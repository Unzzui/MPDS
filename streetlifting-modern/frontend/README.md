# Streetlifting App - Frontend

A modern React + TypeScript frontend for the Streetlifting workout tracking application, featuring a terminal-inspired design philosophy.

## Features

### Core Features

- **Authentication**: JWT-based login/register system
- **Dashboard**: Overview of training statistics and recent activity
- **Workout Tracking**: Log and view workout sessions
- **Progress Tracking**: Visual charts and statistics
- **Training Blocks**: Periodized training program management
- **Routines**: Custom workout routine creation and management

### Routines System

- **Create Routines**: Build custom workout routines with exercises
- **Routine Templates**: Pre-built templates for common training programs
- **Exercise Management**: Add, edit, and organize exercises within routines
- **Active Routines**: Track which routines are currently active
- **Day-based Scheduling**: Assign routines to specific training days
- **Main Lifts**: Designate primary exercises for tracking progress

### Design Philosophy

- **Terminal Modern**: Dark theme with neon accents (#00ff88, #ff6b35)
- **Monospace Typography**: JetBrains Mono for authentic terminal feel
- **Mobile-First**: Responsive design optimized for mobile devices
- **Professional Aesthetic**: No emojis, clean and functional interface

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **React Query** for server state management
- **Tailwind CSS** for styling
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── styles/             # CSS files
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Routines Feature

The routines system allows users to create and manage custom workout programs:

### Key Components

- `RoutinesPage`: Main routines listing and management
- `RoutineDetailPage`: Detailed view of a specific routine
- `useRoutines`: Custom hook for routines API operations
- `Routines.css`: Terminal-styled CSS for routines

### API Integration

All routine operations are handled through the backend API:

- CRUD operations for routines
- Exercise management within routines
- Template-based routine creation
- Active routine tracking

### Usage

1. Navigate to "Routines" in the bottom navigation
2. Create a new routine or use a template
3. Add exercises with sets, reps, and other parameters
4. Activate routines to use them in workouts
5. View routine details and manage exercises

## Development

### Adding New Features

1. Create TypeScript types in `src/types/`
2. Add API endpoints in `src/services/api.ts`
3. Create custom hooks in `src/hooks/`
4. Build UI components in `src/pages/` or `src/components/`
5. Add styles following the terminal design philosophy

### Styling Guidelines

- Use CSS variables defined in `src/styles/global.css`
- Follow the terminal design philosophy (dark theme, neon accents)
- Ensure mobile-first responsive design
- Use monospace fonts for authentic terminal feel
- Avoid emojis in UI elements

## Contributing

1. Follow the terminal design philosophy
2. Write TypeScript for all new code
3. Use React Query for server state management
4. Test on mobile devices
5. Follow the existing code structure and patterns

## License

This project is part of the Streetlifting App ecosystem.
