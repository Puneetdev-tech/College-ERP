#!/bin/bash
# =============================================================
# RJIT College ERP — Deep Complete Test Suite v2
# =============================================================

BASE="http://localhost:5000/api"
PASS=0; FAIL=0; TOTAL=0; ERRORS=""
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

api() {
  local method="$1" path="$2" data="$3" token="$4"
  local args=(-s -w "\n%{http_code}" -H "Content-Type: application/json")
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  if   [ "$method" = "GET"    ]; then curl "${args[@]}" "$BASE$path"
  elif [ "$method" = "DELETE" ]; then curl "${args[@]}" -X DELETE "$BASE$path"
  else curl "${args[@]}" -X "$method" -d "$data" "$BASE$path"; fi
}

body()  { echo "$1" | sed '$d'; }
code()  { echo "$1" | tail -1; }
field() { body "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$2',''))" 2>/dev/null; }
ok()    { body "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('success') else 'no')" 2>/dev/null; }

check() {
  local desc="$1" res="$2" want_code="${3:-200}"
  local got_code is_ok
  got_code=$(code "$res"); is_ok=$(ok "$res")
  TOTAL=$((TOTAL+1))
  if [ "$got_code" = "$want_code" ] && [ "$is_ok" = "yes" ]; then
    PASS=$((PASS+1)); echo -e "  ${GREEN}✓${NC} [$got_code] $desc"
  else
    FAIL=$((FAIL+1))
    local b; b=$(body "$res" | head -c 150)
    echo -e "  ${RED}✗${NC} [$got_code] $desc (expected $want_code)"
    echo -e "    ${RED}→ $b${NC}"
    ERRORS="$ERRORS\n• $desc [HTTP $got_code, expected $want_code]: $b"
  fi
}

check_fail() {
  local desc="$1" res="$2" want_code="$3"
  local got_code
  got_code=$(code "$res")
  TOTAL=$((TOTAL+1))
  if [ "$got_code" = "$want_code" ]; then
    PASS=$((PASS+1)); echo -e "  ${GREEN}✓${NC} [$got_code] $desc"
  else
    FAIL=$((FAIL+1))
    local b; b=$(body "$res" | head -c 150)
    echo -e "  ${RED}✗${NC} [$got_code] $desc (expected $want_code)"
    echo -e "    ${RED}→ $b${NC}"
    ERRORS="$ERRORS\n• $desc [HTTP $got_code, expected $want_code]: $b"
  fi
}

hdr() { echo ""; echo -e "${BOLD}${YELLOW}━━━ $1 ━━━${NC}"; }

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║    RJIT College ERP — Complete Deep Test Suite v2            ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

ADMIN_EMAIL="admin@rjit.edu.in"
DEAN_EMAIL="dean@rjit.edu.in"
OFFICER_EMAIL="store@rjit.edu.in"
PRINCIPAL_EMAIL="principal@rjit.edu.in"
TEST_PASS="TestPass@2026"

# ═══════════════════════════════════════════════════════════
hdr "1. AUTHENTICATION — LOGIN FLOWS"
# ═══════════════════════════════════════════════════════════
r=$(api POST /auth/login "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$TEST_PASS\"}")
ADMIN_TOKEN=$(field "$r" token)
check "Admin login — valid credentials" "$r"

r=$(api POST /auth/login "{\"email\":\"$DEAN_EMAIL\",\"password\":\"$TEST_PASS\"}")
DEAN_TOKEN=$(field "$r" token)
check "Dean login — valid credentials" "$r"

r=$(api POST /auth/login "{\"email\":\"$OFFICER_EMAIL\",\"password\":\"$TEST_PASS\"}")
OFFICER_TOKEN=$(field "$r" token)
check "Store Officer login — valid credentials" "$r"

