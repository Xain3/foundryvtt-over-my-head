#!/bin/bash
# Example: Using Environment Variables for Local Development
#
# This script shows different ways to use environment variables
# to control debug and development flags during local development.

echo "=== FoundryVTT Over My Head - Flag Management Examples ==="
echo ""

# Example 1: Run with debug mode enabled
echo "1. Running with debug mode enabled..."
FOMH_DEBUG_MODE=true npm run dev
echo ""

# Example 2: Run tests with debug logging
echo "2. Running tests with debug logging..."
FOMH_DEBUG_MODE=true npm test
echo ""

# Example 3: Run with production-like settings
echo "3. Running with production-like settings..."
FOMH_DEBUG_MODE=false FOMH_DEV=false npm run build
echo ""

# Example 4: Set environment for entire session
echo "4. Setting environment for entire session..."
export FOMH_DEBUG_MODE=true
export FOMH_DEV=true
echo "Environment variables set:"
echo "  FOMH_DEBUG_MODE=$FOMH_DEBUG_MODE"
echo "  FOMH_DEV=$FOMH_DEV"
echo ""
echo "Now all commands will use these settings until you close the terminal"
echo ""

# Example 5: Create a .env file for persistent settings (if using dotenv)
echo "5. Example .env file content:"
cat << 'DOTENV'
# Development settings
FOMH_DEBUG_MODE=true
FOMH_DEV=true

# Or for production testing:
# FOMH_DEBUG_MODE=false
# FOMH_DEV=false
DOTENV
echo ""

# Example 6: Different configurations for different scenarios
echo "6. Quick configuration presets:"
echo ""
echo "  Development (full debugging):"
echo "    FOMH_DEBUG_MODE=true FOMH_DEV=true npm run dev"
echo ""
echo "  Testing (production-like):"
echo "    FOMH_DEBUG_MODE=false FOMH_DEV=false npm test"
echo ""
echo "  Debug tests only:"
echo "    FOMH_DEBUG_MODE=true npm run test:unit"
echo ""

# Example 7: Using with Docker
echo "7. Using with Docker Compose:"
cat << 'DOCKER'
# Add to your docker-compose.yml:
services:
  foundry:
    environment:
      - FOMH_DEBUG_MODE=true
      - FOMH_DEV=true
DOCKER
echo ""

# Example 8: Quick toggle aliases (add to ~/.bashrc or ~/.zshrc)
echo "8. Convenience aliases for your shell:"
cat << 'ALIASES'
# Add to ~/.bashrc or ~/.zshrc:
alias omh-dev='FOMH_DEBUG_MODE=true FOMH_DEV=true npm run dev'
alias omh-test='FOMH_DEBUG_MODE=true npm test'
alias omh-prod='FOMH_DEBUG_MODE=false FOMH_DEV=false npm run build'
ALIASES
echo ""

echo "=== Examples Complete ==="
