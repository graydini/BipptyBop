// Wait for DOM content to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    const gameArea = document.getElementById('gameArea');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    
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
        
        // Random timing between 1000ms and 2500ms
        const nextAppearance = 1000 + Math.random() * 1500;
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
                // Play hit sound (swapped - now the thud sound)
                window.gameAudio.playHitSound();
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                
                // Award extra life every 30 points
                if (score % 30 === 0) {
                    lives++;
                    updateLivesDisplay();
                    // Show 1UP message
                    showOneUpMessage(topHat);
                }
                
                // Apply stun animation when clicked - longer duration
                mouse.classList.remove('tease-appearance');
                mouse.classList.remove('full-appearance');
                mouse.classList.add('stun-animation');
                
                // Wait for longer stun animation to finish before removing
                setTimeout(() => {
                    if (mouseContainer.contains(mouse)) {
                        mouseContainer.removeChild(mouse);
                        mouseContainer.classList.remove('mouse-pop-active');
                        
                        // Schedule next appearance after mouse disappears
                        scheduleNextMouse();
                    }
                }, 1000); // Increased stun duration from 500ms to 1000ms
            });

            // Set timeout based on appearance type
            const appearanceDuration = isTeaseAppearance ? 600 : 800;
            setTimeout(() => {
                if (mouseContainer.contains(mouse) && !mouse.classList.contains('stun-animation')) {
                    // Play miss sound (swapped - now the ping sound)
                    window.gameAudio.playMissSound();
                    
                    // Create starburst effect when mouse disappears
                    const mouseRect = mouse.getBoundingClientRect();
                    const centerX = mouseRect.left + mouseRect.width / 2;
                    const centerY = mouseRect.top + mouseRect.height / 2;
                    createStarburst(centerX, centerY);
                    
                    // Only lose a life for full appearances, not teases
                    if (!isTeaseAppearance) {
                        lives--;
                        updateLivesDisplay();
                        
                        // Check if game over
                        if (lives <= 0) {
                            mouseContainer.removeChild(mouse);
                            mouseContainer.classList.remove('mouse-pop-active');
                            endGame();
                            return;
                        }
                    }
                    
                    mouseContainer.removeChild(mouse);
                    mouseContainer.classList.remove('mouse-pop-active');
                    
                    // Schedule next appearance after mouse disappears
                    scheduleNextMouse();
                }
            }, appearanceDuration);
        };
        
        if (isTeaseAppearance) {
            // Skip the swirl animation for tease appearances
            showWithSwirl();
        } else {
            // First create a magical star swirl animation and sound for full appearances
            createMagicalSwirl(lastHatPosition, topHat).then(() => {
                // Set this hat as the last hat position for next animation
                lastHatPosition = topHat;
                showWithSwirl();
            });
        }
    }
    
    // Function to show 1UP message
    function showOneUpMessage(nearElement) {
        const oneUpMessage = document.createElement('div');
        oneUpMessage.className = 'one-up-message';
        oneUpMessage.textContent = '1UP!';
        
        // Position message near the element
        const rect = nearElement.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        oneUpMessage.style.left = `${rect.left + rect.width/2 - gameAreaRect.left}px`;
        oneUpMessage.style.top = `${rect.top - 20 - gameAreaRect.top}px`;
        
        // Add to game area and animate
        gameArea.appendChild(oneUpMessage);
        
        // Remove after animation completes
        setTimeout(() => {
            if (gameArea.contains(oneUpMessage)) {
                gameArea.removeChild(oneUpMessage);
            }
        }, 1000);
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
        clearTimeout(gameInterval); 
        gameActive = false;
        window.gameAudio.stopBackgroundMusic();
        
        // Create game over message instead of alert
        const gameOverMsg = document.createElement('div');
        gameOverMsg.className = 'game-over-message';
        gameOverMsg.innerHTML = `
            <h2>Game Over!</h2>
            <p>Your score: ${score}</p>
            <button class="play-again-btn">Play Again</button>
        `;
        
        // Add to game area
        gameArea.appendChild(gameOverMsg);
        
        // Add event listener to play again button
        const playAgainBtn = gameOverMsg.querySelector('.play-again-btn');
        playAgainBtn.addEventListener('click', () => {
            gameArea.removeChild(gameOverMsg);
            startGame();
        });
    }

    // Initialize game area once DOM is loaded
    initializeGameArea();

    // Get the start button from controls area (not the one on the playfield)
    const startButton = document.getElementById('startButton');
    if (startButton) {
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