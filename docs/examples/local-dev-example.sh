#!/bin/bash
set -e
set -u
# Example: Using Environment Variables for Local Development
#
# This script shows different ways to use environment variables
# to control debug and development flags during local development.

echo "=== FoundryVTT Over My Head - Flag Management Examples ==="
echo ""

# Example 1: Run with debug mode enabled
echo "1. Running with debug mode enabled..."
OMH_DEBUG_MODE=true npm run dev
echo ""

# Example 2: Run tests with debug logging
echo "2. Running tests with debug logging..."
OMH_DEBUG_MODE=true npm test
echo ""

# Example 3: Run with production-like settings
echo "3. Running with production-like settings..."
OMH_DEBUG_MODE=false OMH_DEV=false npm run build
echo ""

# Example 4: Set environment for entire session
echo "4. Setting environment for entire session..."
export OMH_DEBUG_MODE=true
export OMH_DEV=true
echo "Environment variables set:"
echo "  OMH_DEBUG_MODE=$OMH_DEBUG_MODE"
echo "  OMH_DEV=$OMH_DEV"
echo ""
echo "Now all commands will use these settings until you close the terminal"
echo ""

# Example 5: Create a .env file for persistent settings (if using dotenv)
echo "5. Example .env file content:"
cat << 'DOTENV'
# Development settings
OMH_DEBUG_MODE=true
OMH_DEV=true

# Or for production testing:
# OMH_DEBUG_MODE=false
# OMH_DEV=false
DOTENV
echo ""

# Example 6: Different configurations for different scenarios
echo "6. Quick configuration presets:"
echo ""
echo "  Development (full debugging):"
echo "    OMH_DEBUG_MODE=true OMH_DEV=true npm run dev"
echo ""
echo "  Testing (production-like):"
echo "    OMH_DEBUG_MODE=false OMH_DEV=false npm test"
echo ""
echo "  Debug tests only:"
echo "    OMH_DEBUG_MODE=true npm run test:unit"
echo ""

# Example 7: Using with Docker
echo "7. Using with Docker Compose:"
cat << 'DOCKER'
# Add to your docker-compose.yml:
services:
  foundry:
    environment:
      - OMH_DEBUG_MODE=true
      - OMH_DEV=true
DOCKER
echo ""

# Example 8: Quick toggle aliases (add to ~/.bashrc or ~/.zshrc)
echo "8. Convenience aliases for your shell:"
cat << 'ALIASES'
# Add to ~/.bashrc or ~/.zshrc:
alias omh-dev='OMH_DEBUG_MODE=true OMH_DEV=true npm run dev'
alias omh-test='OMH_DEBUG_MODE=true npm test'
alias omh-prod='OMH_DEBUG_MODE=false OMH_DEV=false npm run build'
ALIASES
echo ""

echo "=== Examples Complete ==="
