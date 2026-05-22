#!/bin/bash
# Hit each API endpoint with expected method + auth, verify proper response.
# Read-only where possible — destructive endpoints just verify auth gating.
BASE="https://www.form5472prep.com"

# Get admin cookie for endpoints that need it.
ADMIN_COOKIE=$(curl -s -i -X POST "$BASE/api/admin/login" -H "Content-Type: application/json" -d '{"password":"709394"}' | grep -i "^set-cookie:" | sed 's/set-cookie: //I' | cut -d';' -f1)
echo "admin cookie: ${ADMIN_COOKIE:0:30}..."

# CRON_SECRET is not available locally, so cron endpoints will return 401 — that's expected.
# INTERNAL_API_SECRET is in .env.local for the internal endpoints.
INTERNAL_SECRET=$(grep "^INTERNAL_API_SECRET" "$(dirname "$0")/../.env.local" 2>/dev/null | cut -d= -f2-)

ok=0; warn=0; fail=0

check() {
  local label="$1"
  local expected_codes="$2"
  shift 2
  local body
  local code
  body=$(curl -s -o /tmp/_api_body -w "%{http_code}" --max-time 60 "$@")
  code="$body"
  local status
  if [[ " $expected_codes " == *" $code "* ]]; then
    status="OK "
    ok=$((ok+1))
  else
    status="ERR"
    fail=$((fail+1))
  fi
  local resp
  resp=$(head -c 120 /tmp/_api_body 2>/dev/null | tr -d '\n')
  printf "[%s] %-50s HTTP=%s expected=%s body=%s\n" "$status" "$label" "$code" "$expected_codes" "$resp"
}

echo ""
echo "=== Public-facing APIs (no auth) ==="
check "POST /api/auth/google (empty body)" "400 503" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/auth/google"
check "POST /api/auth/send-link (empty body)" "200 400" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/auth/send-link"
check "POST /api/auth/send-link (valid email format)" "200" -X POST -H "Content-Type: application/json" -d '{"email":"smoketest-nonexistent@example.com"}' "$BASE/api/auth/send-link"
check "POST /api/auth/sign-out" "200 303" -X POST "$BASE/api/auth/sign-out"
check "GET /api/filings (anon)" "200" "$BASE/api/filings"
check "GET /api/filings/badid" "404" "$BASE/api/filings/badid"

echo ""
echo "=== Admin auth + admin endpoints ==="
check "POST /api/admin/login (wrong pw)" "401" -X POST -H "Content-Type: application/json" -d '{"password":"wrong"}' "$BASE/api/admin/login"
check "GET /api/admin/posts (no auth)" "403" "$BASE/api/admin/posts"
check "GET /api/admin/posts (with auth)" "200" -H "Cookie: $ADMIN_COOKIE" "$BASE/api/admin/posts"
check "GET /api/admin/stripe-diag (no auth)" "401" "$BASE/api/admin/stripe-diag"
check "POST /api/admin/filings/bad (no auth)" "401" -X POST -H "Content-Type: application/json" -d '{"action":"setStatus","status":"DRAFT"}' "$BASE/api/admin/filings/bad"
check "POST /api/admin/filings/bad (auth, bad action)" "404 400" -X POST -H "Cookie: $ADMIN_COOKIE" -H "Content-Type: application/json" -d '{"action":"nope"}' "$BASE/api/admin/filings/bad"

echo ""
echo "=== Internal endpoints (shared-secret auth) ==="
check "POST /api/internal/validate-filing/bad (no auth)" "401" -X POST "$BASE/api/internal/validate-filing/bad"
check "POST /api/internal/respond-to-customer/bad (no auth)" "401" -X POST "$BASE/api/internal/respond-to-customer/bad"
if [ -n "$INTERNAL_SECRET" ]; then
  check "POST /api/internal/validate-filing/bad (auth, 404)" "404" -X POST -H "Authorization: Bearer $INTERNAL_SECRET" "$BASE/api/internal/validate-filing/badid"
fi

echo ""
echo "=== Cron endpoints (CRON_SECRET auth, expected 401 from local) ==="
check "GET /api/cron/fax-status-poll" "401" "$BASE/api/cron/fax-status-poll"
check "GET /api/cron/abandoned-draft-reminder" "401" "$BASE/api/cron/abandoned-draft-reminder"
check "GET /api/cron/january-reminder" "401" "$BASE/api/cron/january-reminder"
check "GET /api/cron/march-reminder" "401" "$BASE/api/cron/march-reminder"

echo ""
echo "=== Webhook endpoints (signature-required, expected 400 for missing sig) ==="
check "POST /api/stripe-webhook (no sig)" "400" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/stripe-webhook"
check "POST /api/telnyx-webhook (no body)" "200" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/telnyx-webhook"

echo ""
echo "=== Filing-scoped endpoints (need ownership) ==="
check "GET /api/filings/badid/messages (anon)" "404" "$BASE/api/filings/badid/messages"
check "GET /api/filings/badid/messages (admin)" "404" -H "Cookie: $ADMIN_COOKIE" "$BASE/api/filings/badid/messages?as=admin"
check "GET /api/filings/cmpenzypg0001ky04wz21hfr7/messages (admin)" "200" -H "Cookie: $ADMIN_COOKIE" "$BASE/api/filings/cmpenzypg0001ky04wz21hfr7/messages?as=admin"
check "GET /api/filings/cmpenzypg0001ky04wz21hfr7/pdf (admin)" "200 401 404" -H "Cookie: $ADMIN_COOKIE" "$BASE/api/filings/cmpenzypg0001ky04wz21hfr7/pdf"

echo ""
echo "=== Plaid + checkout (skip POST creates; just verify shape) ==="
check "POST /api/plaid/link-token (no filing)" "400 404 500" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/plaid/link-token"

echo ""
echo "===== SUMMARY ====="
echo "OK: $ok  FAIL: $fail"
[ $fail -eq 0 ] || exit 1
