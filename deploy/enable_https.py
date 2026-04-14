"""Switch nginx for xenglishschool.com from HTTP to HTTPS (Let's Encrypt)."""
import paramiko, sys, textwrap
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass

HOST = "187.77.245.72"
DOMAIN = "xenglishschool.com"
EMAIL = "admin@xenglishschool.com"   # used by Let's Encrypt for expiry notices
APP_DIR = "/var/www/pro-xes-english-study"
SERVER_PORT = 3000

def run(c, cmd, check=True, quiet=False):
    if not quiet: print(f"\n$ {cmd}")
    _, o, e = c.exec_command(cmd, timeout=300)
    out = o.read().decode(errors='replace'); err = e.read().decode(errors='replace')
    rc = o.channel.recv_exit_status()
    if out and not quiet: print(out.rstrip())
    if err and not quiet: print(f"[stderr] {err.rstrip()}")
    if check and rc != 0: raise RuntimeError(f"rc={rc}: {cmd}")
    return rc, out, err

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, 22, "root", "GXpNStPZ)0g6DBc6", timeout=20)

# 0) Sanity: DNS must point to this VPS before Let's Encrypt HTTP-01 can work
print("=== DNS check ===")
run(c, f"getent hosts {DOMAIN} www.{DOMAIN} || true", check=False)
run(c, f"curl -s -o /dev/null -w 'apex HTTP %{{http_code}} via %{{remote_ip}}\\n' http://{DOMAIN}/ || true", check=False)

# 1) HTTP-only nginx config that also serves ACME challenge
print("\n=== Write HTTP nginx (pre-cert) ===")
http_conf = textwrap.dedent(f"""
server {{
    listen 80;
    listen [::]:80;
    server_name {DOMAIN} www.{DOMAIN};

    root {APP_DIR}/client/dist;
    index index.html;

    location /.well-known/acme-challenge/ {{
        root /var/www/html;
    }}

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

sftp = c.open_sftp()
with sftp.file("/etc/nginx/sites-available/pro-xes", "w") as f:
    f.write(http_conf)
sftp.close()
run(c, "mkdir -p /var/www/html")
run(c, "nginx -t && systemctl reload nginx")

# 2) Install certbot
print("\n=== Install certbot ===")
run(c, "DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx")

# 3) Obtain cert (will also edit nginx to add SSL + HTTP->HTTPS redirect)
print("\n=== Issue certificate ===")
run(c,
    f"certbot --nginx -d {DOMAIN} -d www.{DOMAIN} "
    f"--non-interactive --agree-tos -m {EMAIL} --redirect --keep-until-expiring")

# 4) Verify renewal timer and final config
print("\n=== Verify ===")
run(c, "systemctl list-timers | grep -i certbot || true", check=False)
run(c, "certbot certificates", check=False)
run(c, "nginx -t")
run(c, f"curl -sI http://{DOMAIN}/ | head -3", check=False)
run(c, f"curl -sI https://{DOMAIN}/ --resolve {DOMAIN}:443:127.0.0.1 -k | head -3", check=False)

c.close()
print("\nDONE")
