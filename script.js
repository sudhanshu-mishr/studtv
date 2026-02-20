const TMDB_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual TMDB API Key if you have one
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentGenre = 'popular';
let currentSearchQuery = '';

// Default movies to show if no API key is provided
// Data manually curated based on popular movies (as of mid-2024/2025 context)
const DEFAULT_MOVIES = [
    {
        id: 533535,
        title: "Deadpool & Wolverine",
        poster_path: "/8cdWjvZonExuuKeOpSkCVEF8tBC.jpg",
        vote_average: 7.8,
        release_date: "2024-07-24",
        genre_ids: [28, 35, 878]
    },
    {
        id: 1022789,
        title: "Inside Out 2",
        poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        vote_average: 7.7,
        release_date: "2024-06-11",
        genre_ids: [16, 10751, 12, 35]
    },
    {
        id: 519182,
        title: "Despicable Me 4",
        poster_path: "/wWba3TaojhK7NdsiCj9J8fIV6T.jpg",
        vote_average: 7.3,
        release_date: "2024-06-20",
        genre_ids: [16, 10751, 35, 28]
    },
    {
        id: 693134,
        title: "Dune: Part Two",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        vote_average: 8.2,
        release_date: "2024-02-27",
        genre_ids: [878, 12]
    },
    {
        id: 823464,
        title: "Godzilla x Kong: The New Empire",
        poster_path: "/tM26baWg8dZ20zWlT88o2D6Z4uC.jpg",
        vote_average: 7.2,
        release_date: "2024-03-27",
        genre_ids: [28, 878, 12]
    },
    {
        id: 653346,
        title: "Kingdom of the Planet of the Apes",
        poster_path: "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
        vote_average: 7.1,
        release_date: "2024-05-08",
        genre_ids: [878, 12, 28]
    },
    {
        id: 929590,
        title: "Civil War",
        poster_path: "/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
        vote_average: 7.0,
        release_date: "2024-04-10",
        genre_ids: [10752, 28, 18]
    },
    {
        id: 746036,
        title: "The Fall Guy",
        poster_path: "/tSz1qsmSJon0rqjHBxXZmrotuse.jpg",
        vote_average: 7.3,
        release_date: "2024-04-24",
        genre_ids: [28, 35]
    },
    {
        id: 1011985,
        title: "Kung Fu Panda 4",
        poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        vote_average: 7.1,
        release_date: "2024-03-02",
        genre_ids: [16, 28, 10751, 35, 14]
    },
    {
        id: 934632,
        title: "Rebel Moon - Part Two: The Scargiver",
        poster_path: "/cxevDYdeFkiixRShbObdwAHBZry.jpg",
        vote_average: 6.1,
        release_date: "2024-04-19",
        genre_ids: [878, 28, 18]
    },
    {
        id: 609681,
        title: "The Marvels",
        poster_path: "/9GBhzXMFbwrpXmUCVicQ8qLFXFb.jpg",
        vote_average: 6.3,
        release_date: "2023-11-08",
        genre_ids: [878, 12, 28]
    },
    {
        id: 872585,
        title: "Oppenheimer",
        poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        vote_average: 8.1,
        release_date: "2023-07-19",
        genre_ids: [18, 36]
    },
    {
        id: 385687,
        title: "Fast X",
        poster_path: "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
        vote_average: 7.2,
        release_date: "2023-05-17",
        genre_ids: [28, 80, 53]
    },
    {
        id: 502356,
        title: "The Super Mario Bros. Movie",
        poster_path: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
        vote_average: 7.7,
        release_date: "2023-04-05",
        genre_ids: [16, 10751, 12, 14, 35]
    },
    {
        id: 763215,
        title: "Damsel",
        poster_path: "/sMp34cNKjIb7IJSpUI PTZqjh.jpg", // Note: intentional placeholder if link is tricky, but using standard path structure
        vote_average: 6.6,
        release_date: "2024-03-08",
        genre_ids: [14, 28, 12]
    },
    {
        id: 359410,
        title: "Road House",
        poster_path: "/bXi6FQBLIA1EDWKTVxT4vFd GTpQ.jpg",
        vote_average: 7.0,
        release_date: "2024-03-08",
        genre_ids: [28, 53, 80]
    },
    {
        id: 634492,
        title: "Madame Web",
        poster_path: "/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
        vote_average: 5.6,
        release_date: "2024-02-14",
        genre_ids: [28, 14, 878]
    },
    {
        id: 792307,
        title: "Poor Things",
        poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxc.jpg",
        vote_average: 7.8,
        release_date: "2023-12-07",
        genre_ids: [878, 10749, 35]
    },
    {
        id: 466420,
        title: "Killers of the Flower Moon",
        poster_path: "/dB6Krk806dnh0acqOxVlU0vT61.jpg",
        vote_average: 7.5,
        release_date: "2023-10-18",
        genre_ids: [80, 18, 36]
    },
    {
        id: 299534,
        title: "Avengers: Endgame",
        poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        vote_average: 8.3,
        release_date: "2019-04-24",
        genre_ids: [28, 12, 878]
    }
];

