# Space Dodger Game

## Overview

Space Dodger is a web-based arcade survival game where players control a spaceship to dodge falling asteroids. Built with React, TypeScript, and Express.js, it features progressive difficulty scaling, power-ups, audio integration, and persistent high score tracking. The game uses HTML5 Canvas for rendering with a modern UI component system and state management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Single-page application built with React 18 and TypeScript
- **Component Structure**: Modular design with separate components for game screens (StartScreen, GameCanvas, GameUI, GameOverScreen)
- **State Management**: Zustand stores for game state, audio, and UI management with subscriptions for reactive updates
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Canvas Rendering**: HTML5 Canvas API for real-time game graphics and animations
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for logging and error handling
- **Development Integration**: Vite development server integration for seamless full-stack development
- **Storage Interface**: Abstracted storage layer with in-memory implementation for user data
- **Static Serving**: Express serves built frontend assets in production

### Game Engine Design
- **Object-Oriented Game Objects**: Spaceship, Asteroid, and PowerUp classes extending base GameObject
- **Game Loop**: RequestAnimationFrame-based game loop with delta time calculations
- **Collision Detection**: Rectangle and circle collision detection algorithms
- **Difficulty Scaling**: Time-based progression system with increasing spawn rates and speeds
- **Power-up System**: Temporary abilities (shield, slow time, score boost) with duration tracking

### State Management Pattern
- **Game State**: Centralized game state management with phase transitions (ready → playing → ended)
- **Audio State**: Separate audio state management with mute controls and sound effect handling
- **Local Persistence**: High scores and preferences stored in localStorage
- **Reactive Updates**: Component re-rendering triggered by state changes through subscriptions

### Data Storage Solutions
- **PostgreSQL**: Configured with Drizzle ORM for structured data persistence
- **Local Storage**: Browser storage for game preferences and high scores
- **In-Memory Storage**: Development implementation for user data with interface for easy swapping

### Authentication & User Management
- **Basic User Schema**: Username/password structure defined in shared schema
- **Session Management**: Framework ready for session-based authentication
- **Storage Abstraction**: Interface-based design allows for easy database integration

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database toolkit with migrations support
- **Database Connection**: Environment-based configuration with connection pooling

### UI Libraries
- **Radix UI**: Comprehensive primitive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component system built on Radix UI and Tailwind

### Audio Integration
- **Web Audio API**: Browser-native audio handling for background music and sound effects
- **Audio Assets**: MP3 format support for background music, hit sounds, and success sounds
- **Volume Control**: Mute/unmute functionality with persistent preferences

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production server builds
- **PostCSS**: CSS processing with autoprefixer for browser compatibility
- **GLSL Shader Support**: 3D graphics capability through vite-plugin-glsl

### Asset Management
- **Font Loading**: Inter font family loaded via Fontsource
- **Static Assets**: Support for 3D models (GLTF/GLB) and audio files
- **Asset Optimization**: Vite handles asset bundling and optimization