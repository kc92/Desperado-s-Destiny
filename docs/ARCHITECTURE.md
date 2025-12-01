# Desperados Destiny - Architecture Overview

This document provides a high-level overview of the `Desperados Destiny` project's architecture, outlining its monorepo structure, core components, technology stack, and inter-service communication.

## 1. Project Overview

`Desperados Destiny` is a browser-based persistent MMORPG. The project is structured as a monorepo, designed to manage multiple interconnected applications (frontend, backend, shared utilities) within a single Git repository. This approach facilitates code sharing, consistent development practices, and streamlined deployment.

## 2. Monorepo Structure

The project utilizes NPM workspaces to manage three primary packages:

*   **`server/`**: The backend application, responsible for game logic, data persistence, and API services.
*   **`client/`**: The frontend application, providing the user interface and interacting with the backend.
*   **`shared/`**: A library containing common TypeScript types, constants, and utility functions used by both `server` and `client`. This minimizes duplication and ensures consistency across the full-stack.

```
desperados-destiny/
├── client/          # React.js Frontend Application
├── server/          # Node.js/Express.js Backend Application
├── shared/          # Shared Types, Constants, and Utilities
└── docs/            # Project Documentation (including this file)
└── ...              # Other configuration and project files
```

## 3. Technology Stack

### Global
*   **TypeScript**: Primary language for all workspaces, ensuring type safety and code quality.
*   **Docker & Docker Compose**: Used for containerization and orchestration of the development and production environments, providing isolated and consistent setups.
*   **NPM Workspaces**: Manages dependencies and scripts across the monorepo.
*   **ESLint & Prettier**: Enforce code style and formatting consistency.

### Backend (`server/`)
*   **Node.js (Express.js)**: Robust JavaScript runtime and web framework for building the API and handling game logic.
*   **MongoDB**: Primary NoSQL database for persistent game data (character data, game state).
*   **Redis**: In-memory data store used for caching, session management, and potentially real-time game state.
*   **Socket.io**: Enables real-time, bidirectional event-based communication between the backend and connected clients for dynamic game interactions.
*   **JWT (JSON Web Tokens)**: Used for secure user authentication and authorization.
*   **Nodemailer**: For email-related functionalities (e.g., email verification, password reset).

### Frontend (`client/`)
*   **React.js**: A declarative JavaScript library for building user interfaces.
*   **Vite**: A fast build tool that significantly improves the frontend development experience.
*   **TailwindCSS**: A utility-first CSS framework for rapid and consistent styling, adhering to the Western theme.
*   **Zustand**: A small, fast, and scalable state-management solution for React.
*   **Socket.io-client**: The client-side library for establishing real-time communication with the backend.
*   **React Router**: For client-side navigation and routing within the single-page application.
*   **Framer Motion**: A production-ready motion library for React, enabling fluid animations.

## 4. Inter-service Communication and Data Flow

1.  **Client-Server API (HTTP/REST):**
    *   The `client` communicates with the `server` primarily via HTTP requests for actions like user authentication, character creation, and fetching initial game data. These interactions follow a RESTful API pattern.
2.  **Real-time Communication (WebSocket/Socket.io):**
    *   For dynamic and interactive game events (e.g., combat updates, chat messages, Destiny Deck draws, player movement), `Socket.io` is used. The `client` establishes a WebSocket connection with the `server` to send and receive real-time updates.
3.  **Backend-Database Interaction:**
    *   The `server` interacts with `MongoDB` for all persistent data storage and retrieval. This includes user accounts, character profiles, inventory, game world state, etc.
    *   `Redis` is used by the `server` for high-speed caching of frequently accessed data, rate limiting, and managing real-time sessions for connected users.
4.  **Shared Logic and Types (`shared/`):**
    *   The `shared` workspace contains interfaces, enums, and utility functions that define the contracts and common logic between the `client` and `server`. This ensures type consistency and reduces errors during full-stack development.

## 5. Deployment and Infrastructure

The application is designed for containerized deployment using Docker. `docker-compose.yml` orchestrates the `frontend`, `backend`, `mongodb`, and `redis` services for both development and production environments. This ensures portability and scalability.

Continuous Integration/Continuous Deployment (CI/CD) workflows (e.g., GitHub Actions) can be integrated to automate testing, building, and deployment processes, leveraging the Docker images.

---

This architecture provides a scalable, maintainable, and robust foundation for `Desperados Destiny`, supporting a rich and interactive MMORPG experience.