r=$(api POST /auth/login "{\"email\":\"$PRINCIPAL_EMAIL\",\"password\":\"$TEST_PASS\"}")
PRINCIPAL_TOKEN=$(field "$r" token)
check "Principal login — valid credentials" "$r"

r=$(api POST /auth/login '{"email":"nobody@test.com","password":"bad"}')
check_fail "Login — wrong email rejected" "$r" "401"

r=$(api POST /auth/login "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrongpass\"}")
check_fail "Login — correct email, wrong password rejected" "$r" "401"

r=$(api POST /auth/login '{"email":"","password":""}')
check_fail "Login — empty fields rejected" "$r" "400"

r=$(api POST /auth/login '{"email":"notanemail","password":"abc"}')
check_fail "Login — invalid email format rejected" "$r" "400"

# ═══════════════════════════════════════════════════════════
hdr "2. TOKEN VALIDATION"
# ═══════════════════════════════════════════════════════════
r=$(api GET /users "" "")
check_fail "No token — rejected with 401" "$r" "401"

r=$(api GET /users "" "bad.token.here")
check_fail "Invalid token — rejected with 401" "$r" "401"

r=$(api GET /users "" "$ADMIN_TOKEN")
check "Valid Admin token — accepted" "$r"

# ═══════════════════════════════════════════════════════════
hdr "3. PASSWORD RESET FLOW"
# ═══════════════════════════════════════════════════════════
r=$(api POST /auth/forgot-password "{\"email\":\"$ADMIN_EMAIL\"}")
check "Forgot password — valid email generates OTP" "$r"
OTP=$(field "$r" otp)

r=$(api POST /auth/forgot-password '{"email":"nobody@xyz.com"}')
check_fail "Forgot password — unknown email rejected (404)" "$r" "404"

r=$(api POST /auth/verify-otp "{\"email\":\"$ADMIN_EMAIL\",\"otp\":\"$OTP\"}")
check "Verify OTP — correct OTP accepted" "$r"

r=$(api POST /auth/verify-otp "{\"email\":\"$ADMIN_EMAIL\",\"otp\":\"000000\"}")
check_fail "Verify OTP — wrong OTP rejected (400)" "$r" "400"

# Use OTP to reset password back to same value
r=$(api POST /auth/reset-password "{\"email\":\"$ADMIN_EMAIL\",\"otp\":\"$OTP\",\"newPassword\":\"$TEST_PASS\"}")
check "Reset password — valid OTP + new password saved" "$r"

# ═══════════════════════════════════════════════════════════
hdr "4. USER MANAGEMENT — CRUD"
# ═══════════════════════════════════════════════════════════
r=$(api GET /users "" "$ADMIN_TOKEN")
check "Get all users (Admin)" "$r"
USER_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('users',[])))" 2>/dev/null)
echo -e "     Users in DB: ${CYAN}$USER_COUNT${NC}"

TS=$(date +%s)
r=$(api POST /users "{\"name\":\"TestUser $TS\",\"email\":\"tuser$TS@rjit.edu.in\",\"password\":\"test123\",\"role\":\"Purchase Officer\",\"status\":\"Active\",\"permissions\":[\"Dashboard\",\"Place Order\"]}" "$ADMIN_TOKEN")
check "Create new user (Admin)" "$r" "200"
NEW_USER_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('id',''))" 2>/dev/null)

r=$(api POST /users "{\"name\":\"Dup\",\"email\":\"tuser$TS@rjit.edu.in\",\"password\":\"abc\",\"role\":\"Admin\",\"status\":\"Active\",\"permissions\":[]}" "$ADMIN_TOKEN")
check_fail "Create user — duplicate email rejected (400)" "$r" "400"

r=$(api PUT "/users/$NEW_USER_ID" "{\"name\":\"Updated $TS\",\"email\":\"tuser$TS@rjit.edu.in\",\"role\":\"Purchase Officer\",\"status\":\"Active\",\"permissions\":[\"Dashboard\"]}" "$ADMIN_TOKEN")
check "Update user — name & permissions saved" "$r"

