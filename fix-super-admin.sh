#!/bin/bash

# This script fixes the issues in the Super Admin section

echo "Fixing Super Admin issues..."

# Step 1: Install Angular Material
echo "Installing Angular Material..."
npm install @angular/material

# Step 2: Install other dependencies
echo "Installing other dependencies..."
npm install

# Step 3: Add Angular Material theme to styles.css
echo "Adding Angular Material theme to styles.css..."
if ! grep -q "@import '@angular/material/prebuilt-themes/indigo-pink.css';" src/styles.css; then
  echo "@import '@angular/material/prebuilt-themes/indigo-pink.css';" >> src/styles.css
fi

# Step 4: Clear Angular cache
echo "Clearing Angular cache..."
ng cache clean

echo "Fix completed!"
echo "Please restart your development server with 'ng serve'"
echo "If you still encounter issues, please refer to the FIX-SUPER-ADMIN-ERRORS.md file for more detailed instructions."
