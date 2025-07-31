// BookQuest App Logic (Encapsulated in IIFE for minimal global scope)
(function() {
  // --- DOM Elements ---
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

  // --- State ---
  let allBooks = [];
  let filteredBooks = [];
  let categories = new Set();
  let currentFilters = {
    category: '',
    yearMin: '',
    yearMax: ''
  };
  let currentSort = 'title-asc';

  // Diverse, visually appealing default book cover images (Pexels/Unsplash/Pixabay)
  // Keywords: abstract book cover, colorful book spine, simple book illustration, generic book design, literary patterns
  // All images are royalty-free and suitable for use as generic book covers
  const defaultCoverImages = [
    // Abstract, colorful, and generic book cover images
    'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&w=200&h=300&fit=crop', // Abstract stack
    'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&w=200&h=300&fit=crop', // Colorful spines
    'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&w=200&h=300&fit=crop', // Minimalist
    'https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg?auto=compress&w=200&h=300&fit=crop', // Simple illustration
    'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&w=200&h=300&fit=crop', // Book pattern
    'https://images.pexels.com/photos/1053687/pexels-photo-1053687.jpeg?auto=compress&w=200&h=300&fit=crop', // Pastel stack
    'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&w=200&h=300&fit=crop', // Artistic
    'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&w=200&h=300&fit=crop' // Literary pattern
  ];
  // getPlaceholderImage: randomly select a default cover image for books without a cover
  function getPlaceholderImage() {
    const idx = Math.floor(Math.random() * defaultCoverImages.length);
    return defaultCoverImages[idx];
  }

  // --- IMAGE SLIDER LOGIC (Inspired by Codehal) ---
  // This slider displays the default book cover images in a horizontal carousel with navigation buttons.
  // The logic is adapted from Codehal's YouTube slider tutorial: https://youtu.be/McPdzhLRzCg?si=d23XAoU71GQ0wKgl
  let sliderIndex = 0;
  let slidesToShow = 4; // Default for desktop
  let autoSlideInterval = null;
  let isSliderHovered = false;

  // Responsive: determine how many slides to show
  function updateSlidesToShow() {
    if (window.innerWidth < 640) {
      slidesToShow = 1;
    } else if (window.innerWidth < 900) {
      slidesToShow = 2;
    } else {
      slidesToShow = 4;
    }
  }

  // Render the slider images
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

  // Move the slider track to show the correct slides
  function updateSliderPosition() {
    const slideWidth = sliderTrack && sliderTrack.firstChild ? sliderTrack.firstChild.offsetWidth + 32 : 160; // 32px gap
    const maxIndex = defaultCoverImages.length - slidesToShow;
    if (sliderIndex < 0) sliderIndex = 0;
    if (sliderIndex > maxIndex) sliderIndex = maxIndex;
    const translateX = -(sliderIndex * slideWidth);
    sliderTrack.style.transform = `translateX(${translateX}px)`;
  }

  // Navigation button handlers
  function handleSliderPrev() {
    sliderIndex--;
    updateSliderPosition();
  }
  function handleSliderNext() {
    sliderIndex++;
    updateSliderPosition();
  }

  // --- Auto-slide logic ---
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
  if (sliderTrack) {
    sliderTrack.addEventListener('mouseenter', () => { isSliderHovered = true; });
    sliderTrack.addEventListener('mouseleave', () => { isSliderHovered = false; });
    sliderTrack.addEventListener('focusin', () => { isSliderHovered = true; });
    sliderTrack.addEventListener('focusout', () => { isSliderHovered = false; });
  }

  // Looping (infinite effect) is optional; here we clamp at ends for simplicity

  // Responsive: update slidesToShow and position on resize
  function handleResize() {
    updateSlidesToShow();
    updateSliderPosition();
    setupAutoSlide();
  }

  // Initialize slider on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    updateSlidesToShow();
    renderSlider();
    if (sliderPrev && sliderNext) {
      sliderPrev.addEventListener('click', handleSliderPrev);
      sliderNext.addEventListener('click', handleSliderNext);
    }
    window.addEventListener('resize', handleResize);
  });

  // --- Utility Functions ---

  // Show the custom modal with a message (with entrance animation)
  function showModal(message) {
    modalMessage.textContent = message;
    modalOverlay.classList.remove('hidden');
    modalBox.classList.add('animate-modal-in');
    setTimeout(() => modalClose.focus(), 300);
  }

  // Hide modal on close button click
  modalClose.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    modalBox.classList.remove('animate-modal-in');
  });
  // Hide modal on overlay click (not modal box)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add('hidden');
      modalBox.classList.remove('animate-modal-in');
    }
  });
  // Accessibility: close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (!modalOverlay.classList.contains('hidden') && e.key === 'Escape') {
      modalOverlay.classList.add('hidden');
      modalBox.classList.remove('animate-modal-in');
    }
  });

  // Show or hide the loading indicator
  function setLoading(show) {
    loadingIndicator.classList.toggle('hidden', !show);
  }

  // Truncate a string to a max length, adding ellipsis if needed
  function truncate(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
  }

  // Extract year from a date string (YYYY or YYYY-MM-DD)
  function extractYear(dateStr) {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  // --- API Interaction ---
  async function fetchBooks(query) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=32`;
    try {
      setLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (!data.items || !Array.isArray(data.items)) return [];
      return data.items;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // --- Book Display ---
  function displayBooks(books) {
    resultsDiv.innerHTML = '';
    if (!books.length) {
      resultsDiv.innerHTML = `<div class="col-span-full text-center text-gray-500 text-lg py-12">No books found for your query. Try a different search term!</div>`;
      return;
    }
    // Animate results fade-in
    resultsDiv.classList.remove('fade-in');
    void resultsDiv.offsetWidth; // force reflow
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
      // Use API image if available, else themed placeholder
      const image = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || getPlaceholderImage();
      const bookId = `book-${idx}`;
      // Book Card with Boxicons for visual polish and collect toggle
      const card = document.createElement('div');
      card.className = 'bookquest-card';
      card.innerHTML = `
        <div class="bookquest-card-img flex items-center justify-center relative">
          <img src="${image}" alt="Cover for ${title}" loading="lazy" onerror="this.src='${getPlaceholderImage()}'" />
          <i class="bx bx-book absolute top-2 left-2 text-main-color text-xl opacity-80"></i>
          <!-- Collect/Favorite toggle button -->
          <button class="bookquest-collect-toggle absolute top-2 right-2 bg-transparent flex items-center justify-center p-1 rounded-full" aria-label="Collect or favorite this book">
            <i class="bx bx-heart text-2xl"></i>
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
    // Add event listeners for "Read More" toggles (with smooth expand/collapse)
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
    // Add event listeners for collect/favorite toggles
    document.querySelectorAll('.bookquest-collect-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        const icon = btn.querySelector('i');
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) {
          icon.classList.remove('bx-heart');
          icon.classList.add('bxs-heart');
        } else {
          icon.classList.remove('bxs-heart');
          icon.classList.add('bx-heart');
        }
      });
    });
  }

  // Populate the category filter dropdown with unique categories from books
  function populateCategories(books) {
    categories = new Set();
    books.forEach(item => {
      const cats = item.volumeInfo && item.volumeInfo.categories;
      if (cats && Array.isArray(cats)) {
        cats.forEach(cat => categories.add(cat));
      }
    });
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  }

  // --- Filtering & Sorting ---
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

  function updateDisplay() {
    applyFilters();
    applySorting();
    displayBooks(filteredBooks);
  }

  // --- Event Handlers ---
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

  categoryFilter.addEventListener('change', () => {
    currentFilters.category = categoryFilter.value;
    updateDisplay();
  });

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

  sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    updateDisplay();
  });

  // Clear Filters Button: resets all filters and sort to default
  clearFiltersBtn.addEventListener('click', () => {
    currentFilters = { category: '', yearMin: '', yearMax: '' };
    currentSort = 'title-asc';
    categoryFilter.value = '';
    yearMinInput.value = '';
    yearMaxInput.value = '';
    sortSelect.value = 'title-asc';
    updateDisplay();
  });

  // --- Back to Top Button Logic ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('show');
      backToTopBtn.classList.remove('hidden');
    } else {
      backToTopBtn.classList.remove('show');
      backToTopBtn.classList.add('hidden');
    }
  });
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Dark Mode Toggle (Boxicons Only) ---
  // Persists preference in localStorage, updates icon (bx-moon for light, bx-sun for dark)
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
  if (darkModeToggle) {
    // On load, set dark mode from localStorage or system preference
    const darkPref = localStorage.getItem('bookquest-dark');
    if (darkPref === '1' || (darkPref === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(!isDark);
    });
  }

  // --- Accessibility: Focus modal close on open ---
  modalOverlay.addEventListener('transitionend', () => {
    if (!modalOverlay.classList.contains('hidden')) {
      modalClose.focus();
    }
  });

  // Optionally, show a default search on load
  // window.addEventListener('DOMContentLoaded', () => {
  //   searchInput.value = 'bestsellers';
  //   searchForm.dispatchEvent(new Event('submit'));
  // });
})(); 