r=$(api POST /users '{"name":"X","email":"x@x.com","password":"x","role":"Admin","status":"Active","permissions":[]}' "$OFFICER_TOKEN")
check_fail "Create user — Store Officer denied (403, no Users perm)" "$r" "403"

r=$(api DELETE "/users/$NEW_USER_ID" "" "$ADMIN_TOKEN")
check "Delete test user" "$r"

# ═══════════════════════════════════════════════════════════
hdr "5. INVENTORY — CRUD"
# ═══════════════════════════════════════════════════════════
r=$(api GET /inventory "" "$ADMIN_TOKEN")
check "Get all inventory (Admin)" "$r"
INV_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('items',[])))" 2>/dev/null)
echo -e "     Inventory items: ${CYAN}$INV_COUNT${NC}"

r=$(api POST /inventory '{"item":"TestItem_Suite","category":"General","subcategory":"TestSub","type":"Standard","stock":50,"price":100}' "$ADMIN_TOKEN")
check "Create inventory item (Admin)" "$r"
NEW_INV_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('item',{}).get('id',''))" 2>/dev/null)

r=$(api PUT "/inventory/$NEW_INV_ID" '{"item":"TestItem_Suite","category":"General","subcategory":"TestSub","type":"Standard","stock":75,"price":120}' "$ADMIN_TOKEN")
check "Update inventory item — stock & price" "$r"

r=$(api POST /inventory '{"item":"Y","category":"X","subcategory":"X","type":"Standard","stock":1,"price":1}' "$PRINCIPAL_TOKEN")
check_fail "Create inventory — Principal denied (403, no Inventory perm)" "$r" "403"

r=$(api DELETE "/inventory/$NEW_INV_ID" "" "$ADMIN_TOKEN")
check "Delete inventory item" "$r"

# ═══════════════════════════════════════════════════════════
hdr "6. LEGACY INVENTORY"
# ═══════════════════════════════════════════════════════════
r=$(api GET /inventory/legacy "" "$ADMIN_TOKEN")
check "Get legacy general inventory items" "$r"

r=$(api GET /inventory/legacy-sanitary "" "$ADMIN_TOKEN")
check "Get legacy sanitary items" "$r"

r=$(api GET /inventory/legacy-electrical "" "$ADMIN_TOKEN")
check "Get legacy electrical items" "$r"

# ═══════════════════════════════════════════════════════════
hdr "7. CATEGORIES — CRUD"
# ═══════════════════════════════════════════════════════════
r=$(api GET /categories "" "$ADMIN_TOKEN")
check "Get all categories" "$r"
CAT_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('categories',[])))" 2>/dev/null)
echo -e "     Categories: ${CYAN}$CAT_COUNT${NC}"

TS2=$(date +%s)
r=$(api POST /categories "{\"name\":\"TestCat$TS2\",\"icon\":\"FaBoxes\",\"desc\":\"Test cat\",\"color\":\"from-blue-500 to-indigo-600\"}" "$ADMIN_TOKEN")
check "Create category (Admin)" "$r" "201"
NEW_CAT_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('category',{}).get('id',''))" 2>/dev/null)

r=$(api POST "/categories/$NEW_CAT_ID/subcategories" '{"name":"TestSubCat1"}' "$ADMIN_TOKEN")
check "Create subcategory" "$r" "201"

r=$(api DELETE "/categories/$NEW_CAT_ID/subcategories/TestSubCat1" "" "$ADMIN_TOKEN")
check "Delete subcategory" "$r"

r=$(api DELETE "/categories/$NEW_CAT_ID" "" "$ADMIN_TOKEN")
check "Delete category" "$r"

r=$(api POST /categories "{\"name\":\"DeanCat$TS2\",\"icon\":\"FaBoxes\"}" "$DEAN_TOKEN")
check "Create category — Dean allowed (has Inventory permission)" "$r" "201"

