#!/bin/bash

# Central Buy API — Local Development Setup
# This script sets up PostgreSQL + Redis using docker-compose
# and initializes the database with seed data

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  Central Buy API — Local Testing Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  docker-compose is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${BLUE}1️⃣  Starting PostgreSQL + Redis containers...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ Containers started${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${BLUE}2️⃣  Waiting for PostgreSQL to be ready...${NC}"
sleep 5
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  PostgreSQL failed to start after 30 attempts${NC}"
        exit 1
    fi
    echo "   Attempt $i/30..."
    sleep 1
done

echo ""
echo -e "${BLUE}3️⃣  Loading seed data into PostgreSQL...${NC}"
docker-compose exec -T postgres psql -U postgres -d centralbuy -f /dev/stdin < scripts/seed.sql

echo -e "${GREEN}✅ Seed data loaded${NC}"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Local Development Environment Ready!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}Database Connection:${NC}"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: postgres"
echo "  Pass: postgres"
echo "  DB:   centralbuy"
echo ""
echo -e "${BLUE}Redis Connection:${NC}"
echo "  Host: localhost"
echo "  Port: 6379"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Update .env if needed"
echo "  2. Run: pnpm install && pnpm run start:dev"
echo "  3. API will be available at: http://localhost:3000"
echo "  4. Swagger Docs at: http://localhost:3000/api/docs"
echo ""
echo -e "${BLUE}Test Users:${NC}"
echo "  - particular@centralbuy.local (plan: particular)"
echo "  - empresa@centralbuy.local (plan: empresa)"
echo "  - consultant@centralbuy.local (plan: particular)"
echo "  - admin@centralbuy.local (plan: admin)"
echo ""
echo -e "${YELLOW}To stop containers: docker-compose down${NC}"
echo -e "${YELLOW}To view logs: docker-compose logs -f${NC}"
echo ""
