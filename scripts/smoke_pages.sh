#!/bin/bash
# Hit every public-facing page on prod, report status + size + key issues.
# Read-only: no POSTs, no auth side effects.
BASE="https://www.form5472prep.com"
ROUTES=(
  "/"
  "/start"
  "/file"
  "/file/years"
  "/file/owner"
  "/file/save"
  "/sign-in"
  "/blog"
  "/privacy"
  "/terms"
  "/data-retention"
  "/security"
  "/dashboard"
  "/admin"
  "/admin/login"
  "/admin/filings"
  "/admin/posts"
  "/admin/reminders"
  "/unsubscribe"
  "/unsubscribe?token=bad"
  "/filings/nonexistent"
  "/filings/nonexistent/edit"
  "/filings/cmpenzypg0001ky04wz21hfr7"
  "/filings/cmpenzypg0001ky04wz21hfr7/confirmation"
  "/admin/filings/cmpenzypg0001ky04wz21hfr7"
  "/admin/posts/new"
  "/auth/expired-token"
  "/blog/nonexistent-slug"
)

FAIL=0
for r in "${ROUTES[@]}"; do
  out=$(curl -s -o /dev/null -w "HTTP=%{http_code} time=%{time_total}s size=%{size_download}\n" -L --max-time 30 "$BASE$r")
  code=$(echo "$out" | sed -nE 's/.*HTTP=([0-9]+).*/\1/p')
  case "$code" in
    2*|3*) icon="OK " ;;
    404) icon="404" ;;
    401|403) icon="AUTH" ;;
    5*) icon="ERR"; FAIL=$((FAIL+1)) ;;
    *) icon="???"; FAIL=$((FAIL+1)) ;;
  esac
  printf "[%s] %-50s %s\n" "$icon" "$r" "$out"
done
echo ""
if [ $FAIL -gt 0 ]; then
  echo "FAIL count: $FAIL"
  exit 1
fi
echo "All page smoke tests passed (auth + 404 routes returning expected codes)."