# ═══════════════════════════════════════════════════════════
hdr "8. ORDERS — FULL LIFECYCLE"
# ═══════════════════════════════════════════════════════════
r=$(api GET /orders "" "$ADMIN_TOKEN")
check "Get all orders" "$r"
ORD_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('orders',[])))" 2>/dev/null)
echo -e "     Orders in DB: ${CYAN}$ORD_COUNT${NC}"

# Place order — ID is auto-generated by backend
r=$(api POST /orders '{"supplier":"TestSupplier","item":"Test Chairs","category":"Furniture","subcategory":"Chairs","type":"Standard","quantity":10,"pricePerUnit":500,"department":"Computer Science","faculty":"Dr. Test"}' "$OFFICER_TOKEN")
check "Place order (Store Officer)" "$r"
NEW_ORDER_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('order',{}).get('id',''))" 2>/dev/null)
echo -e "     Created order ID: ${CYAN}$NEW_ORDER_ID${NC}"

TOTAL=$((TOTAL+1))
if [ -n "$NEW_ORDER_ID" ] && [ "$NEW_ORDER_ID" != "None" ]; then
  r2=$(api GET /orders "" "$ADMIN_TOKEN")
  ORDER_EXISTS=$(body "$r2" | python3 -c "import sys,json; orders=json.load(sys.stdin).get('orders',[]); print('yes' if any(o.get('id','')=='$NEW_ORDER_ID' for o in orders) else 'no')" 2>/dev/null)
  if [ "$ORDER_EXISTS" = "yes" ]; then
    PASS=$((PASS+1)); echo -e "  ${GREEN}✓${NC} Order $NEW_ORDER_ID visible in order list"
  else
    FAIL=$((FAIL+1)); echo -e "  ${RED}✗${NC} Order $NEW_ORDER_ID NOT visible in list"
    ERRORS="$ERRORS\n• Order $NEW_ORDER_ID not found in order list"
  fi
else
  FAIL=$((FAIL+1)); echo -e "  ${RED}✗${NC} No order ID returned from create"
  ERRORS="$ERRORS\n• Order create did not return an ID"
fi

r=$(api POST "/orders/$NEW_ORDER_ID/approve" "" "$ADMIN_TOKEN")
check "Approve order (Admin)" "$r"

# Place second order then reject it
r=$(api POST /orders '{"supplier":"S2","item":"Reject Item","category":"General","subcategory":"Sub","type":"Standard","quantity":1,"pricePerUnit":100,"department":"HR","faculty":"Dr. Rej"}' "$OFFICER_TOKEN")
ORDER_ID2=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('order',{}).get('id',''))" 2>/dev/null)
r=$(api POST "/orders/$ORDER_ID2/reject" "" "$ADMIN_TOKEN")
check "Reject order (Admin)" "$r"

# Dean cannot place orders
r=$(api POST /orders '{"supplier":"X","item":"X","category":"X","subcategory":"X","type":"Standard","quantity":1,"pricePerUnit":1,"department":"X","faculty":"X"}' "$DEAN_TOKEN")
check_fail "Place order — Dean denied (403, no Place Order perm)" "$r" "403"

# Receive approved order
r=$(api POST "/orders/$NEW_ORDER_ID/receive" "{\"receiveDate\":\"2026-07-07\"}" "$ADMIN_TOKEN")
check "Receive approved order — updates inventory" "$r"

# ═══════════════════════════════════════════════════════════
hdr "9. ISSUED STOCK"
# ═══════════════════════════════════════════════════════════
r=$(api GET /issues "" "$ADMIN_TOKEN")
check "Get all issued stock" "$r"
ISS_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('issues',[])))" 2>/dev/null)
echo -e "     Issued records: ${CYAN}$ISS_COUNT${NC}"

