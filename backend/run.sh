#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example and fill in your values."
    exit 1
fi

echo "Loading environment variables..."
set -a
source .env
set +a

echo "Building project..."
mvn clean package -DskipTests -q

echo "Starting backend..."
mvn spring-boot:run
