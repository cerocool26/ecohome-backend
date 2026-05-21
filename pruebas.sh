#!/bin/bash
# ============================================================
# EcoHome Backend — Pruebas cURL completas
# Prerrequisito: servidor corriendo en localhost:3000
# ============================================================

BASE="http://localhost:3000"
echo "======================================================"
echo "  EcoHome Store — Pruebas de API"
echo "======================================================"

# ── 1. Signup cliente ────────────────────────────────────────
echo -e "\n[1] POST /auth/signup (nuevo cliente)"
curl -s -X POST $BASE/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana García","email":"ana@test.com","password":"password123"}' | jq .

# ── 2. Login admin ───────────────────────────────────────────
echo -e "\n[2] POST /auth/login (admin)"
echo "    Asegúrate de haber creado un admin en la BD"
ADMIN_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecohome.com","password":"admin123"}' | jq -r '.token')
echo "    Token admin: ${ADMIN_TOKEN:0:40}..."

# ── 3. Login cliente ─────────────────────────────────────────
echo -e "\n[3] POST /auth/login (cliente)"
CLIENT_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@test.com","password":"password123"}' | jq -r '.token')
echo "    Token client: ${CLIENT_TOKEN:0:40}..."

# ── 4. Crear producto (admin) ─────────────────────────────────
echo -e "\n[4] POST /products (admin crea producto)"
PRODUCT=$(curl -s -X POST $BASE/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Vaso reciclado 350ml","price":12500,"description":"Vidrio 100% reciclado","stock":50}')
echo $PRODUCT | jq .
PRODUCT_ID=$(echo $PRODUCT | jq -r '.id')

# ── 5. Listar productos ───────────────────────────────────────
echo -e "\n[5] GET /products (cliente autenticado)"
curl -s $BASE/products \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .

# ── 6. Obtener uno ────────────────────────────────────────────
echo -e "\n[6] GET /products/$PRODUCT_ID"
curl -s $BASE/products/$PRODUCT_ID \
  -H "Authorization: Bearer $CLIENT_TOKEN" | jq .

# ── 7. PATCH — actualizar precio ──────────────────────────────
echo -e "\n[7] PATCH /products/$PRODUCT_ID (admin actualiza precio)"
curl -s -X PATCH $BASE/products/$PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":11900}' | jq .

# ── 8. Error: sin token (401) ─────────────────────────────────
echo -e "\n[8] POST /products SIN token → espera 401"
curl -s -X POST $BASE/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Trampa","price":1}' | jq .

# ── 9. Error: cliente intenta crear (403) ─────────────────────
echo -e "\n[9] POST /products con token CLIENT → espera 403"
curl -s -X POST $BASE/products \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Producto gratis","price":0.01}' | jq .

# ── 10. Error: validación (400) ───────────────────────────────
echo -e "\n[10] POST /products con price inválido → espera 400"
curl -s -X POST $BASE/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"","price":-5}' | jq .

# ── 11. Eliminar producto ─────────────────────────────────────
echo -e "\n[11] DELETE /products/$PRODUCT_ID (admin) → espera 204"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X DELETE $BASE/products/$PRODUCT_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n======================================================"
echo "  Pruebas completadas"
echo "======================================================"