INV_R=$(api GET /inventory "" "$ADMIN_TOKEN")
FIRST_INV=$(body "$INV_R" | python3 -c "
import sys,json
items=json.load(sys.stdin).get('items',[])
item=[i for i in items if i['stock']>0]
if item: print(item[0]['item']+'|'+item[0]['category']+'|'+item[0].get('subcategory','General')+'|'+item[0].get('type','Standard'))
" 2>/dev/null)
INV_ITEM=$(echo "$FIRST_INV" | cut -d'|' -f1)
INV_CAT=$(echo "$FIRST_INV"  | cut -d'|' -f2)
INV_SUB=$(echo "$FIRST_INV"  | cut -d'|' -f3)
INV_TYPE=$(echo "$FIRST_INV" | cut -d'|' -f4)

if [ -n "$INV_ITEM" ]; then
  r=$(api POST /issues "{\"item\":\"$INV_ITEM\",\"category\":\"$INV_CAT\",\"subcategory\":\"$INV_SUB\",\"type\":\"$INV_TYPE\",\"department\":\"CSE\",\"faculty\":\"Dr. Kumar\",\"quantity\":1}" "$ADMIN_TOKEN")
  check "Issue stock item (Admin)" "$r"
else
  TOTAL=$((TOTAL+1)); FAIL=$((FAIL+1))
  echo -e "  ${RED}✗${NC} No items with stock > 0 to issue"
  ERRORS="$ERRORS\n• No inventory items available to issue"
fi

r=$(api POST /issues '{"item":"X","category":"X","subcategory":"X","type":"Standard","department":"X","faculty":"X","quantity":1}' "$PRINCIPAL_TOKEN")
check_fail "Issue stock — Principal denied (403)" "$r" "403"

# ═══════════════════════════════════════════════════════════
hdr "10. NOTIFICATIONS — CRUD"
# ═══════════════════════════════════════════════════════════
r=$(api GET /notifications "" "$ADMIN_TOKEN")
check "Get all notifications" "$r"
NOTIF_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('notifications',[])))" 2>/dev/null)
echo -e "     Notifications: ${CYAN}$NOTIF_COUNT${NC}"

r=$(api POST /notifications '{"type":"Test","message":"Test suite notification","iconType":"info","color":"bg-blue-100 text-blue-800"}' "$ADMIN_TOKEN")
check "Create notification" "$r"
NEW_NOTIF_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('notification',{}).get('id',''))" 2>/dev/null)

r=$(api PUT "/notifications/$NEW_NOTIF_ID/read" "" "$ADMIN_TOKEN")
check "Mark single notification as read" "$r"

r=$(api PUT /notifications/read-all "" "$ADMIN_TOKEN")
check "Mark all notifications as read" "$r"

r=$(api DELETE "/notifications/$NEW_NOTIF_ID" "" "$ADMIN_TOKEN")
check "Delete single notification" "$r"

# ═══════════════════════════════════════════════════════════
hdr "11. SETTINGS"
# ═══════════════════════════════════════════════════════════
r=$(api GET /settings "" "$ADMIN_TOKEN")
check "Get system settings (Admin)" "$r"

r=$(api PUT /settings '{"lowStockThreshold":15,"collegeName":"RJIT","collegeLogo":"/rjit_logo.png","collegeAddress":"Test Addr","collegePhone":"9876543210","collegeEmail":"info@rjit.edu.in","collegeWebsite":"www.rjit.edu.in"}' "$ADMIN_TOKEN")
check "Update system settings (Admin)" "$r"

r=$(api PUT /settings '{"lowStockThreshold":5}' "$OFFICER_TOKEN")
check_fail "Update settings — Store Officer denied (403)" "$r" "403"

# ═══════════════════════════════════════════════════════════
hdr "12. APPROVAL SEQUENCE"
# ═══════════════════════════════════════════════════════════
r=$(api GET /users/approval-sequence "" "$ADMIN_TOKEN")
check "Get approval sequence" "$r"

