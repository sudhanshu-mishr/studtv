document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('video-player');
    const watchBtn = document.getElementById('watch-btn');
    const movieIdInput = document.getElementById('movie-id-input');
    const movieTitle = document.getElementById('movie-title');

    watchBtn.addEventListener('click', () => {
        const movieId = movieIdInput.value.trim();
        if (movieId) {
            // Validate if it's a number (basic check)
            if (/^\d+$/.test(movieId)) {
                const newSrc = `https://www.vidking.net/embed/movie/${movieId}`;
                videoPlayer.src = newSrc;
                movieTitle.textContent = `Now Watching: Movie ID ${movieId}`;
                movieIdInput.value = ''; // Clear input
            } else {
                alert('Please enter a valid numeric Movie ID.');
            }
        }
    });

    // Allow pressing "Enter" in the input field
    movieIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            watchBtn.click();
        }
    });
});
