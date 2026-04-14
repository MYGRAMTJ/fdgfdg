// ПРИМЕРЫ РАСШИРЕНИЯ И КАСТОМИЗАЦИИ
// Hand Gesture Control - Code Examples

/**
 * ПРИМЕР 1: Добавление нового жеста - "Ладонь вверх"
 * Opens palm facing up
 */

// Добавить в метод recognizeGesture():
function recognizeGestureExample1(landmarks) {
    // Существующие жесты...
    
    // НОВОЕ: Обнаружение ладони вверх
    // Проверяем, что пальцы смотрят вверх и ладонь открыта
    const isOpenPalm = landmarks[8].y < landmarks[6].y;      // Index up
    const isPalmUp = landmarks[9].y < landmarks[0].y;        // Middle higher than wrist
    const isSpread = this.calculateHandOpenness(landmarks) > 0.7;
    
    if (isOpenPalm && isPalmUp && isSpread) {
        return 'PALM_UP';
    }
    
    return 'UNKNOWN';
}

/**
 * ПРИМЕР 2: Добавление звука обратной связи
 * Audio feedback for gestures
 */

class AudioFeedback {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    playClickSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainer = this.audioContext.createGain();
        
        oscillator.connect(gainer);
        gainer.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 800; // Hz
        oscillator.type = 'sine';
        
        gainer.gain.setTargetAtTime(0.3, this.audioContext.currentTime, 0.01);
        gainer.gain.setTargetAtTime(0, this.audioContext.currentTime + 0.1, 0.01);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playSuccessSound() {
        const frequencies = [523, 659, 784]; // Частоты (до-ми-соль)
        
        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainer = this.audioContext.createGain();
            
            oscillator.connect(gainer);
            gainer.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            gainer.gain.setTargetAtTime(0.1, this.audioContext.currentTime + i * 0.1, 0.01);
            gainer.gain.setTargetAtTime(0, this.audioContext.currentTime + i * 0.1 + 0.15, 0.01);
            
            oscillator.start(this.audioContext.currentTime + i * 0.1);
            oscillator.stop(this.audioContext.currentTime + i * 0.1 + 0.15);
        });
    }
}

// Использование в HandGestureControl:
class HandGestureControl {
    constructor() {
        // ... существующий код ...
        this.audio = new AudioFeedback();
    }
    
    performClick() {
        // ... существующий код ...
        this.audio.playClickSound(); // Добавить звук
    }
}

/**
 * ПРИМЕР 3: Интеграция с системой управления медиа
 * Control a video player with gestures
 */

class GestureMediaController {
    constructor(videoElement) {
        this.video = videoElement;
    }
    
    handleGesture(gesture, handPos) {
        switch(gesture) {
            case 'THUMBS_UP':
                this.video.play();
                console.log('Play');
                break;
            case 'FIST':
                this.video.pause();
                console.log('Pause');
                break;
            case 'POINT':
                this.video.currentTime -= 5; // Назад на 5 сек
                console.log('Rewind 5s');
                break;
            case 'VICTORY':
                this.video.currentTime += 10; // Вперед на 10 сек
                console.log('Forward 10s');
                break;
            case 'PALM':
                // Регулировка громкости по высоте руки
                const volume = 1 - handPos.y / window.innerHeight;
                this.video.volume = Math.max(0, Math.min(1, volume));
                console.log('Volume:', (volume * 100).toFixed(0) + '%');
                break;
        }
    }
}

/**
 * ПРИМЕР 4: Система для рисования по воздуху
 * Air drawing system
 */

class AirDrawing {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastPos = { x: 0, y: 0 };
        
        // Настройки рисования
        this.brushSize = 3;
        this.brushColor = '#00d4ff';
    }
    
    startDrawing(x, y) {
        this.isDrawing = true;
        this.lastPos = { x, y };
    }
    
    draw(x, y) {
        if (!this.isDrawing) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        this.lastPos = { x, y };
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setBrushSize(size) {
        this.brushSize = size;
    }
    
    setBrushColor(color) {
        this.brushColor = color;
    }
}

// Интеграция с HandGestureControl:
class HandGestureControl {
    constructor() {
        // ... существующий код ...
        this.drawer = new AirDrawing(document.getElementById('drawingCanvas'));
    }
    
    handleGestures() {
        // ... существующий код ...
        
        const gesture = Array.from(this.handData.gestures.values())[0];
        
        if (gesture === 'PALM') {
            // Рисовать если ладонь открыта
            this.drawer.draw(this.smoothedHandPos.x, this.smoothedHandPos.y);
        } else {
            this.drawer.stopDrawing();
        }
        
        if (gesture === 'FIST') {
            // Очистить холст если кулак
            this.drawer.clear();
        }
    }
}

