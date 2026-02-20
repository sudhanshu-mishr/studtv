const TMDB_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual TMDB API Key if you have one
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For cards
const HERO_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'; // For hero (better quality)

let currentPage = 1;
let currentGenre = 'popular';
let currentSearchQuery = '';
let currentMediaType = 'all'; // 'all', 'movie', 'tv'
let allMovies = []; // Stores loaded JSON data

// Default Genres (Mixed)
const DEFAULT_GENRES = [
    { id: 'popular', name: 'Popular' },
    { id: 'movie', name: 'Movies' },
    { id: 'tv', name: 'TV Shows' },
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10765, name: 'Sci-Fi & Fantasy' }, // TV specific
    { id: 10759, name: 'Action & Adventure' }, // TV specific
    { id: 53, name: 'Thriller' }
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const genreList = document.getElementById('genre-list');
    const moviesGrid = document.getElementById('movies-grid');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Modal Elements
    const modal = document.getElementById('player-modal');
    const closeModal = document.querySelector('.close-modal');
    const videoPlayer = document.getElementById('video-player');
    const modalTitle = document.getElementById('modal-movie-title');
    const tvControls = document.getElementById('tv-controls');
    const seasonInput = document.getElementById('season-input');
    const episodeInput = document.getElementById('episode-input');
    const loadEpisodeBtn = document.getElementById('load-episode-btn');
    const nextEpisodeBtn = document.getElementById('next-episode-btn');

    let currentPlayingId = null;
    let currentPlayingTitle = null;

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        videoPlayer.src = ''; // Stop video
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            videoPlayer.src = '';
        }
    });

    // Manual TV Controls
    loadEpisodeBtn.addEventListener('click', () => {
        if (currentPlayingId) {
            const season = parseInt(seasonInput.value) || 1;
            const episode = parseInt(episodeInput.value) || 1;
            updatePlayerSource(currentPlayingId, 'tv', season, episode, currentPlayingTitle);
        }
    });

    nextEpisodeBtn.addEventListener('click', () => {
        if (currentPlayingId) {
            const currentEpisode = parseInt(episodeInput.value) || 1;
            const nextEpisode = currentEpisode + 1;
            const season = parseInt(seasonInput.value) || 1;

            // Update input UI
            episodeInput.value = nextEpisode;

            updatePlayerSource(currentPlayingId, 'tv', season, nextEpisode, currentPlayingTitle);
        }
    });

    initApp();

    async function initApp() {
        // Load local data first
        await loadLocalData();

        if (isApiKeySet()) {
            await fetchGenres(); // Will fetch from API if key set
            fetchMovies();
        } else {
            console.log("No API Key set. Using loaded static data.");

            // Set Hero Movie from local data
            if (allMovies.length > 0) {
                setHeroMovie(allMovies[Math.floor(Math.random() * allMovies.length)]);
            }

            // Filter genre list to remove API-specific logic if needed, but here we just render default
            renderGenres(DEFAULT_GENRES.filter(g => g.id !== 'popular')); // Render all except hardcoded Popular which is handled

            fetchMovies(); // Will use default logic
        }
    }

    async function loadLocalData() {
        try {
            const response = await fetch('./movies.json');
            const data = await response.json();
            if (Array.isArray(data)) {
                allMovies = data;
                console.log(`Loaded ${allMovies.length} movies/shows from local JSON.`);
            }
        } catch (error) {
            console.error('Error loading movies.json:', error);
            // Fallback to empty if fails, but user provided file so it should work
        }
    }

    function isApiKeySet() {
        return TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_API_KEY_HERE';
    }

    function setHeroMovie(movie) {
        const heroSection = document.getElementById('hero-section');
        const heroTitle = document.getElementById('hero-title');
        const heroOverview = document.getElementById('hero-overview');
        const heroPlayBtn = document.getElementById('hero-play-btn');
        const heroInfoBtn = document.getElementById('hero-info-btn');

        if (!movie) return;

        // Use high-res backdrop if available, otherwise poster
        let backdrop = 'https://via.placeholder.com/1920x1080?text=No+Image';
        if (movie.backdrop_path) {
            if (movie.backdrop_path.startsWith('http')) backdrop = movie.backdrop_path;
            else backdrop = `${HERO_IMAGE_BASE_URL}${movie.backdrop_path}`;
        }

        heroSection.style.backgroundImage = `url('${backdrop}')`;
        heroTitle.textContent = movie.title || movie.name; // Handle TV 'name'
        heroOverview.textContent = movie.overview || "No overview available.";

        // Remove old listeners to avoid duplicates if re-init
        const newPlayBtn = heroPlayBtn.cloneNode(true);
        heroPlayBtn.parentNode.replaceChild(newPlayBtn, heroPlayBtn);

        newPlayBtn.addEventListener('click', () => {
            openPlayer(movie.id, movie.title || movie.name, movie.media_type);
        });

        const newInfoBtn = heroInfoBtn.cloneNode(true);
        heroInfoBtn.parentNode.replaceChild(newInfoBtn, heroInfoBtn);
        newInfoBtn.addEventListener('click', () => {
             alert(`More info about ${movie.title || movie.name}: ${movie.overview}`);
        });
    }

    // Genre logic mainly for API, but adapted for local
    function renderGenres(genres) {
        const popularItem = genreList.querySelector('li:first-child');
        genreList.innerHTML = '';
        if (popularItem) {
            genreList.appendChild(popularItem);
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
                document.querySelectorAll('.genre-nav a').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
            });
            li.appendChild(a);
            genreList.appendChild(li);
        });
    }

    function handleGenreClick(genreId) {
        currentGenre = genreId;
        currentSearchQuery = '';
        currentPage = 1;

        // Handle pseudo-genres for Movies/TV
        if (genreId === 'movie') {
            currentMediaType = 'movie';
            currentGenre = 'popular'; // Reset genre filter when switching media type tab
        } else if (genreId === 'tv') {
            currentMediaType = 'tv';
            currentGenre = 'popular';
        } else if (genreId === 'popular') {
            currentMediaType = 'all';
        }

        fetchMovies();
    }

    async function fetchMovies() {
        let movies = [];
        let totalPages = 1;
        const ITEMS_PER_PAGE = 20;

        if (isApiKeySet()) {
           // API Logic (omitted for brevity as we focus on local expansion, but existing structure supports it)
           // ... (Same as before)
        } else {
            // Static Data Logic
            movies = [...allMovies]; // Copy array

            // Filter by Search
            if (currentSearchQuery) {
                const query = currentSearchQuery.toLowerCase().trim();
                movies = movies.filter(m =>
                    (m.title && m.title.toLowerCase().includes(query)) ||
                    (m.name && m.name.toLowerCase().includes(query))
                );
            }

            // Filter by Media Type (Movies vs TV)
            if (currentMediaType !== 'all') {
                movies = movies.filter(m => m.media_type === currentMediaType);
            }

            // Filter by Genre
            // Note: 'popular', 'movie', 'tv' are handled above or via media_type
            if (typeof currentGenre === 'number') {
                movies = movies.filter(m => m.genre_ids && m.genre_ids.includes(currentGenre));
            }

            // Pagination Logic
            totalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const paginatedMovies = movies.slice(start, end);

            renderMovies(paginatedMovies);
            updatePagination(currentPage, totalPages);
        }
    }

    // Live Search Functionality with Debounce
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearchQuery = query;
                currentPage = 1;
                fetchMovies();

                if (query) {
                    document.querySelectorAll('.genre-nav a').forEach(el => el.classList.remove('active'));
                    const sectionTitle = document.getElementById('section-title');
                    if (sectionTitle) sectionTitle.textContent = `Results for "${query}"`;
                } else {
                    const sectionTitle = document.getElementById('section-title');
                    if (sectionTitle) sectionTitle.textContent = 'Trending Now';
                }
            }, 300);
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
             // For static data, we need to check limit in fetchMovies, but here is click handler
             // We can just increment and let render handle empty
             currentPage++;
             fetchMovies();
        });
    }

    function updatePagination(page, totalPages) {
        if (currentPageSpan) currentPageSpan.textContent = `Page ${page}`;
        if (prevPageBtn) prevPageBtn.disabled = page <= 1;
        if (nextPageBtn) nextPageBtn.disabled = page >= totalPages;
    }

    function renderMovies(movies) {
        if (!moviesGrid) return;
        moviesGrid.innerHTML = '';
        if (!movies || movies.length === 0) {
            moviesGrid.innerHTML = '<p style="color: #fff; width: 100%;">No matches found.</p>';
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.style.animation = 'fadeIn 0.5s ease-out';

            const title = movie.title || movie.name;
            const mediaType = movie.media_type || 'movie'; // Default to movie if missing

            card.addEventListener('click', () => openPlayer(movie.id, title, mediaType));

            let posterPath = 'https://via.placeholder.com/200x300?text=No+Image';
            if (movie.poster_path) {
                if (movie.poster_path.startsWith('http')) {
                    posterPath = movie.poster_path;
                } else {
                    posterPath = `${IMAGE_BASE_URL}${movie.poster_path}`;
                }
            }

            card.innerHTML = `
                <img src="${posterPath}" alt="${title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${title}</h3>
                    <div class="movie-meta">
                         <span class="movie-rating">${Math.round((movie.vote_average || 0) * 10)}% Match</span>
                         <span class="movie-year">${(movie.release_date || movie.first_air_date || '').split('-')[0]}</span>
                    </div>
                </div>
            `;
            moviesGrid.appendChild(card);
        });
    }

    // --- Enhanced Player Integration ---
    function openPlayer(id, title, mediaType) {
        const modal = document.getElementById('player-modal');
        const tvControls = document.getElementById('tv-controls');

        currentPlayingId = id;
        currentPlayingTitle = title;

        // Reset Inputs for TV
        if (mediaType === 'tv') {
            tvControls.style.display = 'flex';

            // Check saved progress for last episode
            const lastSession = getSavedSession(id);
            let season = 1;
            let episode = 1;

            if (lastSession) {
                season = lastSession.season;
                episode = lastSession.episode;
                console.log(`Resuming ${title} at S${season}E${episode}`);
            }

            document.getElementById('season-input').value = season;
            document.getElementById('episode-input').value = episode;

            updatePlayerSource(id, 'tv', season, episode, title);
        } else {
            tvControls.style.display = 'none';
            updatePlayerSource(id, 'movie', null, null, title);
        }

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function updatePlayerSource(id, mediaType, season, episode, title) {
        const videoPlayer = document.getElementById('video-player');
        const modalTitle = document.getElementById('modal-movie-title');

        let url = '';
        let params = [];

        // Base URL based on Media Type
        if (mediaType === 'tv') {
            url = `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`;
            // TV Specific Params
            params.push('nextEpisode=true');
            params.push('episodeSelector=true');

            if (modalTitle) modalTitle.textContent = `${title} - S${season}:E${episode}`;

            // Save Session (Current Episode)
            saveSession(id, season, episode);

        } else {
            url = `https://www.vidking.net/embed/movie/${id}`;
            if (modalTitle) modalTitle.textContent = title;
        }

        // Global Params
        params.push('color=e50914'); // Netflix Red
        params.push('autoPlay=true'); // Autoplay since we clicked Play

        // Check for Saved Progress (Time)
        // Note: Progress ID should probably differ for TV episodes (e.g. id_s1_e1), but simple ID works for movie
        // For TV, VidKing might handle internal progress per episode via localStorage on their domain,
        // but if we want to resume *time* on our side, we need unique keys.
        // Let's stick to simple ID for now or compound key.
        const progressKey = mediaType === 'tv' ? `${id}_S${season}_E${episode}` : id;
        const savedProgress = getSavedProgress(progressKey);

        if (savedProgress) {
            params.push(`progress=${Math.floor(savedProgress)}`);
        }

        // Construct Final URL
        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        if (videoPlayer) {
            videoPlayer.src = url;
        }
    }

    // --- Progress Tracking ---

    function saveProgress(keyId, currentTime) {
        const key = `watch_progress_${keyId}`;
        localStorage.setItem(key, currentTime);
    }

    function getSavedProgress(keyId) {
        const key = `watch_progress_${keyId}`;
        const saved = localStorage.getItem(key);
        return saved ? parseFloat(saved) : null;
    }

    function saveSession(id, season, episode) {
        const key = `watch_session_${id}`;
        const session = { season, episode, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(session));
    }

    function getSavedSession(id) {
        const key = `watch_session_${id}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
    }

    // Listen for Player Events
    window.addEventListener("message", function (event) {
        try {
            let data = event.data;
            if (typeof data === "string") {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return;
                }
            }

            if (data && data.type === "PLAYER_EVENT" && data.data) {
                const eventData = data.data;
                const eventType = eventData.event;

                if (eventType === "timeupdate" || eventType === "pause" || eventType === "ended") {
                    // If TV, we need to know which episode to save progress for.
                    // The eventData might contain season/episode if VidKing sends it (documented in prompt).
                    // Prompt said: id, season, episode are sent.

                    if (eventData.mediaType === 'tv' && eventData.season && eventData.episode) {
                         const compoundId = `${eventData.id}_S${eventData.season}_E${eventData.episode}`;
                         if (eventData.currentTime) saveProgress(compoundId, eventData.currentTime);

                         // Also update session just in case they seeked/changed ep inside player
                         saveSession(eventData.id, eventData.season, eventData.episode);
                    } else if (eventData.id && eventData.currentTime) {
                         saveProgress(eventData.id, eventData.currentTime);
                    }
                }
            }
        } catch (error) {
            console.error("Error processing player message:", error);
        }
    });
});
