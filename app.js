/**
 * Hand Gesture Control System
 * Uses MediaPipe Hands for real-time hand tracking and gesture recognition
 */

class HandGestureControl {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hands = null;
        this.camera = null;
        this.isRunning = false;
        
        // Hand data
        this.handData = {
            hands: [],
            gestures: new Map()
        };
        
        // Configuration
        this.config = {
            minConfidence: 0.5,
            smoothing: 0.6,
            mirrorVideo: true,
            showSkeleton: true
        };
        
        // Gesture detection
        this.gestureHistory = [];
        this.lastGesture = null;
        this.clickCooldown = 0;
        
        // Smoothing for cursor movement
        this.smoothedHandPos = { x: 0, y: 0 };
        
        // DOM elements
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            resetBtn: document.getElementById('resetBtn'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            handsCount: document.getElementById('handsCount'),
            confidence: document.getElementById('confidence'),
            currentGesture: document.getElementById('currentGesture'),
            cursorPos: document.getElementById('cursorPos'),
            gestureIcons: document.getElementById('gestureIcons'),
            virtualCursor: document.getElementById('virtualCursor'),
            clickFeedback: document.getElementById('clickFeedback'),
            confidenceSlider: document.getElementById('confidenceSlider'),
            smoothing: document.getElementById('smoothing'),
            mirrorVideo: document.getElementById('mirrorVideo'),
            showSkeleton: document.getElementById('showSkeleton'),
            confidenceValue: document.getElementById('confidenceValue'),
            smoothingValue: document.getElementById('smoothingValue')
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: this.config.minConfidence,
                minTrackingConfidence: 0.5
            });
            
            this.hands.onResults(this.onResults.bind(this));
            
            // Update canvas size
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update status
            this.updateStatus('ready', 'Готово к старту');
            this.elements.statusIndicator.classList.remove('active');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.updateStatus('error', 'Ошибка инициализации');
        }
    }
    
    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        
        this.elements.confidenceSlider.addEventListener('change', (e) => {
            this.config.minConfidence = parseFloat(e.target.value);
            this.hands.setOptions({
                minDetectionConfidence: this.config.minConfidence
            });
            this.elements.confidenceValue.textContent = Math.round(this.config.minConfidence * 100) + '%';
        });
        
        this.elements.smoothing.addEventListener('change', (e) => {
            this.config.smoothing = parseFloat(e.target.value);
            this.elements.smoothingValue.textContent = Math.round(this.config.smoothing * 100) + '%';
        });
        
        this.elements.mirrorVideo.addEventListener('change', (e) => {
            this.config.mirrorVideo = e.target.checked;
            this.canvas.style.transform = this.config.mirrorVideo ? 'scaleX(-1)' : 'scaleX(1)';
        });
        
        this.elements.showSkeleton.addEventListener('change', (e) => {
            this.config.showSkeleton = e.target.checked;
        });
    }
    
    async start() {
        try {
            this.isRunning = true;
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            
            this.updateStatus('loading', 'Запуск камеры...');
            
            // Initialize camera
            const constraint = {
                audio: false,
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraint);
            this.video.srcObject = stream;
            
            // Camera setup with MediaPipe
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 1280,
                height: 720
            });
            
            await this.camera.initialize();
            this.camera.start();
            
            this.updateStatus('active', 'Камера активна');
            this.elements.statusIndicator.classList.add('active');
            this.elements.virtualCursor.classList.add('active');
        } catch (error) {
            console.error('Ошибка доступа к камере:', error);
            this.updateStatus('error', 'Ошибка доступа к камере');
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
            this.isRunning = false;
            
            if (error.name === 'NotAllowedError') {
                alert('Пожалуйста, разрешите доступ к камере');
            } else if (error.name === 'NotFoundError') {
                alert('Камера не найдена');
            }
        }
    }
    
    stop() {
        this.isRunning = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        
        if (this.camera) {
            this.camera.stop();
        }
        
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        this.updateStatus('ready', 'Остановлено');
        this.elements.statusIndicator.classList.remove('active');
        this.elements.virtualCursor.classList.remove('active');
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    reset() {
        this.gestureHistory = [];
        this.lastGesture = null;
        this.elements.currentGesture.textContent = 'Нет';
        this.elements.gestureIcons.innerHTML = '';
    }
    
    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.config.mirrorVideo) {
            this.canvas.style.transform = 'scaleX(-1)';
        }
    }
    
    onResults(results) {
        if (!this.isRunning) return;
        
        this.handData.hands = results.multiHandLandmarks || [];
        this.handData.gestures.clear();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Process each hand
        if (this.handData.hands.length > 0) {
            for (let i = 0; i < this.handData.hands.length; i++) {
                const landmarks = this.handData.hands[i];
                const handedness = results.multiHandedness[i];
                
                // Recognize gesture
                const gesture = this.recognizeGesture(landmarks);
                this.handData.gestures.set(handedness.label, gesture);
                
                // Draw hand landmarks if enabled
                if (this.config.showSkeleton) {
                    this.drawHand(landmarks);
                }
            }
            
            // Handle gesture actions
            this.handleGestures();
        }
        
        // Update UI
        this.updateUI();
    }
    
    recognizeGesture(landmarks) {
        const fingers = this.getFingerStates(landmarks);
        
        // Get hand bounding box
        const bbox = this.getHandBBox(landmarks);
        
        // Calculate hand opening percentage
        const openness = this.calculateHandOpenness(landmarks);
        
        // Detect gestures
        if (openness < 0.3) {
            return 'FIST'; // Closed fist for click
        } else if (openness > 0.7 && fingers.thumbActive && fingers.allFingersUp) {
            return 'PALM'; // Open palm for cursor control
        } else if (fingers.indexUp && fingers.middleUp && !fingers.ringUp && !fingers.pinkyUp) {
            return 'VICTORY'; // V-sign
        } else if (fingers.indexUp && !fingers.middleUp && !fingers.ringUp && !fingers.pinkyUp) {
            return 'POINT'; // Pointing finger
        } else if (fingers.thumbUp && fingers.allFingersUp) {
            return 'THUMBS_UP'; // Thumbs up
        } else if (openness > 0.6) {
            return 'OPEN_HAND'; // Open hand
        }
        
        return 'UNKNOWN';
    }
    
    getFingerStates(landmarks) {
        // Finger tip and PIP joint indices
        const tips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
        const pips = [3, 6, 10, 14, 18];
        const mcps = [2, 5, 9, 13, 17];
        
        const states = {
            thumbUp: landmarks[tips[0]].y < landmarks[pips[0]].y,
            indexUp: landmarks[tips[1]].y < landmarks[pips[1]].y,
            middleUp: landmarks[tips[2]].y < landmarks[pips[2]].y,
            ringUp: landmarks[tips[3]].y < landmarks[pips[3]].y,
            pinkyUp: landmarks[tips[4]].y < landmarks[pips[4]].y,
            thumbActive: landmarks[tips[0]].x > landmarks[mcps[0]].x,
            allFingersUp: false
        };
        
        states.allFingersUp = states.indexUp && states.middleUp && states.ringUp && states.pinkyUp;
        
        return states;
    }
    
    calculateHandOpenness(landmarks) {
        // Calculate distance between hand center and landmarks
        const center = {
            x: landmarks[9].x,
            y: landmarks[9].y
        };
        
        let totalDistance = 0;
        let maxDistance = 0;
        
        for (let i = 0; i < landmarks.length; i++) {
            const dx = landmarks[i].x - center.x;
            const dy = landmarks[i].y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            totalDistance += distance;
            maxDistance = Math.max(maxDistance, distance);
        }
        
        return totalDistance / (21 * 0.5); // Normalize
    }
    
    getHandBBox(landmarks) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const point of landmarks) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        
        return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }
    
    drawHand(landmarks) {
        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        this.ctx.lineWidth = 2;
        
        for (const [start, end] of connections) {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x * w, p1.y * h);
            this.ctx.lineTo(p2.x * w, p2.y * h);
            this.ctx.stroke();
        }
        
        // Draw landmarks
        this.ctx.fillStyle = 'rgba(255, 0, 110, 0.8)';
        for (const landmark of landmarks) {
            const x = landmark.x * w;
            const y = landmark.y * h;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    handleGestures() {
        // Control cursor based on palm position
        const palmGesture = Array.from(this.handData.gestures.values()).find(g => 
            g === 'PALM' || g === 'OPEN_HAND'
        );
        
        if (palmGesture && this.handData.hands.length > 0) {
            const indexFinger = this.handData.hands[0][8]; // Index finger tip
            
            // Update cursor position with smoothing
            const targetX = indexFinger.x * window.innerWidth;
            const targetY = indexFinger.y * window.innerHeight;
            
            this.smoothedHandPos.x += (targetX - this.smoothedHandPos.x) * (1 - this.config.smoothing);
            this.smoothedHandPos.y += (targetY - this.smoothedHandPos.y) * (1 - this.config.smoothing);
            
            this.elements.virtualCursor.style.left = this.smoothedHandPos.x + 'px';
            this.elements.virtualCursor.style.top = this.smoothedHandPos.y + 'px';
            
            this.elements.cursorPos.textContent = Math.round(this.smoothedHandPos.x) + 'x' + Math.round(this.smoothedHandPos.y);
        }
        
        // Detect click (fist)
        const fistGesture = Array.from(this.handData.gestures.values()).find(g => g === 'FIST');
        
        if (fistGesture && this.clickCooldown <= 0) {
            this.performClick();
            this.clickCooldown = 20; // Cooldown to prevent multiple clicks
        }
        
        if (this.clickCooldown > 0) {
            this.clickCooldown--;
        }
        
        // Track gesture history
        const currentGesture = Array.from(this.handData.gestures.values())[0];
        if (currentGesture && currentGesture !== this.lastGesture) {
            this.lastGesture = currentGesture;
            this.addGestureToHistory(currentGesture);
        }
    }
    
    performClick() {
        // Show click feedback
        const feedback = this.elements.clickFeedback;
        feedback.style.left = this.smoothedHandPos.x + 'px';
        feedback.style.top = this.smoothedHandPos.y + 'px';
        feedback.classList.remove('active');
        void feedback.offsetWidth; // Trigger reflow
        feedback.classList.add('active');
        
        // Simulate click event
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: this.smoothedHandPos.x,
            clientY: this.smoothedHandPos.y
        });
        
        document.elementFromPoint(this.smoothedHandPos.x, this.smoothedHandPos.y)?.dispatchEvent(clickEvent);
    }
    
    addGestureToHistory(gesture) {
        this.gestureHistory.unshift(gesture);
        if (this.gestureHistory.length > 5) {
            this.gestureHistory.pop();
        }
        
        // Update gesture display
        this.updateGestureDisplay();
    }
    
    updateGestureDisplay() {
        const icons = {
            'FIST': '👊',
            'PALM': '✋',
            'OPEN_HAND': '🖐️',
            'VICTORY': '🤟',
            'POINT': '☝️',
            'THUMBS_UP': '👍',
            'UNKNOWN': '❓'
        };
        
        this.elements.gestureIcons.innerHTML = this.gestureHistory
            .map(gesture => `<span class="gesture-icon">${icons[gesture] || '❓'}</span>`)
            .join('');
    }
    
    updateUI() {
        this.elements.handsCount.textContent = this.handData.hands.length;
        
        const avgConfidence = this.handData.hands.length > 0 ? 
            Math.round(this.config.minConfidence * 100) : 0;
        this.elements.confidence.textContent = avgConfidence + '%';
        
        const gesture = Array.from(this.handData.gestures.values())[0];
        if (gesture) {
            this.elements.currentGesture.textContent = this.getGestureName(gesture);
        }
    }
    
    getGestureName(gesture) {
        const names = {
            'FIST': 'Кулак (Клик)',
            'PALM': 'Открытая ладонь',
            'OPEN_HAND': 'Раскрытая рука',
            'VICTORY': 'Знак V',
            'POINT': 'Указание',
            'THUMBS_UP': 'Палец вверх',
            'UNKNOWN': 'Неизвестный'
        };
        return names[gesture] || gesture;
    }
    
    updateStatus(status, text) {
        this.elements.statusText.textContent = text;
        this.canvas.dataset.status = status;
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const gestureControl = new HandGestureControl();
});
