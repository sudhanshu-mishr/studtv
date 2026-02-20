const TMDB_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual TMDB API Key if you have one
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // For cards
const HERO_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'; // For hero (better quality)

let currentPage = 1;
let currentGenre = 'popular';
let currentSearchQuery = '';

// Default movies to show if no API key is provided
const DEFAULT_MOVIES = [
    {
        id: 533535,
        title: "Deadpool & Wolverine",
        poster_path: "/8cdWjvZonExuuKeOpSkCVEF8tBC.jpg",
        backdrop_path: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
        vote_average: 7.8,
        release_date: "2024-07-24",
        overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
        genre_ids: [28, 35, 878]
    },
    {
        id: 1022789,
        title: "Inside Out 2",
        poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        backdrop_path: "/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
        vote_average: 7.7,
        release_date: "2024-06-11",
        overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust, who’ve long been running a successful operation by all accounts, aren’t sure how to feel when Anxiety shows up. And it looks like she’s not alone.",
        genre_ids: [16, 10751, 12, 35]
    },
    {
        id: 519182,
        title: "Despicable Me 4",
        poster_path: "/wWba3TaojhK7NdsiCj9J8fIV6T.jpg",
        backdrop_path: "/lgkPzcOSnTvjeMnuFzozRO5HHw1.jpg",
        vote_average: 7.3,
        release_date: "2024-06-20",
        overview: "Gru and Lucy and their girls—Margo, Edith and Agnes—welcome a new member to the Gru family, Gru Jr., who is intent on tormenting his dad. Gru also faces a new nemesis in Maxime Le Mal and his femme fatale girlfriend Valentina, forcing the family to go on the run.",
        genre_ids: [16, 10751, 35, 28]
    },
    {
        id: 693134,
        title: "Dune: Part Two",
        poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        vote_average: 8.2,
        release_date: "2024-02-27",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
        genre_ids: [878, 12]
    },
    {
        id: 823464,
        title: "Godzilla x Kong: The New Empire",
        poster_path: "/tM26baWg8dZ20zWlT88o2D6Z4uC.jpg",
        backdrop_path: "/j3Z3XktmWB1VqkS8i40spI9pFAy.jpg",
        vote_average: 7.2,
        release_date: "2024-03-27",
        overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
        genre_ids: [28, 878, 12]
    },
    {
        id: 653346,
        title: "Kingdom of the Planet of the Apes",
        poster_path: "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
        backdrop_path: "/fqv8v6AycXKsivp1T5yKtLbGXce.jpg",
        vote_average: 7.1,
        release_date: "2024-05-08",
        overview: "Several generations in the future following Caesar's reign, apes are now the dominant species and live harmoniously while humans have been reduced to living in the shadows. As a new tyrannical ape leader builds his empire, one young ape undertakes a harrowing journey that will cause him to question all that he has known about the past and to make choices that will define a future for apes and humans alike.",
        genre_ids: [878, 12, 28]
    },
    {
        id: 929590,
        title: "Civil War",
        poster_path: "/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
        backdrop_path: "/z121dSTR7PY9KxKuvwiIFSYW8cf.jpg",
        vote_average: 7.0,
        release_date: "2024-04-10",
        overview: "In the near future, a group of war journalists attempt to survive while reporting the truth as the United States stands on the brink of civil war.",
        genre_ids: [10752, 28, 18]
    },
    {
        id: 746036,
        title: "The Fall Guy",
        poster_path: "/tSz1qsmSJon0rqjHBxXZmrotuse.jpg",
        backdrop_path: "/H5HjE7Xb9N09rbWn1zBfxgI8uz.jpg",
        vote_average: 7.3,
        release_date: "2024-04-24",
        overview: "Fresh off an almost career-ending accident, stuntman Colt Seavers has to track down a missing movie star, solve a conspiracy and try to win back the love of his life while still doing his day job.",
        genre_ids: [28, 35]
    },
    {
        id: 1011985,
        title: "Kung Fu Panda 4",
        poster_path: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        backdrop_path: "/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg",
        vote_average: 7.1,
        release_date: "2024-03-02",
        overview: "Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior. As such, he will train a new kung fu practitioner for the spot and will encounter a villain called the Chameleon who conjures villains from the past.",
        genre_ids: [16, 28, 10751, 35, 14]
    },
    {
        id: 934632,
        title: "Rebel Moon - Part Two: The Scargiver",
        poster_path: "/cxevDYdeFkiixRShbObdwAHBZry.jpg",
        backdrop_path: "/8fNBsX9mYp422geyRhQPflQ0quM.jpg",
        vote_average: 6.1,
        release_date: "2024-04-19",
        overview: "The rebels gear up for battle against the ruthless forces of the Motherworld as unbreakable bonds are forged, heroes emerge — and legends are made.",
        genre_ids: [878, 28, 18]
    },
    {
        id: 609681,
        title: "The Marvels",
        poster_path: "/9GBhzXMFbwrpXmUCVicQ8qLFXFb.jpg",
        backdrop_path: "/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg",
        vote_average: 6.3,
        release_date: "2023-11-08",
        overview: "Carol Danvers, aka Captain Marvel, has reclaimed her identity from the tyrannical Kree and taken revenge on the Supreme Intelligence. But unintended consequences see Carol shouldering the burden of a destabilized universe.",
        genre_ids: [878, 12, 28]
    },
    {
        id: 872585,
        title: "Oppenheimer",
        poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        backdrop_path: "/fm6KqXpk3M2HVveHwvkHIeHYDI6.jpg",
        vote_average: 8.1,
        release_date: "2023-07-19",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        genre_ids: [18, 36]
    },
    {
        id: 385687,
        title: "Fast X",
        poster_path: "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
        backdrop_path: "/4XM8DUTQb3lhLemJC51Jx4hDB5k.jpg",
        vote_average: 7.2,
        release_date: "2023-05-17",
        overview: "Dom Toretto and his family are targeted by the vengeful son of drug kingpin Hernan Reyes.",
        genre_ids: [28, 80, 53]
    },
    {
        id: 502356,
        title: "The Super Mario Bros. Movie",
        poster_path: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
        backdrop_path: "/9n2tJBplPbgR2ca05hS5CKXwP2c.jpg",
        vote_average: 7.7,
        release_date: "2023-04-05",
        overview: "While working underground to fix a water main, Brooklyn plumbers—and brothers—Mario and Luigi are transported down a mysterious pipe and wander into a magical new world.",
        genre_ids: [16, 10751, 12, 14, 35]
    },
    {
        id: 763215,
        title: "Damsel",
        poster_path: "/sMp34cNKjIb7IJSpUI PTZqjh.jpg",
        backdrop_path: "/deLWkOLZmBNkm8p164D7Poho2lz.jpg",
        vote_average: 6.6,
        release_date: "2024-03-08",
        overview: "A young woman's marriage to a charming prince turns into a fierce fight for survival when she's offered up as a sacrifice to a fire-breathing dragon.",
        genre_ids: [14, 28, 12]
    },
    {
        id: 359410,
        title: "Road House",
        poster_path: "/bXi6FQBLIA1EDWKTVxT4vFd GTpQ.jpg",
        backdrop_path: "/1ZskH970IN633KxHkhb73bL6h5r.jpg",
        vote_average: 7.0,
        release_date: "2024-03-08",
        overview: "Ex-UFC fighter Dalton takes a job as a bouncer at a Florida Keys roadhouse, only to discover that this paradise is not all it seems.",
        genre_ids: [28, 53, 80]
    },
    {
        id: 634492,
        title: "Madame Web",
        poster_path: "/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
        backdrop_path: "/pwGmXVKUgKN13PS35CJ87SLn7Ba.jpg",
        vote_average: 5.6,
        release_date: "2024-02-14",
        overview: "Forced to confront revelations about her past, paramedic Cassandra Webb must protect three young women from a mysterious adversary who wants them dead.",
        genre_ids: [28, 14, 878]
    },
    {
        id: 792307,
        title: "Poor Things",
        poster_path: "/kCGlIMHnOm8JPXq3rXM6c5wMxc.jpg",
        backdrop_path: "/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
        vote_average: 7.8,
        release_date: "2023-12-07",
        overview: "Brought back to life by an unorthodox scientist, a young woman runs off with a debauched lawyer on a whirlwind adventure across the continents.",
        genre_ids: [878, 10749, 35]
    },
    {
        id: 466420,
        title: "Killers of the Flower Moon",
        poster_path: "/dB6Krk806dnh0acqOxVlU0vT61.jpg",
        backdrop_path: "/oOqe9hMCjOIb6dElsFy7KYuemVS.jpg",
        vote_average: 7.5,
        release_date: "2023-10-18",
        overview: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one—until the FBI steps in to unravel the mystery.",
        genre_ids: [80, 18, 36]
    },
    {
        id: 299534,
        title: "Avengers: Endgame",
        poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        backdrop_path: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        vote_average: 8.3,
        release_date: "2019-04-24",
        overview: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
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

    initApp();

    async function initApp() {
        if (isApiKeySet()) {
            await fetchGenres();
            fetchMovies();
        } else {
            console.log("No API Key set. Using default static data.");

            // Set Hero Movie
            setHeroMovie(DEFAULT_MOVIES[Math.floor(Math.random() * DEFAULT_MOVIES.length)]);

            const standardGenres = DEFAULT_GENRES.filter(g => g.id !== 'popular');
            renderGenres(standardGenres);

            fetchMovies(); // Will use default logic
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
        heroTitle.textContent = movie.title;
        heroOverview.textContent = movie.overview || "No overview available.";

        // Remove old listeners to avoid duplicates if re-init
        const newPlayBtn = heroPlayBtn.cloneNode(true);
        heroPlayBtn.parentNode.replaceChild(newPlayBtn, heroPlayBtn);

        newPlayBtn.addEventListener('click', () => {
            openPlayer(movie.id, movie.title);
        });

        // Info button could scroll to details or open modal (just placeholder for now)
        const newInfoBtn = heroInfoBtn.cloneNode(true);
        heroInfoBtn.parentNode.replaceChild(newInfoBtn, heroInfoBtn);
        newInfoBtn.addEventListener('click', () => {
             alert(`More info about ${movie.title}: ${movie.overview}`);
        });
    }

    async function fetchGenres() {
        if (!isApiKeySet()) return;

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
                const query = currentSearchQuery.toLowerCase().trim();
                console.log("Searching for:", query);
                movies = movies.filter(m => m.title.toLowerCase().includes(query));
                console.log("Found:", movies.length);
            }

            // Filter by Genre
            else if (currentGenre !== 'popular') {
                movies = movies.filter(m => m.genre_ids && m.genre_ids.includes(parseInt(currentGenre)));
            }

            renderMovies(movies);
            updatePagination(1, 1);
        }
    }

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            console.log("Search button clicked. Query:", query);
            if (query) {
                currentSearchQuery = query;
                currentPage = 1;
                fetchMovies();
                document.querySelectorAll('.genre-nav a').forEach(el => el.classList.remove('active'));

                // Update section title
                const sectionTitle = document.getElementById('section-title');
                if (sectionTitle) sectionTitle.textContent = `Search Results for "${query}"`;
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission if any
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
            moviesGrid.innerHTML = '<p style="color: #fff; width: 100%;">No movies found matching your criteria.</p>';
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.addEventListener('click', () => openPlayer(movie.id, movie.title));

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
                    <div class="movie-meta">
                         <span class="movie-rating">${Math.round((movie.vote_average || 0) * 10)}% Match</span>
                         <span class="movie-year">${movie.release_date ? movie.release_date.split('-')[0] : ''}</span>
                    </div>
                </div>
            `;
            moviesGrid.appendChild(card);
        });
    }

    function openPlayer(movieId, title) {
        const modal = document.getElementById('player-modal');
        const videoPlayer = document.getElementById('video-player');
        const modalTitle = document.getElementById('modal-movie-title');

        if (videoPlayer) {
            videoPlayer.src = `https://www.vidking.net/embed/movie/${movieId}`;
        }

        if (modalTitle) modalTitle.textContent = title;

        if (modal) {
            modal.style.display = 'flex';
        }
    }
});