const DEFAULT_GENRES = [
    { id: 'popular', name: 'Popular' },
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
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const genreList = document.getElementById('genre-list');
    const moviesGrid = document.getElementById('movies-grid');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');

    initApp();

    async function initApp() {
        if (isApiKeySet()) {
            await fetchGenres();
            fetchMovies();
        } else {
            console.log("No API Key set. Using default static data.");
            renderGenres(DEFAULT_GENRES); // Use default genres (note: structure is slightly diff for API response)
            // Fix: DEFAULT_GENRES includes 'popular', API doesn't.
            // renderGenres logic expects API format mostly, let's adapt.
            // Actually, renderGenres expects {id, name}. DEFAULT_GENRES matches.
            // BUT renderGenres manually adds "Popular". We should pass DEFAULT_GENRES excluding 'popular' if we reuse that logic,
            // or just rely on the fact that 'Popular' is hardcoded in HTML?
            // Wait, HTML has Popular hardcoded. renderGenres clears it.
            // Let's pass sliced DEFAULT_GENRES (skipping the first one if it's 'popular', or just standard genres).
            const standardGenres = DEFAULT_GENRES.filter(g => g.id !== 'popular');
            renderGenres(standardGenres);

            fetchMovies(); // Will use default logic
        }
    }

    function isApiKeySet() {
        return TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_API_KEY_HERE';
    }

    async function fetchGenres() {
        if (!isApiKeySet()) return; // Handled in initApp fallback

        try {
            const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
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
        let movies = [];
        let totalPages = 1;

        if (isApiKeySet()) {
            let url = '';
            if (currentSearchQuery) {
                url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPage}`;
            } else if (currentGenre === 'popular') {
                url = `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${currentPage}`;
            } else {
                url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${currentGenre}&page=${currentPage}`;
            }

            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.results) {
                    movies = data.results;
                    totalPages = data.total_pages;
                    renderMovies(movies);
                    updatePagination(data.page, totalPages);
                } else if (data.status_message) {
                    console.error('API Error:', data.status_message);
                    moviesGrid.innerHTML = `<p>Error: ${data.status_message}</p>`;
                }
            } catch (error) {
                console.error('Error fetching movies:', error);
                moviesGrid.innerHTML = '<p>Error loading movies.</p>';
            }
        } else {
            // Static Data Fallback
            movies = DEFAULT_MOVIES;

            // Filter by Search
            if (currentSearchQuery) {
                const query = currentSearchQuery.toLowerCase();
                movies = movies.filter(m => m.title.toLowerCase().includes(query));
            }

            // Filter by Genre
            else if (currentGenre !== 'popular') {
                movies = movies.filter(m => m.genre_ids && m.genre_ids.includes(parseInt(currentGenre)));
            }

            // Mock Pagination (simple slicing for demo if list was long, but here we just show all matches)
            // If we want to simulate paging on a short list, it's overkill. We'll just show all.
            renderMovies(movies);
            updatePagination(1, 1);
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
            // Only functional with real API for now
            if (isApiKeySet()) {
                currentPage++;
                fetchMovies();
            }
        });
    }

    function updatePagination(page, totalPages) {
        if (currentPageSpan) currentPageSpan.textContent = `Page ${page}`;
        if (prevPageBtn) prevPageBtn.disabled = page <= 1;
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

            // Use full URL if provided (static data), else construct from base
            let posterPath = 'https://via.placeholder.com/200x300?text=No+Image';
            if (movie.poster_path) {
                if (movie.poster_path.startsWith('http')) {
                    posterPath = movie.poster_path;
                } else {
                    posterPath = `${IMAGE_BASE_URL}${movie.poster_path}`;
                }
            }

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
