#!/bin/bash
# Script para regenerar y actualizar la contraseña del superadmin

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔐 Fixing Superadmin Password${NC}"
echo "========================================"
echo ""

# Step 1: Generate new hash inside the backend container
echo -e "${YELLOW}Step 1: Generating new password hash...${NC}"
echo "Running inside backend container where bcrypt is installed..."
echo ""

docker exec komunidad-backend node /app/fix-superadmin-password.js > /tmp/fix-output.txt 2>&1
cat /tmp/fix-output.txt

# Extract the new hash from output
NEW_HASH=$(cat /tmp/fix-output.txt | grep "New hash:" | cut -d' ' -f3)

if [ -z "$NEW_HASH" ]; then
    echo -e "${RED}❌ Failed to generate new hash${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ New hash generated successfully${NC}"
echo ""

# Step 2: Update database
echo -e "${YELLOW}Step 2: Updating database...${NC}"
docker exec -i komunidad-db psql -U postgres -d komunidad <<EOF
UPDATE users
SET password_hash = '$NEW_HASH'
WHERE dni = '00000000';

SELECT dni, email, role, status,
       CASE
         WHEN password_hash = '$NEW_HASH' THEN 'Updated ✅'
         ELSE 'Not Updated ❌'
       END as password_status
FROM users
WHERE dni = '00000000';
EOF

echo ""
echo -e "${GREEN}✅ Database updated${NC}"
echo ""

# Step 3: Test login
echo -e "${YELLOW}Step 3: Testing login...${NC}"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "00000000",
    "password": "admin123"
  }')

http_body=$(echo "$response" | sed -e 's/HTTP_STATUS\:.*//g')
http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

if [ "$http_status" = "200" ]; then
    echo -e "${GREEN}✅ LOGIN SUCCESSFUL!${NC}"
    echo ""
    echo "Credentials:"
    echo "  DNI: 00000000"
    echo "  Password: admin123"
    echo ""
    token=$(echo "$http_body" | jq -r '.token' 2>/dev/null)
    if [ "$token" != "null" ] && [ "$token" != "" ]; then
        echo "Token received (first 50 chars):"
        echo "${token:0:50}..."
    fi
else
    echo -e "${RED}❌ LOGIN FAILED${NC}"
    echo "HTTP Status: $http_status"
    echo ""
    echo "Response:"
    echo "$http_body" | jq '.' 2>/dev/null || echo "$http_body"
fi

echo ""
echo "========================================"
