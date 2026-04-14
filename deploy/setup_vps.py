"""
One-shot VPS setup for Option A (GitHub Actions -> SSH -> pull/build/restart).

Runs everything remotely via paramiko (no curl from this laptop, no manual SSH).
Idempotent: safe to re-run.
"""
import paramiko
import sys
import textwrap

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = "187.77.245.72"
PORT = 22
USER = "root"
PASSWORD = "GXpNStPZ)0g6DBc6"

REPO_SSH = "git@github.com:codebuilder0101/pro-xes-english-school.git"
REPO_HTTPS = "https://github.com/codebuilder0101/pro-xes-english-school.git"
APP_DIR = "/var/www/pro-xes-english-study"
SERVER_PORT = 3000
PM2_NAME = "pro-xes-server"

def run(client, cmd, check=True, quiet=False):
    if not quiet:
        print(f"\n$ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=False, timeout=600)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    rc = stdout.channel.recv_exit_status()
    if out and not quiet:
        print(out.rstrip())
    if err and not quiet:
        print(f"[stderr] {err.rstrip()}")
    if check and rc != 0:
        raise RuntimeError(f"Command failed ({rc}): {cmd}\n{err}")
    return rc, out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {USER}@{HOST}:{PORT} ...")
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=20)
    print("Connected.\n")

    # 1) Base packages
    print("=== Step 1: apt packages ===")
    run(client, "DEBIAN_FRONTEND=noninteractive apt-get update -y")
    run(client, "DEBIAN_FRONTEND=noninteractive apt-get install -y git nginx curl ca-certificates gnupg build-essential ufw")

    # 2) Node.js 20 (NodeSource) if missing or too old
    print("\n=== Step 2: Node.js ===")
    rc, out, _ = run(client, "node -v || true", check=False)
    need_node = (rc != 0) or (not out.strip().startswith("v2"))
    if need_node:
        run(client, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -")
        run(client, "DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs")
    run(client, "node -v && npm -v")

    # 3) pm2
    print("\n=== Step 3: pm2 ===")
    rc, _, _ = run(client, "command -v pm2 >/dev/null", check=False)
    if rc != 0:
        run(client, "npm install -g pm2")
    run(client, "pm2 -v")

    # 4) Deploy SSH keypair for GitHub Actions -> VPS
    print("\n=== Step 4: deploy keypair ===")
    run(client, "mkdir -p /root/.ssh && chmod 700 /root/.ssh")
    rc, _, _ = run(client, "test -f /root/.ssh/gh_deploy", check=False)
    if rc != 0:
        run(client, 'ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f /root/.ssh/gh_deploy')
    # ensure public key is in authorized_keys (idempotent)
    run(client, "touch /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys")
    run(client, "grep -qxf /root/.ssh/gh_deploy.pub /root/.ssh/authorized_keys || cat /root/.ssh/gh_deploy.pub >> /root/.ssh/authorized_keys")
    # trust github host key
    run(client, "ssh-keyscan -t ed25519,rsa github.com >> /root/.ssh/known_hosts 2>/dev/null; sort -u /root/.ssh/known_hosts -o /root/.ssh/known_hosts")

    # 5) Clone or update repo
    print("\n=== Step 5: repo ===")
    rc, _, _ = run(client, f"test -d {APP_DIR}/.git", check=False)
    if rc != 0:
        run(client, f"mkdir -p {APP_DIR}")
        # public repo => HTTPS clone works without auth
        run(client, f"git clone {REPO_HTTPS} {APP_DIR}")
    else:
        run(client, f"cd {APP_DIR} && git fetch --all && git reset --hard origin/main")

    # 6) Install & build
    print("\n=== Step 6: install & build ===")
    run(client, f"cd {APP_DIR}/server && npm install --no-audit --no-fund && npm run build")
    run(client, f"cd {APP_DIR}/client && npm install --no-audit --no-fund && npm run build")

    # 7) pm2 process
    print("\n=== Step 7: pm2 ===")
    rc, _, _ = run(client, f"pm2 describe {PM2_NAME} >/dev/null 2>&1", check=False)
    if rc != 0:
        run(client, f"cd {APP_DIR}/server && PORT={SERVER_PORT} pm2 start dist/index.js --name {PM2_NAME} --update-env")
    else:
        run(client, f"cd {APP_DIR}/server && pm2 restart {PM2_NAME} --update-env")
    run(client, "pm2 save")
    run(client, "pm2 startup systemd -u root --hp /root | tail -n1 | bash || true")

    # 8) nginx config
    print("\n=== Step 8: nginx ===")
    nginx_conf = textwrap.dedent(f"""
    server {{
        listen 80 default_server;
        server_name _;

        root {APP_DIR}/client/dist;
        index index.html;

        location /api/ {{
            proxy_pass http://127.0.0.1:{SERVER_PORT}/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }}

        location / {{
            try_files $uri $uri/ /index.html;
        }}
    }}
    """).strip() + "\n"

    sftp = client.open_sftp()
    with sftp.file("/etc/nginx/sites-available/pro-xes", "w") as f:
        f.write(nginx_conf)
    sftp.close()
    run(client, "ln -sf /etc/nginx/sites-available/pro-xes /etc/nginx/sites-enabled/pro-xes")
    run(client, "rm -f /etc/nginx/sites-enabled/default")
    run(client, "nginx -t && systemctl reload nginx")

    # 9) firewall
    print("\n=== Step 9: firewall ===")
    run(client, "ufw allow OpenSSH || true")
    run(client, "ufw allow 'Nginx Full' || true")
    run(client, "yes | ufw enable || true")

    # 10) Emit deploy private key so we can store it as a GitHub secret
    print("\n=== Step 10: fetch deploy private key ===")
    _, priv, _ = run(client, "cat /root/.ssh/gh_deploy", quiet=True)
    _, pub, _ = run(client, "cat /root/.ssh/gh_deploy.pub", quiet=True)
    with open("deploy/gh_deploy_key", "w", newline="\n") as f:
        f.write(priv)
    with open("deploy/gh_deploy_key.pub", "w", newline="\n") as f:
        f.write(pub)
    print("Saved deploy/gh_deploy_key (private) + .pub")

    client.close()
    print("\n=== DONE. Visit: http://187.77.245.72/ ===")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nFAILED: {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)
