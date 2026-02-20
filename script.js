const API_KEY_STORAGE_KEY = 'tmdb_api_key';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentGenre = 'popular';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-api-key-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const genreList = document.getElementById('genre-list');
    const moviesGrid = document.getElementById('movies-grid');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    // Load API Key
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
        if (apiKeyInput) apiKeyInput.value = storedKey;
        initApp();
    }

    if (saveKeyBtn) {
        saveKeyBtn.addEventListener('click', () => {
            const key = apiKeyInput.value.trim();
            if (key) {
                localStorage.setItem(API_KEY_STORAGE_KEY, key);
                alert('API Key saved!');
                initApp();
            } else {
                alert('Please enter a valid API Key.');
            }
        });
    }

    function getApiKey() {
        return localStorage.getItem(API_KEY_STORAGE_KEY);
    }

    async function initApp() {
        if (!getApiKey()) return;
        await fetchGenres();
        fetchMovies();
    }

    async function fetchGenres() {
        const apiKey = getApiKey();
        try {
            const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`);
            const data = await response.json();
            if (data.genres) {
                renderGenres(data.genres);
            }
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    }

    function renderGenres(genres) {
        // Clear existing genres except 'Popular'
        const popularItem = genreList.querySelector('li:first-child');
        genreList.innerHTML = '';
        if (popularItem) {
            genreList.appendChild(popularItem);

             // Re-attach listener to Popular
            const popularLink = popularItem.querySelector('a');
            if (popularLink) {
                popularLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleGenreClick('popular');
                    document.querySelectorAll('.genre-nav a').forEach(el => el.classList.remove('active'));
                    e.target.classList.add('active');
                });
            }
        }

        genres.forEach(genre => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.dataset.id = genre.id;
            a.textContent = genre.name;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                handleGenreClick(genre.id);
                // Update active class
                document.querySelectorAll('.genre-nav a').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
            });
            li.appendChild(a);
            genreList.appendChild(li);
        });
    }

    function handleGenreClick(genreId) {
        currentGenre = genreId;
        currentSearchQuery = ''; // Clear search
        currentPage = 1;
        fetchMovies();
    }

    async function fetchMovies() {
        const apiKey = getApiKey();
        if (!apiKey) return;

        let url = '';

        if (currentSearchQuery) {
            url = `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPage}`;
        } else if (currentGenre === 'popular') {
            url = `${BASE_URL}/movie/popular?api_key=${apiKey}&page=${currentPage}`;
        } else {
            url = `${BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${currentGenre}&page=${currentPage}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                renderMovies(data.results);
                updatePagination(data.page, data.total_pages);
            } else if (data.status_message) {
                 console.error('API Error:', data.status_message);
                 moviesGrid.innerHTML = `<p>Error: ${data.status_message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            moviesGrid.innerHTML = '<p>Error loading movies.</p>';
        }
    }

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                currentSearchQuery = query;
                currentPage = 1;
                fetchMovies();
                // Reset active genre
                 document.querySelectorAll('.genre-nav a').forEach(el => el.classList.remove('active'));
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (searchBtn) searchBtn.click();
            }
        });
    }

    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchMovies();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            currentPage++;
            fetchMovies();
        });
    }

    function updatePagination(page, totalPages) {
        if (currentPageSpan) currentPageSpan.textContent = `Page ${page}`;
        if (prevPageBtn) prevPageBtn.disabled = page <= 1;
        // Limit total pages to 500 as per TMDB API restrictions often
        if (nextPageBtn) nextPageBtn.disabled = page >= totalPages || page >= 500;
    }

    function renderMovies(movies) {
        if (!moviesGrid) return;

        moviesGrid.innerHTML = '';
        if (!movies || movies.length === 0) {
            moviesGrid.innerHTML = '<p>No movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.addEventListener('click', () => loadMovie(movie.id, movie.title));

            const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';

            card.innerHTML = `
                <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <span class="movie-rating">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                    <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : ''}</span>
                </div>
            `;
            moviesGrid.appendChild(card);
        });
    }

    function loadMovie(movieId, title) {
        const videoPlayer = document.getElementById('video-player');
        const playerPlaceholder = document.getElementById('player-placeholder');
        const movieTitle = document.getElementById('movie-title');

        if (videoPlayer) {
            // Update src
            videoPlayer.src = `https://www.vidking.net/embed/movie/${movieId}`;
        }

        // Hide placeholder
        if (playerPlaceholder) playerPlaceholder.style.display = 'none';

        // Update title
        if (movieTitle) movieTitle.textContent = `Now Watching: ${title}`;

        // Scroll to player
        const playerSection = document.getElementById('player-section');
        if (playerSection) playerSection.scrollIntoView({ behavior: 'smooth' });
    }
});
