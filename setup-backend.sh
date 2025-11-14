#!/bin/bash

# FinFlow Backend Setup Script
# This script helps set up Supabase + Blockchain backend

set -e  # Exit on error

echo "🚀 FinFlow Backend Setup"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm $(npm -v) found"

echo ""
echo "Step 1: Installing Supabase dependencies..."
npm install @supabase/supabase-js@latest
print_success "Supabase dependencies installed"

echo ""
echo "Step 2: Installing Web3 dependencies..."
npm install ethers@^6.10.0 wagmi@^2.5.0 viem@^2.7.0 @tanstack/react-query@^5.20.0
print_success "Web3 dependencies installed"

echo ""
echo "Step 3: Installing Smart Contract development tools..."
npm install -D hardhat @nomicfoundation/hardhat-toolbox @typechain/hardhat @typechain/ethers-v6 @openzeppelin/contracts
print_success "Smart contract tools installed"

echo ""
echo "Step 4: Setting up environment files..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    print_success ".env.local created from .env.example"
    print_info "⚠️  Please update .env.local with your actual credentials"
else
    print_info ".env.local already exists (not overwriting)"
fi

echo ""
echo "Step 5: Initializing Hardhat..."
if [ ! -d "contracts" ]; then
    mkdir -p contracts
    print_success "Created contracts directory"
else
    print_info "contracts directory already exists"
fi

echo ""
print_success "Backend setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your Supabase credentials"
echo "  2. Set up Supabase project: https://supabase.com/dashboard"
echo "  3. Run database migrations (see IMPLEMENTATION_GUIDE.md)"
echo "  4. Deploy smart contracts (see contracts/ directory)"
echo "  5. Start development: npm run dev"
echo ""
echo "📚 Documentation:"
echo "  • BACKEND_MIGRATION_PLAN.md - Overall migration strategy"
echo "  • IMPLEMENTATION_GUIDE.md - Step-by-step implementation"
echo ""
