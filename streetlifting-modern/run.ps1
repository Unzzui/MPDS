# StreetLifting Modern - PowerShell Startup Script
# Este script inicia tanto el backend (FastAPI) como el frontend (React) en Windows

param(
    [switch]$Help,
    [switch]$Setup,
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Kill
)

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Function to kill process on port
function Stop-Port {
    param([int]$Port)
    if (Test-Port $Port) {
        Write-Warning "Port $Port is in use. Killing existing process..."
        try {
            Get-NetTCPConnection -LocalPort $Port | ForEach-Object {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
        }
        catch {
            Write-Warning "Could not kill process on port $Port"
        }
    }
}

# Function to setup backend
function Setup-Backend {
    Write-Status "Setting up backend..."
    
    Set-Location backend
    
    # Check if Python is installed
    if (-not (Test-Command "python")) {
        Write-Error "Python is not installed. Please install Python 3.8+"
        exit 1
    }
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-Status "Creating virtual environment..."
        python -m venv venv
    }
    
    # Activate virtual environment
    Write-Status "Activating virtual environment..."
    & ".\venv\Scripts\Activate.ps1"
    
    # Install dependencies
    Write-Status "Installing Python dependencies..."
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Status "Creating .env file..."
        @"
# App settings
APP_NAME=StreetLifting API
DEBUG=true

# Database
DATABASE_URL=sqlite:///./streetlifting.db

# Security
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Created .env file"
    }
    
    Set-Location ..
}

# Function to setup frontend
function Setup-Frontend {
    Write-Status "Setting up frontend..."
    
    Set-Location frontend
    
    # Check if Node.js is installed
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    }
    
    # Check if npm is installed
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Please install npm"
        exit 1
    }
    
    # Install dependencies
    Write-Status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Status "Creating .env file..."
        "VITE_API_URL=http://localhost:8000" | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Created .env file"
    }
    
    Set-Location ..
}

# Function to start backend
function Start-Backend {
    Write-Status "Starting backend server..."
    
    Set-Location backend
    
    # Activate virtual environment
    & ".\venv\Scripts\Activate.ps1"
    
    # Kill any existing process on port 8000
    Stop-Port 8000
    
    # Start the server
    Write-Success "Backend starting on http://localhost:8000"
    Write-Status "API Docs: http://localhost:8000/docs"
    
    # Start uvicorn in background
    Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -WindowStyle Hidden
    
    Set-Location ..
}

# Function to start frontend
function Start-Frontend {
    Write-Status "Starting frontend server..."
    
    Set-Location frontend
    
    # Kill any existing process on port 5173
    Stop-Port 5173
    
    # Start the development server
    Write-Success "Frontend starting on http://localhost:5173"
    
    # Start npm dev in background
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    
    Set-Location ..
}

# Function to cleanup
function Stop-Servers {
    Write-Status "Shutting down servers..."
    
    # Kill any remaining processes on our ports
    Stop-Port 8000
    Stop-Port 5173
    
    Write-Success "Servers stopped"
}

# Function to show help
function Show-Help {
    Write-Host "StreetLifting Modern - PowerShell Startup Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Help       Show this help message"
    Write-Host "  -Setup      Only setup dependencies (don't start servers)"
    Write-Host "  -Backend    Only start backend"
    Write-Host "  -Frontend   Only start frontend"
    Write-Host "  -Kill       Kill existing processes and exit"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run.ps1              # Start both backend and frontend"
    Write-Host "  .\run.ps1 -Setup       # Only setup dependencies"
    Write-Host "  .\run.ps1 -Backend     # Only start backend"
    Write-Host "  .\run.ps1 -Kill        # Kill existing processes"
}

# Main execution
function Main {
    Write-Status "🚀 Starting StreetLifting Modern..."
    
    if ($Kill) {
        Stop-Servers
        exit 0
    }
    
    if ($Help) {
        Show-Help
        exit 0
    }
    
    # Check if we're in the right directory
    if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
        Write-Error "Please run this script from the streetlifting-modern directory"
        exit 1
    }
    
    # Setup dependencies
    if ($Setup) {
        Setup-Backend
        Setup-Frontend
        Write-Success "Setup complete! Run '.\run.ps1' to start the servers."
        exit 0
    }
    
    # Setup if not already done
    if (-not (Test-Path "backend\venv")) {
        Setup-Backend
    }
    
    if (-not (Test-Path "frontend\node_modules")) {
        Setup-Frontend
    }
    
    # Start servers based on options
    if ($Backend) {
        Start-Backend
    }
    elseif ($Frontend) {
        Start-Frontend
    }
    else {
        # Start both
        Start-Backend
        Start-Sleep -Seconds 3  # Give backend time to start
        Start-Frontend
    }
    
    Write-Success "🎉 StreetLifting Modern is starting up!"
    Write-Host ""
    Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Green
    Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor Green
    Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""
    
    # Keep script running
    try {
        while ($true) {
            Start-Sleep -Seconds 1
        }
    }
    catch {
        Stop-Servers
    }
}

# Run main function
Main 