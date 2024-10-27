#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Navigate to the parent directory
cd ..

# Ensure the release directory exists
mkdir -p release

# Create a zip and a tar.gzz file excluding the "release" directory, the .git directory, and the files .gitignore, .gitattributes
zip -r module.zip . -x "release/*" -x ".git/*" -x ".gitignore" -x ".gitattributes"
tar -czf module.tar.gz . --exclude="release/*" --exclude=".git/*" --exclude=".gitignore" --exclude=".gitattributes"

# Create an array of all the files to copy to the release directory
files=("LICENSE" "module.json" "README.md" "CHANGELOG.md" "CONTRIBUTING.md" "COPYING")

# Copy the files to the release directory if they exist
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" release
    fi
done


# Navigate to the release directory
cd release

# Get the version from the module.json file
version=$(jq -r .version module.json)

# Get the current date in the format YYYY-MM-DD
date=$(date +%Y-%m-%d)

# Replace {version} in the README.md file with the actual version if README.md is not empty
if [ -s README.md ]; then
    sed -i "s/{version}/$version/g" README.md
    sed -i "s/{date}/$date/g" README.md
else 
    echo "Over my head - Version $version ($date)" > README.md
fi

# Create a release on GitHub using the GitHub CLI
gh release create "$version" module.zip -F README.md