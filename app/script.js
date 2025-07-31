// BookQuest App - Main JavaScript file
(function() {
  // Offline functionality
  let isOnline = navigator.onLine;
  let offlineData = JSON.parse(localStorage.getItem('bookquest_offline_data') || '{}');
  
  // Update online status
  function updateOnlineStatus() {
    isOnline = navigator.onLine;
    if (!isOnline) {
      showModal('You are currently offline. Some features may be limited.');
    }
  }
  
  // Cache book data for offline use
  function cacheBookData(query, books) {
    if (books && books.length > 0) {
      offlineData[query] = {
        books: books,
        timestamp: Date.now()
      };
      localStorage.setItem('bookquest_offline_data', JSON.stringify(offlineData));
    }
  }
  
  // Get cached book data
  function getCachedBookData(query) {
    const cached = offlineData[query];
    if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
      return cached.books;
    }
    return null;
  }
  
  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Get all the HTML elements we need to work with
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const resultsDiv = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading-indicator');
  const categoryFilter = document.getElementById('category-filter');
  const yearMinInput = document.getElementById('year-min');
  const yearMaxInput = document.getElementById('year-max');
  const yearFilterBtn = document.getElementById('year-filter-btn');
  const sortSelect = document.getElementById('sort-select');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const backToTopBtn = document.getElementById('back-to-top');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalBox = document.getElementById('modal-box');
  const modalMessage = document.getElementById('modal-message');
  const modalClose = document.getElementById('modal-close');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const darkIcon = document.getElementById('dark-icon');
  // Slider elements
  const sliderTrack = document.getElementById('bookquest-slider-track');
  const sliderPrev = document.getElementById('slider-prev');
  const sliderNext = document.getElementById('slider-next');

  // Store data about books and current state
  let allBooks = [];
  let filteredBooks = [];
  let categories = new Set();
  let currentFilters = {
    category: '',
    yearMin: '',
    yearMax: ''
  };
  let currentSort = 'title-asc';
  
  // Reading Lists functionality
  let readingLists = {
    favorites: [],
    toRead: [],
    read: []
  };
  let currentReadingList = 'favorites';
  
  // Load reading lists from localStorage
  function loadReadingLists() {
    const saved = localStorage.getItem('bookquest_reading_lists');
    if (saved) {
      readingLists = JSON.parse(saved);
    }
  }
  
  // Save reading lists to localStorage
  function saveReadingLists() {
    localStorage.setItem('bookquest_reading_lists', JSON.stringify(readingLists));
  }
  
  // Add book to reading list
  function addToReadingList(book, listType) {
    const bookId = book.id || book.volumeInfo?.title + book.volumeInfo?.authors?.join(',');
    const existingIndex = readingLists[listType].findIndex(b => 
      (b.id || b.volumeInfo?.title + b.volumeInfo?.authors?.join(',')) === bookId
    );
    
    if (existingIndex === -1) {
      readingLists[listType].push(book);
      saveReadingLists();
      return true;
    }
    return false;
  }
  
  // Remove book from reading list
  function removeFromReadingList(book, listType) {
    const bookId = book.id || book.volumeInfo?.title + book.volumeInfo?.authors?.join(',');
    const index = readingLists[listType].findIndex(b => 
      (b.id || b.volumeInfo?.title + b.volumeInfo?.authors?.join(',')) === bookId
    );
    
    if (index !== -1) {
      readingLists[listType].splice(index, 1);
      saveReadingLists();
      return true;
    }
    return false;
  }
  
  // Check if book is in reading list
  function isInReadingList(book, listType) {
    const bookId = book.id || book.volumeInfo?.title + book.volumeInfo?.authors?.join(',');
    return readingLists[listType].some(b => 
      (b.id || b.volumeInfo?.title + b.volumeInfo?.authors?.join(',')) === bookId
    );
  }

  // List of default book cover images to use when no cover is available
  const defaultCoverImages = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
    'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=300&fit=crop',
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=200&h=300&fit=crop',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=300&fit=crop'
  ];
  
  // Pick a random default cover image for books without covers
  function getPlaceholderImage() {
    const idx = Math.floor(Math.random() * defaultCoverImages.length);
    return defaultCoverImages[idx];
  }

  // Image slider variables and functions
  let sliderIndex = 0;
  let slidesToShow = 4; // How many slides to show at once
  let autoSlideInterval = null;
  let isSliderHovered = false;

  // Figure out how many slides to show based on screen size
  function updateSlidesToShow() {
    if (window.innerWidth < 640) {
      slidesToShow = 1;
    } else if (window.innerWidth < 900) {
      slidesToShow = 2;
    } else {
      slidesToShow = 4;
    }
  }

  // Create the slider with all the book cover images
  function renderSlider() {
    if (!sliderTrack) return;
    sliderTrack.innerHTML = '';
    defaultCoverImages.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'bookquest-slider-slide';
      slide.innerHTML = `<img src="${img}" alt="Book cover example ${i+1}" loading="lazy" />`;
      sliderTrack.appendChild(slide);
    });
    updateSliderPosition();
    setupAutoSlide();
  }

  // Move the slider to show the correct images
  function updateSliderPosition() {
    const slideWidth = sliderTrack && sliderTrack.firstChild ? sliderTrack.firstChild.offsetWidth + 32 : 160;
    const maxIndex = defaultCoverImages.length - slidesToShow;
    if (sliderIndex < 0) sliderIndex = 0;
    if (sliderIndex > maxIndex) sliderIndex = maxIndex;
    const translateX = -(sliderIndex * slideWidth);
    sliderTrack.style.transform = `translateX(${translateX}px)`;
  }

  // Handle previous button click
  function handleSliderPrev() {
    sliderIndex--;
    updateSliderPosition();
  }
  
  // Handle next button click
  function handleSliderNext() {
    sliderIndex++;
    updateSliderPosition();
  }

  // Set up automatic sliding every 3 seconds
  function setupAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    // Only auto-slide if there are more images than can be shown
    if (defaultCoverImages.length > slidesToShow) {
      autoSlideInterval = setInterval(() => {
        if (!isSliderHovered) {
          sliderIndex++;
          const maxIndex = defaultCoverImages.length - slidesToShow;
          if (sliderIndex > maxIndex) sliderIndex = 0;
          updateSliderPosition();
        }
      }, 3000);
    }
  }
  
  // Pause auto-slide when user hovers over slider
  if (sliderTrack) {
    sliderTrack.addEventListener('mouseenter', () => { isSliderHovered = true; });
    sliderTrack.addEventListener('mouseleave', () => { isSliderHovered = false; });
    sliderTrack.addEventListener('focusin', () => { isSliderHovered = true; });
    sliderTrack.addEventListener('focusout', () => { isSliderHovered = false; });
  }

  // Handle window resize
  function handleResize() {
    updateSlidesToShow();
    updateSliderPosition();
    setupAutoSlide();
  }

  // Set up the slider when page loads
  window.addEventListener('DOMContentLoaded', () => {
    updateSlidesToShow();
    renderSlider();
    if (sliderPrev && sliderNext) {
      sliderPrev.addEventListener('click', handleSliderPrev);
      sliderNext.addEventListener('click', handleSliderNext);
    }
    window.addEventListener('resize', handleResize);
  });

  // Toast notification system
  function showToast(message, type = 'info', duration = 4000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const toastId = 'toast-' + Date.now();
    
    toast.className = `toast ${type}`;
    toast.id = toastId;
    
    const iconMap = {
      success: 'bx-check',
      error: 'bx-x',
      warning: 'bx-error',
      info: 'bx-info-circle'
    };
    
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">
          <i class="bx ${iconMap[type] || 'bx-info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="removeToast('${toastId}')">
          <i class="bx bx-x"></i>
        </button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toastId);
      }, duration);
    }
    
    return toastId;
  }
  
  // Remove toast by ID
  function removeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }
  
  // Make removeToast globally accessible
  window.removeToast = removeToast;
  
  // Show modal with message (for important messages)
  function showModal(message) {
    modalMessage.textContent = message;
    modalOverlay.classList.remove('hidden');
    
    // Add show class for animation
    setTimeout(() => {
      const modalBox = document.getElementById('modal-box');
      modalBox.classList.add('show');
    }, 10);
    
    // Focus the close button for accessibility
    modalClose.focus();
  }

  // Close modal when close button is clicked
  modalClose.addEventListener('click', () => {
    const modalBox = document.getElementById('modal-box');
    modalBox.classList.remove('show');
    setTimeout(() => {
      modalOverlay.classList.add('hidden');
    }, 300);
  });
  
  // Close modal when clicking outside of it
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      const modalBox = document.getElementById('modal-box');
      modalBox.classList.remove('show');
      setTimeout(() => {
        modalOverlay.classList.add('hidden');
      }, 300);
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (!modalOverlay.classList.contains('hidden') && e.key === 'Escape') {
      const modalBox = document.getElementById('modal-box');
      modalBox.classList.remove('show');
      setTimeout(() => {
        modalOverlay.classList.add('hidden');
      }, 300);
    }
  });

  // Show or hide the loading spinner
  function setLoading(show) {
    loadingIndicator.classList.toggle('hidden', !show);
  }

  // Cut off long text and add dots
  function truncate(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
  }

  // Get the year from a date string
  function extractYear(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  // Get books from Google Books API with offline support
  async function fetchBooks(query) {
    // Call Google Books API directly
    const apiKey = 'AIzaSyBxGQoO3qPmnjK2SEt5QpiS5X2VZQZQZQZ'; // Replace with your actual API key
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&key=${apiKey}`;
    
    try {
      setLoading(true);
      const res = await fetch(url);
      
      if (!res.ok) {
        console.log('API error: ', res); 
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        showToast('No books found for your search', 'info');
        return [];
      }
      
      // Process and cache the results
      const processedBooks = data.items.map(book => ({
        ...book,
        volumeInfo: {
          ...book.volumeInfo,
          // Ensure all required fields exist
          title: book.volumeInfo.title || 'Untitled',
          authors: book.volumeInfo.authors || ['Unknown Author'],
          description: book.volumeInfo.description || 'No description available',
          categories: book.volumeInfo.categories || ['Uncategorized']
        }
      }));
      
      cacheBookData(query, processedBooks);
      return processedBooks;
      
    } catch (err) {
      console.error('Fetch error:', err);
      showToast(err.message, 'error');
      return getCachedBookData(query) || [];
    } finally {
      setLoading(false);
    }
  }

  // Display the books in cards
  function displayBooks(books) {
    resultsDiv.innerHTML = '';
    
    // Update books count
    const booksCountElement = document.getElementById('books-count');
    if (booksCountElement) {
      booksCountElement.textContent = `${books.length} Books Available`;
    }
    
    if (!books.length) {
      resultsDiv.innerHTML = `<div class="col-span-full text-center text-gray-500 text-lg py-12">No books found for your query. Try a different search term!</div>`;
      return;
    }
    // Add animation to results
    resultsDiv.classList.remove('fade-in');
    void resultsDiv.offsetWidth; // Force reflow
    resultsDiv.classList.add('fade-in');
    books.forEach((item, idx) => {
      const info = item.volumeInfo || {};
      const title = info.title || 'Untitled';
      const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
      const publisher = info.publisher || 'Unknown Publisher';
      const publishedDate = info.publishedDate || 'Unknown Date';
      const year = extractYear(info.publishedDate);
      const description = info.description || '';
      const categories = info.categories ? info.categories.join(', ') : 'Uncategorized';
      const pageCount = info.pageCount || 'N/A';
      // Use API image if available, otherwise use placeholder
      const image = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || getPlaceholderImage();
      const bookId = `book-${idx}`;
      // Create book card with icons and collect button
      const card = document.createElement('div');
      card.className = 'bookquest-card';
      card.innerHTML = `
        <div class="bookquest-card-img flex items-center justify-center relative">
          <img src="${image}" alt="Cover for ${title}" loading="lazy" onerror="this.src='${getPlaceholderImage()}'" />
          <i class="bx bx-book absolute top-2 left-2 text-main-color text-xl opacity-80"></i>
          <!-- Collect/Favorite toggle button -->
          <button class="bookquest-collect-toggle absolute top-2 right-2 bg-transparent flex items-center justify-center p-1 rounded-full" aria-label="Collect or favorite this book" data-book-index="${idx}">
            <i class="bx ${isInReadingList(item, 'favorites') ? 'bxs-heart' : 'bx-heart'} text-2xl"></i>
          </button>
        </div>
        <div class="flex-1 flex flex-col p-5">
          <h2 class="bookquest-card-title flex items-center gap-2">${title}</h2>
          <div class="bookquest-card-authors">${authors}</div>
          <div class="bookquest-card-meta"><span class="font-medium">Publisher:</span> ${publisher}</div>
          <div class="bookquest-card-meta"><span class="font-medium">Published:</span> ${publishedDate}</div>
          <div class="bookquest-card-meta flex items-center gap-2"><i class="bx bx-category text-main-color text-base"></i><span class="font-medium">Categories:</span> ${categories}</div>
          <div class="bookquest-card-meta flex items-center gap-2"><i class="bx bx-file text-main-color text-base"></i><span class="font-medium">Page Count:</span> ${pageCount}</div>
          <div class="bookquest-card-desc mt-2">
            <span class="font-medium">Description:</span>
            <span id="desc-short-${bookId}">${truncate(description, 160)}</span>
            <span id="desc-full-${bookId}" class="bookquest-card-desc-anim collapsed">${description}</span>
            ${description.length > 160 ? `<span class="bookquest-card-desc-toggle" data-toggle-desc="${bookId}">Read More</span>` : ''}
          </div>
        </div>
      `;
      resultsDiv.appendChild(card);
    });
    // Add click handlers for "Read More" buttons
    document.querySelectorAll('.bookquest-card-desc-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-toggle-desc');
        const shortDesc = document.getElementById(`desc-short-${id}`);
        const fullDesc = document.getElementById(`desc-full-${id}`);
        if (fullDesc.classList.contains('collapsed')) {
          shortDesc.style.display = 'none';
          fullDesc.classList.remove('collapsed');
          btn.textContent = 'Show Less';
        } else {
          shortDesc.style.display = '';
          fullDesc.classList.add('collapsed');
          btn.textContent = 'Read More';
        }
      });
    });
    // Add click handlers for collect/favorite buttons
    document.querySelectorAll('.bookquest-collect-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const bookIndex = parseInt(btn.getAttribute('data-book-index'));
        const book = books[bookIndex];
        const icon = btn.querySelector('i');
        
        if (isInReadingList(book, 'favorites')) {
          removeFromReadingList(book, 'favorites');
          btn.classList.remove('active');
          icon.classList.remove('bxs-heart');
          icon.classList.add('bx-heart');
          showToast('Removed from favorites', 'info', 2000);
        } else {
          addToReadingList(book, 'favorites');
          btn.classList.add('active');
          icon.classList.remove('bx-heart');
          icon.classList.add('bxs-heart');
          showToast('Added to favorites!', 'success', 2000);
        }
      });
    });
  }

  // Fill the category dropdown with available categories
  function populateCategories(books) {
    categories = new Set(['Fiction', 'Nonfiction', 'Science', 'History', 'Biography']); // Default categories
    
    books.forEach(item => {
      const cats = item.volumeInfo?.categories;
      if (cats && Array.isArray(cats)) {
        cats.forEach(cat => {
          // Split categories that come combined (e.g., "Fiction/Fantasy")
          cat.split('/').forEach(subCat => {
            categories.add(subCat.trim());
          });
        });
      }
    });
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
    
    // Enable the filter now that we have categories
    categoryFilter.disabled = false;
  }

  // Display reading lists
  function displayReadingLists(listType = 'favorites') {
    const readingListsContent = document.getElementById('reading-lists-content');
    const books = readingLists[listType];
    
    readingListsContent.innerHTML = '';
    
    if (!books.length) {
      readingListsContent.innerHTML = `
        <div class="col-span-full text-center text-gray-500 text-lg py-12">
          <i class="bx bx-book-open text-4xl mb-4 text-gray-300"></i>
          <p>No books in your ${listType} list yet.</p>
          <p class="text-sm mt-2">Search for books and add them to your lists!</p>
        </div>
      `;
      return;
    }
    
    books.forEach((item, idx) => {
      const info = item.volumeInfo || {};
      const title = info.title || 'Untitled';
      const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
      const publisher = info.publisher || 'Unknown Publisher';
      const publishedDate = info.publishedDate || 'Unknown Date';
      const description = info.description || '';
      const categories = info.categories ? info.categories.join(', ') : 'Uncategorized';
      const pageCount = info.pageCount || 'N/A';
      const image = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || getPlaceholderImage();
      const bookId = `reading-list-${listType}-${idx}`;
      
      const card = document.createElement('div');
      card.className = 'bookquest-card';
      card.innerHTML = `
        <div class="bookquest-card-img flex items-center justify-center relative">
          <img src="${image}" alt="Cover for ${title}" loading="lazy" onerror="this.src='${getPlaceholderImage()}'" />
          <i class="bx bx-book absolute top-2 left-2 text-main-color text-xl opacity-80"></i>
          <div class="absolute top-2 right-2 flex gap-1">
            <button class="reading-list-action-btn bg-red-500 text-white p-1 rounded-full text-sm" data-action="remove" data-list="${listType}" data-index="${idx}" title="Remove from ${listType}">
              <i class="bx bx-x"></i>
            </button>
            ${listType === 'toRead' ? `
              <button class="reading-list-action-btn bg-green-500 text-white p-1 rounded-full text-sm" data-action="mark-read" data-index="${idx}" title="Mark as read">
                <i class="bx bx-check"></i>
              </button>
            ` : ''}
          </div>
        </div>
        <div class="flex-1 flex flex-col p-5">
          <h2 class="bookquest-card-title flex items-center gap-2">${title}</h2>
          <div class="bookquest-card-authors">${authors}</div>
          <div class="bookquest-card-meta"><span class="font-medium">Publisher:</span> ${publisher}</div>
          <div class="bookquest-card-meta"><span class="font-medium">Published:</span> ${publishedDate}</div>
          <div class="bookquest-card-meta flex items-center gap-2"><i class="bx bx-category text-main-color text-base"></i><span class="font-medium">Categories:</span> ${categories}</div>
          <div class="bookquest-card-meta flex items-center gap-2"><i class="bx bx-file text-main-color text-base"></i><span class="font-medium">Page Count:</span> ${pageCount}</div>
          <div class="bookquest-card-desc mt-2">
            <span class="font-medium">Description:</span>
            <span id="desc-short-${bookId}">${truncate(description, 160)}</span>
            <span id="desc-full-${bookId}" class="bookquest-card-desc-anim collapsed">${description}</span>
            ${description.length > 160 ? `<span class="bookquest-card-desc-toggle" data-toggle-desc="${bookId}">Read More</span>` : ''}
          </div>
        </div>
      `;
      readingListsContent.appendChild(card);
    });
    
    // Add click handlers for reading list actions
    document.querySelectorAll('.reading-list-action-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = btn.getAttribute('data-action');
        const listType = btn.getAttribute('data-list');
        const index = parseInt(btn.getAttribute('data-index'));
        const book = readingLists[listType][index];
        
        if (action === 'remove') {
          removeFromReadingList(book, listType);
          displayReadingLists(currentReadingList);
          showToast(`Removed from ${listType}`, 'info', 2000);
        } else if (action === 'mark-read') {
          removeFromReadingList(book, 'toRead');
          addToReadingList(book, 'read');
          displayReadingLists(currentReadingList);
          showToast('Marked as read!', 'success', 2000);
        }
      });
    });
    
    // Add click handlers for "Read More" buttons
    document.querySelectorAll('.bookquest-card-desc-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-toggle-desc');
        const shortDesc = document.getElementById(`desc-short-${id}`);
        const fullDesc = document.getElementById(`desc-full-${id}`);
        if (fullDesc.classList.contains('collapsed')) {
          shortDesc.style.display = 'none';
          fullDesc.classList.remove('collapsed');
          btn.textContent = 'Show Less';
        } else {
          shortDesc.style.display = '';
          fullDesc.classList.add('collapsed');
          btn.textContent = 'Read More';
        }
      });
    });
  }
  
  // Export reading lists
  function exportReadingLists() {
    const data = {
      favorites: readingLists.favorites.map(book => ({
        title: book.volumeInfo?.title || 'Untitled',
        authors: book.volumeInfo?.authors?.join(', ') || 'Unknown Author',
        publisher: book.volumeInfo?.publisher || 'Unknown Publisher',
        publishedDate: book.volumeInfo?.publishedDate || 'Unknown Date',
        categories: book.volumeInfo?.categories?.join(', ') || 'Uncategorized',
        pageCount: book.volumeInfo?.pageCount || 'N/A'
      })),
      toRead: readingLists.toRead.map(book => ({
        title: book.volumeInfo?.title || 'Untitled',
        authors: book.volumeInfo?.authors?.join(', ') || 'Unknown Author',
        publisher: book.volumeInfo?.publisher || 'Unknown Publisher',
        publishedDate: book.volumeInfo?.publishedDate || 'Unknown Date',
        categories: book.volumeInfo?.categories?.join(', ') || 'Uncategorized',
        pageCount: book.volumeInfo?.pageCount || 'N/A'
      })),
      read: readingLists.read.map(book => ({
        title: book.volumeInfo?.title || 'Untitled',
        authors: book.volumeInfo?.authors?.join(', ') || 'Unknown Author',
        publisher: book.volumeInfo?.publisher || 'Unknown Publisher',
        publishedDate: book.volumeInfo?.publishedDate || 'Unknown Date',
        categories: book.volumeInfo?.categories?.join(', ') || 'Uncategorized',
        pageCount: book.volumeInfo?.pageCount || 'N/A'
      }))
    };
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookquest-reading-lists.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Reading lists exported successfully!', 'success', 3000);
  }
  
  // Convert data to CSV format
  function convertToCSV(data) {
    let csv = 'List,Title,Authors,Publisher,Published Date,Categories,Page Count\n';
    
    Object.keys(data).forEach(listType => {
      data[listType].forEach(book => {
        csv += `"${listType}","${book.title}","${book.authors}","${book.publisher}","${book.publishedDate}","${book.categories}","${book.pageCount}"\n`;
      });
    });
    
    return csv;
  }

  // Apply current filters to the book list
  function applyFilters() {
    filteredBooks = allBooks.filter(item => {
      const info = item.volumeInfo || {};
      if (currentFilters.category) {
        if (!info.categories || !info.categories.includes(currentFilters.category)) return false;
      }
      const year = extractYear(info.publishedDate);
      if (currentFilters.yearMin && (!year || year < currentFilters.yearMin)) return false;
      if (currentFilters.yearMax && (!year || year > currentFilters.yearMax)) return false;
      return true;
    });
  }

  // Sort the filtered books
  function applySorting() {
    const sortVal = currentSort;
    filteredBooks.sort((a, b) => {
      const infoA = a.volumeInfo || {};
      const infoB = b.volumeInfo || {};
      switch (sortVal) {
        case 'title-asc':
          return (infoA.title || '').localeCompare(infoB.title || '');
        case 'title-desc':
          return (infoB.title || '').localeCompare(infoA.title || '');
        case 'author-asc':
          return (infoA.authors ? infoA.authors[0] : '').localeCompare(infoB.authors ? infoB.authors[0] : '');
        case 'author-desc':
          return (infoB.authors ? infoB.authors[0] : '').localeCompare(infoA.authors ? infoA.authors[0] : '');
        case 'date-asc': {
          const yA = extractYear(infoA.publishedDate) || 0;
          const yB = extractYear(infoB.publishedDate) || 0;
          return yA - yB;
        }
        case 'date-desc': {
          const yA = extractYear(infoA.publishedDate) || 0;
          const yB = extractYear(infoB.publishedDate) || 0;
          return yB - yA;
        }
        case 'pages-asc':
          return (infoA.pageCount || 0) - (infoB.pageCount || 0);
        case 'pages-desc':
          return (infoB.pageCount || 0) - (infoA.pageCount || 0);
        default:
          return 0;
      }
    });
  }

  // Update the display with filtered and sorted books
  function updateDisplay() {
    applyFilters();
    applySorting();
    displayBooks(filteredBooks);
  }

  // Handle search form submission
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
      showModal('Please enter a book title or author to search.');
      return;
    }
    try {
      setLoading(true);
      allBooks = await fetchBooks(query);
      if (!allBooks.length) {
        filteredBooks = [];
        displayBooks([]);
        return;
      }
      populateCategories(allBooks);
      currentFilters = { category: '', yearMin: '', yearMax: '' };
      categoryFilter.value = '';
      yearMinInput.value = '';
      yearMaxInput.value = '';
      updateDisplay();
    } catch (err) {
      showModal('Failed to fetch book data. Please try again later.');
    } finally {
      setLoading(false);
    }
  });

  // Handle category filter changes
  categoryFilter.addEventListener('change', () => {
    currentFilters.category = categoryFilter.value;
    updateDisplay();
  });

  // Handle year filter button click
  yearFilterBtn.addEventListener('click', () => {
    const min = yearMinInput.value ? parseInt(yearMinInput.value, 10) : '';
    const max = yearMaxInput.value ? parseInt(yearMaxInput.value, 10) : '';
    if (min && max && min > max) {
      showModal('Year From cannot be greater than Year To.');
      return;
    }
    currentFilters.yearMin = min;
    currentFilters.yearMax = max;
    updateDisplay();
  });

  // Handle sort dropdown changes
  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    updateDisplay();
  });

  // Handle clear filters button
  clearFiltersBtn.addEventListener('click', () => {
    currentFilters = { category: '', yearMin: '', yearMax: '' };
    currentSort = 'title-asc';
    categoryFilter.value = '';
    yearMinInput.value = '';
    yearMaxInput.value = '';
    sortSelect.value = 'title-asc';
    updateDisplay();
  });

  // Show/hide back to top button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
      backToTopBtn.classList.remove('hidden');
    } else {
      backToTopBtn.classList.remove('show');
      backToTopBtn.classList.add('hidden');
    }
  });
  
  // Scroll to top when back to top button is clicked
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Dark mode toggle functionality
  function setDarkMode(enabled) {
    if (enabled) {
      document.documentElement.classList.add('dark');
      if (darkIcon) {
        darkIcon.classList.remove('bx-moon');
        darkIcon.classList.add('bx-sun');
      }
      localStorage.setItem('bookquest-dark', '1');
    } else {
      document.documentElement.classList.remove('dark');
      if (darkIcon) {
        darkIcon.classList.remove('bx-sun');
        darkIcon.classList.add('bx-moon');
      }
      localStorage.setItem('bookquest-dark', '0');
    }
  }
  
  // Set up dark mode toggle
  if (darkModeToggle) {
    // Check if user prefers dark mode
    const darkPref = localStorage.getItem('bookquest-dark');
    if (darkPref === '1' || (darkPref === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(!isDark);
    });
  }

  // Reading Lists Event Handlers
  const toggleReadingListsBtn = document.getElementById('toggle-reading-lists');
  const readingListsSection = document.getElementById('reading-lists-section');
  const showFavoritesBtn = document.getElementById('show-favorites');
  const showToReadBtn = document.getElementById('show-to-read');
  const showReadBtn = document.getElementById('show-read');
  const exportListsBtn = document.getElementById('export-lists');
  
  // Toggle reading lists section
  if (toggleReadingListsBtn) {
    toggleReadingListsBtn.addEventListener('click', () => {
      const isHidden = readingListsSection.classList.contains('hidden');
      if (isHidden) {
        readingListsSection.classList.remove('hidden');
        displayReadingLists(currentReadingList);
        showToast('Reading lists opened!', 'info', 2000);
      } else {
        readingListsSection.classList.add('hidden');
        showToast('Reading lists closed', 'info', 2000);
      }
    });
  }
  
  // Switch between reading lists
  if (showFavoritesBtn) {
    showFavoritesBtn.addEventListener('click', () => {
      currentReadingList = 'favorites';
      updateReadingListButtons();
      displayReadingLists('favorites');
    });
  }
  
  if (showToReadBtn) {
    showToReadBtn.addEventListener('click', () => {
      currentReadingList = 'toRead';
      updateReadingListButtons();
      displayReadingLists('toRead');
    });
  }
  
  if (showReadBtn) {
    showReadBtn.addEventListener('click', () => {
      currentReadingList = 'read';
      updateReadingListButtons();
      displayReadingLists('read');
    });
  }
  
  // Export reading lists
  if (exportListsBtn) {
    exportListsBtn.addEventListener('click', () => {
      exportReadingLists();
    });
  }
  
  // Update reading list button states
  function updateReadingListButtons() {
    document.querySelectorAll('.reading-list-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(`show-${currentReadingList}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }
  
  // Load reading lists on page load
  loadReadingLists();
  


  // Focus modal close button when modal opens
  modalOverlay.addEventListener('transitionend', () => {
    if (!modalOverlay.classList.contains('hidden')) {
      modalClose.focus();
    }
  });

  // Optional: Auto-search for bestsellers on page load
  // window.addEventListener('DOMContentLoaded', () => {
  //   searchInput.value = 'bestsellers';
  //   searchForm.dispatchEvent(new Event('submit'));
  // });
})(); 