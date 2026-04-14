import paramiko, sys
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("187.77.245.72", 22, "root", "GXpNStPZ)0g6DBc6", timeout=15)

for cmd in [
    "curl -sI http://127.0.0.1/ | head -1",
    "curl -s http://127.0.0.1/api/ -o /dev/null -w 'HTTP %{http_code}\\n'",
    "curl -s http://127.0.0.1:3000/ -o /dev/null -w 'HTTP %{http_code}\\n'",
    "ls /etc/nginx/sites-enabled/",
    "pm2 list",
    "ss -tlnp | grep -E ':80|:3000|:443' | head",
]:
    _, o, e = c.exec_command(cmd, timeout=20)
    print(f"$ {cmd}")
    print(o.read().decode(errors='replace').rstrip())
    err = e.read().decode(errors='replace').rstrip()
    if err: print(f"[stderr] {err}")
    print()
c.close()
