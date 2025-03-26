(function() {
    let score = 0;
    let highScore = 0;

    function updateScore(points) {
        score += points;
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.innerText = `Score: ${score}`;
        }
        updateHighScore();
    }

    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            const highScoreEl = document.getElementById('high-score');
            if (highScoreEl) {
                highScoreEl.innerText = `High Score: ${highScore}`;
            }
        }
    }

    function resetScore() {
        score = 0;
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.innerText = `Score: ${score}`;
        }
    }

    // Expose functions globally
    window.gameScore = {
        updateScore,
        updateHighScore,
        resetScore,
        getScore: () => score,
        getHighScore: () => highScore
    };
})();