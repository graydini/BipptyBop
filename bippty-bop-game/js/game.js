// Wait for DOM content to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.getElementById('gameArea');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const highScoreDisplay = document.getElementById('high-score');
    
    // Check if elements exist before proceeding
    if (!gameArea) {
        console.error("Error: Game area element not found! Make sure there's an element with id 'gameArea'");
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
    let lives = 5; // Starting lives
    let hatInitialized = false;
    let highScore = localStorage.getItem('bipptyBopHighScore') || 0; // Get high score from localStorage
    
    // Difficulty parameters
    const difficultySettings = {
        initialAppearanceTime: { min: 1000, max: 2500 },
        minAppearanceTime: { min: 400, max: 800 },
        appearanceTimeDecreasePerPoint: 5, // ms decrease per point
        minTeaseTime: 300, // minimum tease appearance duration (ms)
        minFullTime: 400,  // minimum full appearance duration (ms)
        
        // Speed at which tease/full appearance times decrease
        teaseTimeDecreaseRate: 3,  // ms per point
        fullTimeDecreaseRate: 4,   // ms per point
        
        // Initial appearance durations
        initialTeaseTime: 600,
        initialFullTime: 800
    };

    // Display initial high score
    updateHighScoreDisplay();
    
    // Function to update the high score display
    function updateHighScoreDisplay() {
        if (highScoreDisplay) {
            highScoreDisplay.textContent = `High Score: ${highScore}`;
        }
    }
    
    // Function to check and update high score if needed
    function checkHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('bipptyBopHighScore', highScore);
            updateHighScoreDisplay();
            return true; // Return true if it's a new high score
        }
        return false; // Return false if it's not a new high score
    }

    // Define hat positions
    const hatPositions = [
        // First row
        { left: '16.5%', top: '25%' },
        { left: '50%', top: '25%' },
        { left: '83.5%', top: '25%' },
        // Second row
        { left: '16.5%', top: '75%' },
        { left: '50%', top: '75%' },
        { left: '83.5%', top: '75%' }
    ];
    
    // Initialize the game area with SVG container
    function initializeGameArea() {
        // Update SVG background to dark blue gradient
        gameArea.style.background = 'linear-gradient(to bottom, #1a365d, #2c5282)';
        
        // Add magical stars to the background
        createMagicalStars();
        
        // Create the start button on the playfield
        createStartButton();
    }
    
    // Create the start button in the center of the playfield
    function createStartButton() {
        const startButton = document.createElement('button');
        startButton.id = 'playFieldStartButton';
        startButton.textContent = 'START';
        startButton.classList.add('playfield-start-button');
        
        gameArea.appendChild(startButton);
        
        startButton.addEventListener('click', function() {
            // Remove the start button
            gameArea.removeChild(startButton);
            
            // Begin the hat animation sequence
            animateFirstHatEntrance();
        });
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
    
    // Animate the first hat dropping into place
    function animateFirstHatEntrance() {
        // Create sparkle shower effect
        createSparkleShower();
        
        // Create first hat that will drop from above
        const firstHat = document.createElement('div');
        firstHat.className = 'top-hat first-hat';
        firstHat.style.position = 'absolute';
        firstHat.style.left = '50%';
        firstHat.style.top = '-200px'; // Start above the visible area
        firstHat.style.transform = 'translateX(-50%) rotate(180deg) scale(0.8)';
        
        // Add hat container and SVG structure
        firstHat.innerHTML = `
            <div class="hat-container">
                <div class="hat-back-layer">
                    <svg class="hat-svg" width="100%" height="100%" viewBox="0 0 100 120">
                        <path class="hat-brim-top" d="M10,60 Q30,50 50,48 Q70,50 90,60" fill="#1F142C" />
                        <path class="hat-brim-shadow" d="M10,60 Q50,80 90,60" fill="#1A1427" opacity="0.7" />
                    </svg>
                </div>
                <div class="mouse-container"></div>
                <div class="hat-front-layer">
                    <svg class="hat-svg" width="100%" height="100%" viewBox="0 0 100 120">
                        <path class="hat-top" d="M30,60 L30,90 Q50,105 70,90 L70,60" fill="#291C3A" />
                        <path class="hat-band" d="M30,75 Q50,80 70,75" stroke="#A01FC8" stroke-width="3" fill="none" />
                        <path class="hat-brim-bottom" d="M10,60 Q50,70 90,60" fill="#1F142C" />
                    </svg>
                </div>
            </div>
        `;
        
        gameArea.appendChild(firstHat);
        
        // Play magical sound
        window.gameAudio.playStarSwirlSound();
        
        // Animate the hat dropping
        let startTime = null;
        const animationDuration = 1500; // 1.5 seconds
        const targetPosition = '50%';
        
        function animateHat(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / animationDuration;
            
            if (progress < 1) {
                // Calculate current position and rotation
                const currentY = -200 + (progress * 350); // Drop from -200px to 150px
                const rotation = 180 - (progress * 180); // Rotate from 180deg to 0deg
                const scale = 0.8 + (progress * 0.2); // Scale from 0.8 to 1.0
                
                firstHat.style.top = `${currentY}px`;
                firstHat.style.transform = `translateX(-50%) rotate(${rotation}deg) scale(${scale})`;
                
                // Add bounce effect near the end
                if (progress > 0.8) {
                    const bounceProgress = (progress - 0.8) / 0.2;
                    const bounce = Math.sin(bounceProgress * Math.PI) * 20;
                    firstHat.style.top = `${currentY - bounce}px`;
                }
                
                requestAnimationFrame(animateHat);
            } else {
                // Final position
                firstHat.style.top = '150px'; // Center position
                firstHat.style.transform = 'translateX(-50%) rotate(0deg) scale(1)';
                
                // After the hat lands, animate the other hats coming out
                setTimeout(() => {
                    animateRemainingHats(firstHat);
                }, 500);
            }
        }
        
        requestAnimationFrame(animateHat);
    }
    
    // Create a sparkle shower effect
    function createSparkleShower() {
        const sparkleCount = 50;
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'sparkle-shower';
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            // Random position across the top half of the screen
            const left = Math.random() * 100;
            const delay = Math.random() * 1.5;
            const size = 5 + Math.random() * 15;
            
            sparkle.style.left = `${left}%`;
            sparkle.style.top = '0';
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            sparkle.style.animationDelay = `${delay}s`;
            
            sparkleContainer.appendChild(sparkle);
        }
        
        gameArea.appendChild(sparkleContainer);
        
        // Remove the sparkle container after the animation
        setTimeout(() => {
            if (gameArea.contains(sparkleContainer)) {
                gameArea.removeChild(sparkleContainer);
            }
        }, 3000);
    }
    
    // Animate the remaining hats coming out of the first hat
    function animateRemainingHats(firstHat) {
        // Calculate first hat position
        const firstHatRect = firstHat.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        const firstHatX = firstHatRect.left + firstHatRect.width / 2 - gameAreaRect.left;
        const firstHatY = firstHatRect.top + firstHatRect.height / 2 - gameAreaRect.top;
        
        // Play magical sound for hat emergence
        window.gameAudio.playStarSwirlSound();
        
        // Create and animate the remaining hats
        let hatsPlaced = 1; // First hat is already placed
        
        for (let i = 0; i < hatPositions.length; i++) {
            // Skip the middle position (index 1) since that's the first hat's position
            if (i === 1) continue;
            
            setTimeout(() => {
                const hat = document.createElement('div');
                hat.className = 'top-hat emerging-hat';
                hat.style.position = 'absolute';
                hat.style.left = `${firstHatX}px`;
                hat.style.top = `${firstHatY}px`;
                hat.style.transform = 'translate(-50%, -50%) scale(0.2)';
                hat.style.opacity = '0';
                
                // Add hat container and SVG structure
                hat.innerHTML = `
                    <div class="hat-container">
                        <div class="hat-back-layer">
                            <svg class="hat-svg" width="100%" height="100%" viewBox="0 0 100 120">
                                <path class="hat-brim-top" d="M10,60 Q30,50 50,48 Q70,50 90,60" fill="#1F142C" />
                                <path class="hat-brim-shadow" d="M10,60 Q50,80 90,60" fill="#1A1427" opacity="0.7" />
                            </svg>
                        </div>
                        <div class="mouse-container"></div>
                        <div class="hat-front-layer">
                            <svg class="hat-svg" width="100%" height="100%" viewBox="0 0 100 120">
                                <path class="hat-top" d="M30,60 L30,90 Q50,105 70,90 L70,60" fill="#291C3A" />
                                <path class="hat-band" d="M30,75 Q50,80 70,75" stroke="#A01FC8" stroke-width="3" fill="none" />
                                <path class="hat-brim-bottom" d="M10,60 Q50,70 90,60" fill="#1F142C" />
                            </svg>
                        </div>
                    </div>
                `;
                
                gameArea.appendChild(hat);
                
                // Create a magical trail
                createMagicalTrail(firstHatX, firstHatY, hatPositions[i].left, hatPositions[i].top);
                
                // Animate the hat moving to its final position
                let startTime = null;
                const animationDuration = 800;
                const targetLeft = hatPositions[i].left;
                const targetTop = hatPositions[i].top;
                
                function animateEmergingHat(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = (timestamp - startTime) / animationDuration;
                    
                    if (progress < 1) {
                        // Calculate current position
                        const currentLeft = firstHatX + (parseFloat(targetLeft) - firstHatX) * progress;
                        const currentTop = firstHatY + (parseFloat(targetTop) - firstHatY) * progress;
                        const currentScale = 0.2 + (progress * 0.8); // Scale from 0.2 to 1.0
                        const currentOpacity = progress;
                        const rotation = 360 * progress; // Spin once during movement
                        
                        hat.style.left = `${currentLeft}px`;
                        hat.style.top = `${currentTop}px`;
                        hat.style.transform = `translate(-50%, -50%) scale(${currentScale}) rotate(${rotation}deg)`;
                        hat.style.opacity = currentOpacity;
                        
                        requestAnimationFrame(animateEmergingHat);
                    } else {
                        // Final position
                        hat.style.left = targetLeft;
                        hat.style.top = targetTop;
                        hat.style.transform = 'translate(-50%, -50%) scale(1) rotate(360deg)';
                        hat.style.opacity = '1';
                        
                        hatsPlaced++;
                        
                        // When all hats are placed, start the game
                        if (hatsPlaced === hatPositions.length) {
                            setTimeout(() => {
                                prepareGameStart();
                            }, 500);
                        }
                    }
                }
                
                requestAnimationFrame(animateEmergingHat);
            }, (i - 1) * 300); // Stagger the animations
        }
    }
    
    // Create a magical trail effect between positions
    function createMagicalTrail(startX, startY, endLeft, endTop) {
        const particleCount = 20;
        const trailContainer = document.createElement('div');
        trailContainer.className = 'magical-trail';
        
        // Convert percentage positions to pixels for end position
        const endX = parseFloat(endLeft) / 100 * gameArea.offsetWidth;
        const endY = parseFloat(endTop) / 100 * gameArea.offsetHeight;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'trail-particle';
            
            const progress = i / particleCount;
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            
            // Add some randomness to the path
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            
            particle.style.left = `${x + offsetX}px`;
            particle.style.top = `${y + offsetY}px`;
            particle.style.animationDelay = `${i * 0.05}s`;
            
            trailContainer.appendChild(particle);
        }
        
        gameArea.appendChild(trailContainer);
        
        // Remove the trail after the animation completes
        setTimeout(() => {
            if (gameArea.contains(trailContainer)) {
                gameArea.removeChild(trailContainer);
            }
        }, 1500);
    }
    
    // Prepare the game to start
    function prepareGameStart() {
        hatInitialized = true;
        
        // Instead of enabling the button, start the game automatically
        setTimeout(() => {
            startGame();
            
            // Update the start button to show "Restart" instead
            const startGameButton = document.getElementById('startButton');
            if (startGameButton) {
                startGameButton.disabled = false;
                startGameButton.textContent = 'Restart Game';
                startGameButton.classList.add('pulse-animation');
            }
        }, 500); // Short delay before starting
    }

    function startGame() {
        if (!hatInitialized) return;
        
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        lives = 5; // Reset lives
        updateLivesDisplay();
        gameActive = true;
        window.gameAudio.playBackgroundMusic(); // Use new audio system
        
        // Schedule the first mouse appearance with random timing
        scheduleNextMouse();
    }
    
    function updateLivesDisplay() {
        if (livesDisplay) {
            // Clear existing hearts
            livesDisplay.innerHTML = '';
            
            // Add heart icons for each life
            for (let i = 0; i < lives; i++) {
                const heart = document.createElement('span');
                heart.textContent = '❤️';
                heart.className = 'life-heart';
                livesDisplay.appendChild(heart);
            }
        }
    }

    // Function to schedule the next mouse appearance with random timing
    function scheduleNextMouse() {
        if (!gameActive) return;
        
        // Calculate current appearance time range based on score
        const decreaseFactor = Math.min(score * difficultySettings.appearanceTimeDecreasePerPoint, 
                                       difficultySettings.initialAppearanceTime.max - difficultySettings.minAppearanceTime.max);
        
        const minTime = Math.max(difficultySettings.initialAppearanceTime.min - decreaseFactor, 
                               difficultySettings.minAppearanceTime.min);
        const maxTime = Math.max(difficultySettings.initialAppearanceTime.max - decreaseFactor, 
                               difficultySettings.minAppearanceTime.max);
        
        // Random timing between calculated min and max
        const nextAppearance = minTime + Math.random() * (maxTime - minTime);
        gameInterval = setTimeout(showMouse, nextAppearance);
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
        
        // Generate random hat index
        const randomHat = Math.floor(Math.random() * totalHats.length);
        const topHat = totalHats[randomHat];
        
        // Determine if this will be a tease appearance (40% chance)
        const isTeaseAppearance = Math.random() < 0.4;
        
        // Only perform magic swirl for full appearances
        const showWithSwirl = () => {
            // After swirl animation completes or immediately for tease, show the mouse
            const mouse = createMouseSvg();
            const mouseContainer = topHat.querySelector('.mouse-container');
            
            // Add appropriate class based on appearance type
            mouse.classList.add(isTeaseAppearance ? 'tease-appearance' : 'full-appearance');
            
            // Append mouse to the mouse container
            mouseContainer.appendChild(mouse);
            
            // Ensure mouse is positioned correctly and fully opaque
            mouse.style.left = '50%'; score thresholds
            mouse.style.transform = 'translateX(-50%)';
            mouse.style.top = '40px';dUpMessage();
            mouse.style.opacity = '1';
            
            // Ensure the mouse can be clickedpoints
            mouse.style.pointerEvents = 'auto';f (score % 30 === 0) {
            mouse.style.cursor = 'url(assets/images/wand-cursor.png), pointer';    lives++;
            
            // Mark container as active for styling
            mouseContainer.classList.add('mouse-pop-active');
            
            mouse.addEventListener('click', (event) => {
                // Check if mouse is already stunned to prevent multiple clicksr duration
                if (mouse.classList.contains('stun-animation')) {'tease-appearance');
                    return;  // Exit early if already stunnedmouse.classList.remove('full-appearance');
                }
                
                // Play hit sound (swapped - now the thud sound)ead
                window.gameAudio.playHitSound();
                score++;
                scoreDisplay.textContent = `Score: ${score}`;for longer stun animation to finish before removing
                
                // Check if this is a new high scoreins(mouse)) {
                checkHighScore();   mouseContainer.removeChild(mouse);
                );
                // Award extra life every 30 points         
                if (score % 30 === 0) {                        // Schedule next appearance after mouse disappears
                    lives++;
                    updateLivesDisplay();
                    // Show 1UP messagencreased stun duration from 1000ms to 1500ms
                    showOneUpMessage(topHat);
                }
                
                // Apply stun animation when clicked - longer durationpearanceDuration = isTeaseAppearance ? 600 : 800;
                mouse.classList.remove('tease-appearance');
                mouse.classList.remove('full-appearance');st.contains('stun-animation')) {
                mouse.classList.add('stun-animation');
                
                // Create swirling stars around mouse's head
                createStunStars(mouse);// Create cartoon puff cloud effect when mouse disappears
                
                // Wait for longer stun animation to finish before removing.left + mouseRect.width / 2;
                setTimeout(() => {Y = mouseRect.top + mouseRect.height / 2;
                    if (mouseContainer.contains(mouse)) {, centerY);
                        mouseContainer.removeChild(mouse);
                        mouseContainer.classList.remove('mouse-pop-active');ull appearances, not teases
                        e) {
                        // Schedule next appearance after mouse disappears
                        scheduleNextMouse();
                    }
                }, 1500); // Increased stun duration from 1000ms to 1500ms game over
            });f (lives <= 0) {
       mouseContainer.removeChild(mouse);
            // Set timeout based on appearance type and current score        mouseContainer.classList.remove('mouse-pop-active');
            let appearanceDuration;
            
            if (isTeaseAppearance) {    }
                // Calculate tease duration based on score
                appearanceDuration = Math.max(
                    difficultySettings.initialTeaseTime - (score * difficultySettings.teaseTimeDecreaseRate),   mouseContainer.removeChild(mouse);
                    difficultySettings.minTeaseTimeclassList.remove('mouse-pop-active');
                );          
            } else {            // Schedule next appearance after mouse disappears
                // Calculate full appearance duration based on scoreMouse();
                appearanceDuration = Math.max(
                    difficultySettings.initialFullTime - (score * difficultySettings.fullTimeDecreaseRate),ation);
                    difficultySettings.minFullTime
                );
            }
            
            setTimeout(() => {
                if (mouseContainer.contains(mouse) && !mouse.classList.contains('stun-animation')) {
                    // Play miss sound (swapped - now the ping sound)First create a magical star swirl animation and sound for full appearances
                    window.gameAudio.playMissSound();   createMagicalSwirl(lastHatPosition, topHat).then(() => {
                               // Set this hat as the last hat position for next animation
                    // Create cartoon puff cloud effect when mouse disappears            lastHatPosition = topHat;
                    const mouseRect = mouse.getBoundingClientRect();
                    const centerX = mouseRect.left + mouseRect.width / 2;
                    const centerY = mouseRect.top + mouseRect.height / 2;
                    createCartoonPuff(centerX, centerY);
                    
                    // Only lose a life for full appearances, not teasesunction to show 1UP message
                    if (!isTeaseAppearance) {
                        lives--;);
                        updateLivesDisplay();
                        oneUpMessage.textContent = '1UP!';
                        // Check if game over
                        if (lives <= 0) {
                            mouseContainer.removeChild(mouse);const rect = nearElement.getBoundingClientRect();
                            mouseContainer.classList.remove('mouse-pop-active');etBoundingClientRect();
                            endGame();
                            return;oneUpMessage.style.left = `${rect.left + rect.width/2 - gameAreaRect.left}px`;
                        }p - 20 - gameAreaRect.top}px`;
                    }
                    
                    mouseContainer.removeChild(mouse);
                    mouseContainer.classList.remove('mouse-pop-active');
                     after animation completes
                    // Schedule next appearance after mouse disappears   setTimeout(() => {
                    scheduleNextMouse();            if (gameArea.contains(oneUpMessage)) {
                }
            }, appearanceDuration);
        };
        
        if (isTeaseAppearance) {
            // Skip the swirl animation for tease appearancesion to show speed up message when difficulty increases
            showWithSwirl();
        } else {
            // First create a magical star swirl animation and sound for full appearances
            createMagicalSwirl(lastHatPosition, topHat).then(() => {dUpMessage.textContent = 'Speed Up!';
                // Set this hat as the last hat position for next animation
                lastHatPosition = topHat;
                showWithSwirl();
            });dUpMessage.style.top = '60px';
        }
    }
    
    // Function to show 1UP message
    function showOneUpMessage(nearElement) {
        const oneUpMessage = document.createElement('div');
        oneUpMessage.className = 'one-up-message';
        oneUpMessage.textContent = '1UP!';    gameArea.removeChild(speedUpMessage);
        
        // Position message near the element
        const rect = nearElement.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        oneUpMessage.style.left = `${rect.left + rect.width/2 - gameAreaRect.left}px`;
        oneUpMessage.style.top = `${rect.top - 20 - gameAreaRect.top}px`;
        star swirl sound
        // Add to game area and animate
        gameArea.appendChild(oneUpMessage);
        container
        // Remove after animation completes document.createElement('div');
        setTimeout(() => {
            if (gameArea.contains(oneUpMessage)) {
                gameArea.removeChild(oneUpMessage);position
            }tHat.getBoundingClientRect();
        }, 1000);
    }
t position relative to game area
    // Function to create a magical star swirl effect between hatst.left + targetRect.width/2 - gameAreaRect.left;
    function createMagicalSwirl(sourceHat, targetHat) {op;
        return new Promise((resolve) => {
            // Play star swirl soundiner position at target
            window.gameAudio.playStarSwirlSound();ft = `${targetX}px`;
            }px`;
            // Create a swirl container
            const swirlContainer = document.createElement('div');tion (or use random position for first appearance)
            swirlContainer.className = 'swirl-container';ourceX, sourceY;
            
            // Get target hat positionif (sourceHat) {
            const targetRect = targetHat.getBoundingClientRect();undingClientRect();
            const gameAreaRect = gameArea.getBoundingClientRect();+ sourceRect.width/2 - gameAreaRect.left - targetX;
            t/2 - gameAreaRect.top - targetY;
            // Calculate target position relative to game area
            const targetX = targetRect.left + targetRect.width/2 - gameAreaRect.left;// First appearance - come from a random edge
            const targetY = targetRect.top + targetRect.height/2 - gameAreaRect.top;th.random() * 4);
            
            // Set swirl container position at target
            swirlContainer.style.left = `${targetX}px`;* gameArea.offsetWidth - targetX;
            swirlContainer.style.top = `${targetY}px`;        sourceY = -100 - targetY;
            
            // Get source position (or use random position for first appearance)
            let sourceX, sourceY;        sourceX = gameArea.offsetWidth + 100 - targetX;
            ght - targetY;
            if (sourceHat) {
                const sourceRect = sourceHat.getBoundingClientRect();
                sourceX = sourceRect.left + sourceRect.width/2 - gameAreaRect.left - targetX;a.offsetWidth - targetX;
                sourceY = sourceRect.top + sourceRect.height/2 - gameAreaRect.top - targetY; 100 - targetY;
            } else {        break;
                // First appearance - come from a random edge
                const edge = Math.floor(Math.random() * 4);
                switch(edge) {           sourceY = Math.random() * gameArea.offsetHeight - targetY;
                    case 0: // top            break;
                        sourceX = Math.random() * gameArea.offsetWidth - targetX;
                        sourceY = -100 - targetY;
                        break;
                    case 1: // right
                        sourceX = gameArea.offsetWidth + 100 - targetX;< 12; i++) {
                        sourceY = Math.random() * gameArea.offsetHeight - targetY;div');
                        break;Name = 'swirl-star';
                    case 2: // bottom
                        sourceX = Math.random() * gameArea.offsetWidth - targetX;     // Random size for variety
                        sourceY = gameArea.offsetHeight + 100 - targetY;           const size = 4 + Math.random() * 8;
                        break;                star.style.width = `${size}px`;
                    case 3: // left
                        sourceX = -100 - targetX;
                        sourceY = Math.random() * gameArea.offsetHeight - targetY;
                        break;
                }
            }positions
                   star.style.setProperty('--start-x', `${sourceX}px`);
            // Create multiple stars for the swirl        star.style.setProperty('--start-y', `${sourceY}px`);
            for (let i = 0; i < 12; i++) {
                const star = document.createElement('div');
                star.className = 'swirl-star';        
                container
                // Random size for varietyr.appendChild(star);
                const size = 4 + Math.random() * 8;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;area
                gameArea.appendChild(swirlContainer);
                // Random delay for each star in the swirl
                star.style.animationDelay = `${i * 0.05}s`;tes
                
                // Set custom properties for start and end positions
                star.style.setProperty('--start-x', `${sourceX}px`);
                star.style.setProperty('--start-y', `${sourceY}px`);}, 600);
                star.style.setProperty('--end-x', '0px');
                star.style.setProperty('--end-y', '0px');
                
                // Add the star to the swirl containeraround stunned mouse's head
                swirlContainer.appendChild(star);
            }irst, remove any existing stun stars to prevent duplicates
            ment.querySelector('.stun-stars-container');
            // Add the swirl to the game areaf (existingStars) {
            gameArea.appendChild(swirlContainer);    mouse.parentElement.removeChild(existingStars);
            
            // Resolve the promise after animation completes
            setTimeout(() => {const starsContainer = document.createElement('div');
                gameArea.removeChild(swirlContainer);ars-container';
                resolve();
            }, 600);
        });
    }let i = 0; i < totalStars; i++) {
 star = document.createElement('div');
    // Function to create swirling stars around stunned mouse's head       star.className = 'stun-star';
    function createStunStars(mouse) {        
        // First, remove any existing stun stars to prevent duplicates
        const existingStars = mouse.parentElement.querySelector('.stun-stars-container');PI * 2;
        if (existingStars) {nter
            mouse.parentElement.removeChild(existingStars);40 is half of container width, 6 is half of star
        }// Same for height
            
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stun-stars-container';
        
        // Create 5 stars at different angles
        const totalStars = 5;    star.style.animationDelay = `${i * 0.1}s`;
        for (let i = 0; i < totalStars; i++) {
            const star = document.createElement('div');
            star.className = 'stun-star';
            
            // Position stars in a circle// Append the stars to the mouse's parent container
            const angle = (i / totalStars) * Math.PI * 2;
            const radius = 25; // Distance from center
            const x = Math.cos(angle) * radius + 40 - 6; // 40 is half of container width, 6 is half of star
            const y = Math.sin(angle) * radius + 40 - 6; // Same for height
            arentElement.contains(starsContainer)) {
            star.style.left = `${x}px`;    mouse.parentElement.removeChild(starsContainer);
            star.style.top = `${y}px`;
            
            // Add random animation delay
            star.style.animationDelay = `${i * 0.1}s`;
            mouse disappears
            starsContainer.appendChild(star); createCartoonPuff(clientX, clientY) {
        }oon puff
        ent('div');
        // Append the stars to the mouse's parent container-container';
        mouse.parentElement.appendChild(starsContainer);
        osition the container at the location
        // Remove after animation completesrea.getBoundingClientRect();
        setTimeout(() => {Rect.left}px`;
            if (mouse.parentElement && mouse.parentElement.contains(starsContainer)) {Rect.top}px`;
                mouse.parentElement.removeChild(starsContainer);
            }
        }, 1500);
    }Puff.className = 'cartoon-puff';
    
    // Function to create a cartoon puff cloud when mouse disappears
    function createCartoonPuff(clientX, clientY) {// Create smaller cloud bubbles around the main puff
        // Create a container for the cartoon puff
        const puffContainer = document.createElement('div');) {
        puffContainer.className = 'smoke-puff-container';    const bubble = document.createElement('div');
        e';
        // Position the container at the location
        const gameAreaRect = gameArea.getBoundingClientRect();uff
        puffContainer.style.left = `${clientX - gameAreaRect.left}px`;I * 2;
        puffContainer.style.top = `${clientY - gameAreaRect.top}px`;onst distance = 30 + Math.random() * 15;
        t xPos = Math.cos(angle) * distance;
        // Create main puff       const yPos = Math.sin(angle) * distance;
        const mainPuff = document.createElement('div');            
        mainPuff.className = 'cartoon-puff';m size for variety
        puffContainer.appendChild(mainPuff);andom() * 10;
        dth = `${size}px`;
        // Create smaller cloud bubbles around the main puff
        const bubbleCount = 5;    
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');os}px)`;
            bubble.className = 'cloud-bubble';    bubble.style.top = `calc(50% + ${yPos}px)`;
            
            // Calculate position around the main puff
            const angle = (i / bubbleCount) * Math.PI * 2; * 0.05}s`;
            const distance = 30 + Math.random() * 15;    
            const xPos = Math.cos(angle) * distance;
            const yPos = Math.sin(angle) * distance;
            
            // Set random size for variety
            const size = 15 + Math.random() * 10;ameArea.appendChild(puffContainer);
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`; completes
            
            // Position the bubbleontainer)) {
            bubble.style.left = `calc(50% + ${xPos}px)`;Child(puffContainer);
            bubble.style.top = `calc(50% + ${yPos}px)`;
            
            // Random delay for bubble appearance
            bubble.style.animationDelay = `${0.1 + i * 0.05}s`;
            
            puffContainer.appendChild(bubble);
        }gameActive = false;
        
        // Add the puff to the game area
        gameArea.appendChild(puffContainer);er message
        );
        // Remove after animation completes
        setTimeout(() => {Create game over message instead of alert
            if (gameArea.contains(puffContainer)) {   const gameOverMsg = document.createElement('div');
                gameArea.removeChild(puffContainer);        gameOverMsg.className = 'game-over-message';
            }
        }, 700);core message if it's a new high score
    }        let highScoreMessage = '';

    function endGame() {igh Score!</p>';
        clearTimeout(gameInterval); 
        gameActive = false;
        window.gameAudio.stopBackgroundMusic();gameOverMsg.innerHTML = `
        
        // Check for high score before showing game over messagescore}</p>
        const isNewHighScore = checkHighScore();
        
        // Create game over message instead of alertin-btn">Play Again</button>
        const gameOverMsg = document.createElement('div');
        gameOverMsg.className = 'game-over-message';
        
        // Include high score message if it's a new high score);
        let highScoreMessage = '';
        if (isNewHighScore) {utton
            highScoreMessage = '<p class="new-high-score">New High Score!</p>';Msg.querySelector('.play-again-btn');
        }lick', () => {
        
        gameOverMsg.innerHTML = `
            <h2>Game Over!</h2>
            <p>Your score: ${score}</p>
            ${highScoreMessage}
            <p>High score: ${highScore}</p>// Initialize game area once DOM is loaded
            <button class="play-again-btn">Play Again</button>
        `;
        rom controls area (not the one on the playfield)
        // Add to game area const startButton = document.getElementById('startButton');









































});    window.endGame = endGame;    window.startGame = startGame;    // Expose necessary functions to window object if needed        }        });            }                startGame();                // Normal start if hats are initialized but game isn't active            } else if (hatInitialized) {                initializeGameArea();                // Reinitialize the game area                                gameArea.innerHTML = '';                // Clear all existing hats                                window.gameAudio.stopBackgroundMusic();                gameActive = false;                clearTimeout(gameInterval);                // If game is active, this is a restart            if (gameActive) {        startButton.addEventListener('click', () => {                startButton.disabled = true; // Disable until hats are ready    if (startButton) {    const startButton = document.getElementById('startButton');    // Get the start button from controls area (not the one on the playfield)    initializeGameArea();    // Initialize game area once DOM is loaded    }        });            startGame();            gameArea.removeChild(gameOverMsg);        playAgainBtn.addEventListener('click', () => {        const playAgainBtn = gameOverMsg.querySelector('.play-again-btn');        // Add event listener to play again button                gameArea.appendChild(gameOverMsg);    if (startButton) {
        startButton.disabled = true; // Disable until hats are ready
        
        startButton.addEventListener('click', () => {
            if (gameActive) {
                // If game is active, this is a restart
                clearTimeout(gameInterval);
                gameActive = false;
                window.gameAudio.stopBackgroundMusic();
                
                // Clear all existing hats
                gameArea.innerHTML = '';
                
                // Reinitialize the game area
                initializeGameArea();
            } else if (hatInitialized) {
                // Normal start if hats are initialized but game isn't active
                startGame();
            }
        });
    }
    
    // Expose necessary functions to window object if needed
    window.startGame = startGame;
    window.endGame = endGame;
});