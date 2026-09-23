#!/usr/bin/env bash
set -euo pipefail

# Replica sets with authentication need an internal key. Keep it in the existing
# data volume, separate from application credentials and out of source control.
triage_key=/data/db/triage-replica.key
if [ ! -s "$triage_key" ]; then
  umask 077
  openssl rand -base64 756 > "$triage_key"
fi
chmod 400 "$triage_key"
chown mongodb:mongodb "$triage_key"
exec /usr/local/bin/docker-entrypoint.sh mongod \
  --replSet triage-rs --keyFile "$triage_key" --bind_ip_all
