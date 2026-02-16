#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://localhost:3000}"

req() {
  local method="$1" path="$2" auth="${3:-}" body="${4:-}"
  local tmp
  tmp="$(mktemp)"

  if [ -n "$body" ] && [ -n "$auth" ]; then
    code=$(curl -sS -k -X "$method" "$BASE$path" -H "Authorization: Bearer $auth" -H "Content-Type: application/json" -d "$body" -o "$tmp" -w "%{http_code}")
  elif [ -n "$body" ]; then
    code=$(curl -sS -k -X "$method" "$BASE$path" -H "Content-Type: application/json" -d "$body" -o "$tmp" -w "%{http_code}")
  elif [ -n "$auth" ]; then
    code=$(curl -sS -k -X "$method" "$BASE$path" -H "Authorization: Bearer $auth" -o "$tmp" -w "%{http_code}")
  else
    code=$(curl -sS -k -X "$method" "$BASE$path" -o "$tmp" -w "%{http_code}")
  fi

  body_out="$(cat "$tmp")"
  rm -f "$tmp"
}

expect_code() {
  local want="$1" got="$2" label="$3"
  if [ "$got" != "$want" ]; then
    echo "FAIL: $label (expected $want got $got)"
    exit 1
  fi
  echo "OK: $label ($got)"
}

contains() {
  local hay="$1" needle="$2" label="$3"
  if ! printf '%s' "$hay" | grep -Fq "$needle"; then
    echo "FAIL: $label (missing '$needle')"
    echo "body: $hay"
    exit 1
  fi
  echo "OK: $label"
}

echo "== OPTIONS =="
req OPTIONS /
expect_code 204 "$code" "OPTIONS /"

echo "== Unauthorized KV/S3 =="
req GET /test-key
expect_code 401 "$code" "GET /test-key unauthorized"
contains "$body_out" 'Unauthorized' "GET unauthorized body"

req PUT /test-file '' '"x"'
expect_code 401 "$code" "PUT /test-file unauthorized"
contains "$body_out" 'Unauthorized' "PUT unauthorized body"

req PROPFIND /
expect_code 401 "$code" "PROPFIND / unauthorized"
contains "$body_out" 'Unauthorized' "PROPFIND unauthorized body"

echo "== Bearer Register/Login =="
req POST /register '' '{"email":"curl@example.com"}'
expect_code 200 "$code" "POST /register"
contains "$body_out" '"token"' "register token"
TOKEN=$(printf '%s' "$body_out" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
SUB=$(printf '%s' "$body_out" | sed -n 's/.*"sub":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ] || [ -z "$SUB" ]; then
  echo "FAIL: could not parse token/sub"
  exit 1
fi

echo "token: $TOKEN"

echo "== /me with bearer =="
req GET /me "$TOKEN"
expect_code 200 "$code" "GET /me"
contains "$body_out" '"sub"' "me has sub"

echo "== Bearer login by sub =="
req POST /login '' "{\"sub\":\"$SUB\"}"
expect_code 200 "$code" "POST /login"
contains "$body_out" '"token"' "login token"

echo "== KV =="
req POST /curl-test-key "$TOKEN" '"curl-test-value"'
expect_code 200 "$code" "POST KV"
contains "$body_out" '"POST":"ok"' "POST KV body"

req GET /curl-test-key "$TOKEN"
expect_code 200 "$code" "GET KV"
contains "$body_out" 'curl-test-value' "GET KV value"

req DELETE /curl-test-key "$TOKEN"
expect_code 200 "$code" "DELETE KV"
contains "$body_out" '"DELETE":"ok"' "DELETE KV body"

req GET /curl-test-key "$TOKEN"
expect_code 200 "$code" "GET KV after delete"
contains "$body_out" 'null' "GET after delete"

echo "== S3 list with bearer =="
req PROPFIND / "$TOKEN"
expect_code 200 "$code" "PROPFIND authorized"

echo "== LLM proxy =="
req POST /llm/chat '' '{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"hi"}]}'
if [ "$code" != "200" ] && [ "$code" != "400" ] && [ "$code" != "401" ] && [ "$code" != "402" ] && [ "$code" != "429" ]; then
  echo "FAIL: unexpected /llm/chat code $code"
  exit 1
fi
echo "OK: /llm/chat returned $code"

echo "== Static =="
req GET /
expect_code 200 "$code" "GET /"

echo "All tests passed."
