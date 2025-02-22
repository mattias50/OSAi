#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Print header
echo -e "\n${BOLD}${BLUE}================================${NC}"
echo -e "${BOLD}${BLUE}   OSAi Test Suite Runner${NC}"
echo -e "${BOLD}${BLUE}================================${NC}\n"

# Function to print step headers
print_step() {
    echo -e "\n${BOLD}${BLUE}>> $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check if Python is installed
print_step "Checking Python installation"
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 and try again."
fi
print_success "Python 3 is installed"

# Check if pip is installed
print_step "Checking pip installation"
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3 and try again."
fi
print_success "pip3 is installed"

# Check if Node.js is installed
print_step "Checking Node.js installation"
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js and try again."
fi
print_success "Node.js is installed"

# Create and activate virtual environment
print_step "Setting up Python virtual environment"
python3 -m venv venv
source venv/bin/activate
print_success "Virtual environment created and activated"

# Install Python dependencies
print_step "Installing Python dependencies"
pip install -r requirements.txt
print_success "Python dependencies installed"

# Install OSAi
print_step "Installing OSAi"
cd ../../
npm install
npm run build
cd tests/test_app
print_success "OSAi installed"

# Run the tests
print_step "Running tests"
echo -e "\n${BOLD}Starting test suite...${NC}\n"
python test_monitoring.py

# Check test result
if [ $? -eq 0 ]; then
    echo -e "\n${BOLD}${GREEN}================================${NC}"
    echo -e "${BOLD}${GREEN}      All Tests Passed! 🎉${NC}"
    echo -e "${BOLD}${GREEN}================================${NC}\n"
else
    echo -e "\n${BOLD}${RED}================================${NC}"
    echo -e "${BOLD}${RED}      Tests Failed! ❌${NC}"
    echo -e "${BOLD}${RED}================================${NC}\n"
    exit 1
fi

# Cleanup
print_step "Cleaning up"
deactivate
rm -rf venv
print_success "Cleanup completed"

echo -e "\n${BOLD}${GREEN}Test suite completed successfully!${NC}\n"