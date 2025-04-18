#!/bin/bash

# Check if at least input directory is provided
if [ $# -lt 1 ]; then
  echo "Usage: $0 <input-directory> [output-file.md]"
  echo "If output-file is not specified, combined-markdown.md will be used"
  exit 1
fi

INPUT_DIR="$1"
OUTPUT_FILE="${2:-combined-markdown.md}"

# Validate input directory exists
if [ ! -d "$INPUT_DIR" ]; then
  echo "Error: Directory '$INPUT_DIR' does not exist"
  exit 1
fi

echo "Searching for markdown files in '$INPUT_DIR'..."

# Find all markdown files recursively and sort them
MD_FILES=$(find "$INPUT_DIR" -type f -name "*.md" | sort)

# Count the number of files found
FILE_COUNT=$(echo "$MD_FILES" | grep -c "")
if [ "$FILE_COUNT" -eq 0 ]; then
  echo "No markdown files found"
  exit 1
fi

echo "Found $FILE_COUNT markdown files"

# Create or truncate the output file
> "$OUTPUT_FILE"

# Counter for progress
COUNTER=0

# Process each markdown file
echo "$MD_FILES" | while read -r file; do
  COUNTER=$((COUNTER + 1))
  echo "Processing [$COUNTER/$FILE_COUNT]: $file"
  
  # Add a separator if it's not the first file
  if [ $COUNTER -gt 1 ]; then
    echo -e "\n\n---\n" >> "$OUTPUT_FILE"
  fi
  
  # Add file path as a header
  echo -e "# File: $file\n" >> "$OUTPUT_FILE"
  
  # Append file content
  cat "$file" >> "$OUTPUT_FILE"
done

echo "Successfully combined $FILE_COUNT markdown files into '$OUTPUT_FILE'"