# BookQuest - Book Information & Discovery App

A modern, responsive web application for discovering and exploring books using the Google Books API. Built with vanilla JavaScript, Tailwind CSS, and Boxicons for a clean, professional user experience.

## 🌟 Features

### Core Functionality
- **Book Search**: Search for books by title, author, or topic
- **Detailed Book Information**: View comprehensive book details including:
  - Title, authors, publisher, publication date
  - Categories/genres, page count
  - Book descriptions with expandable text
  - High-quality cover images with fallback placeholders

### Advanced Filtering & Sorting
- **Category Filter**: Filter books by genre/category
- **Year Range Filter**: Filter by publication year range
- **Multiple Sort Options**: Sort by title, author, publication date, or page count
- **Clear Filters**: One-click reset for all filters

### User Experience
- **Dark/Light Mode Toggle**: Switch between themes with Boxicons
- **Collect/Favorite Books**: Heart toggle on each book card
- **Auto-sliding Image Carousel**: Showcasing sample book covers
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Loading Indicators**: Visual feedback during API calls
- **Back to Top Button**: Easy navigation for long result lists
- **Custom Modals**: User-friendly error messages and notifications

### Visual Design
- **Modern UI**: Clean, professional interface inspired by Codehal designs
- **Custom Color Palette**: Unique green accent color scheme
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Boxicons Integration**: Consistent iconography throughout the app

## 🚀 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookquest
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   GOOGLE_BOOKS_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t yourusername/bookquest:v1 .
   ```

2. **Run the container**
   ```bash
   docker run -d -p 8080:8080 --name bookquest yourusername/bookquest:v1
   ```

3. **Push to Docker Hub**
   ```bash
   docker push yourusername/bookquest:v1
   ```

### Load Balancer Setup

**On Web01 and Web02:**
```bash
docker pull yourusername/bookquest:v1
docker run -d --name app --restart unless-stopped -p 8080:8080 yourusername/bookquest:v1
```

**On Lb01, update `/etc/haproxy/haproxy.cfg` with the provided configuration**

**Reload HAProxy:**
```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

### File Structure
```
bookquest/
├── app/                    # Frontend application
│   ├── index.html         # Main HTML file
│   ├── style.css          # Custom CSS styles
│   ├── script.js          # JavaScript functionality
│   └── icon.svg           # App icon
├── backend/               # Backend server
│   ├── server.js          # Express server
│   └── package.json       # Backend dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── haproxy.cfg           # Load balancer configuration
├── package.json          # Frontend dependencies
└── README.md             # This file
```

## 📖 Usage

### Basic Search
1. Enter a book title, author, or topic in the search bar
2. Click "Search" or press Enter
3. Browse through the results

### Advanced Filtering
1. Use the **Category** dropdown to filter by genre
2. Set **Year From** and **Year To** for publication date range
3. Click **Apply** to filter by year
4. Use **Sort By** to organize results
5. Click **Clear Filters** to reset everything

### Theme Switching
- Click the moon/sun icon in the header to toggle between dark and light modes
- Your preference is automatically saved

### Collecting Books
- Click the heart icon on any book card to mark it as a favorite
- The heart will fill with color to indicate it's collected

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with CSS variables
- **Vanilla JavaScript**: No frameworks, pure JS functionality
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Boxicons**: Modern icon library
- **Google Books API**: Book data and cover images
- **Inter Font**: Modern, readable typography

## 🔌 API Information

This app uses the **Google Books API**:
- **Base URL**: `https://www.googleapis.com/books/v1/volumes`
- **API Key Required**: For production deployment
- **Rate Limits**: Standard Google API limits apply
- **Data Source**: Comprehensive book database

### API Features Used
- Book search by query
- Volume information (title, authors, publisher, etc.)
- Cover images (thumbnail and small thumbnail)
- Categories and publication details

### API Documentation

The application uses the Google Books API:

**Base URL**: `https://www.googleapis.com/books/v1`

**Endpoint**: `/volumes`

**Parameters**:
- `q`: Search query
- `maxResults`: Number of results (default: 10, max: 40)
- `key`: Your API key

**Example Request**:
```
GET https://www.googleapis.com/books/v1/volumes?q=harry+potter&maxResults=40&key=YOUR_API_KEY
```

### Testing Load Balancing

To verify load balancing is working:

```bash
for i in {1..10}; do curl http://localhost; done
```

You should see responses alternating between Web01 and Web02.

## 🎨 Customization

### Colors
The app uses CSS custom properties for easy theming:
```css
:root {
  --bg-color: #1f242d;           /* Main background */
  --secondary-bg-color: #323946; /* Secondary background */
  --main-color: #7cf03d;         /* Accent color */
  --white-color: #ffffff;        /* White text */
  --disabled-color: #fff3ff;     /* Disabled state */
}
```

### Adding More Features
- **Persistent Favorites**: Store collected books in localStorage
- **Reading Lists**: Create multiple collections
- **Book Details Page**: Expandable book information
- **Export Features**: Save book lists as CSV/JSON

### Styling Modifications
- Edit `style.css` for visual changes
- Modify Tailwind classes in `index.html`
- Update color variables for theme changes

## 📱 Responsive Design

The app is fully responsive and optimized for:
- **Mobile**: 1-2 columns, compact layout
- **Tablet**: 2-3 columns, balanced spacing
- **Desktop**: 3-4 columns, full feature access

## 🔧 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Keep vanilla JavaScript (no frameworks)
- Use Tailwind CSS for styling
- Maintain responsive design
- Add clear comments
- Test on multiple devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Books API** for comprehensive book data
- **Tailwind CSS** for utility-first styling
- **Boxicons** for beautiful icons
- **Codehal** for design inspiration
- **Pexels** for placeholder book cover images

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for errors
2. Ensure you have an internet connection (for API calls)
3. Try refreshing the page
4. Open an issue in the repository

---

**Happy Book Hunting! 📚✨** 