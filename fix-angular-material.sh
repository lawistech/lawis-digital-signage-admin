#!/bin/bash

# This script fixes Angular Material issues in the project

echo "Fixing Angular Material issues..."

# Step 1: Install Angular Material and its dependencies
echo "Installing Angular Material and its dependencies..."
npm install @angular/material @angular/cdk @angular/animations

# Step 2: Add Material Icons font
echo "Adding Material Icons font to index.html..."
if ! grep -q "https://fonts.googleapis.com/icon?family=Material+Icons" src/index.html; then
  sed -i '' 's/<head>/<head>\n  <link href="https:\/\/fonts.googleapis.com\/icon?family=Material+Icons" rel="stylesheet">/' src/index.html
fi

# Step 3: Add Angular Material theme to styles.css
echo "Ensuring Angular Material theme is in styles.css..."
if ! grep -q "@import '@angular/material/prebuilt-themes/indigo-pink.css';" src/styles.css; then
  sed -i '' '1s/^/@import '"'"'@angular\/material\/prebuilt-themes\/indigo-pink.css'"'"';\n\n/' src/styles.css
fi

# Step 4: Clear Angular cache
echo "Clearing Angular cache..."
ng cache clean

echo "Angular Material setup fixed successfully!"
echo "Please restart your development server with 'ng serve'"
