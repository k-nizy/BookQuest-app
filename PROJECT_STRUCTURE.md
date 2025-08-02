# BookQuest Project Structure

```
bookquest/
├── app/                    # Frontend application files
│   ├── index.html         # Main HTML file
│   ├── style.css          # Custom CSS styles
│   ├── script.js          # JavaScript functionality
│   └── icon.svg           # Application icon
├── backend/               # Backend server
│   ├── server.js          # Express server implementation
│   └── package.json       # Backend dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── haproxy.cfg           # Load balancer configuration
├── deploy.sh             # Automated deployment script
├── package.json          # Project configuration
├── .dockerignore         # Docker build exclusions
├── README.md             # Project documentation
├── DEMO_SCRIPT.md        # Demo video script
└── PROJECT_STRUCTURE.md  # This file
```

## File Descriptions

### Frontend (`app/`)
- **`index.html`**: Main application interface with search, filters, and book display
- **`style.css`**: Custom styling with responsive design and dark mode support
- **`script.js`**: Core application logic including API integration and UI interactions
- **`icon.svg`**: Application icon for browser tabs and bookmarks

### Backend (`backend/`)
- **`server.js`**: Express server with API routes and static file serving
- **`package.json`**: Backend dependencies (Express, CORS, Axios)

### Deployment
- **`Dockerfile`**: Multi-stage Docker build configuration
- **`docker-compose.yml`**: Container orchestration
- **`haproxy.cfg`**: Load balancer configuration for multi-server deployment
- **`deploy.sh`**: Automated deployment script
- **`.dockerignore`**: Files excluded from Docker build

### Documentation
- **`README.md`**: Complete project documentation and setup instructions
- **`DEMO_SCRIPT.md`**: Script for demo video recording
- **`PROJECT_STRUCTURE.md`**: This file

## Development Workflow

1. **Local Development**: Use `npm run dev` to start backend server
2. **Building**: Use `npm run build` to prepare frontend for production
3. **Docker Deployment**: Use `npm run deploy` or `./deploy.sh`
4. **Load Balancing**: Configure HAProxy with provided configuration

## Key Features

- **Frontend**: Vanilla JavaScript, responsive design, dark mode
- **Backend**: Express server with API proxy
- **Deployment**: Docker containers with load balancing
- **Documentation**: Complete setup and usage instructions 