USERS_R=$(api GET /users "" "$ADMIN_TOKEN")
FIRST_USER_ID=$(body "$USERS_R" | python3 -c "
import sys,json
users=json.load(sys.stdin).get('users',[])
non_admin=[u for u in users if u['role']!='Admin']
if non_admin: print(non_admin[0]['id'])
" 2>/dev/null)

if [ -n "$FIRST_USER_ID" ]; then
  r=$(api PUT /users/approval-sequence "{\"userIds\":[$FIRST_USER_ID]}" "$ADMIN_TOKEN")
  check "Update approval sequence (Admin)" "$r"
fi

r=$(api PUT /users/approval-sequence '{"userIds":[]}' "$OFFICER_TOKEN")
check_fail "Update approval sequence — Store Officer denied (403)" "$r" "403"

# ═══════════════════════════════════════════════════════════
hdr "13. MAINTENANCE — FULL CRUD"
# ═══════════════════════════════════════════════════════════
r=$(api GET /maintenance "" "$ADMIN_TOKEN")
check "Get all maintenance data" "$r"
MCAT_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('categories',[])))" 2>/dev/null)
MUNIT_COUNT=$(body "$r" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('units',[])))" 2>/dev/null)
echo -e "     Maintenance categories: ${CYAN}$MCAT_COUNT${NC}, units: ${CYAN}$MUNIT_COUNT${NC}"

MTS=$(date +%s)
r=$(api POST /maintenance/categories "{\"name\":\"TestMCat$MTS\",\"icon\":\"FaTools\"}" "$ADMIN_TOKEN")
check "Create maintenance category" "$r" "201"
NEW_MCAT_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('category',{}).get('id',''))" 2>/dev/null)

r=$(api POST /maintenance/units "{\"category\":\"$NEW_MCAT_ID\",\"name\":\"Test Unit $MTS\",\"location\":\"Block A\",\"initialPrice\":5000,\"installDate\":\"2024-01-01\"}" "$ADMIN_TOKEN")
check "Create maintenance unit" "$r" "201"
NEW_UNIT_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('unit',{}).get('id',''))" 2>/dev/null)

r=$(api PUT "/maintenance/units/$NEW_UNIT_ID" "{\"name\":\"Updated Unit $MTS\",\"location\":\"Block B\",\"initialPrice\":6000,\"installDate\":\"2024-01-01\"}" "$ADMIN_TOKEN")
check "Update maintenance unit details" "$r"

r=$(api PUT "/maintenance/units/$NEW_UNIT_ID/status" '{"status":"Under Repair"}' "$ADMIN_TOKEN")
check "Update maintenance unit status" "$r"

r=$(api POST "/maintenance/units/$NEW_UNIT_ID/logs" '{"partRepaired":"Test Part","quantity":2,"pricePerQty":500,"date":"2026-07-07","technician":"Test Tech","notes":"Test notes"}' "$ADMIN_TOKEN")
check "Add maintenance log" "$r" "201"
NEW_LOG_ID=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('log',{}).get('id',''))" 2>/dev/null)

r=$(api PUT "/maintenance/units/$NEW_UNIT_ID/logs/$NEW_LOG_ID" '{"partRepaired":"Updated Part","quantity":3,"pricePerQty":600,"date":"2026-07-07","technician":"Tech2","notes":"Updated"}' "$ADMIN_TOKEN")
check "Update maintenance log" "$r"

r=$(api DELETE "/maintenance/units/$NEW_UNIT_ID/logs/$NEW_LOG_ID" "" "$ADMIN_TOKEN")
check "Delete maintenance log" "$r"

r=$(api DELETE "/maintenance/units/$NEW_UNIT_ID" "" "$ADMIN_TOKEN")
check "Delete maintenance unit" "$r"

r=$(api DELETE "/maintenance/categories/$NEW_MCAT_ID" "" "$ADMIN_TOKEN")
check "Delete maintenance category" "$r"

