# WebSocket Signaling Server

This is a simple **WebSocket** signaling server that listens for client connections, receives messages, and broadcasts them to all connected clients except the sender. It is commonly used in **WebRTC** or real-time applications.

## Table of Contents

- Used Technologies
- Prerequisites
- Installation
- Running the Application

## Used Technologies

- 🟠 [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) - for WebRTC communication between Vue and Electron.

## 📌 Prerequisites

Before setting up the project, ensure you have the following tools installed on your machine:

- [Node.js (v16 or higher)](https://nodejs.org/)
- npm (comes with Node.js) or Yarn
- [Git](https://git-scm.com/)


To verify the installation, run the following commands:

```bash
node -v
npm -v
git --version
```

Ensure you see version numbers for each.

**My Versions**:

- Node.js v22.12.0
- npm 10.9.2
- Git 2.46.0.windows.1

## 💿 Installation

To set up the project, follow these steps:

- **Clone the Repository**: 

```bash
git clone https://github.com/MrChaylak/server-screen-app.git
cd server-screen-app
```

- **Install Dependencies**: 

```bash
npm install
```

This command installs all required dependencies listed in package.json.

## 💡 Running the Application

To run the application in development mode, use the following command:

```bash
npm start
```

This will run the signaling server on port 8080: "ws://localhost:8080".

Note: This command starts only the signaling server, for remote screen functionality and display you will have to clone and run **Vue** and **Electron** repositories which you can find the links to here:
- [Vue](https://github.com/MrChaylak/vue-screen-app.git) - The frontend framework used to display and control the remote devices available screens and cameras. Navigate to '/screen-share'.
- [Electron](https://github.com/MrChaylak/electron-screen-app.git) - Gets the devices available screens and camera feed for Vue to display them.
