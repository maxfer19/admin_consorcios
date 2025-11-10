#!/bin/bash
# Script para probar el login del superadmin

echo "🔐 Testing Superadmin Login"
echo "=========================="
echo ""
echo "Testing with DNI: 00000000"
echo "Password: admin123"
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "00000000",
    "password": "admin123"
  }')

http_body=$(echo "$response" | sed -e 's/HTTP_STATUS\:.*//g')
http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "HTTP Status: $http_status"
echo ""
echo "Response Body:"
echo "$http_body" | jq '.' 2>/dev/null || echo "$http_body"
echo ""

if [ "$http_status" = "200" ]; then
    echo "✅ Login successful!"

    # Extract token
    token=$(echo "$http_body" | jq -r '.token' 2>/dev/null)
    if [ "$token" != "null" ] && [ "$token" != "" ]; then
        echo ""
        echo "🎫 Token received (first 50 chars):"
        echo "${token:0:50}..."
    fi
else
    echo "❌ Login failed!"
fi
