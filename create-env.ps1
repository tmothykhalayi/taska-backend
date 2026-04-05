# Create .env file and setup instructions for Windows
Write-Host "🔧 Creating Missing .env File" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Create .env file
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=healthcare_connect

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_key_here_make_it_long_and_secure_123456789
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here_make_it_long_and_secure_123456789

# Email Configuration (REQUIRED for email service)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Server Configuration
PORT=8000
NODE_ENV=development
"@

if (-not (Test-Path $envPath)) {
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ Created .env file with default configuration" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Update the .env file with your actual database credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 CRITICAL STEPS TO FIX THE LOGIN ISSUE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔧 UPDATE .env FILE:" -ForegroundColor White
Write-Host "   - Open healthcare-connect/.env" -ForegroundColor Gray
Write-Host "   - Change DB_PASSWORD to your actual PostgreSQL password" -ForegroundColor Gray
Write-Host "   - Change DB_USERNAME if different from 'postgres'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🗄️  SETUP DATABASE:" -ForegroundColor White
Write-Host "   - Make sure PostgreSQL is running" -ForegroundColor Gray
Write-Host "   - Create database: createdb healthcare_connect" -ForegroundColor Gray
Write-Host "   - Or use pgAdmin to create the database" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 START BACKEND:" -ForegroundColor White
Write-Host "   cd healthcare-connect" -ForegroundColor Gray
Write-Host "   pnpm run start:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 👤 CREATE TEST USER:" -ForegroundColor White
Write-Host "   Use one of these methods:" -ForegroundColor Gray
Write-Host ""
Write-Host "   Method A - Using PowerShell:" -ForegroundColor Gray
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:8000/users' -Method POST -ContentType 'application/json' -Body '{\"email\": \"timothykhalayi96@gmail.com\", \"password\": \"Test1234!\", \"firstName\": \"Timothy\", \"lastName\": \"Khalayi\", \"phoneNumber\": \"+254700000000\", \"role\": \"admin\", \"isEmailVerified\": true}'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Method B - Using VS Code REST Client:" -ForegroundColor Gray
Write-Host "   - Open test-valid-users.http in VS Code" -ForegroundColor DarkGray
Write-Host "   - Install 'REST Client' extension" -ForegroundColor DarkGray
Write-Host "   - Click 'Send Request' on the user creation request" -ForegroundColor DarkGray
Write-Host ""
Write-Host "5. 🧪 TEST LOGIN:" -ForegroundColor White
Write-Host "   - Email: timothykhalayi96@gmail.com" -ForegroundColor Gray
Write-Host "   - Password: Test1234!" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 QUICK TEST (if you want to test immediately):" -ForegroundColor Cyan
Write-Host "   - Email: timoth@gmail.com, Password: 123" -ForegroundColor Gray
Write-Host "   - Email: esthy.nandwa@example.com, Password: 123" -ForegroundColor Gray
Write-Host ""
Write-Host "❓ TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host "- If you get database connection errors, check PostgreSQL is running" -ForegroundColor Gray
Write-Host "- If you get 500 errors, check your .env file is properly configured" -ForegroundColor Gray
Write-Host "- If user creation fails, check the backend logs for specific errors" -ForegroundColor Gray 