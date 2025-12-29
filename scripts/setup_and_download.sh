#!/bin/bash

# Complete setup script for downloading books 1157 and 16546 from Shamela
# This script handles: cloning crawler, setup, download, transform, and import

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$PROJECT_ROOT/data"
CRAWLER_DIR="$PROJECT_ROOT/shamela_crawler"

echo "=========================================="
echo "Shamela TTS Reader - Book Download Setup"
echo "=========================================="
echo ""

# Step 1: Setup shamela_crawler
echo "Step 1: Setting up shamela_crawler..."
if [ ! -d "$CRAWLER_DIR" ]; then
    echo "  Cloning shamela_crawler repository..."
    cd "$PROJECT_ROOT"
    git clone https://github.com/OpenShamela/shamela_crawler.git
else
    echo "  shamela_crawler already exists, skipping clone..."
fi

cd "$CRAWLER_DIR"

# Setup Python environment
if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv || python -m venv venv
fi

echo "  Activating virtual environment..."
source venv/bin/activate

echo "  Installing dependencies..."
pip install -q --upgrade pip

# Try installing from requirements.txt first, then try pip install .
if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt || {
        echo "  requirements.txt installation failed, trying pip install ."
        pip install -q .
    }
else
    echo "  requirements.txt not found, trying pip install ."
    pip install -q . || {
        echo "  pip install . failed, installing dependencies directly"
        pip install -q scrapy ebooklib sqlalchemy alembic tqdm h2
    }
fi

# Step 2: Create data directory
mkdir -p "$DATA_DIR"

# Step 3: Download books
echo ""
echo "Step 2: Downloading books from Shamela..."
echo "  Downloading book 1157..."
scrapy crawl book -a book_id=1157 -s MAKE_JSON=true -o "$DATA_DIR/book_1157_raw.json" 2>&1 | grep -v "DEBUG" || true

echo "  Downloading book 16546..."
scrapy crawl book -a book_id=16546 -s MAKE_JSON=true -o "$DATA_DIR/book_16546_raw.json" 2>&1 | grep -v "DEBUG" || true

# Step 4: Transform JSON files
echo ""
echo "Step 3: Transforming JSON files..."
cd "$PROJECT_ROOT"

if [ -f "$DATA_DIR/book_1157_raw.json" ]; then
    echo "  Transforming book_1157_raw.json..."
    node scripts/transform_shamela_json.js "$DATA_DIR/book_1157_raw.json" "$DATA_DIR/book_1157.json" || {
        echo "  Warning: Transformation failed for book 1157"
    }
fi

if [ -f "$DATA_DIR/book_16546_raw.json" ]; then
    echo "  Transforming book_16546_raw.json..."
    node scripts/transform_shamela_json.js "$DATA_DIR/book_16546_raw.json" "$DATA_DIR/book_16546.json" || {
        echo "  Warning: Transformation failed for book 16546"
    }
fi

# Step 5: Import to database
echo ""
echo "Step 4: Importing books to database..."
cd "$PROJECT_ROOT/backend"

if [ -f "$DATA_DIR/book_1157.json" ] && [ -f "$DATA_DIR/book_16546.json" ]; then
    echo "  Importing books..."
    npm run seed ../data/book_1157.json ../data/book_16546.json
    echo ""
    echo "=========================================="
    echo "✓ Setup complete! Books imported successfully."
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "⚠ Setup incomplete. Please check:"
    echo "  - JSON files in $DATA_DIR"
    echo "  - Run transformation manually if needed"
    echo "  - Then run: cd backend && npm run seed ../data/book_1157.json ../data/book_16546.json"
    echo "=========================================="
fi

