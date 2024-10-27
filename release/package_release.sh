#!/bin/bash

PRERELEASE=""
DRAFT=""
RELEASE=""
PACKAGE_ONLY=false
TARGET=""

# Function to display help message
show_help() {
    echo "Usage: package_release.sh [-p] [-r] [-d] [-P] [-h]"
    echo ""
    echo "Options:"
    echo "  -p        Create a pre-release"
    echo "  -r        Create a release"
    echo "  -d        Create a draft release"
    echo "  -P        Package only, do not create a release"
    echo "  -h, --help  Show this help message"
}

# Parse command line arguments
while getopts "prdPht:" opt; do
    case $opt in
        p)
            PRERELEASE="--prerelease"
            p=true
            ;;
        d) 
            DRAFT="--draft"
            d=true
            ;;
        r)
            PRERELEASE=""
            r=true
            ;;
        P)
            PACKAGE_ONLY=true
            ;;
        t)
            TARGET=--target $OPTARG
            ;;
        h)
            show_help
            exit 0
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            show_help
            exit 1
            ;;
    esac
done

# p and r are mutually exclusive and one of them must be provided
if [ "$p" = true ] && [ "$r" = true ]; then
    echo "Options -p and -r are mutually exclusive" >&2
    exit 1
elif [ "$p" != true ] && [ "$r" != true ]; then
    echo "One of the options -p or -r must be provided" >&2
    exit 1
fi

# Exit immediately if a command exits with a non-zero status
set -e

# If the current directory is the release directory, navigate to the parent directory
if [ "$(basename "$(pwd)")" == "release" ]; then
    cd ..
fi

# Ensure the release directory exists
mkdir -p release

# Create an array of all the files to copy to the release directory
echo "Copying files to release directory"
files=("module.json" "README.md" "CHANGELOG.md" "CONTRIBUTING.md" "COPYING.md")

# Copy the files to the release directory if they exist
for file in "${files[@]}"; do
    if [ -s "$file" ]; then
        cp -f "$file" release;
    else
        # Remove the file from the array if it does not exist
        files=("${files[@]/$file}")
    fi
done

# Create a zip and a tar.gz file excluding the "release" directory, the .git directory, and the files .gitignore, .gitattributes
# Remove the existing module.zip file if it exists
if [ -f release/module.zip ]; then
    rm -f release/module.zip
    echo "Removed existing module.zip"
fi

echo "Creating module.zip"
zip -r release/module ./* -x "release/*" -x ".git/*" -x ".gitignore" -x ".gitattributes"
echo Created module.zip
# echo "Creating module.tar.gz"
# tar --exclude='./release' --exclude='./.git' --exclude='./.gitignore' --exclude='./.gitattributes' --overwrite -czf release/module.tar.gz .

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
echo "Updated README.md with version $version"

# If not in package only mode, create a release on GitHub using the GitHub CLI
if [ "$PACKAGE_ONLY" = false ]; then
    echo "Creating a release on GitHub"
    # Expand the files array into a string of files separated by spaces
    attachments=$(printf " %s" "${files[@]}")
    changelog=""
    if CHANGELOG in files; then
        changelog=--notes-file CHANGELOG.md
    fi
    gh release create "v$version" module.zip $attachments --title "v$version" $changelog $PRERELEASE $DRAFT $TARGET
fi