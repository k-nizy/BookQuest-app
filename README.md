
# BookQuest - Healthcare Literacy Book Discovery Platform

A modern, containerized web application for discovering books with integrated health literacy content. Built with Python Flask backend, responsive frontend, and load balancing support.



[ Watch Demo Video](https://youtu.be/-QMHfBQWQdE) - See BookQuest in action!

[![BookQuest Demo](https://img.youtube.com/vi/-QMHfBQWQdE/maxresdefault.jpg)](https://youtu.be/-QMHfBQWQdE)

  Features

 Core Functionality
- Book Search: Search for books by title, author, or topic using Google Books API
- Health Literacy Integration: Automatic health content suggestions for health-related searches
- Advanced Filtering & Sorting: Filter by category, year range, and sort by multiple criteria
- Reading Lists: Create and manage favorites, to-read, and completed lists
- Responsive Design: Works perfectly on mobile, tablet, and desktop devices

 Technical Features
- Containerized Deployment: Docker-based deployment with multi-stage builds
- Load Balancing: HAProxy configuration for round-robin load balancing
- API Caching: In-memory caching with TTL for improved performance
- Security: Environment variable-based API key management
- Accessibility: ARIA labels, keyboard support, high contrast, large touch targets
- Health Integration: Healthcare literacy content from trusted sources

## 🎥 Demo Video

Watch the BookQuest application in action:

[![BookQuest Demo Video](https://img.youtube.com/vi/-QMHfBQWQdE/maxresdefault.jpg)](https://youtu.be/-QMHfBQWQdE)

**[Watch Full Demo on YouTube](https://youtu.be/-QMHfBQWQdE)**



 Main Interface
![BookQuest Main Interface](Screenshot from 2025-08-02 06-58-15.png)
*Modern, responsive interface with search functionality and health literacy integration*


  Quick Start

 Prerequisites
- Docker and Docker Compose
- Google Books API key
- curl and jq (for testing)

 1. Local Development


# Clone the repository
git clone <repository-url>
cd s-kevin-25

# Copy environment file
cp env.example .env

# Edit .env with your API key
nano .env
```

Add your Google Books API key to `.env`:
```
GOOGLE_BOOKS_API_KEY=your_actual_api_key_here
PORT=8080
FLASK_ENV=development
```


# Build and run locally
docker build -t kevinnizy5/bookquest:v1 .
docker run -d -p 8080:8080 --env-file .env --name bookquest kevinnizy5/bookquest:v1

# Test the application
curl http://localhost:8080/api/health
```

 2. Docker Hub Deployment


# Login to Docker Hub
docker login

# Build and tag the image
docker build -t kevinnizy5/bookquest:v1 .
docker build -t kevinnizy5/bookquest:latest .

# Push to Docker Hub
docker push kevinnizy5/bookquest:v1
docker push kevinnizy5/bookquest:latest
```

 3. Production Deployment

 On Web01 and Web02 servers:

```bash
# Pull the image
docker pull kevinnizy5/bookquest:v1

# Create environment file
cat > .env << EOF
GOOGLE_BOOKS_API_KEY=your_actual_api_key_here
PORT=8080
FLASK_ENV=production
EOF

# Run the application
docker run -d \
  --name bookquest \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file .env \
  kevinnizy5/bookquest:v1

# Verify the application is running
curl http://localhost:8080/api/health
```

 On Load Balancer (Lb01):

```bash
# Install HAProxy if not already installed
sudo apt update
sudo apt install haproxy

# Copy the HAProxy configuration
sudo cp haproxy.cfg /etc/haproxy/haproxy.cfg

# Update the backend server IPs in haproxy.cfg
sudo nano /etc/haproxy/haproxy.cfg
```

Edit the backend server IPs in `/etc/haproxy/haproxy.cfg`:
```
server web01 YOUR_WEB01_IP:8080 check inter 5s rise 2 fall 3
server web02 YOUR_WEB02_IP:8080 check inter 5s rise 2 fall 3
```

```bash
Test HAProxy configuration
sudo haproxy -c -f /etc/haproxy/haproxy.cfg

 Reload HAProxy
sudo systemctl reload haproxy

# Verify load balancer is working
curl http://localhost/api/health
```

 4. Testing Load Balancing

```bash
# Run the demo script
chmod +x demo.sh
./demo.sh

# Or manually test round-robin
for i in {1..10}; do
  echo "Request $i:"
  curl -s http://localhost/api/health | jq '.backend'
  sleep 1
done
```

Project Structure

```
s-kevin-25/
├── app/                    # Frontend application
│   ├── index.html         # Main HTML interface
│   ├── style.css          # Responsive CSS with accessibility
│   ├── script.js          # JavaScript functionality
│   └── icon.svg           # Application icon
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   └── requirements.txt  # Python dependencies
├── Dockerfile            # Multi-stage Docker build
├── haproxy.cfg          # Load balancer configuration
├── demo.sh              # Testing and demo script
├── env.example          # Environment variables template
├── .gitignore           # Git ignore patterns
└── README.md            # This file
```

 API Endpoints

 Health Check
```bash
GET /api/health
```
Returns backend status and identifier for load balancer demo.

 Book Search
```bash
GET /api/search?q=query&maxResults=20
```
Search for books with health literacy integration.

 Categories
```bash
GET /api/categories
```
Get available book categories for filtering.

 Cache Management
```bash
GET /api/cache/stats
POST /api/cache/clear
```
View and manage API response cache.

 Frontend Features

 Responsive Design
- **Mobile**: 1 column layout with large touch targets
- **Tablet**: 2-3 column layout with balanced spacing
- **Desktop**: 3-4 column layout with full feature access

 Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Large Touch Targets**: 44px minimum for mobile
- **Focus Indicators**: Clear focus states
- **Reduced Motion**: Respects user motion preferences

 Color Scheme
- **Trust-building**: Light blues, whites, and soft green accents
- **Dark Mode**: Automatic theme switching
- **High Contrast**: Accessible color combinations

  Security Features

 API Key Management
- **Environment Variables**: No hardcoded API keys
- **Docker Secrets**: Secure key injection in production
- **Key Validation**: Backend validates API key presence

 Container Security
- **Non-root User**: Application runs as non-root user
- **Multi-stage Build**: Minimal production image
- **Health Checks**: Container health monitoring

  Testing

 Manual Testing
```bash
# Health check
curl http://localhost:8080/api/health

# Book search
curl "http://localhost:8080/api/search?q=health+books&maxResults=5"

# Categories
curl http://localhost:8080/api/categories

# Cache stats
curl http://localhost:8080/api/cache/stats
```

 Load Balancer Testing
```bash
# Test round-robin behavior
for i in {1..10}; do
  echo "Request $i:"
  curl -s http://localhost/api/health | jq '.backend'
  sleep 0.5
done
```

Frontend Testing
- Test responsive design on different screen sizes
- Verify keyboard navigation
- Check accessibility with screen readers
- Test dark/light mode switching
- Verify reading list functionality

##  Performance Features

Caching
- **In-memory Cache**: 1-hour TTL for API responses
- **Offline Support**: LocalStorage for offline access
- **Cache Statistics**: Monitor cache performance

 Load Balancing
- **Round-robin**: Even distribution across backends
- **Health Checks**: Automatic backend monitoring
- **Session Persistence**: Optional cookie-based persistence

 Healthcare Integration

 Health Literacy Content
- **Automatic Detection**: Identifies health-related searches
- **Trusted Sources**: Links to Health.gov resources
- **Educational Content**: Health literacy summaries

 Search Enhancement
- **Health Keywords**: Medical, nutrition, wellness terms
- **Resource Links**: Direct links to health information
- **Content Curation**: Relevant health education materials

  Deployment Commands
 Build Commands
```bash
# Build with specific tag
docker build -t kevinnizy5/bookquest:v1 .

# Build latest
docker build -t kevinnizy5/bookquest:latest .
```

### Run Commands
```bash
# Local development
docker run -d -p 8080:8080 --env-file .env kevinnizy5/bookquest:v1

# Production
docker run -d --name bookquest --restart unless-stopped -p 8080:8080 --env-file .env kevinnizy5/bookquest:v1
```

 Load Balancer Commands
```bash
# Test configuration
haproxy -c -f /etc/haproxy/haproxy.cfg

# Reload configuration
systemctl reload haproxy

# Check status
systemctl status haproxy
```


Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

 Development Guidelines
- Follow PEP8 for Python code
- Use alphabetical imports
- Include proper docstrings
- Test on multiple devices
- Maintain accessibility standards


 Acknowledgments

- Google Books API for comprehensive book data
- Health.gov for health literacy resources
- Flask for the Python web framework
- HAProxy for load balancing
- Docker for containerization

 Support

For issues or questions:
1. Check the browser console for errors
2. Verify API key configuration
3. Test load balancer health checks
4. Review Docker container logs

---

**Happy Book Hunting with Health Literacy! 📚🏥✨** 
