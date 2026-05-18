#!/usr/bin/env bash
# ============================================================
# JWT Security Tests — Control Escolar API
# Uso: bash tests/jwt-security.sh [BASE_URL]
# Ejemplo: bash tests/jwt-security.sh http://localhost:3000
# ============================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
API="$BASE_URL/api"
PASS=0
FAIL=0

# --- helpers ------------------------------------------------

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
red()   { printf '\033[0;31m%s\033[0m\n' "$1"; }
bold()  { printf '\033[1m%s\033[0m\n' "$1"; }

assert_status() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    green "  PASS [$label] — HTTP $actual"
    PASS=$((PASS + 1))
  else
    red "  FAIL [$label] — expected HTTP $expected, got HTTP $actual"
    FAIL=$((FAIL + 1))
  fi
}

http_status() {
  curl -s -o /dev/null -w '%{http_code}' "$@"
}

# --- setup: obtener token válido ----------------------------

bold "\n[Setup] Obteniendo token válido via POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@controlescolar.com","password":"password"}')

VALID_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$VALID_TOKEN" ]; then
  red "No se pudo obtener token. Asegúrate de que el seed fue ejecutado y la API corre en $BASE_URL"
  exit 1
fi
green "  Token obtenido: ${VALID_TOKEN:0:40}..."

# Elegir una ruta protegida que requiera autenticación
PROTECTED_ROUTE="$API/alumnos"
# Elegir una ruta que requiera rol admin (ajustar si la ruta cambia)
ADMIN_ONLY_ROUTE="$API/maestros"

bold "\n[Tests] Iniciando pruebas de seguridad JWT\n"

# --- Test 1: Sin token → 401 --------------------------------
bold "Test 1: Acceso sin token"
STATUS=$(http_status "$PROTECTED_ROUTE")
assert_status "sin-token → 401" "401" "$STATUS"

# --- Test 2: Token con formato inválido → 401 ---------------
bold "\nTest 2: Token con formato inválido"
STATUS=$(http_status "$PROTECTED_ROUTE" -H "Authorization: Bearer not.a.valid.token")
assert_status "token-inválido → 401" "401" "$STATUS"

# --- Test 3: Token firmado con secret incorrecto → 401 ------
bold "\nTest 3: Token firmado con secret incorrecto"
# Genera un JWT con secret falso (header.payload válidos, firma incorrecta)
FAKE_HEADER=$(printf '{"alg":"HS256","typ":"JWT"}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
FAKE_PAYLOAD=$(printf '{"id":1,"rol":"admin","iat":1700000000,"exp":9999999999}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
FAKE_SIG="invalidsignature"
FAKE_TOKEN="${FAKE_HEADER}.${FAKE_PAYLOAD}.${FAKE_SIG}"
STATUS=$(http_status "$PROTECTED_ROUTE" -H "Authorization: Bearer $FAKE_TOKEN")
assert_status "secret-incorrecto → 401" "401" "$STATUS"

# --- Test 4: Token expirado → 401 ---------------------------
bold "\nTest 4: Token expirado (payload con exp en el pasado)"
EXPIRED_HEADER=$(printf '{"alg":"HS256","typ":"JWT"}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
EXPIRED_PAYLOAD=$(printf '{"id":1,"rol":"admin","iat":1000000000,"exp":1000000001}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
EXPIRED_TOKEN="${EXPIRED_HEADER}.${EXPIRED_PAYLOAD}.invalidsig"
STATUS=$(http_status "$PROTECTED_ROUTE" -H "Authorization: Bearer $EXPIRED_TOKEN")
assert_status "token-expirado → 401" "401" "$STATUS"

# --- Test 5: Token alterado (payload modificado) → 401 ------
bold "\nTest 5: Token con payload alterado (firma no coincide)"
IFS='.' read -r ORIG_HEADER ORIG_PAYLOAD ORIG_SIG <<< "$VALID_TOKEN"
TAMPERED_PAYLOAD=$(printf '{"id":99999,"rol":"admin","iat":1700000000,"exp":9999999999}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
TAMPERED_TOKEN="${ORIG_HEADER}.${TAMPERED_PAYLOAD}.${ORIG_SIG}"
STATUS=$(http_status "$PROTECTED_ROUTE" -H "Authorization: Bearer $TAMPERED_TOKEN")
assert_status "token-alterado → 401" "401" "$STATUS"

# --- Test 6: Token válido + ruta protegida → 200 ------------
bold "\nTest 6: Token válido accede a ruta protegida"
STATUS=$(http_status "$PROTECTED_ROUTE" -H "Authorization: Bearer $VALID_TOKEN")
assert_status "token-válido → 200" "200" "$STATUS"

# --- Test 7: Token válido alumno accede a ruta admin → 403 --
bold "\nTest 7: Token de alumno accede a ruta de admin"
ALUMNO_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"juan.perez@controlescolar.com","password":"password"}')
ALUMNO_TOKEN=$(echo "$ALUMNO_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ALUMNO_TOKEN" ]; then
  STATUS=$(http_status -X DELETE "$API/alumnos/1" -H "Authorization: Bearer $ALUMNO_TOKEN")
  assert_status "rol-insuficiente → 403" "403" "$STATUS"
else
  red "  SKIP — No se pudo obtener token de alumno"
fi

# --- Test 8: Header Authorization ausente parcialmente ------
bold "\nTest 8: Authorization sin prefijo Bearer"
STATUS=$(http_status "$PROTECTED_ROUTE" -H "Authorization: $VALID_TOKEN")
assert_status "sin-bearer-prefix → 401" "401" "$STATUS"

# --- Resumen ------------------------------------------------
bold "\n============================================"
bold "Resultados de Seguridad JWT"
bold "============================================"
green "  PASSED: $PASS"
if [ "$FAIL" -gt 0 ]; then
  red "  FAILED: $FAIL"
else
  green "  FAILED: $FAIL"
fi
bold "  TOTAL:  $((PASS + FAIL))"

[ "$FAIL" -eq 0 ] && green "\nTodos los tests pasaron correctamente." || red "\nHay tests fallidos — revisar configuración."
exit $FAIL