/**
 * ПРИМЕР 5: Игровой контроллер на основе жестов
 * Game controller based on hand gestures
 */

class GestureGameController {
    constructor(gameElement) {
        this.game = gameElement;
        this.player = {
            x: 0,
            y: 0,
            speed: 10,
            isJumping: false,
            velocityY: 0
        };
    }
    
    handleGestureInput(gesture, handPos) {
        // Движение влево-вправо по X позиции руки
        this.player.x = handPos.x / window.innerWidth * window.innerWidth;
        
        // Прыжок при V знаке
        if (gesture === 'VICTORY' && !this.player.isJumping) {
            this.player.isJumping = true;
            this.player.velocityY = -15;
        }
        
        // Удар при кулаке
        if (gesture === 'FIST') {
            this.performAttack();
        }
        
        // Щит при ладони вверх
        if (gesture === 'PALM_UP') {
            this.activateShield();
        }
    }
    
    performAttack() {
        console.log('Attack!');
        // Логика атаки
    }
    
    activateShield() {
        console.log('Shield activated!');
        // Логика щита
    }
    
    update() {
        // Физика: гравитация
        if (this.player.isJumping) {
            this.player.velocityY += 0.5; // Гравитация
            this.player.y += this.player.velocityY;
            
            if (this.player.y >= window.innerHeight - 100) {
                this.player.y = window.innerHeight - 100;
                this.player.isJumping = false;
                this.player.velocityY = 0;
            }
        }
    }
}

/**
 * ПРИМЕР 6: Система навигации по меню с жестами
 * Menu navigation with gestures
 */

class GestureMenuNavigator {
    constructor() {
        this.currentIndex = 0;
        this.menuItems = document.querySelectorAll('.menu-item');
        this.isSelecting = false;
    }
    
    handleGesture(gesture) {
        switch(gesture) {
            case 'POINT':
                // Переместить фокус на следующий элемент
                this.moveNext();
                break;
            case 'VICTORY':
                // Переместить фокус на предыдущий элемент
                this.movePrevious();
                break;
            case 'FIST':
                // Выбрать текущий элемент
                this.selectCurrent();
                break;
        }
    }
    
    moveNext() {
        this.currentIndex = (this.currentIndex + 1) % this.menuItems.length;
        this.highlight();
    }
    
    movePrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.menuItems.length) % this.menuItems.length;
        this.highlight();
    }
    
    selectCurrent() {
        this.menuItems[this.currentIndex].click();
    }
    
    highlight() {
        this.menuItems.forEach((item, i) => {
            if (i === this.currentIndex) {
                item.classList.add('focused');
            } else {
                item.classList.remove('focused');
            }
        });
    }
}

/**
 * ПРИМЕР 7: Запись и воспроизведение жестов
 * Record and playback gestures
 */

class GestureRecorder {
    constructor() {
        this.recording = false;
        this.gestures = [];
        this.startTime = 0;
    }
    
    startRecording() {
        this.recording = true;
        this.gestures = [];
        this.startTime = Date.now();
        console.log('Recording started');
    }
    
    recordGesture(gesture, position) {
        if (!this.recording) return;
        
        this.gestures.push({
            timestamp: Date.now() - this.startTime,
            gesture: gesture,
            position: position
        });
    }
    
    stopRecording() {
        this.recording = false;
        console.log('Recording stopped. Total gestures:', this.gestures.length);
    }
    
    playback(callback) {
        let index = 0;
        
        const playNext = () => {
            if (index >= this.gestures.length) {
                console.log('Playback completed');
                return;
            }
            
            const current = this.gestures[index];
            const next = this.gestures[index + 1];
            const delay = next ? next.timestamp - current.timestamp : 0;
            
            callback(current.gesture, current.position);
            
            index++;
            setTimeout(playNext, delay);
        };
        
        playNext();
    }
    
    exportGestures() {
        return JSON.stringify(this.gestures, null, 2);
    }
    
    importGestures(jsonData) {
        this.gestures = JSON.parse(jsonData);
    }
}

/**
 * ПРИМЕР 8: Калибровка персональной модели жестов
 * Personal gesture calibration
 */

class GestureCalibration {
    constructor() {
        this.calibrationData = {
            handSize: 0,
            skinTone: null,
            lightingConditions: null,
            gestureThresholds: {}
        };
    }
    
