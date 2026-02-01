#!/usr/bin/env bash
# Curl-only tests for bun-server.js
# Run server with: TEST_MODE=1 TEST_SESSION_ID=test-session-id bun run ../bin/enigmatic.js
# Then: ./test-bun-server.sh

set -e
BASE="${BASE:-https://localhost:3000}"
COOKIE="${COOKIE:-token=test-session-id}"

echo "=== OPTIONS ==="
curl -sS -k -X OPTIONS "$BASE/" -w "\nstatus: %{http_code}\n" -o /dev/null

echo "=== GET /me (no auth, expect 401) ==="
curl -sS -k -X GET "$BASE/me" -w "\nstatus: %{http_code}\n"

echo "=== GET /me (with cookie, expect 200) ==="
curl -sS -k -X GET "$BASE/me" -H "Cookie: $COOKIE" -w "\nstatus: %{http_code}\n"

echo "=== GET KV key (no auth, expect 401) ==="
curl -sS -k -X GET "$BASE/test-key" -w "\nstatus: %{http_code}\n"

echo "=== POST KV (set) ==="
curl -sS -k -X POST "$BASE/curl-test-key" -H "Cookie: $COOKIE" -H "Content-Type: application/json" -d '"curl-test-value"' -w "\nstatus: %{http_code}\n"

echo "=== GET KV (get) ==="
curl -sS -k -X GET "$BASE/curl-test-key" -H "Cookie: $COOKIE" -w "\nstatus: %{http_code}\n"

echo "=== DELETE KV ==="
curl -sS -k -X DELETE "$BASE/curl-test-key" -H "Cookie: $COOKIE" -w "\nstatus: %{http_code}\n"

echo "=== GET KV after delete (expect null) ==="
curl -sS -k -X GET "$BASE/curl-test-key" -H "Cookie: $COOKIE" -w "\nstatus: %{http_code}\n"

echo "=== PROPFIND (list files) ==="
curl -sS -k -X PROPFIND "$BASE/" -H "Cookie: $COOKIE" -w "\nstatus: %{http_code}\n"

echo "=== GET / (static index) ==="
curl -sS -k -X GET "$BASE/" -w "\nstatus: %{http_code}\n" -o /dev/null

echo "Done."
