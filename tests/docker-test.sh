#!/bin/sh
set -e

if ! command -v docker > /dev/null 2>&1 || ! docker info > /dev/null 2>&1; then
    echo "Docker is not available. Skipping docker integration tests."
    echo "This command is intended for CI environments."
    exit 0
fi

echo "Starting test PostgreSQL..."
docker compose -f docker-compose.test.yml up -d --wait

echo "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
    if docker compose -f docker-compose.test.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "PostgreSQL failed to start"
        docker compose -f docker-compose.test.yml down
        exit 1
    fi
    sleep 1
done

export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/inventory_control_test"
export JWT_SECRET="test-secret-docker"

echo ""
echo "Running unit tests..."
pnpm test:unit

echo ""
echo "Running integration tests..."
pnpm test:integration

echo ""
echo "Running e2e tests..."
pnpm test:e2e

echo ""
echo "All tests passed!"
docker compose -f docker-compose.test.yml down
