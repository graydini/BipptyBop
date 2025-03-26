(function() {
    // Create audio context
    let audioContext;
    
    // Initialize audio on first user interaction to satisfy browser autoplay policies
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }
    
    // Create a hit sound (high-pitched "ping")
    function playHitSound() {
        const ctx = initAudio();
        
        // Create oscillator for the main tone
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Slide down
        
        // Create gain node for volume control
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        // Connect and start
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
    }
    
    // Create a miss sound (low "thud")
    function playMissSound() {
        const ctx = initAudio();
        
        // Create oscillator
        const oscillator = ctx.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        
        // Create gain node
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        // Add a bit of distortion for a "thud" effect
        const distortion = ctx.createWaveShaper();
        function makeDistortionCurve(amount) {
            const k = amount || 50;
            const n_samples = 44100;
            const curve = new Float32Array(n_samples);
            for (let i = 0; i < n_samples; ++i) {
                const x = i * 2 / n_samples - 1;
                curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }
        distortion.curve = makeDistortionCurve(400);
        
        // Connect everything
        oscillator.connect(distortion);
        distortion.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
    }
    
    // Background music (simple magical arpeggio loop)
    let bgMusicPlaying = false;
    let bgMusicNodes = [];
    
    function playBackgroundMusic() {
        if (bgMusicPlaying) return;
        
        const ctx = initAudio();
        bgMusicPlaying = true;
        
        // Create a magical arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        const duration = 0.2;
        const spacing = 0.21;
        
        function playArpeggio(time) {
            notes.forEach((note, i) => {
                // Create oscillator
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = note;
                
                // Create gain node
                const gainNode = ctx.createGain();
                gainNode.gain.setValueAtTime(0, time + i * spacing);
                gainNode.gain.linearRampToValueAtTime(0.1, time + i * spacing + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + i * spacing + duration);
                
                // Connect
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                // Start and stop
                osc.start(time + i * spacing);
                osc.stop(time + i * spacing + duration);
                
                bgMusicNodes.push({ osc, gainNode });
            });
            
            // Schedule the next arpeggio if still playing
            if (bgMusicPlaying) {
                setTimeout(() => playArpeggio(ctx.currentTime), 1000);
            }
        }
        
        // Start the loop
        playArpeggio(ctx.currentTime);
    }
    
    function stopBackgroundMusic() {
        bgMusicPlaying = false;
        
        // Stop and disconnect all nodes
        bgMusicNodes.forEach(node => {
            try {
                node.gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                setTimeout(() => {
                    try {
                        node.osc.disconnect();
                        node.gainNode.disconnect();
                    } catch (e) {}
                }, 200);
            } catch(e) {}
        });
        
        bgMusicNodes = [];
    }
    
    // Magical star swirl sound
    function playStarSwirlSound() {
        const ctx = initAudio();
        
        // Create oscillator for the magical swish
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.5);
        
        // Create gain node
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        // Add some magic with a delay
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.1;
        
        const feedbackGain = ctx.createGain();
        feedbackGain.gain.value = 0.3;
        
        // Connect everything
        oscillator.connect(gainNode);
        gainNode.connect(delay);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        gainNode.connect(ctx.destination);
        delay.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
    }
    
    // Make audio functions globally available
    window.gameAudio = {
        playHitSound,
        playMissSound,
        playBackgroundMusic,
        stopBackgroundMusic,
        playStarSwirlSound
    };
})();