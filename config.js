/**
 * Configuration and Gesture Definitions
 * Customize gesture thresholds and actions here
 */

const GESTURE_CONFIG = {
    // Detection thresholds
    HAND_OPENNESS_THRESHOLD: {
        FIST: 0.3,          // Сжатый кулак
        OPEN_HAND: 0.6,     // Раскрытая рука
        PALM: 0.7           // Открытая ладонь
    },
    
    // Hand position sensitivity
    CURSOR_SMOOTHING: 0.6,  // 0-1, higher = smoother but slower
    CLICK_COOLDOWN: 20,     // Frames between clicks
    
    // MediaPipe settings
    MEDIAPIPE_OPTIONS: {
        maxNumHands: 2,
        modelComplexity: 1,      // 0 = lightweight, 1 = full
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    },
    
    // Visual feedback
    VISUAL_FEEDBACK: {
        CLICK_DURATION: 600,     // ms
        GESTURE_HISTORY_SIZE: 5,
        CURSOR_SCALE: 1.0
    },
    
    // Performance settings
    PERFORMANCE: {
        VIDEO_WIDTH: 1280,
        VIDEO_HEIGHT: 720,
        CANVAS_RESIZE_THROTTLE: 500  // ms
    }
};

// Gesture definitions with emoji and descriptions
const GESTURES = {
    FIST: {
        emoji: '👊',
        name: 'Кулак',
        description: 'Сжатый кулак для клика',
        action: 'click',
        confidence: 'high'
    },
    PALM: {
        emoji: '✋',
        name: 'Ладонь',
        description: 'Открытая ладонь для управления курсором',
        action: 'cursor',
        confidence: 'high'
    },
    OPEN_HAND: {
        emoji: '🖐️',
        name: 'Раскрытая рука',
        description: 'Рука со всеми пальцами вверх',
        action: 'cursor',
        confidence: 'medium'
    },
    VICTORY: {
        emoji: '🤟',
        name: 'Знак V',
        description: 'Два пальца вверх',
        action: 'special',
        confidence: 'medium'
    },
    POINT: {
        emoji: '☝️',
        name: 'Указание',
        description: 'Один палец вверх',
        action: 'point',
        confidence: 'high'
    },
    THUMBS_UP: {
        emoji: '👍',
        name: 'Палец вверх',
        description: 'Большой палец вверх',
        action: 'confirm',
        confidence: 'high'
    },
    UNKNOWN: {
        emoji: '❓',
        name: 'Неизвестно',
        description: 'Неопознанный жест',
        action: 'none',
        confidence: 'low'
    }
};

// Landmark indices for fingers
const HAND_LANDMARKS = {
    WRIST: 0,
    THUMB_CMC: 1,
    THUMB_MCP: 2,
    THUMB_IP: 3,
    THUMB_TIP: 4,
    INDEX_MCP: 5,
    INDEX_PIP: 6,
    INDEX_DIP: 7,
    INDEX_TIP: 8,
    MIDDLE_MCP: 9,
    MIDDLE_PIP: 10,
    MIDDLE_DIP: 11,
    MIDDLE_TIP: 12,
    RING_MCP: 13,
    RING_PIP: 14,
    RING_DIP: 15,
    RING_TIP: 16,
    PINKY_MCP: 17,
    PINKY_PIP: 18,
    PINKY_DIP: 19,
    PINKY_TIP: 20
};

// Finger connections for visualization
const FINGER_CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm connections
    [5, 9], [9, 13], [13, 17]
];

// Color scheme
const COLOR_SCHEME = {
    // Canvas drawing colors
    LANDMARK_COLOR: 'rgba(255, 0, 110, 0.8)',
    CONNECTION_COLOR: 'rgba(0, 212, 255, 0.5)',
    HIGHLIGHT_COLOR: 'rgba(0, 255, 136, 0.8)',
    
    // UI colors (CSS vars style)
    ACCENT: '#00d4ff',
    ACCENT_SECONDARY: '#ff006e',
    SUCCESS: '#00ff88',
    WARNING: '#ffaa00',
    DANGER: '#ff3333',
    
    // Palettes
    BRAND_GRADIENT: ['#00d4ff', '#ff006e'],
    HAND_GRADIENT: ['#00d4ff', '#0099cc']
};

// Audio feedback configuration
const AUDIO_CONFIG = {
    ENABLED: true,
    VOLUME: 0.3,
    CLICK_FREQUENCY: 800,  // Hz (frequency of beep)
    CLICK_DURATION: 80,    // ms
    SUCCESS_FREQUENCY: 1047,
    SUCCESS_DURATION: 100
};

// Gesture action combinations
const GESTURE_ACTIONS = {
    SINGLE_HAND_FIST: 'click',
    BOTH_HANDS_OPEN: 'double_action',
    THUMBS_UP: 'confirm',
    VICTORY_SIGN: 'special_action',
    POINTING: 'select'
};

// Advanced detection parameters
const ADVANCED_DETECTION = {
    // Hand stability - required frames for gesture confirmation
    GESTURE_CONFIRMATION_FRAMES: 3,
    
    // Tracking
    HAND_LOST_TIMEOUT: 500, // ms
    
    // Gesture smoothing
    POSITION_SMOOTHING_FACTOR: 0.6,
    ANGLE_SMOOTHING_FACTOR: 0.5,
    
    // Distance calculations
    USE_EULER_DISTANCE: true,
    NORMALIZE_TO_HAND_SIZE: true
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GESTURE_CONFIG,
        GESTURES,
        HAND_LANDMARKS,
        FINGER_CONNECTIONS,
        COLOR_SCHEME,
        AUDIO_CONFIG,
        GESTURE_ACTIONS,
        ADVANCED_DETECTION
    };
}
