// Wait for DOM content to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.getElementById('gameArea');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('startButton');
    
    // Remove the audio loading code - now using programmatic audio

    // Check if elements exist before proceeding
    if (!gameArea) {
        console.error("Error: Game area element not found! Make sure there's an element with id 'gameArea'");
        return;
    }

    if (!startButton) {
        console.error("Error: Start button element not found! Make sure there's an element with id 'startButton'");
        return;
    }

    if (!scoreDisplay) {
        console.error("Error: Score display element not found! Make sure there's an element with id 'score'");
        return;
    }

    let score = 0;
    let gameInterval;
    let gameActive = false;
    let lastHatPosition = null;

    // Initialize the game area with SVG container
    function initializeGameArea() {
        // Update SVG background to dark blue gradient
        gameArea.style.background = 'linear-gradient(to bottom, #1a365d, #2c5282)';
        
        // Add magical stars to the background
        createMagicalStars();
        
        // Create SVG containers for each hat if they don't exist
        const hatContainers = document.getElementsByClassName('top-hat');
        if (hatContainers.length === 0) {
            console.error("Error: No top-hat elements found!");
            return;
        }
        
        for (let i = 0; i < hatContainers.length; i++) {
            // Create a container with layered elements for 3D effect
            hatContainers[i].innerHTML = `
                <div class="hat-container">
                    <!-- Back layer - behind mouse -->
                    <div class="hat-back-layer">
                        <svg class="hat-svg" width="100%" height="100%" viewBox="0 0 100 120">
                            <!-- Top part of brim (behind mouse) -->
                            <path class="hat-brim-top" d="M10,60 Q30,50 50,48 Q70,50 90,60" fill="#1F142C" />
                            
                            <!-- Shadow under the brim -->
                            <path class="hat-brim-shadow" d="M10,60 Q50,80 90,60" fill="#1A1427" opacity="0.7" />
                        </svg>
                    </div>
                    
                    <!-- Mouse container (middle layer) -->
                    <div class="mouse-container"></div>
                    
                    <!-- Front layer (in front of mouse) -->
                    <div class="hat-front-layer">
                        <svg class="hat-svg" width="100%" height="100%" viewBox="0 0 100 120">
                            <!-- Hat body (cylindrical part) -->
                            <path class="hat-top" d="M30,60 L30,90 Q50,105 70,90 L70,60" fill="#291C3A" />
                            
                            <!-- Hat band -->
                            <path class="hat-band" d="M30,75 Q50,80 70,75" stroke="#A01FC8" stroke-width="3" fill="none" />
                            
                            <!-- Bottom part of brim (in front of mouse) -->
                            <path class="hat-brim-bottom" d="M10,60 Q50,70 90,60" fill="#1F142C" />
                        </svg>
                    </div>
                </div>`;
        }
    }
    
    // Create magical stars in the background
    function createMagicalStars() {
        // Create a container for stars
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        
        // Create 20 stars with random positions
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            // Random size between 5px and 15px
            const size = 5 + Math.random() * 10;
            
            // Random animation delay
            const animDelay = Math.random() * 3;
            
            // Set star styles
            star.style.left = `${left}%`;
            star.style.top = `${top}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${animDelay}s`;
            
            starsContainer.appendChild(star);
        }
        
        gameArea.appendChild(starsContainer);
    }

    function startGame() {
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameActive = true;
        window.gameAudio.playBackgroundMusic(); // Use new audio system
        initializeGameArea();
        
        // Slow down the game by increasing interval
        gameInterval = setInterval(showMouse, 1400); 
    }

    function createMouseSvg() {
        const ns = "http://www.w3.org/2000/svg";
        
        // Create mouse SVG element
        const mouseSvg = document.createElementNS(ns, "svg");
        mouseSvg.setAttribute("width", "60");
        mouseSvg.setAttribute("height", "60");
        mouseSvg.setAttribute("viewBox", "0 0 60 60");
        mouseSvg.classList.add('mouse');
        
        // Remove the background circle - we don't want to change the mouse shape
        
        // Mouse body (gray oval)
        const body = document.createElementNS(ns, "ellipse");
        body.setAttribute("cx", "30");
        body.setAttribute("cy", "35");
        body.setAttribute("rx", "20");
        body.setAttribute("ry", "15");
        body.setAttribute("fill", "#999");
        body.setAttribute("fill-opacity", "1"); // Ensure opacity is 1
        
        // Left ear
        const leftEar = document.createElementNS(ns, "circle");
        leftEar.setAttribute("cx", "20");
        leftEar.setAttribute("cy", "20");
        leftEar.setAttribute("r", "8");
        leftEar.setAttribute("fill", "#999");
        
        // Right ear
        const rightEar = document.createElementNS(ns, "circle");
        rightEar.setAttribute("cx", "40");
        rightEar.setAttribute("cy", "20");
        rightEar.setAttribute("r", "8");
        rightEar.setAttribute("fill", "#999");
        
        // Eyes
        const leftEye = document.createElementNS(ns, "circle");
        leftEye.setAttribute("cx", "25");
        leftEye.setAttribute("cy", "30");
        leftEye.setAttribute("r", "2");
        leftEye.setAttribute("fill", "#000");
        
        const rightEye = document.createElementNS(ns, "circle");
        rightEye.setAttribute("cx", "35");
        rightEye.setAttribute("cy", "30");
        rightEye.setAttribute("r", "2");
        rightEye.setAttribute("fill", "#000");
        
        // Nose
        const nose = document.createElementNS(ns, "circle");
        nose.setAttribute("cx", "30");
        nose.setAttribute("cy", "35");
        nose.setAttribute("r", "3");
        nose.setAttribute("fill", "#FF6B6B");
        
        // Wire (tail)
        const wire = document.createElementNS(ns, "path");
        wire.setAttribute("d", "M10,40 Q5,45 10,50 T15,55");
        wire.setAttribute("stroke", "#666");
        wire.setAttribute("stroke-width", "2");
        wire.setAttribute("fill", "none");
        
        // Add all elements to the SVG (no background)
        mouseSvg.appendChild(leftEar);
        mouseSvg.appendChild(rightEar);
        mouseSvg.appendChild(body);
        mouseSvg.appendChild(leftEye);
        mouseSvg.appendChild(rightEye);
        mouseSvg.appendChild(nose);
        mouseSvg.appendChild(wire);
        
        return mouseSvg;
    }

    function showMouse() {
        // Get all hat elements
        const totalHats = document.getElementsByClassName('top-hat');
        
        // Generate random hat index between 0 and 5
        const randomHat = Math.floor(Math.random() * totalHats.length);
        const topHat = totalHats[randomHat];
        
        // First create a magical star swirl animation and sound
        createMagicalSwirl(lastHatPosition, topHat).then(() => {
            // Set this hat as the last hat for next animation
            lastHatPosition = topHat;
            
            // After swirl animation completes, show the mouse
            const mouse = createMouseSvg();
            const mouseContainer = topHat.querySelector('.mouse-container');
            
            // Add appropriate class based on appearance type
            const isTeaseAppearance = Math.random() < 0.4;
            mouse.classList.add(isTeaseAppearance ? 'tease-appearance' : 'full-appearance');
            
            // Append mouse to the mouse container (now above hat layers)
            mouseContainer.appendChild(mouse);
            
            // Ensure mouse is positioned correctly and fully opaque
            mouse.style.left = '50%';
            mouse.style.transform = 'translateX(-50%)';
            mouse.style.top = '40px';
            mouse.style.opacity = '1';
            
            // Ensure the mouse can be clicked
            mouse.style.pointerEvents = 'auto';
            mouse.style.cursor = 'url(assets/images/wand-cursor.png), pointer';
            
            // Mark container as active for styling
            mouseContainer.classList.add('mouse-pop-active');
            
            mouse.addEventListener('click', (event) => {
                window.gameAudio.playHitSound(); // Use new audio system
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                
                // Create starburst effect at click location
                createStarburst(event.clientX, event.clientY);
                
                mouseContainer.removeChild(mouse);
                mouseContainer.classList.remove('mouse-pop-active');
            });

            // Set timeout based on appearance type
            setTimeout(() => {
                if (mouseContainer.contains(mouse)) {
                    window.gameAudio.playMissSound(); // Use new audio system
                    mouseContainer.removeChild(mouse);
                    mouseContainer.classList.remove('mouse-pop-active');
                }
            }, isTeaseAppearance ? 600 : 800);
        });
    }

    // Function to create a magical star swirl effect between hats
    function createMagicalSwirl(sourceHat, targetHat) {
        return new Promise((resolve) => {
            // Play star swirl sound
            window.gameAudio.playStarSwirlSound();
            
            // Create a swirl container
            const swirlContainer = document.createElement('div');
            swirlContainer.className = 'swirl-container';
            
            // Get target hat position
            const targetRect = targetHat.getBoundingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();
            
            // Calculate target position relative to game area
            const targetX = targetRect.left + targetRect.width/2 - gameAreaRect.left;
            const targetY = targetRect.top + targetRect.height/2 - gameAreaRect.top;
            
            // Set swirl container position at target
            swirlContainer.style.left = `${targetX}px`;
            swirlContainer.style.top = `${targetY}px`;
            
            // Get source position (or use random position for first appearance)
            let sourceX, sourceY;
            
            if (sourceHat) {
                const sourceRect = sourceHat.getBoundingClientRect();
                sourceX = sourceRect.left + sourceRect.width/2 - gameAreaRect.left - targetX;
                sourceY = sourceRect.top + sourceRect.height/2 - gameAreaRect.top - targetY;
            } else {
                // First appearance - come from a random edge
                const edge = Math.floor(Math.random() * 4);
                switch(edge) {
                    case 0: // top
                        sourceX = Math.random() * gameArea.offsetWidth - targetX;
                        sourceY = -100 - targetY;
                        break;
                    case 1: // right
                        sourceX = gameArea.offsetWidth + 100 - targetX;
                        sourceY = Math.random() * gameArea.offsetHeight - targetY;
                        break;
                    case 2: // bottom
                        sourceX = Math.random() * gameArea.offsetWidth - targetX;
                        sourceY = gameArea.offsetHeight + 100 - targetY;
                        break;
                    case 3: // left
                        sourceX = -100 - targetX;
                        sourceY = Math.random() * gameArea.offsetHeight - targetY;
                        break;
                }
            }
            
            // Create multiple stars for the swirl
            for (let i = 0; i < 12; i++) {
                const star = document.createElement('div');
                star.className = 'swirl-star';
                
                // Random size for variety
                const size = 4 + Math.random() * 8;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                
                // Random delay for each star in the swirl
                star.style.animationDelay = `${i * 0.05}s`;
                
                // Set custom properties for start and end positions
                star.style.setProperty('--start-x', `${sourceX}px`);
                star.style.setProperty('--start-y', `${sourceY}px`);
                star.style.setProperty('--end-x', '0px');
                star.style.setProperty('--end-y', '0px');
                
                // Add the star to the swirl container
                swirlContainer.appendChild(star);
            }
            
            // Add the swirl to the game area
            gameArea.appendChild(swirlContainer);
            
            // Resolve the promise after animation completes
            setTimeout(() => {
                gameArea.removeChild(swirlContainer);
                resolve();
            }, 600);
        });
    }

    // Function to create a starburst effect at click location
    function createStarburst(clientX, clientY) {
        // Create a container for the starburst
        const burstContainer = document.createElement('div');
        burstContainer.className = 'starburst-container';
        
        // Position the container at the click location
        const gameAreaRect = gameArea.getBoundingClientRect();
        burstContainer.style.left = `${clientX - gameAreaRect.left}px`;
        burstContainer.style.top = `${clientY - gameAreaRect.top}px`;
        
        // Create particles for starburst
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'starburst-particle';
            
            // Calculate random angle and distance for this particle
            const angle = (i / particleCount) * 360 + (Math.random() * 30 - 15);
            const distance = 30 + Math.random() * 30;
            
            // Calculate x and y offsets
            const xOffset = Math.cos(angle * Math.PI / 180) * distance;
            const yOffset = Math.sin(angle * Math.PI / 180) * distance;
            
            // Set custom properties for animation
            particle.style.setProperty('--x-offset', `${xOffset}px`);
            particle.style.setProperty('--y-offset', `${yOffset}px`);
            
            // Add random animation delay
            particle.style.animationDelay = `${Math.random() * 0.1}s`;
            
            burstContainer.appendChild(particle);
        }
        
        // Add the starburst to the game area
        gameArea.appendChild(burstContainer);
        
        // Remove after animation completes
        setTimeout(() => {
            if (gameArea.contains(burstContainer)) {
                gameArea.removeChild(burstContainer);
            }
        }, 700);
    }

    function endGame() {
        clearInterval(gameInterval);
        gameActive = false;
        window.gameAudio.stopBackgroundMusic(); // Use new audio system
        alert(`Game Over! Your score is: ${score}`);
    }

    // Initialize game area once DOM is loaded
    initializeGameArea();

    startButton.addEventListener('click', () => {
        if (!gameActive) {
            startGame();
        }
    });
    
    // Expose necessary functions to window object if needed
    window.startGame = startGame;
    window.endGame = endGame;
});