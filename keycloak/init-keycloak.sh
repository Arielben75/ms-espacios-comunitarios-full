#!/bin/bash

# Script para configurar automáticamente Keycloak con OAuth2 clientes
# Este script se ejecutará cuando Keycloak inicie

KEYCLOAK_URL="http://localhost:8080"
REALM="espacios-reservas-realm"
ADMIN_USER="${KEYCLOAK_ADMIN_USER:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin123}"

# Esperar a que Keycloak esté listo
sleep 30

echo "Configurando Keycloak con OAuth2 clients..."

# Obtener token de administrador
ADMIN_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}&password=${ADMIN_PASSWORD}&grant_type=password&client_id=admin-cli" \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token de administrador"
  exit 1
fi

echo "✓ Token de administrador obtenido"

# Crear cliente para espacios-comunitarios
echo "Creando cliente para espacios-comunitarios..."

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "espacios-client",
    "name": "Espacios Comunitarios",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "espacios-client-secret-12345",
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": true,
    "standardFlowEnabled": true,
    "registeredRedirectUris": [
      "http://localhost:3000/api/auth/callback",
      "http://localhost:3000/*",
      "http://espacios-comunitarios-app:3000/*"
    ]
  }' > /dev/null

echo "✓ Cliente espacios-comunitarios creado"

# Crear cliente para reserva-comunitarios
echo "Creando cliente para reserva-comunitarios..."

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "reservaciones-client",
    "name": "Reservaciones",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "reservaciones-client-secret-12345",
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": true,
    "standardFlowEnabled": true,
    "registeredRedirectUris": [
      "http://localhost:3002/api/auth/callback",
      "http://localhost:3002/*",
      "http://reserva-comunitarios-app:3000/*"
    ]
  }' > /dev/null

echo "✓ Cliente reserva-comunitarios creado"

echo "✓ Configuración de Keycloak completada"