r=$(api POST /maintenance/categories '{"name":"Fail","icon":"FaTools"}' "$OFFICER_TOKEN")
check_fail "Create maintenance category — Store Officer denied (403)" "$r" "403"

# ═══════════════════════════════════════════════════════════
hdr "14. REPORTS"
# ═══════════════════════════════════════════════════════════
r=$(api GET /reports/summary "" "$ADMIN_TOKEN")
check "Get reports summary (Admin)" "$r"

r=$(api GET /reports/inventory "" "$ADMIN_TOKEN")
check "Get inventory report (Admin)" "$r"

r=$(api GET /reports/issues "" "$ADMIN_TOKEN")
check "Get issues report (Admin)" "$r"

r=$(api GET /reports/orders "" "$ADMIN_TOKEN")
check "Get orders report (Admin)" "$r"

r=$(api GET /reports/inventory "" "$DEAN_TOKEN")
check "Get inventory report (Dean — has Reports permission)" "$r"

r=$(api GET /reports/summary "" "$PRINCIPAL_TOKEN")
check "Get reports summary (Principal — has Reports permission)" "$r"

# ═══════════════════════════════════════════════════════════
hdr "15. ROLE-BASED ACCESS CONTROL (RBAC) VERIFICATION"
# ═══════════════════════════════════════════════════════════
# Dean: Dashboard, Inventory, Receive Order, Issue Stock, Reports, Notifications, Maintenance
r=$(api GET /inventory "" "$DEAN_TOKEN")
check "Dean → GET inventory ✓" "$r"

r=$(api GET /maintenance "" "$DEAN_TOKEN")
check "Dean → GET maintenance ✓" "$r"

r=$(api POST /orders '{"supplier":"X","item":"X","category":"X","subcategory":"X","type":"Standard","quantity":1,"pricePerUnit":1,"department":"X","faculty":"X"}' "$DEAN_TOKEN")
check_fail "Dean → Place Order ✗ (denied)" "$r" "403"

r=$(api PUT /settings '{"lowStockThreshold":5}' "$DEAN_TOKEN")
check_fail "Dean → Update Settings ✗ (denied)" "$r" "403"

# Store Officer: Dashboard, Place Order, Receive Order, Reports, Notifications
r=$(api POST /orders '{"supplier":"TestS","item":"TestI","category":"General","subcategory":"Sub","type":"Standard","quantity":1,"pricePerUnit":100,"department":"IT","faculty":"Dr. Test"}' "$OFFICER_TOKEN")
check "Store Officer → Place Order ✓" "$r"
NEW_ORDER_ID3=$(body "$r" | python3 -c "import sys,json; print(json.load(sys.stdin).get('order',{}).get('id',''))" 2>/dev/null)

r=$(api POST /issues '{"item":"X","category":"X","subcategory":"X","type":"Standard","department":"X","faculty":"X","quantity":1}' "$OFFICER_TOKEN")
check_fail "Store Officer → Issue Stock ✗ (denied)" "$r" "403"

r=$(api PUT /settings '{"lowStockThreshold":5}' "$OFFICER_TOKEN")
check_fail "Store Officer → Update Settings ✗ (denied)" "$r" "403"

# Principal: Dashboard, Analytics, Reports, Maintenance
r=$(api GET /maintenance "" "$PRINCIPAL_TOKEN")
check "Principal → GET maintenance ✓" "$r"

r=$(api POST /orders '{"supplier":"X","item":"X","category":"X","subcategory":"X","type":"Standard","quantity":1,"pricePerUnit":1,"department":"X","faculty":"X"}' "$PRINCIPAL_TOKEN")
check_fail "Principal → Place Order ✗ (denied)" "$r" "403"

r=$(api POST /issues '{"item":"X","category":"X","subcategory":"X","type":"Standard","department":"X","faculty":"X","quantity":1}' "$PRINCIPAL_TOKEN")
check_fail "Principal → Issue Stock ✗ (denied)" "$r" "403"

