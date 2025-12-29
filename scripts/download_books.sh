#!/bin/bash

# Script to download books from Shamela Library using shamela_crawler
# Books to download: 1157 and 16546

set -e

echo "Setting up shamela_crawler and downloading books..."

# Check if shamela_crawler directory exists
if [ ! -d "shamela_crawler" ]; then
    echo "Cloning shamela_crawler repository..."
    git clone https://github.com/OpenShamela/shamela_crawler.git
fi

cd shamela_crawler

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -q -r requirements.txt || {
        echo "  Trying pip install ."
        pip install -q .
    }
else
    pip install -q . || {
        pip install -q scrapy ebooklib sqlalchemy alembic tqdm h2
    }
fi

# Create data directory if it doesn't exist
mkdir -p ../data

# Download book 1157
echo "Downloading book 1157..."
scrapy crawl book -a book_id=1157 -s MAKE_JSON=true -o ../data/book_1157.json 2>&1 | grep -v "DEBUG" || {
    echo "Warning: Book 1157 download may have issues. Check output above."
}

# Download book 16546
echo "Downloading book 16546..."
scrapy crawl book -a book_id=16546 -s MAKE_JSON=true -o ../data/book_16546.json 2>&1 | grep -v "DEBUG" || {
    echo "Warning: Book 16546 download may have issues. Check output above."
}

echo ""
echo "Download complete! Check ../data/ directory for JSON files."
echo "Next step: Run 'npm run seed' in the backend directory to import books."

