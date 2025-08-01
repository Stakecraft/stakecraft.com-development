#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js
check_node() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
}

# Function to check MongoDB connection
check_mongodb() {
    print_status "Checking MongoDB connection..."
    
    cd stakecraft-backend
    
    # Test database connection
    if node -e "
    import('dotenv').then(dotenv => {
        dotenv.config();
        import('mongoose').then(mongoose => {
            mongoose.connect(process.env.MONGODB_URI)
                .then(() => {
                    console.log('✅ MongoDB connection successful');
                    process.exit(0);
                })
                .catch(err => {
                    console.log('❌ MongoDB connection failed:', err.message);
                    process.exit(1);
                });
        });
    });
    " 2>/dev/null; then
        print_success "MongoDB connection successful"
    else
        print_error "MongoDB connection failed. Please check your MONGODB_URI in .env file"
        exit 1
    fi
    
    cd ..
}

# Function to install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd stakecraft-backend
    
    print_status "Installing backend dependencies..."
    npm install
    
    if [ ! -f .env ]; then
        print_warning "Creating .env file from example..."
        cp env.example .env
        print_warning "Please edit stakecraft-backend/.env with your configuration."
    fi
    
    # Create uploads directory
    mkdir -p uploads
    
    print_success "Backend setup completed."
    cd ..
}

# Function to seed test data
seed_data() {
    print_status "Seeding test data..."
    cd stakecraft-backend
    
    print_status "Seeding content data..."
    npm run seed
    
    print_status "Seeding user data..."
    npm run seed:users
    
    print_success "Data seeding completed."
    cd ..
}

# Function to test the API
test_api() {
    print_status "Testing API endpoints..."
    cd stakecraft-backend
    
    # Start server in background
    print_status "Starting server for testing..."
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Run API tests
    print_status "Running API tests..."
    npm run test:api
    
    # Stop server
    kill $SERVER_PID 2>/dev/null
    
    print_success "API testing completed."
    cd ..
}

# Function to show usage information
show_usage() {
    echo -e "${BLUE}StakeCraft Controller Setup Script${NC}"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  setup       - Install dependencies and setup backend"
    echo "  seed        - Seed test data (users and content)"
    echo "  test        - Test API endpoints"
    echo "  all         - Run complete setup (setup + seed + test)"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    - Install dependencies only"
    echo "  $0 seed     - Seed test data only"
    echo "  $0 all      - Complete setup"
}

# Main function
main() {
    case "${1:-all}" in
        "setup")
            print_status "Running setup only..."
            check_node
            setup_backend
            check_mongodb
            print_success "Setup completed successfully!"
            ;;
        "seed")
            print_status "Running seed only..."
            check_mongodb
            seed_data
            print_success "Seeding completed successfully!"
            ;;
        "test")
            print_status "Running tests only..."
            test_api
            print_success "Testing completed successfully!"
            ;;
        "all")
            print_status "Running complete setup..."
            check_node
            setup_backend
            check_mongodb
            seed_data
            test_api
            print_success "Complete setup finished successfully!"
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Invalid option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Show final information
show_final_info() {
    echo ""
    echo -e "${BLUE}🎉 Setup Complete!${NC}"
    echo "=================="
    echo ""
    echo -e "${GREEN}📋 What was created:${NC}"
    echo "• User and Content controllers with full CRUD operations"
    echo "• Test data for users and content"
    echo "• API endpoints for user and content management"
    echo "• Comprehensive validation and error handling"
    echo ""
    echo -e "${GREEN}🔐 Test User Credentials:${NC}"
    echo "• Admin: admin / admin123"
    echo "• Editor: editor1 / editor123"
    echo "• Manager: manager / manager123"
    echo ""
    echo -e "${GREEN}🌐 Access URLs:${NC}"
    echo "• Frontend Admin Panel: http://localhost:3000/notadmin"
    echo "• API Base URL: http://localhost:5000/api"
    echo "• Health Check: http://localhost:5000/health"
    echo ""
    echo -e "${GREEN}📚 Available Scripts:${NC}"
    echo "• npm run dev          - Start development server"
    echo "• npm run seed         - Seed content data"
    echo "• npm run seed:users   - Seed user data"
    echo "• npm run seed:all     - Seed all data"
    echo "• npm run test:api     - Test API endpoints"
    echo ""
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo "1. Start the backend: cd stakecraft-backend && npm run dev"
    echo "2. Start the frontend: cd stakecraft-frontend && npm run dev"
    echo "3. Access admin panel at http://localhost:3000/notadmin"
    echo "4. Login with admin credentials to manage content"
}

# Run main function
main "$@"

# Show final information if setup was successful
if [ $? -eq 0 ]; then
    show_final_info
fi 