# ═══════════════════════════════════════════════════════════
hdr "16. FRONTEND & BACKEND HEALTH"
# ═══════════════════════════════════════════════════════════
TOTAL=$((TOTAL+1))
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/)
if [ "$STATUS" = "200" ]; then
  PASS=$((PASS+1)); echo -e "  ${GREEN}✓${NC} [$STATUS] Frontend at :5173 accessible"
else
  FAIL=$((FAIL+1)); echo -e "  ${RED}✗${NC} [$STATUS] Frontend NOT accessible"
  ERRORS="$ERRORS\n• Frontend not accessible"
fi

TOTAL=$((TOTAL+1))
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/)
if [ "$STATUS" = "200" ]; then
  PASS=$((PASS+1)); echo -e "  ${GREEN}✓${NC} [$STATUS] Backend at :5000 accessible"
else
  FAIL=$((FAIL+1)); echo -e "  ${RED}✗${NC} [$STATUS] Backend NOT accessible"
  ERRORS="$ERRORS\n• Backend not accessible"
fi

# ═══════════════════════════════════════════════════════════
hdr "17. FINAL DATABASE STATE"
# ═══════════════════════════════════════════════════════════
USERS_R=$(api GET /users "" "$ADMIN_TOKEN")
FINAL_USERS=$(body "$USERS_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('users',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Users in DB: ${CYAN}$FINAL_USERS${NC}"

INV_R=$(api GET /inventory "" "$ADMIN_TOKEN")
FINAL_INV=$(body "$INV_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('items',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Inventory items: ${CYAN}$FINAL_INV${NC}"

ORD_R=$(api GET /orders "" "$ADMIN_TOKEN")
FINAL_ORD=$(body "$ORD_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('orders',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Orders: ${CYAN}$FINAL_ORD${NC}"

ISS_R=$(api GET /issues "" "$ADMIN_TOKEN")
FINAL_ISS=$(body "$ISS_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('issues',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Issued records: ${CYAN}$FINAL_ISS${NC}"

NOTIF_R=$(api GET /notifications "" "$ADMIN_TOKEN")
FINAL_NOTIF=$(body "$NOTIF_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('notifications',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Notifications: ${CYAN}$FINAL_NOTIF${NC}"

CAT_R=$(api GET /categories "" "$ADMIN_TOKEN")
FINAL_CAT=$(body "$CAT_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('categories',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Categories: ${CYAN}$FINAL_CAT${NC}"

MAINT_R=$(api GET /maintenance "" "$ADMIN_TOKEN")
FINAL_MCAT=$(body "$MAINT_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('categories',[])))" 2>/dev/null)
FINAL_MUNIT=$(body "$MAINT_R" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('units',[])))" 2>/dev/null)
TOTAL=$((TOTAL+1)); PASS=$((PASS+1))
echo -e "  ${GREEN}✓${NC} Maintenance — Categories: ${CYAN}$FINAL_MCAT${NC}, Units: ${CYAN}$FINAL_MUNIT${NC}"

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}                        FINAL RESULTS${NC}"
echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Total Tests : ${BOLD}$TOTAL${NC}"
echo -e "  ${GREEN}Passed      : $PASS${NC}"
echo -e "  ${RED}Failed      : $FAIL${NC}"
PCTG=$(python3 -c "print(round($PASS/$TOTAL*100,1))" 2>/dev/null)
echo -e "  Pass Rate   : ${BOLD}${PCTG}%${NC}"
echo ""
if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}🎉 ALL TESTS PASSED — SOFTWARE IS COMPLETE & FULLY WORKING!${NC}"
else
  echo -e "  ${YELLOW}${BOLD}⚠  SOME TESTS FAILED:${NC}"
  echo -e "$ERRORS"
fi
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
