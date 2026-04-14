import paramiko
import sys

HOST = "187.77.245.72"
PORT = 22
USER = "root"
PASSWORD = "GXpNStPZ)0g6DBc6"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {USER}@{HOST}:{PORT} ...")
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=15)
    print("Connected. Running checks...\n")
    for cmd in ["whoami", "hostname", "pwd", "uname -a", "uptime"]:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        print(f"$ {cmd}\n{out}{(' [stderr: ' + err + ']') if err else ''}\n")
    client.close()
    print("VPS connection verified successfully.")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(1)
