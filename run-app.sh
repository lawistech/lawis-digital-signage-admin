#!/bin/bash

# This script runs the application with the necessary fixes

echo "Starting the application..."

# Clear Angular cache
echo "Clearing Angular cache..."
ng cache clean

# Start the application
echo "Starting the development server..."
ng serve

echo "Application started!"
