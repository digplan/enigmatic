#!/usr/bin/env bash
# Curl-only tests for bun-server.js
# Run server: bun run ../bin/enigmatic.js
# Then: ./test-server.sh

set -e
BASE="${BASE:-https://localhost:3000}"
TOKEN=""

echo "=== OPTIONS ==="
curl -sS -k -X OPTIONS "$BASE/" -w "\nstatus: %{http_code}\n" -o /dev/null

echo "=== GET /me (no auth, expect 404) ==="
curl -sS -k -X GET "$BASE/me" -w "\nstatus: %{http_code}\n"

echo "=== Bearer register (expect 200) ==="
REG=$(curl -sS -k -X POST "$BASE/register" -H "Content-Type: application/json" -d '{"email":"curl@example.com"}')
TOKEN=$(echo "$REG" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "token: $TOKEN"

echo "=== GET /me (Bearer, expect 200) ==="
curl -sS -k -X GET "$BASE/me" -H "Authorization: Bearer $TOKEN" -w "\nstatus: %{http_code}\n"

echo "=== GET KV key (no auth, expect 404) ==="
curl -sS -k -X GET "$BASE/test-key" -w "\nstatus: %{http_code}\n"

echo "=== POST KV (set) ==="
curl -sS -k -X POST "$BASE/curl-test-key" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '"curl-test-value"' -w "\nstatus: %{http_code}\n"

echo "=== GET KV (get) ==="
curl -sS -k -X GET "$BASE/curl-test-key" -H "Authorization: Bearer $TOKEN" -w "\nstatus: %{http_code}\n"

echo "=== DELETE KV ==="
curl -sS -k -X DELETE "$BASE/curl-test-key" -H "Authorization: Bearer $TOKEN" -w "\nstatus: %{http_code}\n"

echo "=== GET KV after delete (expect null) ==="
curl -sS -k -X GET "$BASE/curl-test-key" -H "Authorization: Bearer $TOKEN" -w "\nstatus: %{http_code}\n"

echo "=== PROPFIND (list files) ==="
curl -sS -k -X PROPFIND "$BASE/" -H "Authorization: Bearer $TOKEN" -w "\nstatus: %{http_code}\n"

echo "=== GET / (static index) ==="
curl -sS -k -X GET "$BASE/" -w "\nstatus: %{http_code}\n" -o /dev/null

echo "Done."
