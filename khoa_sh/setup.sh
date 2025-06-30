#!/bin/bash

# 🚀 KV Together - Auto Setup Script
# Tự động setup toàn bộ dự án từ đầu

echo "🚀 KV Together - Auto Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running from project root
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    print_error "Please run this script from the KV_Together root directory"
    exit 1
fi

print_info "Starting KV Together setup..."

# Step 1: Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
print_status "Node.js $(node -v) ✓"

# Check PHP
if ! command -v php &> /dev/null; then
    print_error "PHP is not installed. Please install PHP 8.2+ first"
    exit 1
fi
PHP_VERSION=$(php -v | head -n 1 | cut -d' ' -f2 | cut -d'.' -f1-2)
print_status "PHP $PHP_VERSION ✓"

# Check Composer
if ! command -v composer &> /dev/null; then
    print_error "Composer is not installed. Please install Composer first"
    exit 1
fi
print_status "Composer $(composer -V | cut -d' ' -f3) ✓"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client not found. Make sure MySQL server is running"
else
    print_status "MySQL client ✓"
fi

# Step 2: Setup Backend
echo ""
echo "⚡ Setting up Backend (Laravel)..."

cd backend

# Install PHP dependencies
print_info "Installing PHP dependencies..."
if composer install; then
    print_status "PHP dependencies installed"
else
    print_error "Failed to install PHP dependencies"
    exit 1
fi

# Setup environment
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cp .env.example .env
    print_status ".env file created"
fi

# Generate application key
print_info "Generating application key..."
if php artisan key:generate; then
    print_status "Application key generated"
else
    print_error "Failed to generate application key"
    exit 1
fi

# Database setup
echo ""
print_info "Setting up database..."
echo "Please ensure your MySQL server is running and create a database named 'kv_together'"
echo "Update your .env file with correct database credentials"

read -p "Have you created the database and updated .env? (y/N): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Run migrations
    print_info "Running database migrations..."
    if php artisan migrate; then
        print_status "Database migrations completed"
    else
        print_error "Failed to run migrations"
        exit 1
    fi

    # Run seeders
    print_info "Seeding database with sample data..."
    if php artisan db:seed; then
        print_status "Database seeded successfully"
    else
        print_error "Failed to seed database"
        exit 1
    fi

    # Create storage link
    print_info "Creating storage link..."
    if php artisan storage:link; then
        print_status "Storage link created"
    else
        print_warning "Storage link creation failed (might already exist)"
    fi

    # Create required directories
    mkdir -p storage/app/public/campaigns
    mkdir -p storage/app/public/activities
    mkdir -p storage/app/public/avatars
    print_status "Storage directories created"
else
    print_warning "Skipping database setup. Please run manually:"
    echo "  php artisan migrate"
    echo "  php artisan db:seed"
    echo "  php artisan storage:link"
fi

cd ..

# Step 3: Setup Frontend
echo ""
echo "🎨 Setting up Frontend (Next.js)..."

cd frontend

# Install Node dependencies
print_info "Installing Node.js dependencies..."
if npm install; then
    print_status "Node.js dependencies installed"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Setup environment
if [ ! -f ".env.local" ]; then
    print_info "Creating .env.local file..."
    cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
EOL
    print_status ".env.local file created"
fi

# Build check
print_info "Checking TypeScript compilation..."
if npm run type-check; then
    print_status "TypeScript compilation successful"
else
    print_warning "TypeScript compilation has warnings"
fi

cd ..

# Step 4: Root setup
echo ""
echo "📦 Setting up root dependencies..."

if [ -f "package.json" ]; then
    if npm install; then
        print_status "Root dependencies installed"
    else
        print_error "Failed to install root dependencies"
    fi
fi

# Step 5: Create helpful scripts
echo ""
print_info "Creating helpful scripts..."

# Create start script
cat > start.sh << 'EOL'
#!/bin/bash
echo "🚀 Starting KV Together development servers..."

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "⚡ Starting Laravel backend on http://localhost:8000"
cd backend
php artisan serve --port=8000 &
BACKEND_PID=$!

# Wait a moment
sleep 2

# Start frontend
echo "🎨 Starting Next.js frontend on http://localhost:3000"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
EOL

chmod +x start.sh

# Create database reset script
cat > reset-db.sh << 'EOL'
#!/bin/bash
echo "🗄️ Resetting database..."
cd backend
php artisan migrate:fresh --seed
php artisan storage:link
echo "✅ Database reset complete!"
EOL

chmod +x reset-db.sh

print_status "Helper scripts created (start.sh, reset-db.sh)"

# Step 6: Final summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_status "Backend setup complete ✓"
print_status "Frontend setup complete ✓"
print_status "Helper scripts created ✓"
echo ""
echo "📋 Next steps:"
echo "   1. Update backend/.env with your database credentials"
echo "   2. Run './start.sh' to start both servers"
echo "   3. Visit http://localhost:3000 to see the application"
echo ""
echo "🔧 Useful commands:"
echo "   ./start.sh                    # Start both servers"
echo "   ./reset-db.sh                 # Reset database with fresh data"
echo "   cd backend && php artisan tinker  # Laravel console"
echo "   cd frontend && npm run build  # Build for production"
echo ""
echo "📚 Documentation:"
echo "   README.md              # Project overview"
echo "   DEVELOPMENT_GUIDE.md   # Detailed development guide"
echo "   DATABASE_GUIDE.md      # Database schema and queries"
echo "   PRESENTATION_SLIDES.md # Presentation materials"
echo ""
echo "🎯 Default login credentials:"
echo "   Admin: admin@kvtogether.com / admin123"
echo "   Test user: Check UserSeeder.php for more accounts"
echo ""

# Check if we should start the servers
read -p "Do you want to start the development servers now? (y/N): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting development servers..."
    ./start.sh
fi

print_status "Setup script completed successfully! 🚀"