    calibrateHandSize(landmarks) {
        // Вычислить средний размер ладони
        let totalDistance = 0;
        for (let i = 0; i < landmarks.length; i++) {
            for (let j = i + 1; j < landmarks.length; j++) {
                const dx = landmarks[i].x - landmarks[j].x;
                const dy = landmarks[i].y - landmarks[j].y;
                totalDistance += Math.sqrt(dx * dx + dy * dy);
            }
        }
        
        this.calibrationData.handSize = totalDistance / (21 * 20);
        console.log('Hand size calibrated:', this.calibrationData.handSize);
    }
    
    calibrateLighting(brightness) {
        this.calibrationData.lightingConditions = brightness;
        console.log('Lighting calibrated:', brightness);
    }
    
    setGestureThreshold(gestureName, threshold) {
        this.calibrationData.gestureThresholds[gestureName] = threshold;
    }
    
    exportCalibration() {
        return JSON.stringify(this.calibrationData);
    }
    
    importCalibration(jsonData) {
        this.calibrationData = JSON.parse(jsonData);
    }
}

/**
 * ПРИМЕР 9: Статистика и аналитика жестов
 * Gesture statistics and analytics
 */

class GestureAnalytics {
    constructor() {
        this.stats = {
            totalGestures: 0,
            gestureCount: {},
            averageConfidence: 0,
            sessionDuration: 0,
            startTime: Date.now()
        };
    }
    
    recordGesture(gesture, confidence = 1.0) {
        this.stats.totalGestures++;
        
        if (!this.stats.gestureCount[gesture]) {
            this.stats.gestureCount[gesture] = 0;
        }
        this.stats.gestureCount[gesture]++;
        
        // Обновить среднюю уверенность
        this.stats.averageConfidence = (
            (this.stats.averageConfidence * (this.stats.totalGestures - 1) + confidence) / 
            this.stats.totalGestures
        );
    }
    
    getSessionDuration() {
        return (Date.now() - this.stats.startTime) / 1000; // В секундах
    }
    
    getMostUsedGesture() {
        return Object.entries(this.stats.gestureCount)
            .sort((a, b) => b[1] - a[1])
            [0][0];
    }
    
    getReport() {
        return {
            totalGestures: this.stats.totalGestures,
            sessionDuration: this.getSessionDuration(),
            averageConfidence: this.stats.averageConfidence,
            gestureBreakdown: this.stats.gestureCount,
            mostUsedGesture: this.getMostUsedGesture(),
            gesturesPerSecond: (this.stats.totalGestures / this.getSessionDuration()).toFixed(2)
        };
    }
    
    displayReport() {
        const report = this.getReport();
        console.table(report);
    }
}

/**
 * ПРИМЕР 10: Фильтры и эффекты дополненной реальности
 * AR filters and effects
 */

class AREffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.effects = {
            particles: [],
            trails: []
        };
    }
    
    addParticleEffect(x, y, radius = 10) {
        const particle = {
            x: x,
            y: y,
            radius: radius,
            alpha: 1,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: (Math.random() - 0.5) * 4
        };
        
        this.effects.particles.push(particle);
    }
    
    addTrail(x, y) {
        this.effects.trails.push({
            x: x,
            y: y,
            alpha: 1,
            size: 5
        });
    }
    
    update() {
        // Обновить частицы
        this.effects.particles = this.effects.particles.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.alpha -= 0.02;
            p.radius += 0.5;
            return p.alpha > 0;
        });
        
        // Обновить тропы
        this.effects.trails = this.effects.trails.filter(t => {
            t.alpha -= 0.05;
            t.size += 0.5;
            return t.alpha > 0;
        });
    }
    
    render() {
        // Рисовать частицы
        this.effects.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Рисовать тропы
        this.effects.trails.forEach(t => {
            this.ctx.fillStyle = `rgba(255, 0, 110, ${t.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

/**
 * ПРИМЕР 11: Интеграция с веб-сокетами для сетевого управления
 * WebSocket integration for remote control
 */

class GestureWebSocketController {
    constructor(serverUrl) {
        this.ws = new WebSocket(serverUrl);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onerror = (error) => console.error('WebSocket error:', error);
    }
    
    sendGesture(gesture, position) {
        const message = {
            type: 'gesture',
            gesture: gesture,
            position: position,
            timestamp: Date.now()
        };
        
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
    
    handleMessage(event) {
        const message = JSON.parse(event.data);
        console.log('Received:', message);
    }
    
    disconnect() {
        this.ws.close();
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AudioFeedback,
        GestureMediaController,
        AirDrawing,
        GestureGameController,
        GestureMenuNavigator,
        GestureRecorder,
        GestureCalibration,
        GestureAnalytics,
        AREffects,
        GestureWebSocketController
    };
}
