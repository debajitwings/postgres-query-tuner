#!/bin/bash

# PostgreSQL Query Tuner - Deployment Script
# This script helps you deploy the application to various platforms

set -e

echo "🚀 PostgreSQL Query Tuner - Deployment Helper"
echo "=============================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy with Docker
deploy_docker() {
    echo "📦 Deploying with Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    echo "Building Docker image..."
    docker build -t postgres-query-tuner .
    
    echo "Starting container..."
    docker run -d \
        -p 3000:3000 \
        --name postgres-query-tuner \
        --env-file .env \
        --restart unless-stopped \
        postgres-query-tuner
    
    echo "✅ Docker deployment complete!"
    echo "Access your app at: http://localhost:3000"
}

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo "📦 Deploying with Docker Compose..."
    
    if ! command_exists docker-compose; then
        echo "❌ Docker Compose is not installed."
        exit 1
    fi
    
    echo "Starting services..."
    docker-compose up -d
    
    echo "✅ Docker Compose deployment complete!"
    echo "Access your app at: http://localhost:3000"
}

# Function to deploy with PM2
deploy_pm2() {
    echo "⚙️  Deploying with PM2..."
    
    if ! command_exists pm2; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    echo "Installing dependencies..."
    npm install --production
    
    echo "Starting application with PM2..."
    pm2 start server.js --name "postgres-query-tuner"
    pm2 save
    
    echo "✅ PM2 deployment complete!"
    echo "View logs: pm2 logs postgres-query-tuner"
    echo "Monitor: pm2 monit"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "☁️  Deploying to Heroku..."
    
    if ! command_exists heroku; then
        echo "❌ Heroku CLI is not installed."
        echo "Install from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    echo "Logging in to Heroku..."
    heroku login
    
    echo "Creating Heroku app..."
    read -p "Enter app name (or press Enter for random): " app_name
    
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create "$app_name"
    fi
    
    echo "Setting environment variables..."
    if [ -f .env ]; then
        while IFS='=' read -r key value; do
            if [[ ! $key =~ ^# && -n $key ]]; then
                heroku config:set "$key=$value"
            fi
        done < .env
    fi
    
    echo "Deploying to Heroku..."
    git init
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    
    echo "✅ Heroku deployment complete!"
    heroku open
}

# Function to check environment
check_environment() {
    echo "🔍 Checking environment..."
    
    if [ ! -f .env ]; then
        echo "⚠️  Warning: .env file not found"
        echo "Creating from template..."
        cp .env.example .env
        echo "Please edit .env with your API keys"
        return 1
    fi
    
    if grep -q "your_anthropic_api_key_here" .env; then
        echo "⚠️  Warning: API keys not configured in .env"
        echo "Please add your API keys to .env file"
        return 1
    fi
    
    echo "✅ Environment configured"
    return 0
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment method:"
    echo "1) Docker"
    echo "2) Docker Compose"
    echo "3) PM2 (Process Manager)"
    echo "4) Heroku"
    echo "5) Check Environment"
    echo "6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1)
            check_environment
            deploy_docker
            ;;
        2)
            check_environment
            deploy_docker_compose
            ;;
        3)
            check_environment
            deploy_pm2
            ;;
        4)
            check_environment
            deploy_heroku
            ;;
        5)
            check_environment
            ;;
        6)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice"
            show_menu
            ;;
    esac
}

# Check prerequisites
echo "Checking prerequisites..."
echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
echo "PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')"
echo ""

# Show menu
show_menu
