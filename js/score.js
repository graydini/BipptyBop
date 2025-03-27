/*
 * Score management for Bippty Bop game
 * Handles high score tracking using localStorage
 */

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

    // Initialize the score module
    function initScoreSystem() {
        // Check if high score already exists in localStorage
        const existingHighScore = localStorage.getItem('bipptyBopHighScore');
        
        if (!existingHighScore) {
            // Initialize with 0 if no high score exists
            localStorage.setItem('bipptyBopHighScore', 0);
        }
    }
    
    // Reset the high score (for development purposes)
    function resetHighScore() {
        localStorage.setItem('bipptyBopHighScore', 0);
        return 0;
    }
    
    // Get the current high score
    function getHighScore() {
        return parseInt(localStorage.getItem('bipptyBopHighScore') || 0);
    }
    
    // Save a new high score
    function saveHighScore(score) {
        const currentHighScore = getHighScore();
        
        if (score > currentHighScore) {
            localStorage.setItem('bipptyBopHighScore', score);
            return true; // It's a new high score
        }
        
        return false; // Not a new high score
    }
    
    // Initialize when the script loads
    initScoreSystem();

    // Expose functions globally
    window.gameScore = {
        updateScore,
        updateHighScore,
        resetScore,
        getScore: () => score,
        getHighScore: () => highScore
    };

    // Expose the functions to the window object
    window.scoreSystem = {
        getHighScore: getHighScore,
        saveHighScore: saveHighScore,
        resetHighScore: resetHighScore
    };
})();