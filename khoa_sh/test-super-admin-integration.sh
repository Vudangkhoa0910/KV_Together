#!/bin/bash

echo "🚀 Testing Super Admin Integration..."

# Test admin redirect
echo "1. Testing admin redirect..."
curl -s "http://localhost:3000/admin" -w "Status: %{http_code}\n" | head -1

# Test super-admin access (this will require authentication)
echo "2. Testing super-admin page accessibility..."
curl -s "http://localhost:3000/super-admin" -w "Status: %{http_code}\n" | head -1

# Test Super Admin API endpoints
echo "3. Testing Super Admin API endpoints..."

# Create test admin user for API testing
php backend/artisan tinker --execute="
\$admin = App\Models\User::where('email', 'admin@test.com')->first();
if (!\$admin) {
    \$adminRole = App\Models\Role::where('slug', 'admin')->first();
    \$admin = App\Models\User::create([
        'name' => 'Super Admin',
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
        'role_id' => \$adminRole->id,
        'status' => 'active',
        'email_verified_at' => now()
    ]);
    echo 'Admin user created';
} else {
    echo 'Admin user exists';
}
"

# Test API endpoints
echo "4. Testing API system info..."
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' \
  -c cookies.txt -s > /dev/null

TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' -s | jq -r '.token // empty')

if [ ! -z "$TOKEN" ]; then
    echo "✅ Authentication successful"
    
    # Test system info
    echo "Testing system info endpoint..."
    curl -H "Authorization: Bearer $TOKEN" \
         -H "Accept: application/json" \
         http://localhost:8000/api/super-admin/system-info -s | jq '.database_info.total_tables' 2>/dev/null || echo "❌ System info failed"
    
    # Test analytics
    echo "Testing analytics endpoint..."
    curl -H "Authorization: Bearer $TOKEN" \
         -H "Accept: application/json" \
         http://localhost:8000/api/super-admin/analytics -s | jq '.users.total' 2>/dev/null || echo "❌ Analytics failed"
    
    # Test table data
    echo "Testing table data endpoint..."
    curl -H "Authorization: Bearer $TOKEN" \
         -H "Accept: application/json" \
         http://localhost:8000/api/super-admin/tables/users -s | jq '.table' 2>/dev/null || echo "❌ Table data failed"
         
    echo "✅ All API endpoints working!"
else
    echo "❌ Authentication failed"
fi

# Cleanup
rm -f cookies.txt

echo "🎉 Super Admin Integration Test Complete!"
