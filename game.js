const SINGLE_GAME_WIDTH = 640;
const DUAL_GAME_WIDTH = 1100;
let GAME_WIDTH = SINGLE_GAME_WIDTH;
const GAME_HEIGHT = 640;
let LEFT_X = GAME_WIDTH * 0.25;
let RIGHT_X = GAME_WIDTH * 0.75;
const HAND_Y = 510;
const POTATO_Y_OFFSET = 60;
const POTATO_INTRO_SIZE = 88;
const POTATO_GAME_SIZE = 40;
const BASE_HAND_SCALE = 0.44;
const BASE_CATCH_WIDTH = 170;
const BASE_CATCH_HEIGHT = 56;
const CATCH_ZONE_OFFSET_Y = 14;
const MIN_CATCH_WIDTH = 24;
const MIN_CATCH_HEIGHT = 10;
const CATCH_SHRINK_PER_SCORE = 6.4;
const CATCH_SHRINK_PER_SECOND = 4.6;
const TIMER_OPTIONS = [10, 30, 60];
const SINGLE_DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Very Hard'];
const SINGLE_RULE_OPTIONS = ['Sudden Death', '3 Lives'];
const POTATO_SKINS = ['Classic', 'Fire', 'Ninja', 'Golden'];
const DUAL_VARIANT_OPTIONS = ['Best of 3', 'First to 30', 'Timed Battle', 'Chaos', 'Pure Skill'];
const LOGIN_PLAYERS = ['Bryle', 'Prince', 'Josh', 'Mommy', 'Daddy'];
// Fill these from Supabase Project Settings > API. Empty values keep the game local-only.
const SUPABASE_URL = 'https://logcqybbstowuzdtwjxq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZ2NxeWJic3Rvd3V6ZHR3anhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTI5NjIsImV4cCI6MjA5NDkyODk2Mn0.KkJu3034iBfMntQCBF1vwWo1vt2xnAWUQPg5-_SKn_Y';
const SUPABASE_SINGLE_TABLE = 'tabandatato_scores';
const SUPABASE_DUAL_TABLE = 'tabandatato_dual_scores';
const SUPABASE_PROFILE_TABLE = 'tabandatato_profiles';
const LEADERBOARD_VIEWS = ['Global', 'Today', 'Player', '2P'];
const BOX_MOVE_SCORE_TRIGGER = 10;
const SINGLE_OBSTACLE_SCORE_TRIGGER = 25;
const SINGLE_OBSTACLE_MAX_LIFETIME_MS = 9000;
const SINGLE_OBSTACLE_SCORE_STEP = 5;
const SINGLE_OBSTACLE_MAX_PER_WAVE = 5;
const BOX_MOVE_INTERVAL_MS = 520;
const BOX_MOVE_MAX_OFFSET_X = 26;
const BOX_MOVE_MAX_OFFSET_Y = 12;
const DIFFICULTY_SCORE_STEP = 10;
const DUAL_PANEL_GAP = 140;
const DUAL_PANEL_MARGIN = 18;
const DUAL_PANEL_BORDER = 6;
const DUAL_TIME_MOVE_TRIGGER_SEC = 10;
const DUAL_TIME_LEVEL_STEP_SEC = 10;
const DUAL_HAND_MOVE_INTERVAL_MS = 520;
const DUAL_HAND_MOVE_MAX_OFFSET_X = 28;
const DUAL_HAND_MOVE_MAX_OFFSET_Y = 10;
const DUAL_POWER_TYPES = {
    SHIELD: 'shield',
    BIGBOX: 'bigbox',
    SHRINK_UP: 'shrink_up',
    SHRINK: 'shrink',
    HEAVY: 'heavy',
    STUN: 'stun',
    LASER: 'laser',
    DOUBLE: 'double',
    FREEZE: 'freeze'
};
const SINGLE_POWER_TYPES = {
    FREEZE: 'freeze',
    DOUBLE: 'double',
    BIGBOX: 'bigbox',
    SHRINK_UP: 'shrink_up',
    SHIELD: 'shield',
    LASER: 'laser'
};
const MAX_SINGLE_SHIELD_CHARGES = 3;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#9BE7FF',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

let potato;
let leftHand;
let rightHand;
let leftCatchZone;
let rightCatchZone;
let currentHand;
let leftCollider;
let rightCollider;

let score = 0;
let bestScore = 0;
let canSwitch = false;
let potatoInFlight = false;
let selectedPlayer = '';
let loggedInPlayer = '';
let gameState = 'intro';
let catchCount = 0;
let activePowerUp = null;
let powerUpTimer = null;
let powerUpText;
let soundEnabled = true;
let audioContext;
let singleTimerEnabled = true;
let dualTimerEnabled = true;
let singleTimerSeconds = 30;
let dualTimerSeconds = 120;
let singleDifficultyMode = 'Medium';
let singleRuleMode = 'Sudden Death';
let selectedPotatoSkin = 'Classic';
let dailyChallengeActive = false;
let selectedDualVariant = 'Best of 3';
let leaderboardView = 'Global';
let freezeStartedAt = null;
let freezeTotalMs = 0;

let introGroup;
let modeSelectGroup;
let playerSelectGroup;
let guestRoleGroup;
let dualPlayerSelectGroup;
let dualGuestRoleGroup;
let gameplayGroup;
let gameOverGroup;
let leaderboardGroup;
let unlocksGroup;
let howToGroup;
let dualGroup;
let dualResultGroup;
let bgGroup;

let scoreText;
let bestText;
let playerText;
let timerText;
let livesText;
let streakText;
let dualTimerText;
let welcomeText;
let daddyCheerText;
let soundToggleText;
let dualMatch;
let dualPlayerNames = { mouse: null, keyboard: null };
let runStartMs = 0;
let dualRunStartMs = 0;
let dualPowerUpGroup;
let dualPowerSpawnEvent;
let dualPowerNoticeText;
let dualLastPowerType = null;
let dualTimeDifficultyLevel = 0;
let dualHandMoveEvent = null;
let dualFreezeStartedAt = null;
let dualFreezeTotalMs = 0;
let dualFreezeTimer = null;
let singlePowerUpGroup;
let singlePowerSpawnEvent;
let singleLastPowerType = null;
let singleShieldCharges = 0;
let singleObstacleGroup;
let singleObstacleSpawnEvent;
let boxMoveEvent = null;
let isGamePaused = false;
let pausedMode = null;
let pauseOverlayGroup = null;
let pauseOverlayResumeButton = null;
let singlePauseButton = null;
let dualPauseButton = null;
let leftCatchOffsetX = 0;
let leftCatchOffsetY = 0;
let rightCatchOffsetX = 0;
let rightCatchOffsetY = 0;
let leftHandOffsetX = 0;
let leftHandOffsetY = 0;
let rightHandOffsetX = 0;
let rightHandOffsetY = 0;
let baseLeftHandY = 0;
let baseRightHandY = 0;
let singleDifficultyLevel = 0;
let doubleHands = [];
let doubleZones = [];
let doubleColliders = [];
let livesRemaining = 1;
let maxLives = 1;
let currentStreak = 0;
let maxStreak = 0;
let powerUpsCollected = 0;
let hasNewHighScoreThisRun = false;
let supabaseClient = null;
let cloudLeaderboard = [];
let cloudDualLeaderboard = [];
let cloudScoresLoaded = false;
let cloudProfiles = [];
let sessionId = '';

const game = new Phaser.Game(config);

function applyGameWidth(scene, width) {
    if (GAME_WIDTH === width) return;
    GAME_WIDTH = width;
    LEFT_X = GAME_WIDTH * 0.25;
    RIGHT_X = GAME_WIDTH * 0.75;
    if (scene?.scale) scene.scale.resize(GAME_WIDTH, GAME_HEIGHT);
    if (scene?.cameras?.main) scene.cameras.main.setZoom(1);
    const container = document.getElementById('game-container');
    if (container) {
        container.style.width = `${GAME_WIDTH}px`;
        container.style.maxWidth = GAME_WIDTH >= DUAL_GAME_WIDTH ? '98vw' : '100vw';
    }
    createAnimatedBackground(scene);
}

function getSessionId() {
    try {
        const existing = localStorage.getItem('tabandatato_session_id');
        if (existing) return existing;
        const next = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('tabandatato_session_id', next);
        return next;
    } catch (error) {
        return `session_${Date.now()}`;
    }
}

function toggleFullscreen() {
    const target = document.getElementById('game-container') || document.documentElement;
    if (!document.fullscreenElement) {
        target.requestFullscreen?.().catch(() => {});
    } else {
        document.exitFullscreen?.().catch(() => {});
    }
}

function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

function preload() {
    this.load.image('avatar_bryle', 'assets/images/bryle.png');
    this.load.image('avatar_prince', 'assets/images/Prince.png');
    this.load.image('avatar_josh', 'assets/images/josh.png');
    this.load.image('avatar_mommy', 'assets/images/mommy.png');
    this.load.image('avatar_daddy', 'assets/images/daddy.png');
}

function create() {
    ensureCoreTextures(this);
    createAnimatedBackground(this);
    sessionId = getSessionId();
    initSupabase();
    refreshCloudLeaderboards();
    const leaderboard = getLeaderboard();
    bestScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
    soundEnabled = localStorage.getItem('tabandatato_sound') !== 'off';
    singleTimerEnabled = localStorage.getItem('tabandatato_timer_single') !== 'off';
    dualTimerEnabled = true;
    singleTimerSeconds = clampTimerSeconds(parseInt(localStorage.getItem('tabandatato_timer_single_seconds'), 10) || 30);
    dualTimerSeconds = 120;
    singleDifficultyMode = clampSingleDifficulty(localStorage.getItem('tabandatato_difficulty'));
    singleRuleMode = clampSingleRule(localStorage.getItem('tabandatato_single_rule'));
    selectedPotatoSkin = clampPotatoSkin(localStorage.getItem('tabandatato_potato_skin'));
    selectedDualVariant = clampDualVariant(localStorage.getItem('tabandatato_dual_variant'));
    loggedInPlayer = getSavedLoginPlayer();
    selectedPlayer = loggedInPlayer;

    this.input.on('pointerdown', (pointer, gameObjects) => {
        if (isGamePaused) return;
        if (gameObjects.length > 0) return;
        if (gameState === 'playing') {
            switchHand(this);
        } else if (gameState === 'dual') {
            switchDualHand(this, 'mouse');
        }
    });
    this.input.keyboard.on('keydown-SPACE', () => {
        if (isGamePaused) return;
        if (gameState === 'dual') switchDualHand(this, 'keyboard');
    });
    this.input.keyboard.on('keydown-UP', () => {
        if (isGamePaused) return;
        if (gameState === 'dual') switchDualHand(this, 'keyboard');
    });
    this.input.keyboard.on('keydown-ESC', () => {
        if (gameState === 'playing' || gameState === 'dual' || isGamePaused) {
            togglePause(this);
        }
    });
    this.input.keyboard.addCapture(['SPACE', 'UP', 'ESC']);

    if (loggedInPlayer) {
        showIntro(this);
    } else {
        showPlayerSelect(this);
    }
}

function ensureCoreTextures(scene) {
    if (scene.textures.exists('potato')) scene.textures.remove('potato');
    if (scene.textures.exists('potato_fire')) scene.textures.remove('potato_fire');
    if (scene.textures.exists('potato_ninja')) scene.textures.remove('potato_ninja');
    if (scene.textures.exists('potato_golden')) scene.textures.remove('potato_golden');
    if (scene.textures.exists('hand')) scene.textures.remove('hand');

    createPotatoTexture(scene, 'potato', 0x8d6e63, 0xd7ccc8, 'classic');
    createPotatoTexture(scene, 'potato_fire', 0xbf360c, 0xffcc80, 'fire');
    createPotatoTexture(scene, 'potato_ninja', 0x455a64, 0xcfd8dc, 'ninja');
    createPotatoTexture(scene, 'potato_golden', 0xffc107, 0xfff8e1, 'golden');

    const handG = scene.make.graphics({ x: 0, y: 0, add: false });
    handG.fillStyle(0xffe0b2, 1);
    handG.fillRoundedRect(16, 44, 96, 56, 20);
    handG.fillRoundedRect(20, 20, 16, 36, 10);
    handG.fillRoundedRect(38, 14, 16, 42, 10);
    handG.fillRoundedRect(56, 10, 16, 46, 10);
    handG.fillRoundedRect(74, 16, 16, 40, 10);
    handG.fillRoundedRect(92, 24, 16, 30, 10);
    handG.lineStyle(2, 0xffcc80, 0.8);
    handG.strokeRoundedRect(16, 44, 96, 56, 20);
    handG.generateTexture('hand', 128, 128);
    handG.destroy();
}

function createPotatoTexture(scene, key, fill, stroke, style) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(fill, 1);
    g.fillEllipse(64, 64, 90, 70);
    g.lineStyle(3, stroke, 0.95);
    g.strokeEllipse(64, 64, 90, 70);
    g.fillStyle(style === 'ninja' ? 0x111111 : 0x5d4037, 0.75);
    g.fillEllipse(52, 52, 16, 10);
    g.fillEllipse(78, 70, 14, 9);
    g.fillEllipse(64, 80, 12, 8);
    if (style === 'fire') {
        g.fillStyle(0xffeb3b, 0.95);
        g.fillTriangle(38, 30, 52, 2, 66, 34);
        g.fillTriangle(58, 30, 76, 0, 92, 36);
    } else if (style === 'ninja') {
        g.fillStyle(0x111111, 0.95);
        g.fillRoundedRect(26, 42, 76, 24, 8);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(50, 54, 5);
        g.fillCircle(78, 54, 5);
    } else if (style === 'golden') {
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(48, 44, 5);
        g.fillCircle(82, 56, 4);
    }
    g.generateTexture(key, 128, 128);
    g.destroy();
}

function update(time, delta) {
    if (isGamePaused) return;
    if (gameState === 'playing') {
        updateCatchZoneSizeForScore(this);
        updateSinglePowerUps(this, delta);
        updateSingleObstacles(this, delta);
        if (singleTimerEnabled && timerText) {
            const elapsedMs = this.time.now - runStartMs - freezeTotalMs - (freezeStartedAt ? this.time.now - freezeStartedAt : 0);
            const remainingSec = Math.max(0, Math.ceil((singleTimerSeconds * 1000 - elapsedMs) / 1000));
            timerText.setText(`Time: ${remainingSec}s`);
            if (remainingSec <= 0) {
                finishGame(this);
                return;
            }
        }
    }
    if (gameState === 'dual' && dualMatch?.timerEnabled && dualTimerText) {
        const elapsedMs = getDualElapsedMs(this);
        const remainingSec = Math.max(0, Math.ceil((dualMatch.timerSeconds * 1000 - elapsedMs) / 1000));
        dualTimerText.setText(`Time: ${remainingSec}s`);
        if (remainingSec <= 0) {
            finishDualRoundByTimer(this);
            return;
        }
    }
    if (gameState === 'playing' && potato && potato.y > GAME_HEIGHT + 20) {
        loseLife(this);
    }
    if (gameState === 'dual') {
        updateDual(this, delta);
    }
}

function createAnimatedBackground(scene) {
    if (bgGroup) bgGroup.destroy(true);
    bgGroup = scene.add.group();

    const topBand = scene.add.rectangle(GAME_WIDTH / 2, 90, GAME_WIDTH + 10, 180, 0xb3e5fc);
    const midBand = scene.add.rectangle(GAME_WIDTH / 2, 320, GAME_WIDTH + 10, 280, 0x81d4fa);
    const bottomBand = scene.add.rectangle(GAME_WIDTH / 2, 580, GAME_WIDTH + 10, 180, 0x4fc3f7);
    topBand.setAlpha(0.75);
    midBand.setAlpha(0.7);
    bottomBand.setAlpha(0.6);
    bgGroup.addMultiple([topBand, midBand, bottomBand]);

    for (let i = 0; i < 9; i++) {
        const bubble = scene.add.circle(
            Phaser.Math.Between(30, GAME_WIDTH - 30),
            Phaser.Math.Between(40, GAME_HEIGHT - 40),
            Phaser.Math.Between(10, 26),
            0xffffff,
            0.25
        );
        bgGroup.add(bubble);
        scene.tweens.add({
            targets: bubble,
            y: bubble.y - Phaser.Math.Between(30, 100),
            x: bubble.x + Phaser.Math.Between(-25, 25),
            alpha: { from: 0.2, to: 0.45 },
            duration: Phaser.Math.Between(2400, 4200),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

function showIntro(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGame(scene);
    cleanupDualGame(scene);
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    cleanupGroup('unlocksGroup');
    cleanupGroup('howToGroup');
    cleanupGroup('introGroup');

    gameState = 'intro';
    introGroup = scene.add.group();

    const panel = createPanel(scene, GAME_WIDTH / 2, 324, 560, 580, 0xffffff, 0.12, 0xffffff);
    const title = scene.add.text(GAME_WIDTH / 2, 170, 'TabandaTato', {
        fontSize: '58px',
        fill: '#5d4037',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff8e1',
        strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5);

    const subtitle = scene.add.text(GAME_WIDTH / 2, 280, 'Tap anywhere to pass the potato.\nKeep it hot, never let it drop!', {
        fontSize: '24px',
        fill: '#1a237e',
        align: 'center',
        fontFamily: 'Verdana',
        lineSpacing: 8
    }).setOrigin(0.5);

    const mascot = scene.add.image(GAME_WIDTH / 2, 390, 'potato').setDisplaySize(POTATO_INTRO_SIZE, POTATO_INTRO_SIZE);
    scene.tweens.add({
        targets: [title, mascot],
        y: '-=12',
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    const profile = loggedInPlayer ? getPlayerProfile(loggedInPlayer) : null;
    const loginText = scene.add.text(GAME_WIDTH / 2, 116, profile ? `Logged in: ${loggedInPlayer} | Lv ${profile.level} ${profile.title}` : 'Choose a character to start', {
        fontSize: '17px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        backgroundColor: '#ffffff',
        padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5);
    const changeHeroBtn = createButton(scene, GAME_WIDTH / 2, 145, 'Change Hero', '#7b1fa2', () => showPlayerSelect(scene), 170, 16);
    const startBtn = createButton(scene, GAME_WIDTH / 2, 462, 'Start Game', '#43a047', () => {
        if (!loggedInPlayer) {
            showPlayerSelect(scene);
            return;
        }
        showModeSelect(scene);
    }, 280, 30);
    const dailyBtn = createButton(scene, GAME_WIDTH / 2, 518, 'Daily Challenge', '#00838f', () => {
        if (!loggedInPlayer) {
            showPlayerSelect(scene);
            return;
        }
        startDailyChallenge(scene);
    }, 260, 22);
    const unlocksBtn = createButton(scene, GAME_WIDTH / 2 - 82, 578, 'Unlocks', '#7b1fa2', () => showUnlocks(scene), 158, 20);
    const leaderboardBtn = createButton(scene, GAME_WIDTH / 2 + 92, 578, 'Leaderboard', '#ef6c00', () => showLeaderboard(scene), 178, 20);
    const howToBtn = createButton(scene, 112, 34, 'How to Play', '#00897b', () => showHowToPlay(scene), 180, 18);
    const fullscreenBtn = createToggleButton(scene, GAME_WIDTH - 92, 84, 'Fullscreen', '#1565c0', () => toggleFullscreen(), 150, 16);
    soundToggleText = createToggleButton(
        scene,
        GAME_WIDTH - 88,
        34,
        soundEnabled ? 'Sound: ON' : 'Sound: OFF',
        '#3949ab',
        () => toggleSound(scene),
        150,
        18
    );
    const hint = scene.add.text(GAME_WIDTH / 2, 430, 'Keep the potato up, build combos, unlock skins!', {
        fontSize: '18px',
        fill: '#004d40',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    introGroup.addMultiple([panel, title, subtitle, mascot, loginText, changeHeroBtn, startBtn, dailyBtn, unlocksBtn, leaderboardBtn, howToBtn, fullscreenBtn, soundToggleText, hint]);
}

function showModeSelect(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupDualGame(scene);
    cleanupGroup('unlocksGroup');
    cleanupGroup('howToGroup');

    gameState = 'select';
    modeSelectGroup = scene.add.group();

    const panel = createPanel(scene, GAME_WIDTH / 2, 336, 470, 560, 0xffffff, 0.72, 0x5e35b1);
    const title = scene.add.text(GAME_WIDTH / 2, 180, 'Choose Game Mode', {
        fontSize: '50px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const onePlayerBtn = createButton(scene, GAME_WIDTH / 2, 275, `One Player: ${loggedInPlayer || 'Login'}`, '#2e7d32', () => {
        dailyChallengeActive = false;
        if (!loggedInPlayer) {
            showPlayerSelect(scene);
            return;
        }
        selectedPlayer = loggedInPlayer;
        startActualGame(scene);
    }, 280, 30);
    const twoPlayerBtn = createButton(scene, GAME_WIDTH / 2, 350, 'Two Players', '#00838f', () => startDualSetup(scene), 280, 30);
    const onePlayerTimerToggle = createToggleButton(
        scene,
        GAME_WIDTH / 2 - 105,
        420,
        `1P Timer: ${singleTimerEnabled ? 'ON' : 'OFF'}`,
        '#6d4c41',
        () => toggleSingleTimer(onePlayerTimerToggle),
        190,
        18
    );
    const onePlayerTimerOption = createToggleButton(
        scene,
        GAME_WIDTH / 2 + 105,
        420,
        `1P: ${singleTimerSeconds}s`,
        '#5d4037',
        () => cycleSingleTimerSeconds(onePlayerTimerOption),
        155,
        18
    );
    const onePlayerDifficultyOption = createToggleButton(
        scene,
        GAME_WIDTH / 2,
        472,
        `1P Difficulty: ${singleDifficultyMode}`,
        '#283593',
        () => cycleSingleDifficulty(onePlayerDifficultyOption),
        310,
        18
    );
    const onePlayerRuleOption = createToggleButton(
        scene,
        GAME_WIDTH / 2,
        524,
        `1P Rule: ${singleRuleMode}`,
        '#ad1457',
        () => cycleSingleRule(onePlayerRuleOption),
        310,
        18
    );
    const dualVariantOption = createToggleButton(
        scene,
        GAME_WIDTH / 2,
        572,
        `2P: ${selectedDualVariant}`,
        '#00695c',
        () => cycleDualVariant(dualVariantOption),
        310,
        18
    );
    const loginBtn = createButton(scene, GAME_WIDTH - 96, 590, 'Login', '#7b1fa2', () => showPlayerSelect(scene), 150, 20);
    const backBtn = createButton(scene, 72, 590, 'Back', '#546e7a', () => showIntro(scene), 120, 20);

    modeSelectGroup.addMultiple([
        title,
        panel,
        onePlayerBtn,
        twoPlayerBtn,
        onePlayerTimerToggle,
        onePlayerTimerOption,
        onePlayerDifficultyOption,
        onePlayerRuleOption,
        dualVariantOption,
        loginBtn,
        backBtn
    ]);
}

function showPlayerSelect(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGroup('modeSelectGroup');
    cleanupGroup('introGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('leaderboardGroup');
    cleanupDualGame(scene);
    cleanupGroup('playerSelectGroup');

    gameState = 'select';
    playerSelectGroup = scene.add.group();

    const panel = createPanel(scene, GAME_WIDTH / 2, 336, 470, 560, 0xffffff, 0.78, 0x7b1fa2);
    const title = scene.add.text(GAME_WIDTH / 2, 120, 'Login', {
        fontSize: '46px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const sub = scene.add.text(GAME_WIDTH / 2, 170, 'Choose the character earning XP and skins', {
        fontSize: '20px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const players = LOGIN_PLAYERS;
    const colors = ['#1976d2', '#00897b', '#f4511e', '#ad1457', '#6a1b9a'];
    const buttons = players.map((name, index) => {
        const y = 230 + index * 64;
        const profile = getPlayerProfile(name);
        const btn = createButton(
            scene,
            GAME_WIDTH / 2 + 50,
            y,
            `${name} | Lv ${profile.level}`,
            loggedInPlayer === name ? '#6a1b9a' : colors[index],
            () => {
                setLoggedInPlayer(name);
                showModeSelect(scene);
            },
            260,
            22
        );
        const avatar = createAvatar(scene, getAvatarKey(name), GAME_WIDTH / 2 - 112, y, 0.2);
        const titleText = scene.add.text(GAME_WIDTH / 2 + 50, y + 31, profile.title, {
            fontSize: '14px',
            fill: '#455a64',
            fontFamily: 'Trebuchet MS',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        return [btn, avatar, titleText];
    }).flat();

    const backBtn = createButton(scene, GAME_WIDTH / 2, 590, 'Back', '#546e7a', () => showModeSelect(scene), 170, 24);
    playerSelectGroup.addMultiple([panel, title, sub, ...buttons, backBtn]);
}

function showGuestRoleSelect(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    gameState = 'select';

    guestRoleGroup = scene.add.group();

    const title = scene.add.text(GAME_WIDTH / 2, 170, 'Guest Selected', {
        fontSize: '44px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const question = scene.add.text(GAME_WIDTH / 2, 245, 'Are you Mommy or Daddy?', {
        fontSize: '32px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const mommyAvatar = createAvatar(scene, 'avatar_mommy', GAME_WIDTH / 2 - 100, 340, 0.2);
    const mommyBtn = createButton(scene, GAME_WIDTH / 2 + 35, 340, 'Mommy', '#ad1457', () => {
        selectedPlayer = 'Mommy';
        startActualGame(scene);
    }, 220, 30);

    const daddyAvatar = createAvatar(scene, 'avatar_daddy', GAME_WIDTH / 2 - 100, 430, 0.2);
    const daddyBtn = createButton(scene, GAME_WIDTH / 2 + 35, 430, 'Daddy', '#6a1b9a', () => {
        selectedPlayer = 'Daddy';
        startActualGame(scene);
    }, 220, 30);

    const backBtn = createButton(scene, GAME_WIDTH / 2, 560, 'Back', '#546e7a', () => showPlayerSelect(scene), 170, 24);
    guestRoleGroup.addMultiple([title, question, mommyAvatar, mommyBtn, daddyAvatar, daddyBtn, backBtn]);
}

function setLoggedInPlayer(name) {
    loggedInPlayer = clampLoginPlayer(name);
    selectedPlayer = loggedInPlayer;
    localStorage.setItem('tabandatato_logged_in_player', loggedInPlayer);
    selectedPotatoSkin = clampPotatoSkin(localStorage.getItem(getSkinStorageKey(loggedInPlayer)));
}

function getSavedLoginPlayer() {
    const saved = localStorage.getItem('tabandatato_logged_in_player');
    return LOGIN_PLAYERS.includes(saved) ? saved : '';
}

function showLeaderboard(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    cleanupGroup('unlocksGroup');
    cleanupGroup('howToGroup');
    cleanupDualGame(scene);

    gameState = 'leaderboard';
    leaderboardGroup = scene.add.group();

    const panel = createPanel(scene, GAME_WIDTH / 2, 330, 460, 600, 0xffffff, 0.95, 0xffb74d);
    const title = scene.add.text(GAME_WIDTH / 2, 90, 'High Scores', {
        fontSize: '52px',
        fill: '#e65100',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff3e0',
        strokeThickness: 7
    }).setOrigin(0.5);

    const leaderboardData = getLeaderboardViewData();
    const entries = leaderboardData.single.slice(0, 5);
    const rows = [];

    const prevView = createButton(scene, GAME_WIDTH / 2 - 178, 140, '<', '#6d4c41', () => cycleLeaderboardView(scene, -1), 52, 18);
    const nextView = createButton(scene, GAME_WIDTH / 2 + 178, 140, '>', '#6d4c41', () => cycleLeaderboardView(scene, 1), 52, 18);
    const singleTitle = scene.add.text(GAME_WIDTH / 2, 140, leaderboardData.title, {
        fontSize: '28px',
        fill: '#2e7d32',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    if (leaderboardView !== '2P' && entries.length === 0) {
        rows.push(scene.add.text(GAME_WIDTH / 2, 225, 'No 1-player scores yet', {
            fontSize: '22px',
            fill: '#455a64',
            align: 'center',
            fontFamily: 'Trebuchet MS'
        }).setOrigin(0.5));
    } else if (leaderboardView !== '2P') {
        entries.forEach((entry, index) => {
            const y = 180 + index * 36;
            const rank = index + 1;
            const rankText = scene.add.text(62, y, `${rank}.`, {
                fontSize: '22px',
                fill: rank === 1 ? '#f57f17' : rank === 2 ? '#546e7a' : rank === 3 ? '#bf360c' : '#37474f',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            const avatar = createAvatar(scene, getAvatarKey(entry.player), 108, y, 0.11);
            const player = scene.add.text(140, y, entry.player, {
                fontSize: '21px',
                fill: '#1b5e20',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            const scoreLabel = scene.add.text(418, y, String(entry.score), {
                fontSize: '21px',
                fill: '#0d47a1',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            rows.push(rankText, avatar, player, scoreLabel);
        });
    }

    const divider = scene.add.rectangle(GAME_WIDTH / 2, 330, 390, 3, 0xffcc80, 0.9);
    const dualTitle = scene.add.text(GAME_WIDTH / 2, 365, leaderboardView === '2P' ? '2 Player Global' : 'Player Profiles', {
        fontSize: '30px',
        fill: '#00838f',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const dualEntries = leaderboardView === '2P' ? leaderboardData.dual.slice(0, 5) : getProfileRows().slice(0, 5);
    if (dualEntries.length === 0) {
        rows.push(scene.add.text(GAME_WIDTH / 2, 430, leaderboardView === '2P' ? 'No 2-player scores yet' : 'No profiles yet', {
            fontSize: '22px',
            fill: '#455a64',
            align: 'center',
            fontFamily: 'Trebuchet MS'
        }).setOrigin(0.5));
    } else if (leaderboardView === '2P') {
        dualEntries.forEach((entry, index) => {
            const y = 410 + index * 34;
            const rank = scene.add.text(52, y, `${index + 1}.`, {
                fontSize: '20px',
                fill: '#37474f',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            const text = scene.add.text(90, y, `${entry.winner} beat ${entry.loser}`, {
                fontSize: '19px',
                fill: '#263238',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            const score = scene.add.text(418, y, `${entry.winnerScore}-${entry.loserScore}`, {
                fontSize: '19px',
                fill: '#0d47a1',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            rows.push(rank, text, score);
        });
    } else {
        dualEntries.forEach((profile, index) => {
            const y = 410 + index * 34;
            const rank = scene.add.text(52, y, `${index + 1}.`, makeHudStyle(18, '#37474f')).setOrigin(0, 0.5);
            const text = scene.add.text(90, y, `${profile.player} - ${profile.title}`, makeHudStyle(17, '#263238')).setOrigin(0, 0.5);
            const stats = scene.add.text(418, y, `Lv ${profile.level}`, makeHudStyle(18, '#0d47a1')).setOrigin(1, 0.5);
            rows.push(rank, text, stats);
        });
    }

    const backBtn = createButton(scene, GAME_WIDTH / 2, 590, 'Back', '#546e7a', () => showIntro(scene), 170, 24);
    const sourceText = scene.add.text(GAME_WIDTH / 2, 118, isSupabaseEnabled() ? (cloudScoresLoaded ? 'Cloud scores synced' : 'Loading cloud scores...') : 'Local scores only', {
        fontSize: '14px',
        fill: '#5d4037',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    leaderboardGroup.addMultiple([panel, title, sourceText, prevView, nextView, singleTitle, divider, dualTitle, ...rows, backBtn]);
    if (isSupabaseEnabled() && !cloudScoresLoaded) {
        refreshCloudLeaderboards().then(() => {
            if (gameState === 'leaderboard') showLeaderboard(scene);
        });
    }
}

function cycleLeaderboardView(scene, direction) {
    const index = LEADERBOARD_VIEWS.indexOf(leaderboardView);
    leaderboardView = LEADERBOARD_VIEWS[(index + direction + LEADERBOARD_VIEWS.length) % LEADERBOARD_VIEWS.length];
    showLeaderboard(scene);
}

function getLeaderboardViewData() {
    const allSingle = getLeaderboard();
    const allDual = getDualLeaderboard();
    if (leaderboardView === 'Today') {
        const today = getDailyKey();
        return {
            title: "Today's Top Scores",
            single: allSingle.filter((entry) => getLocalDateKey(entry.date) === today),
            dual: []
        };
    }
    if (leaderboardView === 'Player') {
        return {
            title: 'Best by Player',
            single: getBestScoresByPlayer(allSingle),
            dual: []
        };
    }
    if (leaderboardView === '2P') {
        return {
            title: '2 Player Results',
            single: [],
            dual: allDual
        };
    }
    return {
        title: 'Global Top Scores',
        single: allSingle,
        dual: allDual
    };
}

function getBestScoresByPlayer(entries) {
    const best = new Map();
    entries.forEach((entry) => {
        const player = entry.player || 'Guest';
        const current = best.get(player);
        if (!current || entry.score > current.score) best.set(player, entry);
    });
    return Array.from(best.values()).sort((a, b) => b.score - a.score);
}

function getLocalDateKey(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showHowToPlay(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGame(scene);
    cleanupDualGame(scene);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    cleanupGroup('unlocksGroup');
    cleanupGroup('howToGroup');

    gameState = 'howto';
    howToGroup = scene.add.group();

    const panel = createPanel(scene, GAME_WIDTH / 2, 330, 500, 560, 0xffffff, 0.95, 0x00897b);
    const title = scene.add.text(GAME_WIDTH / 2, 80, 'How to Play', {
        fontSize: '48px',
        fill: '#00695c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#e0f2f1',
        strokeThickness: 7
    }).setOrigin(0.5);
    const lines = [
        '1 Player',
        'Tap anywhere to throw the potato to the other hand.',
        'Catch streaks raise your combo multiplier.',
        'Power-ups can help, but laser traps make the potato drop faster.',
        '',
        'Unlocks',
        'Fire unlocks at score 30.',
        'Ninja unlocks at streak 25.',
        'Golden unlocks at score 75 or by beating Daily Challenge.',
        '',
        '2 Players',
        'Player 1 uses mouse or touch. Player 2 uses Space or Up.'
    ];
    const body = scene.add.text(GAME_WIDTH / 2, 310, lines.join('\n'), {
        fontSize: '19px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 420 }
    }).setOrigin(0.5);
    const backBtn = createButton(scene, GAME_WIDTH / 2, 590, 'Back', '#546e7a', () => showIntro(scene), 170, 22);
    howToGroup.addMultiple([panel, title, body, backBtn]);
}

function startActualGame(scene) {
    if (!selectedPlayer) {
        showPlayerSelect(scene);
        return;
    }
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupDualGame(scene);
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    cleanupGroup('unlocksGroup');
    cleanupGroup('howToGroup');
    cleanupGame(scene);

    gameState = 'playing';
    runStartMs = scene.time.now;
    singleLastPowerType = null;
    singleShieldCharges = 0;
    score = 0;
    catchCount = 0;
    currentStreak = 0;
    maxStreak = 0;
    powerUpsCollected = 0;
    maxLives = singleRuleMode === '3 Lives' ? 3 : 1;
    livesRemaining = maxLives;
    hasNewHighScoreThisRun = false;
    canSwitch = true;
    potatoInFlight = false;
    singleDifficultyLevel = 0;
    freezeStartedAt = null;
    freezeTotalMs = 0;
    clearPowerUp(scene, true);
    resetPauseState(scene);

    scene.physics.world.gravity.y = 600;
    scene.physics.world.setBoundsCollision(true, true, false, false);

    gameplayGroup = scene.add.group();
    ensureSinglePowerIconTextures(scene);
    singlePowerUpGroup = scene.add.group();
    singleObstacleGroup = scene.add.group();

    leftHand = scene.physics.add.staticImage(LEFT_X, HAND_Y, 'hand').setScale(BASE_HAND_SCALE);
    rightHand = scene.physics.add.staticImage(RIGHT_X, HAND_Y, 'hand').setScale(BASE_HAND_SCALE);
    leftHand.refreshBody();
    rightHand.refreshBody();
    baseLeftHandY = leftHand.y;
    baseRightHandY = rightHand.y;

    leftCatchZone = scene.add.rectangle(LEFT_X, HAND_Y + CATCH_ZONE_OFFSET_Y, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.2);
    leftCatchZone.setStrokeStyle(3, 0x2e7d32, 0.55);
    scene.physics.add.existing(leftCatchZone, false);
    leftCatchZone.body.setAllowGravity(false);
    leftCatchZone.body.setImmovable(true);

    rightCatchZone = scene.add.rectangle(RIGHT_X, HAND_Y + CATCH_ZONE_OFFSET_Y, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.2);
    rightCatchZone.setStrokeStyle(3, 0x2e7d32, 0.55);
    scene.physics.add.existing(rightCatchZone, false);
    rightCatchZone.body.setAllowGravity(false);
    rightCatchZone.body.setImmovable(true);

    potato = scene.physics.add.image(leftHand.x, leftHand.y - POTATO_Y_OFFSET, getSelectedPotatoTexture()).setDisplaySize(POTATO_GAME_SIZE, POTATO_GAME_SIZE);
    potato.setCollideWorldBounds(true);
    potato.setBounce(0.85, 0.05);
    potato.setAngularDrag(80);

    leftCollider = scene.physics.add.collider(potato, leftCatchZone, () => {
        if (activePowerUp?.type === 'double') {
            onDoubleCatch(scene, leftHand);
            return;
        }
        onCatch(scene, leftHand);
    });
    rightCollider = scene.physics.add.collider(potato, rightCatchZone, () => {
        if (activePowerUp?.type === 'double') {
            onDoubleCatch(scene, rightHand);
            return;
        }
        onCatch(scene, rightHand);
    });

    const hudBar = scene.add.rectangle(GAME_WIDTH / 2, 48, GAME_WIDTH - 28, 84, 0xffffff, 0.58);
    hudBar.setStrokeStyle(2, 0xffffff, 0.65);
    scoreText = scene.add.text(GAME_WIDTH / 2, 12, 'Score: 0', makeHudStyle(28, '#1b5e20')).setOrigin(0.5, 0);
    bestText = scene.add.text(GAME_WIDTH - 150, 14, `Best: ${bestScore}`, makeHudStyle(18, '#0d47a1')).setOrigin(1, 0);
    timerText = singleTimerEnabled
        ? scene.add.text(24, 14, `Time: ${singleTimerSeconds}s`, makeHudStyle(20, '#4e342e')).setOrigin(0, 0)
        : null;
    livesText = scene.add.text(24, 45, `Lives: ${livesRemaining}`, makeHudStyle(18, '#ad1457')).setOrigin(0, 0);
    streakText = scene.add.text(GAME_WIDTH - 150, 45, 'Streak: 0', makeHudStyle(17, '#6a1b9a')).setOrigin(1, 0);
    playerText = scene.add.text(GAME_WIDTH / 2, 48, `Player: ${selectedPlayer}`, makeHudStyle(18, '#263238')).setOrigin(0.5, 0);
    welcomeText = null;
    daddyCheerText = null;
    if (selectedPlayer === 'Daddy') {
        welcomeText = scene.add.text(GAME_WIDTH / 2, 88, 'Welcome Master KRST', {
            fontSize: '24px',
            fill: '#6a1b9a',
            fontFamily: 'Trebuchet MS',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        daddyCheerText = scene.add.text(GAME_WIDTH / 2, 150, '', {
            fontSize: '26px',
            fill: '#d81b60',
            fontFamily: 'Comic Sans MS',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
    }
    const gameHintText = scene.add.text(GAME_WIDTH / 2, selectedPlayer === 'Daddy' ? 126 : 98, `${dailyChallengeActive ? 'Daily Challenge' : singleRuleMode} | ${singleDifficultyMode} | ${selectedPotatoSkin} potato`, {
        fontSize: '18px',
        fill: '#004d40',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5).setAlpha(0.85);
    powerUpText = scene.add.text(GAME_WIDTH / 2, selectedPlayer === 'Daddy' ? 154 : 124, '', {
        fontSize: '20px',
        fill: '#d32f2f',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
    singlePauseButton = createToggleButton(
        scene,
        GAME_WIDTH - 70,
        46,
        'Pause',
        '#6d4c41',
        () => togglePause(scene),
        110,
        17
    );

    gameplayGroup.addMultiple([
        leftCatchZone, rightCatchZone, leftHand, rightHand, potato, hudBar,
        scoreText, bestText, livesText, streakText, playerText, gameHintText, powerUpText, singlePauseButton
    ]);
    if (timerText) gameplayGroup.add(timerText);
    if (welcomeText) gameplayGroup.add(welcomeText);
    if (daddyCheerText) gameplayGroup.add(daddyCheerText);

    resetMovingBoxes(scene);
    currentHand = leftHand;
    scheduleNextSinglePowerUp(scene);
}

function switchHand(scene) {
    if (isGamePaused || !canSwitch || !potato || gameState !== 'playing') return;

    canSwitch = false;
    potatoInFlight = true;
    const target = currentHand === leftHand ? rightHand : leftHand;
    const throwBoost = Math.min(score * 4, 120);
    const throwPower = (activePowerUp && activePowerUp.type === 'freeze') ? 220 + throwBoost : 280 + throwBoost;

    potato.setVelocityX((target.x - potato.x) * 2.5);
    potato.setVelocityY(-throwPower);
    potato.setAngularVelocity((target === rightHand ? 1 : -1) * 150);
    currentHand = target;

    scene.time.delayedCall(220, () => { canSwitch = true; });
    playSfx('throw');
}

function onCatch(scene, hand) {
    if (gameState !== 'playing' || currentHand !== hand || !potato || !potatoInFlight) return;

    potatoInFlight = false;

    catchCount += 1;
    currentStreak += 1;
    maxStreak = Math.max(maxStreak, currentStreak);
    const comboMultiplier = getComboMultiplier();
    const powerMultiplier = activePowerUp && activePowerUp.type === 'double' ? 2 : 1;
    const gain = powerMultiplier * comboMultiplier;
    score += gain;

    applySingleDifficulty(scene);
    const difficulty = getSingleDifficultyConfig();
    const gravityBoost = Math.min(singleDifficultyLevel * 24, 160);
    const baseGravity = 560 + Math.min(score * 8, 220) + gravityBoost;
    scene.physics.world.gravity.y = Math.round(baseGravity * difficulty.gravityScale);

    scoreText.setText(`Score: ${score}`);
    updateStreakHud(scene);
    updateCatchZoneSizeForScore(scene);
    maybeEnableMovingBoxes(scene);
    maybeEnableSingleObstacles(scene);

    if (score > bestScore) {
        bestScore = score;
        bestText.setText(`Best: ${bestScore}`);
        if (!hasNewHighScoreThisRun) {
            hasNewHighScoreThisRun = true;
            playSfx('highscore');
        }
    }

    popText(scoreText, scene);
    popHand(hand, scene);
    burstSparkles(scene, hand.x, hand.y - 48);
    playSkinCatchEffect(scene, hand.x, hand.y - 48);
    showComboFeedback(scene, hand.x, hand.y - 82);
    if (currentStreak === 10 || currentStreak === 25 || currentStreak === 50) {
        scene.cameras.main.flash(110, 255, 245, 157, false);
    }
    vibrate(12);
    updateAchievements({
        score,
        catchCount,
        maxStreak,
        powerUpsCollected,
        difficulty: singleDifficultyMode,
        wonDaily: false
    });
    playSfx('catch');
    if (selectedPlayer === 'Daddy') {
        showDaddyCheer(scene, hand.x, hand.y - 90);
        burstSparkles(scene, hand.x, hand.y - 90, 18);
    }
}

function onDoubleCatch(scene, hand) {
    if (gameState !== 'playing' || !potato || !potatoInFlight) return;
    if (!activePowerUp || activePowerUp.type !== 'double') return;

    potatoInFlight = false;

    catchCount += 1;
    currentStreak += 1;
    maxStreak = Math.max(maxStreak, currentStreak);
    score += 2 * getComboMultiplier();

    const difficulty = getSingleDifficultyConfig();
    scene.physics.world.gravity.y = Math.round((560 + Math.min(score * 8, 220)) * difficulty.gravityScale);

    scoreText.setText(`Score: ${score}`);
    updateStreakHud(scene);
    updateCatchZoneSizeForScore(scene);
    maybeEnableSingleObstacles(scene);

    if (score > bestScore) {
        bestScore = score;
        bestText.setText(`Best: ${bestScore}`);
        if (!hasNewHighScoreThisRun) {
            hasNewHighScoreThisRun = true;
            playSfx('highscore');
        }
    }

    popText(scoreText, scene);
    popHand(hand, scene);
    burstSparkles(scene, hand.x, hand.y - 48);
    playSkinCatchEffect(scene, hand.x, hand.y - 48);
    showComboFeedback(scene, hand.x, hand.y - 82);
    vibrate(12);
    playSfx('catch');
    if (selectedPlayer === 'Daddy') {
        showDaddyCheer(scene, hand.x, hand.y - 90);
        burstSparkles(scene, hand.x, hand.y - 90, 18);
    }
}

function loseLife(scene) {
    if (gameState !== 'playing') return;
    currentStreak = 0;
    updateStreakHud(scene);
    if (singleShieldCharges > 0 && potato && currentHand) {
        singleShieldCharges = Math.max(0, singleShieldCharges - 1);
        potatoInFlight = false;
        canSwitch = true;
        potato.setVelocity(0);
        potato.setAngularVelocity(0);
        potato.setPosition(currentHand.x, currentHand.y - POTATO_Y_OFFSET);
        burstSparkles(scene, potato.x, potato.y, 14);
        if (powerUpText) {
            powerUpText.setText(`Shield saved you! (${singleShieldCharges})`);
            powerUpText.setAlpha(1);
            scene.tweens.killTweensOf(powerUpText);
            scene.tweens.add({ targets: powerUpText, alpha: 0, duration: 900, delay: 400 });
        }
        playSfx('power');
        return;
    }

    if (livesRemaining > 1 && potato && currentHand) {
        livesRemaining -= 1;
        if (livesText) livesText.setText(`Lives: ${livesRemaining}`);
        potatoInFlight = false;
        canSwitch = true;
        potato.setVelocity(0);
        potato.setAngularVelocity(0);
        potato.clearTint();
        potato.setPosition(currentHand.x, currentHand.y - POTATO_Y_OFFSET);
        scene.cameras.main.shake(140, 0.004);
        burstSparkles(scene, potato.x, potato.y, 10);
        if (powerUpText) {
            powerUpText.setText(`Life lost! ${livesRemaining} left`);
            powerUpText.setAlpha(1);
            scene.tweens.killTweensOf(powerUpText);
            scene.tweens.add({ targets: powerUpText, alpha: 0, duration: 900, delay: 600 });
        }
        playSfx('miss');
        return;
    }

    scene.cameras.main.shake(220, 0.007);
    vibrate([30, 40, 30]);
    playSfx('miss');
    finishGame(scene);
}

function finishGame(scene) {
    gameState = 'gameover';
    canSwitch = false;
    potatoInFlight = false;
    if (singlePowerSpawnEvent) {
        singlePowerSpawnEvent.remove(false);
        singlePowerSpawnEvent = null;
    }
    if (singlePowerUpGroup) {
        singlePowerUpGroup.clear(true, true);
        singlePowerUpGroup = null;
    }
    if (singleObstacleSpawnEvent) {
        singleObstacleSpawnEvent.remove(false);
        singleObstacleSpawnEvent = null;
    }
    if (singleObstacleGroup) {
        singleObstacleGroup.clear(true, true);
        singleObstacleGroup = null;
    }

    if (potato) {
        potato.setVelocity(0);
        potato.setAngularVelocity(0);
        potato.setTint(0xff8a80);
    }

    const dailyWon = dailyChallengeActive && score >= getDailyChallengeConfig().targetScore;
    saveLeaderboardEntry(selectedPlayer, score);
    const profileResult = updatePlayerProfile(selectedPlayer, {
        score,
        catches: catchCount,
        maxStreak,
        powerUps: powerUpsCollected,
        games: 1,
        wins: dailyWon ? 1 : 0,
        losses: dailyWon ? 0 : 1
    });
    const unlockedNow = updateAchievements({
        score,
        catchCount,
        maxStreak,
        powerUpsCollected,
        difficulty: singleDifficultyMode,
        wonDaily: dailyWon
    });
    const skinUnlock = updateSkinUnlocks(score, maxStreak, dailyWon);
    if (dailyChallengeActive) saveDailyChallengeScore(score);
    const leaderboard = getLeaderboard();
    bestScore = leaderboard.length > 0 ? leaderboard[0].score : bestScore;

    cleanupGroup('gameOverGroup');
    gameOverGroup = scene.add.group();

    const shade = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.22);
    const panel = createPanel(scene, GAME_WIDTH / 2, 330, 450, 590, 0xffffff, 0.97, 0xff7043);
    const title = scene.add.text(GAME_WIDTH / 2, 82, 'Great Try!', {
        fontSize: '46px',
        fill: '#e65100',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff3e0',
        strokeThickness: 7
    }).setOrigin(0.5);
    const dailyLine = dailyChallengeActive ? `Daily: ${dailyWon ? 'Complete' : `Target ${getDailyChallengeConfig().targetScore}`}` : `Rule: ${singleRuleMode}`;
    const newUnlocks = [...unlockedNow, ...skinUnlock.map((skin) => `${skin} skin`)].slice(0, 3);
    const unlockLine = newUnlocks.length ? `Unlocked: ${newUnlocks.join(', ')}` : '';
    const summary = scene.add.text(GAME_WIDTH / 2, 206, [
        `Player: ${selectedPlayer}`,
        `Score: ${score} | Best: ${bestScore}`,
        `Level ${profileResult.profile.level} ${profileResult.profile.title} | +${profileResult.xpGain} XP`,
        `Catches: ${catchCount} | Streak: ${maxStreak}`,
        `Power-ups: ${powerUpsCollected} | ${dailyLine}`,
        unlockLine
    ].filter(Boolean).join('\n'), {
        fontSize: '19px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS',
        lineSpacing: 6
    }).setOrigin(0.5);

    const missionTitle = scene.add.text(GAME_WIDTH / 2, 350, 'Missions', {
        fontSize: '27px',
        fill: '#00838f',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    const missionLines = getMissionResults({
        score,
        catchCount,
        maxStreak,
        powerUpsCollected,
        dailyWon
    }).map((mission) => `${mission.done ? 'Done' : 'Try'}: ${mission.label}`);
    const missions = scene.add.text(GAME_WIDTH / 2, 408, missionLines.join('\n'), {
        fontSize: '17px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS',
        lineSpacing: 8
    }).setOrigin(0.5);

    const replay = createButton(scene, GAME_WIDTH / 2, 520, 'Play Again', '#2e7d32', () => startActualGame(scene), 240, 26);
    const menu = createButton(scene, GAME_WIDTH / 2, 578, 'Main Menu', '#1565c0', () => showIntro(scene), 240, 26);

    gameOverGroup.addMultiple([shade, panel, title, summary, missionTitle, missions, replay, menu]);
    if (skinUnlock.length > 0) {
        showSkinUnlockPrompt(scene, skinUnlock[0]);
    }
    burstSparkles(scene, GAME_WIDTH / 2, 210, 26);
    clearPowerUp(scene, true);
    playSfx('win');
    dailyChallengeActive = false;
}

function startDualSetup(scene) {
    applyGameWidth(scene, DUAL_GAME_WIDTH);
    dualPlayerNames = { mouse: null, keyboard: null };
    showDualPlayerSelect(scene, 'mouse');
}

function showDualPlayerSelect(scene, slot) {
    applyGameWidth(scene, DUAL_GAME_WIDTH);
    cleanupGame(scene);
    cleanupDualGame(scene);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    cleanupGroup('dualPlayerSelectGroup');

    gameState = 'select';
    dualPlayerSelectGroup = scene.add.group();

    const isMouse = slot === 'mouse';
    const title = scene.add.text(GAME_WIDTH / 2, 150, isMouse ? 'Select Player 1' : 'Select Player 2', {
        fontSize: '46px',
        fill: isMouse ? '#006064' : '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const sub = scene.add.text(GAME_WIDTH / 2, 200, isMouse ? 'Player 1 uses Mouse/Touch' : 'Player 2 uses Keyboard', {
        fontSize: '22px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5);

    const players = ['Bryle', 'Prince', 'Josh', 'Guest'];
    const colors = ['#1976d2', '#00897b', '#f4511e', '#6d4c41'];
    const buttons = players.map((name, index) => {
        const y = 270 + index * 78;
        const isTaken = !isMouse && name !== 'Guest' && isDualNameTaken(name);
        const btn = createButton(
            scene,
            GAME_WIDTH / 2 + 35,
            y,
            isTaken ? `${name} picked` : name,
            isTaken ? '#90a4ae' : colors[index],
            () => {
                if (isTaken) return;
                if (name === 'Guest') {
                    showDualGuestRoleSelect(scene, slot);
                    return;
                }
                completeDualPlayerChoice(scene, slot, name);
            },
            220,
            30
        );
        if (isTaken) btn.setAlpha(0.62);
        const avatar = createAvatar(scene, getAvatarKey(name), GAME_WIDTH / 2 - 95, y, 0.2);
        if (isTaken) avatar.setAlpha(0.45);
        return [btn, avatar];
    }).flat();

    const backBtn = createButton(scene, GAME_WIDTH / 2, 590, 'Back', '#546e7a', () => showModeSelect(scene), 170, 24);
    dualPlayerSelectGroup.addMultiple([title, sub, ...buttons, backBtn]);
}

function showDualGuestRoleSelect(scene, slot) {
    applyGameWidth(scene, DUAL_GAME_WIDTH);
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    gameState = 'select';

    const isMouse = slot === 'mouse';
    dualGuestRoleGroup = scene.add.group();

    const title = scene.add.text(GAME_WIDTH / 2, 170, isMouse ? 'Player 1: Guest' : 'Player 2: Guest', {
        fontSize: '44px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const question = scene.add.text(GAME_WIDTH / 2, 245, 'Are you Mommy or Daddy?', {
        fontSize: '32px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const mommyTaken = !isMouse && isDualNameTaken('Mommy');
    const mommyAvatar = createAvatar(scene, 'avatar_mommy', GAME_WIDTH / 2 - 100, 340, 0.2);
    if (mommyTaken) mommyAvatar.setAlpha(0.45);
    const mommyBtn = createButton(scene, GAME_WIDTH / 2 + 35, 340, mommyTaken ? 'Mommy picked' : 'Mommy', mommyTaken ? '#90a4ae' : '#ad1457', () => {
        if (mommyTaken) return;
        completeDualPlayerChoice(scene, slot, 'Mommy');
    }, 220, 30);
    if (mommyTaken) mommyBtn.setAlpha(0.62);

    const daddyTaken = !isMouse && isDualNameTaken('Daddy');
    const daddyAvatar = createAvatar(scene, 'avatar_daddy', GAME_WIDTH / 2 - 100, 430, 0.2);
    if (daddyTaken) daddyAvatar.setAlpha(0.45);
    const daddyBtn = createButton(scene, GAME_WIDTH / 2 + 35, 430, daddyTaken ? 'Daddy picked' : 'Daddy', daddyTaken ? '#90a4ae' : '#6a1b9a', () => {
        if (daddyTaken) return;
        completeDualPlayerChoice(scene, slot, 'Daddy');
    }, 220, 30);
    if (daddyTaken) daddyBtn.setAlpha(0.62);

    const backBtn = createButton(scene, GAME_WIDTH / 2, 560, 'Back', '#546e7a', () => showDualPlayerSelect(scene, slot), 170, 24);
    dualGuestRoleGroup.addMultiple([title, question, mommyAvatar, mommyBtn, daddyAvatar, daddyBtn, backBtn]);
}

function completeDualPlayerChoice(scene, slot, name) {
    if (slot === 'keyboard' && isDualNameTaken(name)) {
        showDualPlayerSelect(scene, slot);
        return;
    }
    dualPlayerNames[slot] = name;
    if (slot === 'mouse') {
        showDualPlayerSelect(scene, 'keyboard');
        return;
    }
    startDualGame(scene, dualPlayerNames);
}

function isDualNameTaken(name) {
    return Object.values(dualPlayerNames || {}).includes(name);
}

function startDualGame(scene, names = { mouse: 'Mouse', keyboard: 'Keyboard' }) {
    applyGameWidth(scene, DUAL_GAME_WIDTH);
    cleanupGame(scene);
    cleanupDualGame(scene);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    clearPowerUp(scene, true);
    resetPauseState(scene);

    gameState = 'dual';
    const variant = getDualVariantConfig();
    dualRunStartMs = scene.time.now;
    dualLastPowerType = null;
    dualTimeDifficultyLevel = 0;
    dualFreezeStartedAt = null;
    dualFreezeTotalMs = 0;
    if (dualFreezeTimer) {
        dualFreezeTimer.remove(false);
        dualFreezeTimer = null;
    }
    ensureDualPowerIconTextures(scene);
    dualGroup = scene.add.group();
    dualResultGroup = null;
    dualPowerUpGroup = scene.add.group();
    dualPowerNoticeText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '', {
        fontSize: '20px',
        fill: '#5d4037',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#ffffff',
        strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    const divider = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, DUAL_PANEL_GAP, GAME_HEIGHT, 0xffffff, 0);
    const panelWidth = (GAME_WIDTH - DUAL_PANEL_GAP - DUAL_PANEL_MARGIN * 2) / 2;
    const panelHeight = GAME_HEIGHT - DUAL_PANEL_MARGIN * 2;
    const leftPanelX = DUAL_PANEL_MARGIN + panelWidth / 2;
    const rightPanelX = GAME_WIDTH - DUAL_PANEL_MARGIN - panelWidth / 2;
    const panelY = GAME_HEIGHT / 2;
    const leftPanel = scene.add.rectangle(leftPanelX, panelY, panelWidth, panelHeight, 0xffffff, 0.06);
    const rightPanel = scene.add.rectangle(rightPanelX, panelY, panelWidth, panelHeight, 0xffffff, 0.06);
    leftPanel.setStrokeStyle(DUAL_PANEL_BORDER, 0xffffff, 0.45);
    rightPanel.setStrokeStyle(DUAL_PANEL_BORDER, 0xffffff, 0.45);

    const mouseName = names?.mouse || 'Mouse';
    const keyboardName = names?.keyboard || 'Keyboard';

    const mousePortrait = createAvatar(scene, getAvatarKey(mouseName), leftPanelX - panelWidth / 2 + 26, 54, 0.2);
    const keyboardPortrait = createAvatar(scene, getAvatarKey(keyboardName), rightPanelX + panelWidth / 2 - 26, 54, 0.2);
    const mouseTitle = scene.add.text(leftPanelX - panelWidth / 2 + 64, 12, `${mouseName} (Mouse/Touch)`, {
        fontSize: '22px',
        fill: '#006064',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    });
    const keyboardTitle = scene.add.text(rightPanelX + panelWidth / 2 - 64, 12, `${keyboardName} (Space/Up)`, {
        fontSize: '22px',
        fill: '#4a148c',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(1, 0);
    const seriesText = scene.add.text(GAME_WIDTH / 2, 12, `${selectedDualVariant} - Round 1\n0 : 0`, {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#1565c0',
        strokeThickness: 4
    }).setOrigin(0.5, 0);
    dualPauseButton = createToggleButton(scene, GAME_WIDTH - 60, 44, 'Pause', '#6d4c41', () => togglePause(scene), 120, 20);
    const exitBtn = createButton(scene, GAME_WIDTH - 60, 92, 'Exit', '#546e7a', () => showIntro(scene), 120, 20);
    const variantTimerEnabled = selectedDualVariant === 'Timed Battle' || dualTimerEnabled;
    const variantTimerSeconds = selectedDualVariant === 'Timed Battle' ? 60 : dualTimerSeconds;
    dualTimerText = variantTimerEnabled
        ? scene.add.text(GAME_WIDTH / 2, 76, `Time: ${variantTimerSeconds}s`, {
            fontSize: '20px',
            fill: '#5d4037',
            fontFamily: 'Trebuchet MS',
            fontStyle: 'bold',
            backgroundColor: '#fff8e1',
            padding: { left: 8, right: 8, top: 3, bottom: 3 }
        }).setOrigin(0.5, 0)
        : null;

    dualMatch = {
        ended: false,
        round: 1,
        maxWins: variant.maxWins,
        targetScore: variant.targetScore,
        powerUpsEnabled: variant.powerUpsEnabled,
        chaosMode: variant.chaosMode,
        timerSeconds: variantTimerSeconds,
        timerEnabled: variantTimerEnabled,
        seriesText,
        powerGraceUntil: scene.time.now + 5000,
        mouse: createDualLanePlayer(scene, mouseName, '#00838f', {
            left: leftPanelX - panelWidth / 2 + DUAL_PANEL_BORDER,
            right: leftPanelX + panelWidth / 2 - DUAL_PANEL_BORDER,
            top: DUAL_PANEL_MARGIN + DUAL_PANEL_BORDER,
            bottom: GAME_HEIGHT - DUAL_PANEL_MARGIN - DUAL_PANEL_BORDER,
            centerX: leftPanelX
        }),
        keyboard: createDualLanePlayer(scene, keyboardName, '#6a1b9a', {
            left: rightPanelX - panelWidth / 2 + DUAL_PANEL_BORDER,
            right: rightPanelX + panelWidth / 2 - DUAL_PANEL_BORDER,
            top: DUAL_PANEL_MARGIN + DUAL_PANEL_BORDER,
            bottom: GAME_HEIGHT - DUAL_PANEL_MARGIN - DUAL_PANEL_BORDER,
            centerX: rightPanelX
        })
    };


    if (dualMatch.powerUpsEnabled) scheduleNextDualPowerUp(scene);

    dualGroup.addMultiple([
        leftPanel,
        rightPanel,
        divider,
        mousePortrait,
        keyboardPortrait,
        mouseTitle,
        keyboardTitle,
        seriesText,
        dualPauseButton,
        exitBtn,
        dualPowerNoticeText
    ]);
    if (dualTimerText) dualGroup.add(dualTimerText);
    updateDualSeriesHud();
}

function createDualLanePlayer(scene, label, accentColor, lane) {
    const laneLeft = lane.left;
    const laneRight = lane.right;
    const laneTop = lane.top;
    const laneBottom = lane.bottom;
    const laneCenterX = lane.centerX ?? (laneLeft + laneRight) / 2;
    const handOffsetX = Math.min(130, (laneRight - laneLeft) * 0.34);
    const handsY = laneBottom - 120;
    const leftHandX = laneCenterX - handOffsetX;
    const rightHandX = laneCenterX + handOffsetX;
    const isLeftLane = laneCenterX < GAME_WIDTH / 2;
    const player = {
        label,
        score: 0,
        totalScore: 0,
        wins: 0,
        canSwitch: true,
        inFlight: false,
        currentSide: 'left',
        topLimit: Math.max(laneTop, handsY - 170),
        missLimit: laneBottom - 2,
        shieldUntil: 0,
        shrinkUntil: 0,
        heavyUntil: 0,
        stunnedUntil: 0,
        doubleUntil: 0,
        minZoneWidth: BASE_CATCH_WIDTH,
        minZoneHeight: BASE_CATCH_HEIGHT,
        laneTop,
        laneBottom,
        laneLeft,
        laneRight,
        baseLeftX: leftHandX,
        baseRightX: rightHandX,
        baseHandsY: handsY,
        leftX: leftHandX,
        rightX: rightHandX,
        handOffsetLeftX: 0,
        handOffsetLeftY: 0,
        handOffsetRightX: 0,
        handOffsetRightY: 0
    };

    player.leftHand = scene.physics.add.staticImage(leftHandX, handsY, 'hand').setScale(0.34);
    player.rightHand = scene.physics.add.staticImage(rightHandX, handsY, 'hand').setScale(0.34);
    player.leftHand.refreshBody();
    player.rightHand.refreshBody();

    player.leftZone = scene.add.rectangle(leftHandX, handsY + 14, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.18);
    player.leftZone.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(accentColor).color, 0.75);
    scene.physics.add.existing(player.leftZone, false);
    player.leftZone.body.setAllowGravity(false);
    player.leftZone.body.setImmovable(true);

    player.rightZone = scene.add.rectangle(rightHandX, handsY + 14, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.18);
    player.rightZone.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(accentColor).color, 0.75);
    scene.physics.add.existing(player.rightZone, false);
    player.rightZone.body.setAllowGravity(false);
    player.rightZone.body.setImmovable(true);

    player.potato = scene.physics.add.image(leftHandX, handsY - POTATO_Y_OFFSET, 'potato').setDisplaySize(POTATO_GAME_SIZE, POTATO_GAME_SIZE);
    player.potato.setCollideWorldBounds(true);
    player.potato.body.setBoundsRectangle(new Phaser.Geom.Rectangle(laneLeft, laneTop, laneRight - laneLeft, laneBottom - laneTop));
    player.potato.setBounce(0.85, 0.05);
    player.potato.setAngularDrag(80);
    player.potato.setVelocity(0);

    player.leftCollider = scene.physics.add.collider(player.potato, player.leftZone, () => onDualCatch(scene, player, 'left'));
    player.rightCollider = scene.physics.add.collider(player.potato, player.rightZone, () => onDualCatch(scene, player, 'right'));

    const hudY = 96;
    const hudX = isLeftLane ? laneLeft + 12 : laneRight - 12;
    const hudOriginX = isLeftLane ? 0 : 1;
    player.scoreText = scene.add.text(hudX, hudY, `${label}: 0`, {
        fontSize: '24px',
        fill: accentColor,
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(hudOriginX, 0.5);
    player.effectText = scene.add.text(hudX, hudY + 24, '', {
        fontSize: '16px',
        fill: '#37474f',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(hudOriginX, 0.5);

    dualGroup.addMultiple([
        player.leftZone,
        player.rightZone,
        player.leftHand,
        player.rightHand,
        player.potato,
        player.scoreText,
        player.effectText
    ]);

    return player;
}

function switchDualHand(scene, controlKey) {
    if (isGamePaused) return;
    if (!dualMatch || dualMatch.ended) return;
    const player = controlKey === 'mouse' ? dualMatch.mouse : dualMatch.keyboard;
    if (!player || !player.canSwitch) return;
    if (scene.time.now < player.stunnedUntil) return;

    player.canSwitch = false;
    player.inFlight = true;
    const targetSide = player.currentSide === 'left' ? 'right' : 'left';
    const targetX = targetSide === 'left' ? player.leftX : player.rightX;
    const throwBoost = Math.min(player.score * 4, 120);
    const throwPenalty = scene.time.now < player.heavyUntil ? 90 : 0;
    const throwPower = Math.max(170, 280 + throwBoost - throwPenalty);

    player.potato.setVelocityX((targetX - player.potato.x) * 2.5);
    player.potato.setVelocityY(-throwPower);
    player.potato.setAngularVelocity((targetSide === 'right' ? 1 : -1) * 150);
    player.currentSide = targetSide;
    playSfx('throw');

    scene.time.delayedCall(220, () => {
        if (!dualMatch || dualMatch.ended) return;
        player.canSwitch = true;
    });
}

function onDualCatch(scene, player, side) {
    if (!dualMatch || dualMatch.ended) return;
    if (!player.inFlight || player.currentSide !== side) return;

    player.inFlight = false;
    const gain = scene.time.now < player.doubleUntil ? 2 : 1;
    player.score += gain;
    player.totalScore += gain;
    player.scoreText.setText(`${player.label}: ${player.score}`);
    updateDualCatchZoneSize(scene, player);
    popText(player.scoreText, scene);
    burstSparkles(scene, side === 'left' ? player.leftX : player.rightX, player.leftHand.y - 48, 10);
    playSfx('catch');
    if (dualMatch.targetScore && player.score >= dualMatch.targetScore) {
        const opponent = player === dualMatch.mouse ? dualMatch.keyboard : dualMatch.mouse;
        finishDualRound(scene, opponent.label, `could not reach ${dualMatch.targetScore} first`, 'target');
    }
}

function updateDual(scene, delta = 16) {
    if (!dualMatch || dualMatch.ended) return;

    applyDualTimeDifficulty(scene);
    enforceDualLaneBounds(dualMatch.mouse);
    enforceDualLaneBounds(dualMatch.keyboard);
    updateDualPlayerEffects(scene, dualMatch.mouse);
    updateDualPlayerEffects(scene, dualMatch.keyboard);
    updateDualPowerUps(scene, delta);

    const mouseMissed = hasDualPlayerMissed(dualMatch.mouse);
    const keyboardMissed = hasDualPlayerMissed(dualMatch.keyboard);

    if (mouseMissed || keyboardMissed) {
        finishDualRound(scene, mouseMissed ? dualMatch.mouse.label : dualMatch.keyboard.label);
    }
}

function enforceDualLaneBounds(player) {
    if (!player?.potato?.active || !player.potato.body) return;
    const body = player.potato.body;
    const radiusX = (body.width || 20) / 2;
    const minX = player.laneLeft + radiusX;
    const maxX = player.laneRight - radiusX;
    if (player.potato.x < minX) {
        player.potato.x = minX;
        body.velocity.x = Math.max(0, body.velocity.x);
    } else if (player.potato.x > maxX) {
        player.potato.x = maxX;
        body.velocity.x = Math.min(0, body.velocity.x);
    }
}

function hasDualPlayerMissed(player) {
    if (!player?.potato?.active) return false;
    const body = player.potato.body;
    if (!body) return false;

    const halfH = (body.height || 20) / 2;
    const laneBottomY = player.laneBottom - halfH - 1;
    return player.potato.y >= laneBottomY;
}

function updateDualCatchZoneSize(scene, player) {
    const { baseWidth, baseHeight } = getDualBaseZoneSize(player);
    const hasShrink = scene.time.now < player.shrinkUntil;
    const boxScale = hasShrink ? 0.7 : 1;
    const targetWidth = Math.max(MIN_CATCH_WIDTH, baseWidth * boxScale);
    const targetHeight = Math.max(MIN_CATCH_HEIGHT, baseHeight * boxScale);
    player.minZoneWidth = Math.max(MIN_CATCH_WIDTH, Math.min(player.minZoneWidth, targetWidth));
    player.minZoneHeight = Math.max(MIN_CATCH_HEIGHT, Math.min(player.minZoneHeight, targetHeight));
    const nextWidth = player.minZoneWidth;
    const nextHeight = player.minZoneHeight;

    player.leftZone.setSize(nextWidth, nextHeight);
    player.rightZone.setSize(nextWidth, nextHeight);
    player.leftZone.setDisplaySize(nextWidth, nextHeight);
    player.rightZone.setDisplaySize(nextWidth, nextHeight);
    player.leftZone.body.setSize(nextWidth, nextHeight, true);
    player.rightZone.body.setSize(nextWidth, nextHeight, true);
}

function getDualBaseZoneSize(player) {
    const widthShrink = player.score * (CATCH_SHRINK_PER_SCORE + player.score * 0.03);
    const heightShrink = player.score * (0.9 + player.score * 0.01);
    const levelWidthShrink = dualTimeDifficultyLevel * 6;
    const levelHeightShrink = dualTimeDifficultyLevel * 1.2;
    const baseWidth = Math.max(MIN_CATCH_WIDTH, BASE_CATCH_WIDTH - widthShrink - levelWidthShrink);
    const baseHeight = Math.max(MIN_CATCH_HEIGHT, BASE_CATCH_HEIGHT - heightShrink - levelHeightShrink);
    return { baseWidth, baseHeight };
}

function scheduleNextDualPowerUp(scene) {
    if (!dualMatch || dualMatch.ended || !dualPowerUpGroup || !dualMatch.powerUpsEnabled) return;
    if (dualPowerSpawnEvent) {
        dualPowerSpawnEvent.remove(false);
        dualPowerSpawnEvent = null;
    }
    const minDelay = dualMatch.chaosMode ? 2600 : 6000;
    const maxDelay = dualMatch.chaosMode ? 5200 : 10000;
    dualPowerSpawnEvent = scene.time.delayedCall(Phaser.Math.Between(minDelay, maxDelay), () => {
        spawnDualPowerUp(scene);
        scheduleNextDualPowerUp(scene);
    });
}

function spawnDualPowerUp(scene) {
    if (!dualPowerUpGroup || !dualMatch || dualMatch.ended) return;
    const type = pickDualPowerType(scene);
    const spec = getDualPowerSpec(type);
    if (!spec) return;

    const item = scene.add.image(Phaser.Math.Between(34, GAME_WIDTH - 34), -20, spec.texture);
    item.setDisplaySize(30, 30);
    item.setAlpha(0.98);
    item.setData('fallSpeed', Phaser.Math.Between(155, 205));
    item.setData('type', type);
    item.setData('spawnMs', scene.time.now);
    item.setData('collected', false);
    dualPowerUpGroup.add(item);
    if (dualGroup) dualGroup.add(item);
}

function updateDualPowerUps(scene, delta) {
    if (!dualPowerUpGroup) return;
    dualPowerUpGroup.getChildren().forEach((item) => {
        if (!item?.active) return;
        const speed = item.getData('fallSpeed') || 170;
        item.y += speed * (delta / 1000);

        const tooOld = scene.time.now - (item.getData('spawnMs') || scene.time.now) > 7000;
        if (item.y > GAME_HEIGHT + 30 || tooOld) {
            item.destroy();
            return;
        }

        const collector = getDualPowerCollector(item);
        if (collector) collectDualPowerUp(scene, item, collector);
    });
}

function getDualPowerCollector(item) {
    if (!dualMatch || !item?.active) return null;
    const ib = item.getBounds();

    const mousePotato = dualMatch.mouse?.potato;
    const keyboardPotato = dualMatch.keyboard?.potato;
    const mouseHits = !!mousePotato?.active && Phaser.Geom.Intersects.RectangleToRectangle(ib, mousePotato.getBounds());
    const keyboardHits = !!keyboardPotato?.active && Phaser.Geom.Intersects.RectangleToRectangle(ib, keyboardPotato.getBounds());

    if (mouseHits && keyboardHits) {
        const mouseDist = Phaser.Math.Distance.Between(item.x, item.y, mousePotato.x, mousePotato.y);
        const keyboardDist = Phaser.Math.Distance.Between(item.x, item.y, keyboardPotato.x, keyboardPotato.y);
        return mouseDist <= keyboardDist ? dualMatch.mouse : dualMatch.keyboard;
    }
    if (mouseHits) return dualMatch.mouse;
    if (keyboardHits) return dualMatch.keyboard;

    return null;
}

function collectDualPowerUp(scene, item, collector) {
    if (!item?.active || !collector || !dualMatch || dualMatch.ended) return;
    if (item.getData('collected')) return;

    item.setData('collected', true);
    const type = item.getData('type');
    showDualPowerPickupPopup(scene, collector, type);
    item.destroy();
    applyDualPowerEffect(scene, collector, type);
}

function applyDualPowerEffect(scene, collector, type) {
    const now = scene.time.now;
    const opponent = collector === dualMatch.mouse ? dualMatch.keyboard : dualMatch.mouse;
    const attackerName = collector.label;
    const defenderName = opponent.label;

    if (type === DUAL_POWER_TYPES.SHIELD) {
        collector.shieldUntil = Math.max(collector.shieldUntil, now + 5000);
        showDualPowerNotice(scene, `${attackerName} got Shield (5s)`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.BIGBOX) {
        collector.shieldUntil = Math.max(collector.shieldUntil, now + 5000);
        showDualPowerNotice(scene, `${attackerName} converted to Shield (5s)`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.SHRINK_UP) {
        const { baseWidth, baseHeight } = getDualBaseZoneSize(collector);
        collector.shrinkUntil = 0;
        collector.minZoneWidth = Math.min(baseWidth, collector.minZoneWidth + 34);
        collector.minZoneHeight = Math.min(baseHeight, collector.minZoneHeight + 12);
        updateDualCatchZoneSize(scene, collector);
        showDualPowerNotice(scene, `${attackerName} got Shrink Up`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.DOUBLE) {
        collector.doubleUntil = Math.max(collector.doubleUntil, now + 5000);
        showDualPowerNotice(scene, `${attackerName} got Double Score (5s)`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.FREEZE) {
        startDualFreeze(scene, 5000);
        showDualPowerNotice(scene, `${attackerName} froze time (5s)`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.STUN) {
        collector.stunnedUntil = Math.max(collector.stunnedUntil, now + 1200);
        collector.canSwitch = false;
        scene.time.delayedCall(1200, () => {
            if (!collector || !collector.leftHand?.active) return;
            collector.canSwitch = true;
        });
        showDualPowerNotice(scene, `${attackerName} hit a trap: Stunned`);
        playSfx('miss');
        return;
    }

    if (now < dualMatch.powerGraceUntil) {
        showDualPowerNotice(scene, 'Harmful effect blocked: opening grace period');
        return;
    }

    if (scene.time.now < opponent.shieldUntil) {
        opponent.shieldUntil = 0;
        showDualPowerNotice(scene, `${defenderName} blocked with Shield`);
        playSfx('click');
        return;
    }

    if (type === DUAL_POWER_TYPES.SHRINK) {
        if (hasActiveDualDebuff(scene, opponent)) {
            collector.shieldUntil = Math.max(collector.shieldUntil, now + 3000);
            showDualPowerNotice(scene, `${defenderName} resisted. ${attackerName} gets Shield`);
            return;
        }
        opponent.shrinkUntil = Math.max(opponent.shrinkUntil, now + 5000);
        updateDualCatchZoneSize(scene, opponent);
        showDualPowerNotice(scene, `${attackerName} shrank ${defenderName}'s catch zone`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.HEAVY) {
        if (hasActiveDualDebuff(scene, opponent)) {
            collector.shieldUntil = Math.max(collector.shieldUntil, now + 3000);
            showDualPowerNotice(scene, `${defenderName} resisted. ${attackerName} gets Shield`);
            return;
        }
        opponent.heavyUntil = Math.max(opponent.heavyUntil, now + 5000);
        showDualPowerNotice(scene, `${attackerName} made ${defenderName}'s potato heavy`);
        playSfx('power');
        return;
    }

    if (type === DUAL_POWER_TYPES.LASER) {
        if (hasActiveDualDebuff(scene, opponent)) {
            collector.shieldUntil = Math.max(collector.shieldUntil, now + 3000);
            showDualPowerNotice(scene, `${defenderName} resisted laser chain`);
            return;
        }
        fireDualLaser(scene, collector, opponent);
    }
}

function fireDualLaser(scene, collector, opponent) {
    const y = opponent.leftHand.y - 54;
    const beam = scene.add.rectangle(GAME_WIDTH / 2, y, GAME_WIDTH - 26, 10, 0xff1744, 0.9);
    beam.setStrokeStyle(2, 0xffffff, 0.95);
    dualGroup.add(beam);

    showDualPowerNotice(scene, `${collector.label} fired LASER at ${opponent.label}`);
    playSfx('power');

    scene.time.delayedCall(180, () => {
        if (!opponent?.potato?.active) return;
        opponent.potato.setVelocityY(Math.max(opponent.potato.body.velocity.y, 430));
        opponent.heavyUntil = Math.max(opponent.heavyUntil, scene.time.now + 1500);
    });
    scene.time.delayedCall(320, () => beam.destroy());
}

function hasActiveDualDebuff(scene, player) {
    return scene.time.now < player.shrinkUntil || scene.time.now < player.heavyUntil;
}

function updateDualPlayerEffects(scene, player) {
    updateDualCatchZoneSize(scene, player);
    const leftMs = Math.max(0, player.shieldUntil - scene.time.now);
    const shrinkMs = Math.max(0, player.shrinkUntil - scene.time.now);
    const heavyMs = Math.max(0, player.heavyUntil - scene.time.now);
    const stunMs = Math.max(0, player.stunnedUntil - scene.time.now);
    const doubleMs = Math.max(0, player.doubleUntil - scene.time.now);

    const effects = [];
    if (leftMs > 0) effects.push(`Shield ${Math.ceil(leftMs / 1000)}s`);
    if (shrinkMs > 0) effects.push(`Shrunk ${Math.ceil(shrinkMs / 1000)}s`);
    if (heavyMs > 0) effects.push(`Heavy ${Math.ceil(heavyMs / 1000)}s`);
    if (stunMs > 0) effects.push(`Stun ${Math.ceil(stunMs / 1000)}s`);
    if (doubleMs > 0) effects.push(`Double ${Math.ceil(doubleMs / 1000)}s`);
    const nextEffectText = effects.join(' | ');
    if (player.effectText.text !== nextEffectText) {
        player.effectText.setText(nextEffectText);
    }
}

function showDualPowerNotice(scene, text) {
    if (!dualPowerNoticeText) return;
    dualPowerNoticeText.setText(text);
    dualPowerNoticeText.setAlpha(1);
    scene.tweens.killTweensOf(dualPowerNoticeText);
    scene.tweens.add({
        targets: dualPowerNoticeText,
        alpha: 0,
        duration: 1400
    });
}

function getDualElapsedMs(scene) {
    const now = scene.time.now;
    const freezeHoldMs = dualFreezeStartedAt ? now - dualFreezeStartedAt : 0;
    return Math.max(0, now - dualRunStartMs - dualFreezeTotalMs - freezeHoldMs);
}

function startDualFreeze(scene, durationMs = 5000) {
    if (dualFreezeTimer) {
        dualFreezeTimer.remove(false);
        dualFreezeTimer = null;
    }
    if (!dualFreezeStartedAt) {
        dualFreezeStartedAt = scene.time.now;
    }
    if (dualHandMoveEvent) dualHandMoveEvent.paused = true;
    dualFreezeTimer = scene.time.delayedCall(durationMs, () => {
        if (!dualFreezeStartedAt) return;
        dualFreezeTotalMs += scene.time.now - dualFreezeStartedAt;
        dualFreezeStartedAt = null;
        if (dualHandMoveEvent) dualHandMoveEvent.paused = false;
        dualFreezeTimer = null;
        refreshDualHandMoveEvent(scene);
    });
}

function getDualTimeDifficultyLevel(elapsedSec) {
    if (elapsedSec < DUAL_TIME_MOVE_TRIGGER_SEC) return 0;
    return Math.floor((elapsedSec - DUAL_TIME_MOVE_TRIGGER_SEC) / DUAL_TIME_LEVEL_STEP_SEC) + 1;
}

function applyDualTimeDifficulty(scene) {
    if (!dualMatch) return;
    const elapsedSec = Math.max(0, Math.floor(getDualElapsedMs(scene) / 1000));
    const nextLevel = getDualTimeDifficultyLevel(elapsedSec);
    if (nextLevel === dualTimeDifficultyLevel) return;
    dualTimeDifficultyLevel = nextLevel;
    const gravityBoost = Math.min(dualTimeDifficultyLevel * 24, 160);
    scene.physics.world.gravity.y = 560 + gravityBoost;
    refreshDualHandMoveEvent(scene);
}

function getDualHandMoveSettings() {
    const level = dualTimeDifficultyLevel;
    return {
        interval: Math.max(240, DUAL_HAND_MOVE_INTERVAL_MS - level * 40),
        maxOffsetX: Math.min(80, DUAL_HAND_MOVE_MAX_OFFSET_X + level * 7),
        maxOffsetY: Math.min(26, DUAL_HAND_MOVE_MAX_OFFSET_Y + level * 3)
    };
}

function updateDualHandPositions(player) {
    if (!player) return;
    player.leftX = player.baseLeftX + player.handOffsetLeftX;
    player.rightX = player.baseRightX + player.handOffsetRightX;
    const baseY = player.baseHandsY ?? player.leftHand.y;
    player.leftHand.setPosition(player.leftX, baseY + player.handOffsetLeftY);
    player.rightHand.setPosition(player.rightX, baseY + player.handOffsetRightY);
    player.leftHand.refreshBody();
    player.rightHand.refreshBody();
    player.leftZone.setPosition(player.leftX, player.leftHand.y + 14);
    player.rightZone.setPosition(player.rightX, player.rightHand.y + 14);
    player.leftZone.body?.updateFromGameObject();
    player.rightZone.body?.updateFromGameObject();
}

function refreshDualHandMoveEvent(scene) {
    if (dualHandMoveEvent) {
        dualHandMoveEvent.remove(false);
        dualHandMoveEvent = null;
    }
    if (dualTimeDifficultyLevel <= 0) return;
    const { interval } = getDualHandMoveSettings();
    dualHandMoveEvent = scene.time.addEvent({
        delay: interval,
        loop: true,
        callback: () => {
            const { maxOffsetX, maxOffsetY } = getDualHandMoveSettings();
            [dualMatch?.mouse, dualMatch?.keyboard].forEach((player) => {
                if (!player) return;
                player.handOffsetLeftX = Phaser.Math.Between(-maxOffsetX, maxOffsetX);
                player.handOffsetRightX = Phaser.Math.Between(-maxOffsetX, maxOffsetX);
                player.handOffsetLeftY = Phaser.Math.Between(-maxOffsetY, maxOffsetY);
                player.handOffsetRightY = Phaser.Math.Between(-maxOffsetY, maxOffsetY);
                updateDualHandPositions(player);
            });
        }
    });
}

function pickDualPowerType(scene) {
    const roll = Phaser.Math.FloatBetween(0, 1);
    let bucket = 'attack';
    const elapsedSec = Math.max(0, Math.floor(getDualElapsedMs(scene) / 1000));
    const level = getDualTimeDifficultyLevel(elapsedSec);
    const boostChance = Math.max(0.16, 0.3 - level * 0.03);
    const trapChance = Math.min(0.5, 0.2 + level * 0.04);
    if (roll < boostChance) bucket = 'boost';
    else if (roll < boostChance + trapChance) bucket = 'trap';

    let type;
    if (bucket === 'boost') {
        const boostRoll = Phaser.Math.FloatBetween(0, 1);
        if (boostRoll < 0.35) type = DUAL_POWER_TYPES.SHIELD;
        else if (boostRoll < 0.6) type = DUAL_POWER_TYPES.SHRINK_UP;
        else if (boostRoll < 0.8) type = DUAL_POWER_TYPES.DOUBLE;
        else type = DUAL_POWER_TYPES.FREEZE;
    } else if (bucket === 'trap') {
        type = DUAL_POWER_TYPES.STUN;
    } else {
        const rareRoll = Phaser.Math.FloatBetween(0, 1);
        const laserChance = Math.min(0.28, 0.05 + level * 0.04);
        if (rareRoll < laserChance) type = DUAL_POWER_TYPES.LASER;
        else if (rareRoll < 0.55) type = DUAL_POWER_TYPES.SHRINK;
        else type = DUAL_POWER_TYPES.HEAVY;
    }

    if (type === dualLastPowerType) {
        if (type === DUAL_POWER_TYPES.SHIELD) type = DUAL_POWER_TYPES.SHRINK_UP;
        else if (type === DUAL_POWER_TYPES.SHRINK_UP) type = DUAL_POWER_TYPES.SHIELD;
        else type = DUAL_POWER_TYPES.SHIELD;
    }
    dualLastPowerType = type;
    return type;
}

function getDualPowerSpec(type) {
    if (type === DUAL_POWER_TYPES.SHIELD) return { texture: 'pup_shield' };
    if (type === DUAL_POWER_TYPES.BIGBOX) return { texture: 'pup_bigbox' };
    if (type === DUAL_POWER_TYPES.SHRINK_UP) return { texture: 'pup_shrinkup' };
    if (type === DUAL_POWER_TYPES.SHRINK) return { texture: 'pup_shrink' };
    if (type === DUAL_POWER_TYPES.HEAVY) return { texture: 'pup_heavy' };
    if (type === DUAL_POWER_TYPES.STUN) return { texture: 'pup_stun' };
    if (type === DUAL_POWER_TYPES.LASER) return { texture: 'pup_laser' };
    if (type === DUAL_POWER_TYPES.DOUBLE) return { texture: 'pup_double' };
    if (type === DUAL_POWER_TYPES.FREEZE) return { texture: 'pup_freeze' };
    return null;
}

function getDualPowerLabel(type) {
    if (type === DUAL_POWER_TYPES.SHIELD) return 'Shield';
    if (type === DUAL_POWER_TYPES.BIGBOX) return 'BigBox';
    if (type === DUAL_POWER_TYPES.SHRINK_UP) return 'Shrink Up';
    if (type === DUAL_POWER_TYPES.SHRINK) return 'Shrink';
    if (type === DUAL_POWER_TYPES.HEAVY) return 'Heavy';
    if (type === DUAL_POWER_TYPES.STUN) return 'Stun Trap';
    if (type === DUAL_POWER_TYPES.LASER) return 'Laser';
    if (type === DUAL_POWER_TYPES.DOUBLE) return 'Double';
    if (type === DUAL_POWER_TYPES.FREEZE) return 'Freeze';
    return 'Power-Up';
}

function showDualPowerPickupPopup(scene, collector, type) {
    if (!collector?.potato?.active) return;
    const label = getDualPowerLabel(type);
    const popup = scene.add.text(collector.potato.x, collector.potato.y - 28, label, {
        fontSize: '18px',
        fill: '#fffde7',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        stroke: '#1b5e20',
        strokeThickness: 4
    }).setOrigin(0.5);

    if (dualGroup) dualGroup.add(popup);
    scene.tweens.add({
        targets: popup,
        y: popup.y - 24,
        alpha: 0,
        duration: 1000,
        ease: 'Sine.easeOut',
        onComplete: () => popup.destroy()
    });
}

function ensureDualPowerIconTextures(scene) {
    const build = (key, bgColor, drawSymbol) => {
        if (scene.textures.exists(key)) return;
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(bgColor, 1);
        g.fillCircle(16, 16, 15);
        g.lineStyle(2, 0xffffff, 0.95);
        g.strokeCircle(16, 16, 14);
        drawSymbol(g);
        g.generateTexture(key, 32, 32);
        g.destroy();
    };

    build('pup_shield', 0x42a5f5, (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillPoints([
            new Phaser.Geom.Point(16, 8),
            new Phaser.Geom.Point(23, 11),
            new Phaser.Geom.Point(22, 19),
            new Phaser.Geom.Point(16, 24),
            new Phaser.Geom.Point(10, 19),
            new Phaser.Geom.Point(9, 11)
        ], true);
    });

    build('pup_bigbox', 0x66bb6a, (g) => {
        g.lineStyle(3, 0xffffff, 1);
        g.strokeRect(9, 9, 14, 14);
        g.lineBetween(6, 16, 9, 16);
        g.lineBetween(23, 16, 26, 16);
        g.lineBetween(16, 6, 16, 9);
        g.lineBetween(16, 23, 16, 26);
    });

    build('pup_shrinkup', 0x7cb342, (g) => {
        g.lineStyle(3, 0xffffff, 1);
        g.strokeRect(10, 10, 12, 12);
        g.lineBetween(6, 16, 9, 16);
        g.lineBetween(23, 16, 26, 16);
        g.lineBetween(16, 6, 16, 9);
        g.lineBetween(16, 23, 16, 26);
    });

    build('pup_shrink', 0xef5350, (g) => {
        g.lineStyle(3, 0xffffff, 1);
        g.strokeRect(9, 9, 14, 14);
        g.lineBetween(11, 16, 14, 16);
        g.lineBetween(21, 16, 18, 16);
        g.lineBetween(16, 11, 16, 14);
        g.lineBetween(16, 21, 16, 18);
    });

    build('pup_heavy', 0x8d6e63, (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillRect(10, 14, 12, 4);
        g.fillRect(7, 12, 3, 8);
        g.fillRect(22, 12, 3, 8);
    });

    build('pup_stun', 0xffb300, (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillPoints([
            new Phaser.Geom.Point(18, 7),
            new Phaser.Geom.Point(12, 16),
            new Phaser.Geom.Point(17, 16),
            new Phaser.Geom.Point(13, 25),
            new Phaser.Geom.Point(21, 14),
            new Phaser.Geom.Point(16, 14)
        ], true);
    });

    build('pup_double', 0xff7043, (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillRect(9, 11, 14, 4);
        g.fillRect(9, 17, 14, 4);
    });

    build('pup_freeze', 0x29b6f6, (g) => {
        g.lineStyle(3, 0xffffff, 1);
        g.lineBetween(9, 16, 23, 16);
        g.lineBetween(16, 9, 16, 23);
    });

    build('pup_laser', 0xd500f9, (g) => {
        g.lineStyle(2, 0xffffff, 1);
        g.strokeCircle(16, 16, 7);
        g.lineBetween(5, 16, 27, 16);
        g.lineBetween(16, 5, 16, 27);
    });
}

function finishDualRound(scene, loserLabel, reasonText = 'missed the catch', outcomeMode = 'fall') {
    if (!dualMatch || dualMatch.ended) return;
    dualMatch.ended = true;
    if (dualPowerSpawnEvent) {
        dualPowerSpawnEvent.remove(false);
        dualPowerSpawnEvent = null;
    }
    if (dualPowerUpGroup) {
        dualPowerUpGroup.clear(true, true);
    }

    const mouse = dualMatch.mouse;
    const keyboard = dualMatch.keyboard;
    let winner;
    let loser;

    if (outcomeMode === 'timer') {
        if (mouse.score > keyboard.score) {
            winner = mouse;
            loser = keyboard;
        } else if (keyboard.score > mouse.score) {
            winner = keyboard;
            loser = mouse;
        } else {
            const mouseY = mouse.potato?.y ?? 0;
            const keyboardY = keyboard.potato?.y ?? 0;
            loser = mouseY > keyboardY ? mouse : keyboard;
            winner = loser === mouse ? keyboard : mouse;
        }
    } else if (loserLabel) {
        loser = loserLabel === mouse.label ? mouse : keyboard;
        winner = loser === mouse ? keyboard : mouse;
    } else {
        const mouseY = mouse.potato?.y ?? 0;
        const keyboardY = keyboard.potato?.y ?? 0;
        loser = mouseY > keyboardY ? mouse : keyboard;
        winner = loser === mouse ? keyboard : mouse;
    }
    winner.wins += 1;
    playSfx('win');

    if (dualMatch.mouse.potato) dualMatch.mouse.potato.setVelocity(0);
    if (dualMatch.keyboard.potato) dualMatch.keyboard.potato.setVelocity(0);

    dualResultGroup = scene.add.group();
    const panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 320, 0xffffff, 0.95);
    panel.setStrokeStyle(4, 0xff7043, 1);
    const title = scene.add.text(GAME_WIDTH / 2, 245, `${winner.label} wins Round ${dualMatch.round}!`, {
        fontSize: '50px',
        fill: '#e65100',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff3e0',
        strokeThickness: 6
    }).setOrigin(0.5);
    const scoreLine = `Scores: ${mouse.label} ${mouse.score} - ${keyboard.score} ${keyboard.label}`;
    const endLine = reasonText
        ? (loserLabel ? `Round ended: ${loserLabel} ${reasonText}` : `Round ended: ${reasonText}`)
        : '';
    const infoLines = [scoreLine, endLine, `Series: ${dualMatch.mouse.wins} - ${dualMatch.keyboard.wins}`].filter(Boolean);
    const info = scene.add.text(GAME_WIDTH / 2, 302, infoLines.join('\n'), {
        fontSize: '24px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5);

    if (winner.wins >= dualMatch.maxWins) {
        const nextBtn = createButton(scene, GAME_WIDTH / 2, 380, 'See Series Result', '#2e7d32', () => endDualSeries(scene, winner, loser), 280, 26);
        const menu = createButton(scene, GAME_WIDTH / 2, 430, 'Main Menu', '#1565c0', () => showIntro(scene), 240, 24);
        dualResultGroup.addMultiple([panel, title, info, nextBtn, menu]);
    } else {
        const nextRound = createButton(scene, GAME_WIDTH / 2, 380, 'Next Round', '#2e7d32', () => prepareNextDualRound(scene), 240, 26);
        const menu = createButton(scene, GAME_WIDTH / 2, 430, 'Main Menu', '#1565c0', () => showIntro(scene), 240, 24);
        dualResultGroup.addMultiple([panel, title, info, nextRound, menu]);
    }
}

function prepareNextDualRound(scene) {
    if (!dualMatch) return;
    if (dualResultGroup) {
        dualResultGroup.destroy(true);
        dualResultGroup = null;
    }

    dualMatch.round += 1;
    dualRunStartMs = scene.time.now;
    dualMatch.powerGraceUntil = scene.time.now + 5000;
    resetDualPlayerForRound(scene, dualMatch.mouse);
    resetDualPlayerForRound(scene, dualMatch.keyboard);
    dualMatch.ended = false;
    if (dualMatch.powerUpsEnabled) scheduleNextDualPowerUp(scene);
    updateDualSeriesHud();
}

function resetDualPlayerForRound(scene, player) {
    if (!player) return;
    player.score = 0;
    player.canSwitch = true;
    player.inFlight = false;
    player.currentSide = 'left';
    player.shieldUntil = 0;
    player.shrinkUntil = 0;
    player.heavyUntil = 0;
    player.stunnedUntil = 0;
    player.doubleUntil = 0;
    player.minZoneWidth = BASE_CATCH_WIDTH;
    player.minZoneHeight = BASE_CATCH_HEIGHT;
    if (player.leftHand) player.potato.setPosition(player.leftHand.x, player.leftHand.y - POTATO_Y_OFFSET);
    player.potato.setVelocity(0);
    player.potato.setAngularVelocity(0);
    player.scoreText.setText(`${player.label}: 0`);
    if (player.effectText) player.effectText.setText('');
    player.handOffsetLeftX = 0;
    player.handOffsetRightX = 0;
    player.handOffsetLeftY = 0;
    player.handOffsetRightY = 0;
    updateDualHandPositions(player);
    if (player.leftHand) player.potato.setPosition(player.leftHand.x, player.leftHand.y - POTATO_Y_OFFSET);
    updateDualCatchZoneSize(scene, player);
}

function updateDualSeriesHud() {
    if (!dualMatch || !dualMatch.seriesText) return;
    const goal = dualMatch.targetScore ? `First to ${dualMatch.targetScore}` : selectedDualVariant;
    dualMatch.seriesText.setText(`${goal} - Round ${dualMatch.round}\n${dualMatch.mouse.wins} : ${dualMatch.keyboard.wins}`);
}

function endDualSeries(scene, winner, loser) {
    if (!dualMatch) return;
    const currentNames = { mouse: dualMatch.mouse.label, keyboard: dualMatch.keyboard.label };
    saveDualLeaderboardEntry(winner.label, loser.label, winner.totalScore, loser.totalScore);
    updatePlayerProfile(winner.label, {
        score: winner.totalScore,
        catches: winner.totalScore,
        maxStreak: 0,
        powerUps: 0,
        games: 1,
        wins: 1,
        losses: 0
    });
    updatePlayerProfile(loser.label, {
        score: loser.totalScore,
        catches: loser.totalScore,
        maxStreak: 0,
        powerUps: 0,
        games: 1,
        wins: 0,
        losses: 1
    });
    const dualTop = getDualLeaderboard().slice(0, 3);

    if (dualResultGroup) {
        dualResultGroup.destroy(true);
        dualResultGroup = null;
    }

    dualResultGroup = scene.add.group();
    const panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 360, 0xffffff, 0.95);
    panel.setStrokeStyle(4, 0xff7043, 1);
    const title = scene.add.text(GAME_WIDTH / 2, 245, `${winner.label} Wins Series!`, {
        fontSize: '48px',
        fill: '#e65100',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff3e0',
        strokeThickness: 6
    }).setOrigin(0.5);
    const info = scene.add.text(GAME_WIDTH / 2, 300, `Final Rounds: ${winner.wins}-${loser.wins}\nTotal Catches: ${winner.totalScore}-${loser.totalScore}`, {
        fontSize: '24px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5);
    const dualTopTitle = scene.add.text(GAME_WIDTH / 2, 360, '2P Top 3', {
        fontSize: '22px',
        fill: '#006064',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    const topRows = [];
    dualTop.forEach((entry, index) => {
        const y = 385 + index * 22;
        topRows.push(scene.add.text(GAME_WIDTH / 2, y, `${index + 1}. ${entry.winner} beat ${entry.loser} (${entry.winnerScore}-${entry.loserScore})`, {
            fontSize: '15px',
            fill: '#263238',
            fontFamily: 'Trebuchet MS'
        }).setOrigin(0.5));
    });
    const replay = createButton(scene, GAME_WIDTH / 2, 485, 'Play 2P Again', '#2e7d32', () => startDualGame(scene, currentNames), 260, 26);
    const menu = createButton(scene, GAME_WIDTH / 2, 530, 'Main Menu', '#1565c0', () => showIntro(scene), 240, 24);
    dualResultGroup.addMultiple([panel, title, info, dualTopTitle, ...topRows, replay, menu]);
}

function cleanupGame(scene) {
    resetPauseState(scene);
    singlePauseButton = null;
    clearDoubleHands();
    resetMovingBoxes(scene);
    if (singlePowerSpawnEvent) {
        singlePowerSpawnEvent.remove(false);
        singlePowerSpawnEvent = null;
    }
    if (singlePowerUpGroup) {
        singlePowerUpGroup.clear(true, true);
        singlePowerUpGroup = null;
    }
    if (singleObstacleSpawnEvent) {
        singleObstacleSpawnEvent.remove(false);
        singleObstacleSpawnEvent = null;
    }
    if (singleObstacleGroup) {
        singleObstacleGroup.clear(true, true);
        singleObstacleGroup = null;
    }
    singleShieldCharges = 0;

    if (leftCollider) {
        leftCollider.destroy();
        leftCollider = null;
    }
    if (rightCollider) {
        rightCollider.destroy();
        rightCollider = null;
    }

    if (potato) potato.destroy();
    if (leftCatchZone) leftCatchZone.destroy();
    if (rightCatchZone) rightCatchZone.destroy();
    if (leftHand) leftHand.destroy();
    if (rightHand) rightHand.destroy();

    potato = null;
    leftCatchZone = null;
    rightCatchZone = null;
    leftHand = null;
    rightHand = null;
    currentHand = null;
    timerText = null;
    livesText = null;
    streakText = null;

    if (gameplayGroup) {
        gameplayGroup.destroy(true);
        gameplayGroup = null;
    }
    clearPowerUp(scene, true);

    scene.physics.world.gravity.y = 600;
}

function cleanupDualGame(scene) {
    resetPauseState(scene);
    dualPauseButton = null;
    if (dualPowerSpawnEvent) {
        dualPowerSpawnEvent.remove(false);
        dualPowerSpawnEvent = null;
    }
    if (dualPowerUpGroup) {
        dualPowerUpGroup.clear(true, true);
        dualPowerUpGroup = null;
    }
    if (dualHandMoveEvent) {
        dualHandMoveEvent.remove(false);
        dualHandMoveEvent = null;
    }
    if (dualFreezeTimer) {
        dualFreezeTimer.remove(false);
        dualFreezeTimer = null;
    }
    dualPowerNoticeText = null;
    dualLastPowerType = null;
    dualTimeDifficultyLevel = 0;
    dualFreezeStartedAt = null;
    dualFreezeTotalMs = 0;

    if (dualResultGroup) {
        dualResultGroup.destroy(true);
        dualResultGroup = null;
    }
    if (dualGroup) {
        dualGroup.destroy(true);
        dualGroup = null;
    }

    if (dualMatch) {
        const players = [dualMatch.mouse, dualMatch.keyboard].filter(Boolean);
        players.forEach((player) => {
            if (player.leftCollider) player.leftCollider.destroy();
            if (player.rightCollider) player.rightCollider.destroy();
            if (player.potato) player.potato.destroy();
            if (player.leftZone) player.leftZone.destroy();
            if (player.rightZone) player.rightZone.destroy();
            if (player.leftHand) player.leftHand.destroy();
            if (player.rightHand) player.rightHand.destroy();
            if (player.scoreText) player.scoreText.destroy();
            if (player.effectText) player.effectText.destroy();
        });
        dualMatch = null;
    }
    dualTimerText = null;

    if (scene && scene.physics && scene.physics.world) {
        scene.physics.world.gravity.y = 600;
    }
}

function cleanupGroup(groupName) {
    const group = groupName === 'introGroup' ? introGroup
        : groupName === 'modeSelectGroup' ? modeSelectGroup
        : groupName === 'playerSelectGroup' ? playerSelectGroup
        : groupName === 'guestRoleGroup' ? guestRoleGroup
        : groupName === 'dualPlayerSelectGroup' ? dualPlayerSelectGroup
        : groupName === 'dualGuestRoleGroup' ? dualGuestRoleGroup
        : groupName === 'gameOverGroup' ? gameOverGroup
        : groupName === 'leaderboardGroup' ? leaderboardGroup
        : groupName === 'unlocksGroup' ? unlocksGroup
        : groupName === 'howToGroup' ? howToGroup
        : null;

    if (group) group.destroy(true);
    if (groupName === 'introGroup') introGroup = null;
    if (groupName === 'modeSelectGroup') modeSelectGroup = null;
    if (groupName === 'playerSelectGroup') playerSelectGroup = null;
    if (groupName === 'guestRoleGroup') guestRoleGroup = null;
    if (groupName === 'dualPlayerSelectGroup') dualPlayerSelectGroup = null;
    if (groupName === 'dualGuestRoleGroup') dualGuestRoleGroup = null;
    if (groupName === 'gameOverGroup') gameOverGroup = null;
    if (groupName === 'leaderboardGroup') leaderboardGroup = null;
    if (groupName === 'unlocksGroup') unlocksGroup = null;
    if (groupName === 'howToGroup') howToGroup = null;
}

function togglePause(scene) {
    if (isGamePaused) {
        resumeGame(scene);
        return;
    }
    if (gameState !== 'playing' && gameState !== 'dual') return;

    isGamePaused = true;
    pausedMode = gameState;
    scene.physics.world.pause();
    scene.time.timeScale = 0;
    scene.tweens.pauseAll();
    showPauseOverlay(scene);
    refreshPauseButtons();
}

function resumeGame(scene) {
    if (!isGamePaused) return;

    isGamePaused = false;
    pausedMode = null;
    scene.time.timeScale = 1;
    scene.physics.world.resume();
    scene.tweens.resumeAll();
    hidePauseOverlay();
    refreshPauseButtons();
}

function resetPauseState(scene) {
    isGamePaused = false;
    pausedMode = null;
    if (scene?.time) scene.time.timeScale = 1;
    if (scene?.physics?.world) scene.physics.world.resume();
    if (scene?.tweens) scene.tweens.resumeAll();
    hidePauseOverlay();
    refreshPauseButtons();
}

function showPauseOverlay(scene) {
    hidePauseOverlay();
    const title = pausedMode === 'dual' ? '2P Paused' : 'Paused';
    pauseOverlayGroup = scene.add.group();
    const shade = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);
    shade.setInteractive({ useHandCursor: false });
    const panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 380, 200, 0xffffff, 0.97);
    panel.setStrokeStyle(4, 0x5d4037, 1);
    const heading = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 48, title, {
        fontSize: '42px',
        fill: '#5d4037',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    const hint = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 6, 'Press Esc or click Resume', {
        fontSize: '20px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5);
    pauseOverlayResumeButton = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 54, 'Resume', {
        fontSize: '28px',
        fill: '#ffffff',
        backgroundColor: '#2e7d32',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        padding: { left: 24, right: 24, top: 10, bottom: 10 },
        align: 'center'
    }).setOrigin(0.5);
    pauseOverlayResumeButton.setInteractive({ useHandCursor: true });
    pauseOverlayResumeButton.on('pointerover', () => pauseOverlayResumeButton.setScale(1.05));
    pauseOverlayResumeButton.on('pointerout', () => pauseOverlayResumeButton.setScale(1));
    pauseOverlayResumeButton.on('pointerdown', () => resumeGame(scene));

    pauseOverlayGroup.addMultiple([shade, panel, heading, hint, pauseOverlayResumeButton]);
    if (pausedMode === 'playing' && gameplayGroup) {
        gameplayGroup.addMultiple([shade, panel, heading, hint, pauseOverlayResumeButton]);
    } else if (pausedMode === 'dual' && dualGroup) {
        dualGroup.addMultiple([shade, panel, heading, hint, pauseOverlayResumeButton]);
    }
}

function hidePauseOverlay() {
    if (pauseOverlayGroup) {
        pauseOverlayGroup.destroy(true);
        pauseOverlayGroup = null;
    }
    pauseOverlayResumeButton = null;
}

function refreshPauseButtons() {
    const singleText = isGamePaused && pausedMode === 'playing' ? 'Resume' : 'Pause';
    const dualText = isGamePaused && pausedMode === 'dual' ? 'Resume' : 'Pause';
    if (singlePauseButton?.active) singlePauseButton.setText(singleText);
    if (dualPauseButton?.active) dualPauseButton.setText(dualText);
}

function createPanel(scene, x, y, width, height, fill = 0xffffff, alpha = 0.94, stroke = 0xffffff) {
    const panel = scene.add.rectangle(x, y, width, height, fill, alpha);
    panel.setStrokeStyle(4, stroke, 0.95);
    return panel;
}

function createButton(scene, x, y, label, bgColor, onClick, width = 240, fontSize = 28) {
    const button = scene.add.text(x, y, label, {
        fontSize: `${fontSize}px`,
        fill: '#ffffff',
        backgroundColor: bgColor,
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        padding: { left: 22, right: 22, top: 10, bottom: 10 },
        align: 'center',
        fixedWidth: width,
        shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 3, fill: true }
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setScale(1.05));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', () => {
        if (!button.active || !button.input?.enabled) return;
        button.disableInteractive();
        playSfx('click');
        scene.tweens.add({
            targets: button,
            scale: 0.95,
            yoyo: true,
            duration: 80,
            onComplete: onClick
        });
    });

    return button;
}

function createToggleButton(scene, x, y, label, bgColor, onClick, width = 240, fontSize = 28) {
    const button = scene.add.text(x, y, label, {
        fontSize: `${fontSize}px`,
        fill: '#ffffff',
        backgroundColor: bgColor,
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        padding: { left: 22, right: 22, top: 10, bottom: 10 },
        align: 'center',
        fixedWidth: width,
        shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 3, fill: true }
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setScale(1.05));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', () => {
        playSfx('click');
        scene.tweens.add({
            targets: button,
            scale: 0.95,
            yoyo: true,
            duration: 80,
            onComplete: onClick
        });
    });
    return button;
}

function toggleSound(scene) {
    soundEnabled = !soundEnabled;
    localStorage.setItem('tabandatato_sound', soundEnabled ? 'on' : 'off');
    if (soundToggleText) {
        soundToggleText.setText(soundEnabled ? 'Sound: ON' : 'Sound: OFF');
    }
    if (soundEnabled) playSfx('click');
}

function toggleSingleTimer(buttonText) {
    singleTimerEnabled = !singleTimerEnabled;
    localStorage.setItem('tabandatato_timer_single', singleTimerEnabled ? 'on' : 'off');
    if (buttonText) buttonText.setText(`1P Timer: ${singleTimerEnabled ? 'ON' : 'OFF'}`);
}

function toggleDualTimer(buttonText) {
    dualTimerEnabled = !dualTimerEnabled;
    localStorage.setItem('tabandatato_timer_dual', dualTimerEnabled ? 'on' : 'off');
    if (buttonText) buttonText.setText(`2P Timer: ${dualTimerEnabled ? 'ON' : 'OFF'}`);
}

function cycleSingleTimerSeconds(buttonText) {
    const idx = TIMER_OPTIONS.indexOf(singleTimerSeconds);
    singleTimerSeconds = TIMER_OPTIONS[(idx + 1) % TIMER_OPTIONS.length];
    localStorage.setItem('tabandatato_timer_single_seconds', String(singleTimerSeconds));
    if (buttonText) buttonText.setText(`1P: ${singleTimerSeconds}s`);
}

function cycleSingleDifficulty(buttonText) {
    const idx = SINGLE_DIFFICULTY_OPTIONS.indexOf(singleDifficultyMode);
    singleDifficultyMode = SINGLE_DIFFICULTY_OPTIONS[(idx + 1) % SINGLE_DIFFICULTY_OPTIONS.length];
    localStorage.setItem('tabandatato_difficulty', singleDifficultyMode);
    if (buttonText) buttonText.setText(`1P Difficulty: ${singleDifficultyMode}`);
}

function cycleSingleRule(buttonText) {
    const idx = SINGLE_RULE_OPTIONS.indexOf(singleRuleMode);
    singleRuleMode = SINGLE_RULE_OPTIONS[(idx + 1) % SINGLE_RULE_OPTIONS.length];
    localStorage.setItem('tabandatato_single_rule', singleRuleMode);
    if (buttonText) buttonText.setText(`1P Rule: ${singleRuleMode}`);
}

function cycleDualVariant(buttonText) {
    const idx = DUAL_VARIANT_OPTIONS.indexOf(selectedDualVariant);
    selectedDualVariant = DUAL_VARIANT_OPTIONS[(idx + 1) % DUAL_VARIANT_OPTIONS.length];
    localStorage.setItem('tabandatato_dual_variant', selectedDualVariant);
    if (buttonText) buttonText.setText(`2P: ${selectedDualVariant}`);
}

function cycleDualTimerSeconds(buttonText) {
    const idx = TIMER_OPTIONS.indexOf(dualTimerSeconds);
    dualTimerSeconds = TIMER_OPTIONS[(idx + 1) % TIMER_OPTIONS.length];
    localStorage.setItem('tabandatato_timer_dual_seconds', String(dualTimerSeconds));
    if (buttonText) buttonText.setText(`2P: ${dualTimerSeconds}s`);
}

function clampTimerSeconds(value) {
    return TIMER_OPTIONS.includes(value) ? value : 30;
}

function clampSingleDifficulty(value) {
    return SINGLE_DIFFICULTY_OPTIONS.includes(value) ? value : 'Medium';
}

function clampSingleRule(value) {
    return SINGLE_RULE_OPTIONS.includes(value) ? value : 'Sudden Death';
}

function clampPotatoSkin(value) {
    const unlocked = getUnlockedSkinsForPlayer(loggedInPlayer || selectedPlayer || 'Guest');
    return unlocked.includes(value) ? value : 'Classic';
}

function clampDualVariant(value) {
    return DUAL_VARIANT_OPTIONS.includes(value) ? value : 'Best of 3';
}

function clampLoginPlayer(value) {
    return LOGIN_PLAYERS.includes(value) ? value : 'Bryle';
}

function getDualVariantConfig() {
    if (selectedDualVariant === 'First to 30') {
        return { maxWins: 1, targetScore: 30, powerUpsEnabled: true, chaosMode: false };
    }
    if (selectedDualVariant === 'Timed Battle') {
        return { maxWins: 1, targetScore: null, powerUpsEnabled: true, chaosMode: false };
    }
    if (selectedDualVariant === 'Chaos') {
        return { maxWins: 2, targetScore: null, powerUpsEnabled: true, chaosMode: true };
    }
    if (selectedDualVariant === 'Pure Skill') {
        return { maxWins: 2, targetScore: null, powerUpsEnabled: false, chaosMode: false };
    }
    return { maxWins: 2, targetScore: null, powerUpsEnabled: true, chaosMode: false };
}

function getSingleDifficultyConfig() {
    if (singleDifficultyMode === 'Easy') {
        return {
            scoreStep: 14,
            boxMoveTrigger: 14,
            obstacleTrigger: 34,
            obstacleScoreStep: 7,
            shrinkScale: 0.82,
            timeShrinkScale: 0.85,
            gravityScale: 0.88,
            obstacleSpawnDelayScale: 1.25,
            obstacleSpeedScale: 0.86
        };
    }
    if (singleDifficultyMode === 'Very Hard') {
        return {
            scoreStep: 7,
            boxMoveTrigger: 6,
            obstacleTrigger: 14,
            obstacleScoreStep: 4,
            shrinkScale: 1.3,
            timeShrinkScale: 1.35,
            gravityScale: 1.18,
            obstacleSpawnDelayScale: 0.74,
            obstacleSpeedScale: 1.25
        };
    }
    return {
        scoreStep: DIFFICULTY_SCORE_STEP,
        boxMoveTrigger: BOX_MOVE_SCORE_TRIGGER,
        obstacleTrigger: SINGLE_OBSTACLE_SCORE_TRIGGER,
        obstacleScoreStep: SINGLE_OBSTACLE_SCORE_STEP,
        shrinkScale: 1,
        timeShrinkScale: 1,
        gravityScale: 1,
        obstacleSpawnDelayScale: 1,
        obstacleSpeedScale: 1
    };
}

function finishDualRoundByTimer(scene) {
    if (!dualMatch || dualMatch.ended) return;
    finishDualRound(scene, null, 'time is up', 'timer');
}

function playSfx(type) {
    if (!soundEnabled) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioContext) audioContext = new Ctx();
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
    }

    if (type === 'catch') {
        playTone(660, 0.06, 'triangle', 0.06);
    } else if (type === 'miss') {
        playTone(180, 0.22, 'sawtooth', 0.08, 110);
    } else if (type === 'power') {
        playTone(740, 0.07, 'square', 0.05);
        playTone(920, 0.08, 'square', 0.05, 70);
    } else if (type === 'combo') {
        playTone(880, 0.05, 'triangle', 0.05);
        playTone(1100, 0.06, 'triangle', 0.05, 55);
    } else if (type === 'highscore') {
        playTone(980, 0.05, 'sine', 0.04);
        playTone(1240, 0.08, 'sine', 0.04, 70);
    } else if (type === 'obstacle') {
        playTone(150, 0.16, 'sawtooth', 0.07, 0);
        playTone(95, 0.14, 'sawtooth', 0.06, 80);
    } else if (type === 'throw') {
        playTone(300, 0.04, 'sine', 0.04);
    } else if (type === 'win') {
        playTone(520, 0.08, 'triangle', 0.06);
        playTone(660, 0.08, 'triangle', 0.06, 90);
        playTone(820, 0.1, 'triangle', 0.06, 180);
    } else {
        playTone(420, 0.04, 'sine', 0.04);
    }
}

function playTone(freq, durationSec = 0.08, type = 'sine', volume = 0.06, delayMs = 0) {
    if (!audioContext) return;
    const startAt = audioContext.currentTime + delayMs / 1000;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(startAt);
    osc.stop(startAt + durationSec + 0.02);
}

function makeHudStyle(size, fill) {
    return {
        fontSize: `${size}px`,
        fill,
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    };
}

function popText(textObj, scene) {
    scene.tweens.add({
        targets: textObj,
        scale: 1.18,
        duration: 90,
        yoyo: true
    });
}

function popHand(hand, scene) {
    scene.tweens.add({
        targets: hand,
        scaleX: hand.scaleX + 0.04,
        scaleY: hand.scaleY + 0.04,
        duration: 100,
        yoyo: true
    });
}

function updateCatchZoneSizeForScore(scene) {
    if (!leftCatchZone || !rightCatchZone) return;
    const difficulty = getSingleDifficultyConfig();

    const widthShrink = score * (CATCH_SHRINK_PER_SCORE + score * 0.03) * difficulty.shrinkScale;
    const heightShrink = score * (0.9 + score * 0.01) * difficulty.shrinkScale;
    const levelWidthShrink = singleDifficultyLevel * 6 * difficulty.shrinkScale;
    const levelHeightShrink = singleDifficultyLevel * 1.2 * difficulty.shrinkScale;
    const elapsedSec = Math.max(0, ((scene?.time.now ?? 0) - runStartMs) / 1000);
    const timeWidthShrink = elapsedSec * CATCH_SHRINK_PER_SECOND * difficulty.timeShrinkScale;
    const timeHeightShrink = elapsedSec * 0.62 * difficulty.timeShrinkScale;
    const bonus = activePowerUp && activePowerUp.type === 'bigbox' ? 1.35 : 1;
    const nextWidth = Math.max(
        MIN_CATCH_WIDTH,
        (BASE_CATCH_WIDTH - widthShrink - timeWidthShrink - levelWidthShrink) * bonus
    );
    const nextHeight = Math.max(
        MIN_CATCH_HEIGHT,
        (BASE_CATCH_HEIGHT - heightShrink - timeHeightShrink - levelHeightShrink) * bonus
    );

    leftCatchZone.setSize(nextWidth, nextHeight);
    rightCatchZone.setSize(nextWidth, nextHeight);
    leftCatchZone.setDisplaySize(nextWidth, nextHeight);
    rightCatchZone.setDisplaySize(nextWidth, nextHeight);
    leftCatchZone.body.setSize(nextWidth, nextHeight, true);
    rightCatchZone.body.setSize(nextWidth, nextHeight, true);
    if (doubleZones.length > 0) {
        doubleZones.forEach((zone) => {
            if (!zone?.body) return;
            zone.setSize(nextWidth, nextHeight);
            zone.setDisplaySize(nextWidth, nextHeight);
            zone.body.setSize(nextWidth, nextHeight, true);
        });
    }

    const alpha = Phaser.Math.Linear(0.2, 0.08, (BASE_CATCH_WIDTH - nextWidth) / (BASE_CATCH_WIDTH - MIN_CATCH_WIDTH));
    leftCatchZone.setFillStyle(0xffffff, alpha);
    rightCatchZone.setFillStyle(0xffffff, alpha);

    updateCatchZonePositions(scene);
}

function updateCatchZonePositions(scene) {
    if (!leftCatchZone || !rightCatchZone) return;
    if (leftHand) {
        leftHand.setPosition(LEFT_X + leftHandOffsetX, baseLeftHandY + leftHandOffsetY);
        leftHand.refreshBody();
    }
    if (rightHand) {
        rightHand.setPosition(RIGHT_X + rightHandOffsetX, baseRightHandY + rightHandOffsetY);
        rightHand.refreshBody();
    }
    leftCatchZone.setPosition(
        LEFT_X + leftCatchOffsetX + leftHandOffsetX,
        HAND_Y + CATCH_ZONE_OFFSET_Y + leftCatchOffsetY + leftHandOffsetY
    );
    rightCatchZone.setPosition(
        RIGHT_X + rightCatchOffsetX + rightHandOffsetX,
        HAND_Y + CATCH_ZONE_OFFSET_Y + rightCatchOffsetY + rightHandOffsetY
    );
    leftCatchZone.body?.updateFromGameObject();
    rightCatchZone.body?.updateFromGameObject();
}

function spawnDoubleHands(scene) {
    if (!potato || doubleHands.length > 0) return;
    const totalHands = 20;
    const extraCount = Math.max(0, totalHands - 2);
    const rows = 4;
    const perRow = Math.ceil(extraCount / rows);
    const marginX = 60;
    const rowStartY = HAND_Y - 90;
    const rowGap = 36;
    const spacing = perRow > 1 ? (GAME_WIDTH - marginX * 2) / (perRow - 1) : 0;

    for (let r = 0; r < rows; r += 1) {
        const y = rowStartY + rowGap * r;
        for (let i = 0; i < perRow; i += 1) {
            if (doubleHands.length >= extraCount) break;
            const x = marginX + spacing * i;
            const hand = scene.physics.add.staticImage(x, y, 'hand').setScale(BASE_HAND_SCALE);
            hand.refreshBody();
            const zone = scene.add.rectangle(x, y + CATCH_ZONE_OFFSET_Y, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.18);
            zone.setStrokeStyle(3, 0x2e7d32, 0.55);
            scene.physics.add.existing(zone, false);
            zone.body.setAllowGravity(false);
            zone.body.setImmovable(true);
            const collider = scene.physics.add.collider(potato, zone, () => onDoubleCatch(scene, hand));

            doubleHands.push(hand);
            doubleZones.push(zone);
            doubleColliders.push(collider);
            if (gameplayGroup) gameplayGroup.addMultiple([hand, zone]);
        }
    }
    updateCatchZoneSizeForScore(scene);
}

function clearDoubleHands() {
    doubleColliders.forEach((col) => col?.destroy());
    doubleColliders = [];
    doubleHands.forEach((hand) => hand?.destroy());
    doubleZones.forEach((zone) => zone?.destroy());
    doubleHands = [];
    doubleZones = [];
}

function getSingleDifficultyLevel(currentScore) {
    const difficulty = getSingleDifficultyConfig();
    if (currentScore < difficulty.boxMoveTrigger) return 0;
    return Math.floor((currentScore - difficulty.boxMoveTrigger) / difficulty.scoreStep) + 1;
}

function applySingleDifficulty(scene) {
    const nextLevel = getSingleDifficultyLevel(score);
    if (nextLevel === singleDifficultyLevel) return;
    singleDifficultyLevel = nextLevel;
    refreshBoxMoveEvent(scene);
}

function getBoxMoveSettings() {
    const level = singleDifficultyLevel;
    const interval = Math.max(260, BOX_MOVE_INTERVAL_MS - level * 40);
    const maxOffsetX = Math.min(90, BOX_MOVE_MAX_OFFSET_X + level * 6);
    const maxOffsetY = Math.min(40, BOX_MOVE_MAX_OFFSET_Y + level * 3);
    return { interval, maxOffsetX, maxOffsetY };
}

function refreshBoxMoveEvent(scene) {
    const difficulty = getSingleDifficultyConfig();
    if (score < difficulty.boxMoveTrigger) return;
    if (boxMoveEvent) {
        boxMoveEvent.remove(false);
        boxMoveEvent = null;
    }
    const { interval } = getBoxMoveSettings();
    boxMoveEvent = scene.time.addEvent({
        delay: interval,
        loop: true,
        callback: () => {
            const { maxOffsetX, maxOffsetY } = getBoxMoveSettings();
            leftCatchOffsetX = Phaser.Math.Between(-maxOffsetX, maxOffsetX);
            leftCatchOffsetY = Phaser.Math.Between(-maxOffsetY, maxOffsetY);
            rightCatchOffsetX = Phaser.Math.Between(-maxOffsetX, maxOffsetX);
            rightCatchOffsetY = Phaser.Math.Between(-maxOffsetY, maxOffsetY);
            leftHandOffsetX = Phaser.Math.Between(-maxOffsetX, maxOffsetX);
            leftHandOffsetY = Phaser.Math.Between(-maxOffsetY, maxOffsetY);
            rightHandOffsetX = Phaser.Math.Between(-maxOffsetX, maxOffsetX);
            rightHandOffsetY = Phaser.Math.Between(-maxOffsetY, maxOffsetY);
            updateCatchZonePositions(scene);
        }
    });
    updateCatchZonePositions(scene);
}

function maybeEnableMovingBoxes(scene) {
    const difficulty = getSingleDifficultyConfig();
    if (score < difficulty.boxMoveTrigger || boxMoveEvent) return;
    refreshBoxMoveEvent(scene);
}

function resetMovingBoxes(scene) {
    if (boxMoveEvent) {
        boxMoveEvent.remove(false);
        boxMoveEvent = null;
    }
    leftCatchOffsetX = 0;
    leftCatchOffsetY = 0;
    rightCatchOffsetX = 0;
    rightCatchOffsetY = 0;
    leftHandOffsetX = 0;
    leftHandOffsetY = 0;
    rightHandOffsetX = 0;
    rightHandOffsetY = 0;
    updateCatchZonePositions(scene);
}

function scheduleNextSinglePowerUp(scene) {
    if (gameState !== 'playing' || !singlePowerUpGroup) return;
    if (singlePowerSpawnEvent) {
        singlePowerSpawnEvent.remove(false);
        singlePowerSpawnEvent = null;
    }
    singlePowerSpawnEvent = scene.time.delayedCall(Phaser.Math.Between(6000, 10000), () => {
        spawnSinglePowerUp(scene);
        scheduleNextSinglePowerUp(scene);
    });
}

function maybeEnableSingleObstacles(scene) {
    const difficulty = getSingleDifficultyConfig();
    if (gameState !== 'playing' || score < difficulty.obstacleTrigger) return;
    if (!singleObstacleGroup || singleObstacleSpawnEvent) return;
    scheduleNextSingleObstacle(scene);
}

function scheduleNextSingleObstacle(scene) {
    if (gameState !== 'playing' || !singleObstacleGroup) return;
    if (singleObstacleSpawnEvent) {
        singleObstacleSpawnEvent.remove(false);
        singleObstacleSpawnEvent = null;
    }
    const level = getSingleObstacleLevel();
    const difficulty = getSingleDifficultyConfig();
    const minDelay = Math.max(420, Math.round((1500 - level * 120) * difficulty.obstacleSpawnDelayScale));
    const maxDelay = Math.max(700, Math.round((2200 - level * 140) * difficulty.obstacleSpawnDelayScale));
    singleObstacleSpawnEvent = scene.time.delayedCall(Phaser.Math.Between(minDelay, maxDelay), () => {
        spawnSingleObstacleWave(scene);
        scheduleNextSingleObstacle(scene);
    });
}

function getSingleObstacleLevel() {
    const difficulty = getSingleDifficultyConfig();
    if (score < difficulty.obstacleTrigger) return 0;
    return Math.floor((score - difficulty.obstacleTrigger) / difficulty.obstacleScoreStep) + 1;
}

function getSingleObstacleWaveCount() {
    const level = getSingleObstacleLevel();
    return Phaser.Math.Clamp(level, 1, SINGLE_OBSTACLE_MAX_PER_WAVE);
}

function spawnSingleObstacleWave(scene) {
    const count = getSingleObstacleWaveCount();
    for (let i = 0; i < count; i += 1) {
        spawnSingleObstacle(scene);
    }
}

function spawnSingleObstacle(scene) {
    if (gameState !== 'playing' || !singleObstacleGroup) return;
    const item = scene.add.image(Phaser.Math.Between(26, GAME_WIDTH - 26), -24, 'single_obstacle');
    const size = Phaser.Math.Between(24, 40);
    const level = getSingleObstacleLevel();
    const difficulty = getSingleDifficultyConfig();
    item.setDisplaySize(size, size);
    item.setData('fallSpeed', (Phaser.Math.Between(185, 250) + Math.min(140, level * 16)) * difficulty.obstacleSpeedScale);
    item.setData('driftX', Phaser.Math.Between(-70, 70));
    item.setData('spin', Phaser.Math.FloatBetween(-2.6, 2.6));
    item.setData('spawnMs', scene.time.now);
    item.setData('hit', false);
    singleObstacleGroup.add(item);
    if (gameplayGroup) gameplayGroup.add(item);
}

function updateSingleObstacles(scene, delta) {
    if (gameState !== 'playing' || !singleObstacleGroup || !potato?.active) return;
    maybeEnableSingleObstacles(scene);
    let shouldLoseLife = false;
    const children = singleObstacleGroup.getChildren();
    for (let i = 0; i < children.length; i += 1) {
        const item = children[i];
        if (!item?.active) continue;
        const speed = item.getData('fallSpeed') || 200;
        const drift = item.getData('driftX') || 0;
        const spin = item.getData('spin') || 0;
        item.y += speed * (delta / 1000);
        item.x += drift * (delta / 1000);
        item.rotation += spin * (delta / 1000);

        const tooOld = scene.time.now - (item.getData('spawnMs') || scene.time.now) > SINGLE_OBSTACLE_MAX_LIFETIME_MS;
        if (item.y > GAME_HEIGHT + 40 || item.x < -50 || item.x > GAME_WIDTH + 50 || tooOld) {
            item.destroy();
            continue;
        }

        if (item.getData('hit')) continue;
        if (Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), potato.getBounds())) {
            item.setData('hit', true);
            item.destroy();
            shouldLoseLife = true;
            break;
        }
    }

    if (shouldLoseLife) {
        if (powerUpText) {
            powerUpText.setText('Obstacle hit!');
            powerUpText.setAlpha(1);
            scene.tweens.killTweensOf(powerUpText);
            scene.tweens.add({ targets: powerUpText, alpha: 0, duration: 900, delay: 500 });
        }
        scene.cameras.main.shake(120, 0.004);
        playSfx('obstacle');
        loseLife(scene);
    }
}

function spawnSinglePowerUp(scene) {
    if (gameState !== 'playing' || !singlePowerUpGroup) return;
    const type = pickSinglePowerType();
    const spec = getSinglePowerSpec(type);
    if (!spec) return;

    const item = scene.add.image(Phaser.Math.Between(30, GAME_WIDTH - 30), -20, spec.texture);
    item.setDisplaySize(30, 30);
    item.setData('fallSpeed', Phaser.Math.Between(160, 210));
    item.setData('type', type);
    item.setData('spawnMs', scene.time.now);
    item.setData('collected', false);
    singlePowerUpGroup.add(item);
    if (gameplayGroup) gameplayGroup.add(item);
}

function updateSinglePowerUps(scene, delta) {
    if (gameState !== 'playing' || !singlePowerUpGroup || !potato?.active) return;
    singlePowerUpGroup.getChildren().forEach((item) => {
        if (!item?.active) return;
        const speed = item.getData('fallSpeed') || 180;
        item.y += speed * (delta / 1000);

        const tooOld = scene.time.now - (item.getData('spawnMs') || scene.time.now) > 7000;
        if (item.y > GAME_HEIGHT + 30 || tooOld) {
            item.destroy();
            return;
        }

        if (item.getData('collected')) return;
        if (Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), potato.getBounds())) {
            item.setData('collected', true);
            const type = item.getData('type');
            item.destroy();
            showSinglePowerPickupPopup(scene, type);
            applySinglePowerEffect(scene, type);
        }
    });
}

function pickSinglePowerType() {
    const roll = Phaser.Math.FloatBetween(0, 1);
    const level = getSingleDifficultyLevel(score);
    const difficulty = getSingleDifficultyConfig();
    const trigger = difficulty.boxMoveTrigger;
    const baseBoostChance = score >= trigger ? Math.max(0.32, 0.62 - level * 0.05) : 0.68;
    const boostChance = singleDifficultyMode === 'Easy'
        ? Math.min(0.82, baseBoostChance + 0.12)
        : singleDifficultyMode === 'Very Hard'
            ? Math.max(0.2, baseBoostChance - 0.12)
            : baseBoostChance;
    let type;
    if (roll < boostChance) {
        const boosts = [
            SINGLE_POWER_TYPES.FREEZE,
            SINGLE_POWER_TYPES.DOUBLE,
            SINGLE_POWER_TYPES.SHIELD,
            SINGLE_POWER_TYPES.BIGBOX,
            SINGLE_POWER_TYPES.SHRINK_UP
        ];
        type = boosts[Phaser.Math.Between(0, boosts.length - 1)];
    } else {
        type = SINGLE_POWER_TYPES.LASER;
    }

    if (type === singleLastPowerType) {
        type = type === SINGLE_POWER_TYPES.LASER ? SINGLE_POWER_TYPES.SHIELD : SINGLE_POWER_TYPES.LASER;
    }
    singleLastPowerType = type;
    return type;
}

function applySinglePowerEffect(scene, type) {
    powerUpsCollected += 1;
    updateAchievements({ powerUpsCollected });
    if (type === SINGLE_POWER_TYPES.FREEZE || type === SINGLE_POWER_TYPES.DOUBLE || type === SINGLE_POWER_TYPES.BIGBOX) {
        activatePowerUp(scene, type);
        return;
    }
    if (type === SINGLE_POWER_TYPES.SHRINK_UP) {
        activatePowerUp(scene, 'bigbox');
        if (powerUpText) powerUpText.setText('Power-Up: Shrink Up!');
        return;
    }
    if (type === SINGLE_POWER_TYPES.SHIELD) {
        singleShieldCharges = Math.min(MAX_SINGLE_SHIELD_CHARGES, singleShieldCharges + 1);
        if (powerUpText) {
            powerUpText.setText(`Power-Up: Shield x${singleShieldCharges}`);
            powerUpText.setAlpha(1);
            scene.tweens.killTweensOf(powerUpText);
            scene.tweens.add({ targets: powerUpText, alpha: 0, duration: 900, delay: 900 });
        }
        playSfx('power');
        return;
    }

    // Trap power-up
    if (potato?.body) {
        potato.setVelocityY(Math.max(potato.body.velocity.y, 500));
    }
    scene.cameras.main.shake(120, 0.004);
    if (powerUpText) {
        powerUpText.setText('Trap: Laser Hit!');
        powerUpText.setAlpha(1);
        scene.tweens.killTweensOf(powerUpText);
        scene.tweens.add({ targets: powerUpText, alpha: 0, duration: 900, delay: 700 });
    }
    playSfx('miss');
}

function getSinglePowerSpec(type) {
    if (type === SINGLE_POWER_TYPES.FREEZE) return { texture: 'sp_freeze' };
    if (type === SINGLE_POWER_TYPES.DOUBLE) return { texture: 'sp_double' };
    if (type === SINGLE_POWER_TYPES.BIGBOX) return { texture: 'pup_bigbox' };
    if (type === SINGLE_POWER_TYPES.SHRINK_UP) return { texture: 'pup_shrinkup' };
    if (type === SINGLE_POWER_TYPES.SHIELD) return { texture: 'pup_shield' };
    if (type === SINGLE_POWER_TYPES.LASER) return { texture: 'pup_laser' };
    return null;
}

function getSinglePowerLabel(type) {
    if (type === SINGLE_POWER_TYPES.FREEZE) return 'Freeze';
    if (type === SINGLE_POWER_TYPES.DOUBLE) return 'Double';
    if (type === SINGLE_POWER_TYPES.BIGBOX) return 'Big Box';
    if (type === SINGLE_POWER_TYPES.SHRINK_UP) return 'Shrink Up';
    if (type === SINGLE_POWER_TYPES.SHIELD) return 'Shield';
    if (type === SINGLE_POWER_TYPES.LASER) return 'Laser Trap';
    return 'Power-Up';
}

function showSinglePowerPickupPopup(scene, type) {
    if (!potato?.active) return;
    const popup = scene.add.text(potato.x, potato.y - 30, getSinglePowerLabel(type), {
        fontSize: '18px',
        fill: '#fffde7',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        stroke: '#1b5e20',
        strokeThickness: 4
    }).setOrigin(0.5);
    if (gameplayGroup) gameplayGroup.add(popup);
    scene.tweens.add({
        targets: popup,
        y: popup.y - 22,
        alpha: 0,
        duration: 1000,
        onComplete: () => popup.destroy()
    });
}

function ensureSinglePowerIconTextures(scene) {
    ensureDualPowerIconTextures(scene);
    if (!scene.textures.exists('single_obstacle')) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x37474f, 1);
        g.fillCircle(16, 16, 15);
        g.lineStyle(2, 0xb0bec5, 1);
        g.strokeCircle(16, 16, 14);
        g.fillStyle(0x90a4ae, 0.95);
        g.fillRect(7, 14, 18, 4);
        g.fillRect(14, 7, 4, 18);
        g.generateTexture('single_obstacle', 32, 32);
        g.destroy();
    }
    if (!scene.textures.exists('sp_freeze')) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x29b6f6, 1);
        g.fillCircle(16, 16, 15);
        g.lineStyle(2, 0xffffff, 0.95);
        g.strokeCircle(16, 16, 14);
        g.lineStyle(3, 0xffffff, 1);
        g.lineBetween(9, 16, 23, 16);
        g.lineBetween(16, 9, 16, 23);
        g.generateTexture('sp_freeze', 32, 32);
        g.destroy();
    }
    if (!scene.textures.exists('sp_double')) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xff7043, 1);
        g.fillCircle(16, 16, 15);
        g.lineStyle(2, 0xffffff, 0.95);
        g.strokeCircle(16, 16, 14);
        g.fillStyle(0xffffff, 1);
        g.fillRect(9, 11, 14, 4);
        g.fillRect(9, 17, 14, 4);
        g.generateTexture('sp_double', 32, 32);
        g.destroy();
    }
}

function activatePowerUp(scene, type) {
    clearPowerUp(scene, true);
    activePowerUp = { type };
    if (!powerUpText) return;

    if (type === 'freeze') {
        scene.physics.world.gravity.y = Math.max(380, scene.physics.world.gravity.y * 0.7);
        powerUpText.setText('Power-Up: Freeze Time!');
        if (!freezeStartedAt) freezeStartedAt = scene.time.now;
        if (boxMoveEvent) boxMoveEvent.paused = true;
    } else if (type === 'bigbox') {
        powerUpText.setText('Power-Up: Big Catch Box!');
        updateCatchZoneSizeForScore(scene);
    } else {
        powerUpText.setText('Power-Up: Double Score x2!');
    }

    if (type === 'double') {
        spawnDoubleHands(scene);
    }

    powerUpText.setAlpha(1);
    playSfx('power');
    powerUpTimer = scene.time.delayedCall(5000, () => clearPowerUp(scene));
}

function clearPowerUp(scene, silent = false) {
    if (powerUpTimer) {
        powerUpTimer.remove(false);
        powerUpTimer = null;
    }
    if (!activePowerUp) return;
    const wasDouble = activePowerUp.type === 'double';
    activePowerUp = null;

    if (powerUpText) {
        if (silent) {
            powerUpText.setAlpha(0);
        } else {
            powerUpText.setText('Power-Up ended');
            scene.tweens.add({
                targets: powerUpText,
                alpha: 0,
                duration: 500
            });
        }
    }
    if (leftCatchZone && rightCatchZone) updateCatchZoneSizeForScore(scene);
    if (freezeStartedAt) {
        freezeTotalMs += scene.time.now - freezeStartedAt;
        freezeStartedAt = null;
    }
    if (boxMoveEvent) boxMoveEvent.paused = false;
    if (wasDouble) clearDoubleHands();
    refreshBoxMoveEvent(scene);
}

function showDaddyCheer(scene, x, y) {
    if (!daddyCheerText) return;
    const cheers = ['Go Daddy KRST!', 'Let\'s go Daddy KRST!', 'Party time, Daddy!', 'Daddy KRST rules!'];
    const cheer = cheers[Phaser.Math.Between(0, cheers.length - 1)];
    daddyCheerText.setText(cheer);
    daddyCheerText.setPosition(x, y);
    daddyCheerText.setScale(0.8);
    daddyCheerText.setAlpha(1);

    scene.tweens.killTweensOf(daddyCheerText);
    scene.tweens.add({
        targets: daddyCheerText,
        y: y - 30,
        alpha: 0,
        scale: 1.08,
        duration: 850,
        ease: 'Quad.easeOut'
    });
}

function getAvatarKey(playerName) {
    const player = String(playerName || '').toLowerCase();
    if (player === 'bryle') return 'avatar_bryle';
    if (player === 'prince') return 'avatar_prince';
    if (player === 'josh') return 'avatar_josh';
    if (player === 'mommy') return 'avatar_mommy';
    if (player === 'daddy') return 'avatar_daddy';
    return 'potato';
}

function getSelectedPotatoTexture() {
    return getPotatoTextureForSkin(selectedPotatoSkin);
}

function getPotatoTextureForSkin(skin) {
    if (skin === 'Fire') return 'potato_fire';
    if (skin === 'Ninja') return 'potato_ninja';
    if (skin === 'Golden') return 'potato_golden';
    return 'potato';
}

function getSkinUnlockHint(skin) {
    if (skin === 'Fire') return 'Score 30';
    if (skin === 'Ninja') return 'Streak 25';
    if (skin === 'Golden') return '75/Daily';
    return 'Unlocked';
}

function getSkinButtonColor(skin, isUnlocked) {
    if (!isUnlocked) return '#78909c';
    if (selectedPotatoSkin === skin) return '#6a1b9a';
    if (skin === 'Fire') return '#bf360c';
    if (skin === 'Ninja') return '#37474f';
    if (skin === 'Golden') return '#f9a825';
    return '#2e7d32';
}

function getSkinTextColor(skin, isUnlocked) {
    return isUnlocked && skin === 'Golden' ? '#3e2723' : '#ffffff';
}

function getComboMultiplier() {
    if (currentStreak >= 50) return 4;
    if (currentStreak >= 25) return 3;
    if (currentStreak >= 10) return 2;
    return 1;
}

function updateStreakHud(scene) {
    if (!streakText) return;
    const multiplier = getComboMultiplier();
    streakText.setText(`Streak: ${currentStreak}${multiplier > 1 ? ` | Combo x${multiplier}` : ''}`);
    if (currentStreak === 10 || currentStreak === 25 || currentStreak === 50) {
        popText(streakText, scene);
        playSfx('combo');
    }
}

function showComboFeedback(scene, x, y) {
    const multiplier = getComboMultiplier();
    if (multiplier <= 1) return;
    const popup = scene.add.text(x, y, `Combo x${multiplier}`, {
        fontSize: '22px',
        fill: '#fffde7',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        stroke: '#6a1b9a',
        strokeThickness: 4
    }).setOrigin(0.5);
    if (gameplayGroup) gameplayGroup.add(popup);
    scene.tweens.add({
        targets: popup,
        y: y - 26,
        alpha: 0,
        duration: 850,
        onComplete: () => popup.destroy()
    });
    if (currentStreak >= 25) burstSparkles(scene, x, y, currentStreak >= 50 ? 24 : 16);
}

function playSkinCatchEffect(scene, x, y) {
    if (selectedPotatoSkin === 'Classic') return;
    const color = selectedPotatoSkin === 'Fire'
        ? 0xff7043
        : selectedPotatoSkin === 'Ninja'
            ? 0x263238
            : 0xffd54f;
    for (let i = 0; i < 8; i += 1) {
        const dot = scene.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.9);
        if (gameplayGroup) gameplayGroup.add(dot);
        scene.tweens.add({
            targets: dot,
            x: x + Phaser.Math.Between(-46, 46),
            y: y + Phaser.Math.Between(-34, 18),
            alpha: 0,
            scale: 0.2,
            duration: 420,
            onComplete: () => dot.destroy()
        });
    }
}

function getUnlockedSkins() {
    return getUnlockedSkinsForPlayer(selectedPlayer);
}

function getUnlockedSkinsForPlayer(player) {
    try {
        const raw = localStorage.getItem(getSkinStorageKey(player));
        const parsed = raw ? JSON.parse(raw) : ['Classic'];
        return Array.from(new Set(['Classic', ...parsed])).filter((skin) => POTATO_SKINS.includes(skin));
    } catch (error) {
        return ['Classic'];
    }
}

function saveUnlockedSkins(skins) {
    localStorage.setItem(getSkinStorageKey(selectedPlayer), JSON.stringify(Array.from(new Set(['Classic', ...skins]))));
}

function getSkinStorageKey(player) {
    return `tabandatato_unlocked_skins_${getPlayerKey(player)}`;
}

function updateSkinUnlocks(finalScore, finalStreak, wonDaily) {
    const unlocked = getUnlockedSkinsForPlayer(selectedPlayer);
    const next = [...unlocked];
    const newly = [];
    const add = (skin) => {
        if (next.includes(skin)) return;
        next.push(skin);
        newly.push(skin);
    };
    if (finalScore >= 30) add('Fire');
    if (finalStreak >= 25) add('Ninja');
    if (finalScore >= 75 || wonDaily) add('Golden');
    if (getPlayerProfile(selectedPlayer).level >= 5) add('Fire');
    if (getPlayerProfile(selectedPlayer).level >= 8) add('Ninja');
    if (getPlayerProfile(selectedPlayer).level >= 12) add('Golden');
    saveUnlockedSkins(next);
    return newly;
}

function getAchievements() {
    try {
        const raw = localStorage.getItem('tabandatato_achievements');
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function saveAchievements(achievements) {
    localStorage.setItem('tabandatato_achievements', JSON.stringify(achievements));
}

function getAllProfiles() {
    try {
        const raw = localStorage.getItem('tabandatato_profiles');
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function saveAllProfiles(profiles) {
    localStorage.setItem('tabandatato_profiles', JSON.stringify(profiles));
}

function getPlayerKey(player) {
    return String(player || 'Guest').trim().toLowerCase().slice(0, 40) || 'guest';
}

function getPlayerProfile(player) {
    const key = getPlayerKey(player);
    const local = getAllProfiles()[key];
    const cloud = cloudProfiles.find((profile) => getPlayerKey(profile.player) === key);
    return normalizeProfile(cloud || local || { player: player || 'Guest' });
}

function normalizeProfile(profile) {
    const xp = Number(profile.xp) || 0;
    const level = getLevelFromXp(xp);
    return {
        player: String(profile.player || 'Guest').slice(0, 40),
        xp,
        level,
        title: getTitleForLevel(level),
        games: Number(profile.games) || 0,
        totalCatches: Number(profile.totalCatches ?? profile.total_catches) || 0,
        bestScore: Number(profile.bestScore ?? profile.best_score) || 0,
        bestStreak: Number(profile.bestStreak ?? profile.best_streak) || 0,
        powerUps: Number(profile.powerUps ?? profile.powerups) || 0,
        wins: Number(profile.wins) || 0,
        losses: Number(profile.losses) || 0,
        favoriteSkin: profile.favoriteSkin ?? profile.favorite_skin ?? 'Classic'
    };
}

function updatePlayerProfile(player, stats) {
    const profiles = getAllProfiles();
    const key = getPlayerKey(player);
    const current = normalizeProfile(profiles[key] || { player });
    const xpGain = calculateXpGain(stats);
    const updated = normalizeProfile({
        ...current,
        xp: current.xp + xpGain,
        games: current.games + (stats.games || 0),
        totalCatches: current.totalCatches + (stats.catches || 0),
        bestScore: Math.max(current.bestScore, stats.score || 0),
        bestStreak: Math.max(current.bestStreak, stats.maxStreak || 0),
        powerUps: current.powerUps + (stats.powerUps || 0),
        wins: current.wins + (stats.wins || 0),
        losses: current.losses + (stats.losses || 0),
        favoriteSkin: selectedPotatoSkin
    });
    profiles[key] = updated;
    saveAllProfiles(profiles);
    saveSupabaseProfile(updated);
    return { profile: updated, xpGain };
}

function calculateXpGain(stats) {
    return Math.max(5, Math.round((stats.score || 0) * 4 + (stats.catches || 0) * 2 + (stats.maxStreak || 0) * 3 + (stats.powerUps || 0) * 10 + (stats.wins || 0) * 50));
}

function getLevelFromXp(xp) {
    return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 80)) + 1);
}

function getTitleForLevel(level) {
    if (level >= 12) return 'Golden Tato';
    if (level >= 8) return 'Combo Master';
    if (level >= 5) return 'Hot Potato Pro';
    return 'Hot Potato Rookie';
}

function getProfileRows() {
    const localProfiles = Object.values(getAllProfiles()).map(normalizeProfile);
    const merged = new Map();
    [...localProfiles, ...cloudProfiles.map(normalizeProfile)].forEach((profile) => {
        const key = getPlayerKey(profile.player);
        const current = merged.get(key);
        if (!current || profile.xp > current.xp) merged.set(key, profile);
    });
    return Array.from(merged.values()).sort((a, b) => b.xp - a.xp);
}

function updateAchievements(stats = {}) {
    const achievements = getAchievements();
    const newly = [];
    const unlock = (id, label) => {
        if (achievements[id]) return;
        achievements[id] = { label, date: Date.now() };
        newly.push(label);
    };
    if ((stats.catchCount || 0) >= 1) unlock('first_catch', 'First Catch');
    if ((stats.maxStreak || 0) >= 25) unlock('no_drop_hero', 'No Drop Hero');
    if ((stats.powerUpsCollected || 0) >= 5) unlock('power_master', 'Power-Up Master');
    if ((stats.score || 0) >= 40 && stats.difficulty === 'Very Hard') unlock('very_hard_survivor', 'Very Hard Survivor');
    if (stats.wonDaily) unlock('daily_champion', 'Daily Champion');
    if ((stats.score || 0) >= 30 && singleRuleMode === 'Sudden Death') unlock('sudden_death_30', 'Sudden Death 30');
    if (newly.length) saveAchievements(achievements);
    return newly;
}

function getMissionResults(stats) {
    const missions = [
        {
            label: `Catch 30 potatoes (${Math.min(stats.catchCount, 30)}/30)`,
            done: stats.catchCount >= 30
        },
        {
            label: `Build a 15 streak (${Math.min(stats.maxStreak, 15)}/15)`,
            done: stats.maxStreak >= 15
        },
        {
            label: `Collect 3 power-ups (${Math.min(stats.powerUpsCollected, 3)}/3)`,
            done: stats.powerUpsCollected >= 3
        }
    ];
    if (dailyChallengeActive) {
        missions[0] = {
            label: `Beat today's target (${stats.dailyWon ? 'complete' : 'not yet'})`,
            done: stats.dailyWon
        };
    } else if (singleDifficultyMode === 'Very Hard') {
        missions[0] = {
            label: `Score 40 on Very Hard (${Math.min(stats.score, 40)}/40)`,
            done: stats.score >= 40
        };
    }
    return missions;
}

function showSkinUnlockPrompt(scene, skin) {
    if (!skin || !POTATO_SKINS.includes(skin)) return;
    const promptGroup = scene.add.group();
    const shade = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.38);
    shade.setInteractive({ useHandCursor: false });
    const panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 390, 260, 0xffffff, 0.98);
    panel.setStrokeStyle(4, 0x7b1fa2, 1);
    const preview = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 78, getPotatoTextureForSkin(skin)).setDisplaySize(64, 64);
    const title = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, `${skin} skin unlocked!`, {
        fontSize: '28px',
        fill: '#6a1b9a',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#f3e5f5',
        strokeThickness: 5,
        align: 'center'
    }).setOrigin(0.5);
    const question = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24, `Select it now for ${selectedPlayer}?`, {
        fontSize: '19px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5);
    const selectBtn = createButton(scene, GAME_WIDTH / 2 - 96, GAME_HEIGHT / 2 + 88, 'Select', '#2e7d32', () => {
        selectedPotatoSkin = skin;
        localStorage.setItem('tabandatato_potato_skin', selectedPotatoSkin);
        promptGroup.destroy(true);
    }, 150, 20);
    const laterBtn = createButton(scene, GAME_WIDTH / 2 + 96, GAME_HEIGHT / 2 + 88, 'Not Now', '#546e7a', () => {
        promptGroup.destroy(true);
    }, 150, 20);
    promptGroup.addMultiple([shade, panel, preview, title, question, selectBtn, laterBtn]);
    gameOverGroup?.addMultiple([shade, panel, preview, title, question, selectBtn, laterBtn]);
}

function getDailyChallengeConfig() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const timer = [30, 60, 10][seed % 3];
    const difficulty = ['Medium', 'Very Hard', 'Easy'][seed % 3];
    const rule = seed % 2 === 0 ? 'Sudden Death' : '3 Lives';
    const targetScore = difficulty === 'Very Hard' ? 35 : difficulty === 'Easy' ? 45 : 40;
    return { timer, difficulty, rule, targetScore };
}

function getDailyKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDailyChallengeBest() {
    try {
        const raw = localStorage.getItem('tabandatato_daily_scores');
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed[getDailyKey()] || 0;
    } catch (error) {
        return 0;
    }
}

function saveDailyChallengeScore(playerScore) {
    try {
        const raw = localStorage.getItem('tabandatato_daily_scores');
        const parsed = raw ? JSON.parse(raw) : {};
        const key = getDailyKey();
        parsed[key] = Math.max(parsed[key] || 0, playerScore);
        localStorage.setItem('tabandatato_daily_scores', JSON.stringify(parsed));
    } catch (error) {}
}

function startDailyChallenge(scene) {
    if (!loggedInPlayer) {
        showPlayerSelect(scene);
        return;
    }
    const challenge = getDailyChallengeConfig();
    dailyChallengeActive = true;
    singleTimerEnabled = true;
    singleTimerSeconds = challenge.timer;
    singleDifficultyMode = challenge.difficulty;
    singleRuleMode = challenge.rule;
    selectedPlayer = loggedInPlayer;
    startActualGame(scene);
}

function showUnlocks(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGame(scene);
    cleanupDualGame(scene);
    cleanupGroup('introGroup');
    cleanupGroup('modeSelectGroup');
    cleanupGroup('gameOverGroup');
    cleanupGroup('leaderboardGroup');
    cleanupGroup('unlocksGroup');
    cleanupGroup('howToGroup');
    gameState = 'unlocks';
    unlocksGroup = scene.add.group();

    const panel = createPanel(scene, GAME_WIDTH / 2, 330, 500, 570, 0xffffff, 0.95, 0x7b1fa2);
    const title = scene.add.text(GAME_WIDTH / 2, 80, 'Unlocks', {
        fontSize: '50px',
        fill: '#6a1b9a',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#f3e5f5',
        strokeThickness: 7
    }).setOrigin(0.5);
    const activeProfile = getPlayerProfile(selectedPlayer);
    const activePlayerText = scene.add.text(GAME_WIDTH / 2, 112, `${selectedPlayer} | Lv ${activeProfile.level} ${activeProfile.title}`, {
        fontSize: '17px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const unlockedSkins = getUnlockedSkins();
    const skinRows = POTATO_SKINS.map((skin, index) => {
        const y = 156 + index * 48;
        const isUnlocked = unlockedSkins.includes(skin);
        const isSelected = selectedPotatoSkin === skin;
        const preview = scene.add.image(GAME_WIDTH / 2 - 170, y, getPotatoTextureForSkin(skin)).setDisplaySize(38, 38);
        preview.setAlpha(isUnlocked ? 1 : 0.42);
        const ring = scene.add.circle(preview.x, preview.y, 25, 0xffffff, 0);
        ring.setStrokeStyle(isSelected ? 3 : 1, isSelected ? 0x6a1b9a : 0xb0bec5, isUnlocked ? 0.85 : 0.35);
        if (isUnlocked) {
            scene.tweens.add({
                targets: preview,
                y: preview.y - (isSelected ? 5 : 3),
                angle: isSelected ? 6 : 3,
                duration: isSelected ? 780 : 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            scene.tweens.add({
                targets: ring,
                scale: isSelected ? 1.12 : 1.04,
                duration: isSelected ? 780 : 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        const statusLabel = isUnlocked ? (isSelected ? 'Using' : 'Ready') : getSkinUnlockHint(skin);
        const label = `${isSelected ? `${skin} selected` : skin}   ${statusLabel}`;
        const btn = createToggleButton(scene, GAME_WIDTH / 2 + 20, y, label, getSkinButtonColor(skin, isUnlocked), () => {
            if (!isUnlocked) return;
            selectedPotatoSkin = skin;
            localStorage.setItem(getSkinStorageKey(selectedPlayer), JSON.stringify(Array.from(new Set(['Classic', ...unlockedSkins, skin]))));
            localStorage.setItem('tabandatato_potato_skin', selectedPotatoSkin);
            showUnlocks(scene);
        }, 310, 17);
        btn.setColor(getSkinTextColor(skin, isUnlocked));
        if (!isUnlocked) {
            const lock = scene.add.text(preview.x, preview.y, 'LOCK', {
                fontSize: '10px',
                fill: '#ffffff',
                backgroundColor: '#546e7a',
                fontFamily: 'Trebuchet MS',
                fontStyle: 'bold',
                padding: { left: 3, right: 3, top: 1, bottom: 1 }
            }).setOrigin(0.5);
            return [ring, preview, btn, lock];
        }
        return [ring, preview, btn];
    });

    const achievements = Object.values(getAchievements());
    const achievementText = achievements.length
        ? achievements.slice(0, 6).map((item) => item.label).join('\n')
        : 'No achievements yet';
    const achievementTitle = scene.add.text(GAME_WIDTH / 2, 372, 'Achievements', makeHudStyle(26, '#00838f')).setOrigin(0.5);
    const achievementsList = scene.add.text(GAME_WIDTH / 2, 434, achievementText, {
        fontSize: '20px',
        fill: '#263238',
        fontFamily: 'Trebuchet MS',
        align: 'center',
        lineSpacing: 8
    }).setOrigin(0.5);

    const daily = getDailyChallengeConfig();
    const dailyText = scene.add.text(GAME_WIDTH / 2, 522, `Today: ${daily.timer}s ${daily.difficulty}, ${daily.rule}\nTarget: ${daily.targetScore} | Best: ${getDailyChallengeBest()}`, {
        fontSize: '18px',
        fill: '#4e342e',
        fontFamily: 'Trebuchet MS',
        align: 'center',
        lineSpacing: 4
    }).setOrigin(0.5);
    const backBtn = createButton(scene, GAME_WIDTH / 2, 586, 'Back', '#546e7a', () => showIntro(scene), 170, 20);
    unlocksGroup.addMultiple([panel, title, activePlayerText, ...skinRows.flat(), achievementTitle, achievementsList, dailyText, backBtn]);
}

function createAvatar(scene, key, x, y, scale) {
    const avatar = scene.add.image(x, y, key).setScale(scale);
    avatar.setDisplaySize(40, 40);
    return avatar;
}

function getLeaderboard() {
    if (cloudLeaderboard.length > 0) return mergeLeaderboards(getLocalLeaderboard(), cloudLeaderboard);
    return getLocalLeaderboard();
}

function getLocalLeaderboard() {
    try {
        const raw = localStorage.getItem('tabandatato_leaderboard');
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item) => item && typeof item.player === 'string' && Number.isFinite(item.score))
            .sort((a, b) => b.score - a.score);
    } catch (error) {
        return [];
    }
}

function saveLeaderboardEntry(player, playerScore) {
    const leaderboard = getLocalLeaderboard();
    leaderboard.push({
        player: player || 'Guest',
        score: Number(playerScore) || 0,
        date: Date.now(),
        difficulty: singleDifficultyMode,
        rule: singleRuleMode,
        daily: dailyChallengeActive,
        skin: selectedPotatoSkin
    });
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmed = leaderboard.slice(0, 50);
    localStorage.setItem('tabandatato_leaderboard', JSON.stringify(trimmed));
    saveSupabaseScore({
        player: player || 'Guest',
        score: Number(playerScore) || 0,
        difficulty: singleDifficultyMode,
        rule_mode: singleRuleMode,
        daily: dailyChallengeActive,
        skin: selectedPotatoSkin,
        catches: catchCount,
        max_streak: maxStreak,
        powerups: powerUpsCollected
    });
}

function resetLeaderboard() {
    const singleTop = getLocalLeaderboard().slice(0, 3);
    const dualTop = getLocalDualLeaderboard().slice(0, 3);
    localStorage.setItem('tabandatato_leaderboard', JSON.stringify(singleTop));
    localStorage.setItem('tabandatato_dual_leaderboard', JSON.stringify(dualTop));
}

function getDualLeaderboard() {
    if (cloudDualLeaderboard.length > 0) return mergeDualLeaderboards(getLocalDualLeaderboard(), cloudDualLeaderboard);
    return getLocalDualLeaderboard();
}

function getLocalDualLeaderboard() {
    try {
        const raw = localStorage.getItem('tabandatato_dual_leaderboard');
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item) => item && typeof item.winner === 'string' && typeof item.loser === 'string' && Number.isFinite(item.winnerScore) && Number.isFinite(item.loserScore))
            .sort((a, b) => b.winnerScore - a.winnerScore || b.loserScore - a.loserScore);
    } catch (error) {
        return [];
    }
}

function saveDualLeaderboardEntry(winner, loser, winnerScore, loserScore) {
    const leaderboard = getLocalDualLeaderboard();
    leaderboard.push({
        winner: winner || 'Unknown',
        loser: loser || 'Unknown',
        winnerScore: Number(winnerScore) || 0,
        loserScore: Number(loserScore) || 0,
        date: Date.now(),
        variant: selectedDualVariant
    });
    leaderboard.sort((a, b) => b.winnerScore - a.winnerScore || b.loserScore - a.loserScore);
    localStorage.setItem('tabandatato_dual_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
    saveSupabaseDualScore({
        winner: winner || 'Unknown',
        loser: loser || 'Unknown',
        winner_score: Number(winnerScore) || 0,
        loser_score: Number(loserScore) || 0,
        variant: selectedDualVariant
    });
}

function isSupabaseEnabled() {
    return Boolean(
        SUPABASE_URL &&
        SUPABASE_ANON_KEY &&
        window.supabase &&
        !SUPABASE_URL.includes('YOUR_') &&
        !SUPABASE_ANON_KEY.includes('YOUR_')
    );
}

function initSupabase() {
    if (!isSupabaseEnabled()) return null;
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

async function refreshCloudLeaderboards() {
    const client = initSupabase();
    if (!client) return;
    try {
        const [singleResult, dualResult] = await Promise.all([
            client
                .from(SUPABASE_SINGLE_TABLE)
                .select('player, score, created_at, difficulty, rule_mode, daily, skin, catches, max_streak, powerups, session_id')
                .order('score', { ascending: false })
                .limit(50),
            client
                .from(SUPABASE_DUAL_TABLE)
                .select('winner, loser, winner_score, loser_score, created_at, variant, session_id')
                .order('winner_score', { ascending: false })
                .order('loser_score', { ascending: false })
                .limit(50)
        ]);
        if (!singleResult.error && Array.isArray(singleResult.data)) {
            cloudLeaderboard = singleResult.data.map((entry) => ({
                player: entry.player || 'Guest',
                score: Number(entry.score) || 0,
                date: entry.created_at ? Date.parse(entry.created_at) : Date.now(),
                difficulty: entry.difficulty,
                rule: entry.rule_mode,
                daily: Boolean(entry.daily),
                skin: entry.skin,
                catches: Number(entry.catches) || 0,
                maxStreak: Number(entry.max_streak) || 0,
                powerUps: Number(entry.powerups) || 0,
                source: 'cloud'
            }));
        }
        if (!dualResult.error && Array.isArray(dualResult.data)) {
            cloudDualLeaderboard = dualResult.data.map((entry) => ({
                winner: entry.winner || 'Unknown',
                loser: entry.loser || 'Unknown',
                winnerScore: Number(entry.winner_score) || 0,
                loserScore: Number(entry.loser_score) || 0,
                date: entry.created_at ? Date.parse(entry.created_at) : Date.now(),
                variant: entry.variant,
                source: 'cloud'
            }));
        }
        const profileResult = await client
            .from(SUPABASE_PROFILE_TABLE)
            .select('player, xp, games, total_catches, best_score, best_streak, powerups, wins, losses, favorite_skin, updated_at')
            .order('xp', { ascending: false })
            .limit(50);
        if (!profileResult.error && Array.isArray(profileResult.data)) {
            cloudProfiles = profileResult.data.map((entry) => normalizeProfile(entry));
        }
        cloudScoresLoaded = true;
    } catch (error) {
        cloudScoresLoaded = false;
    }
}

function saveSupabaseScore(entry) {
    const client = initSupabase();
    if (!client) return;
    const clean = sanitizeSingleScore(entry);
    if (!clean) return;
    client.from(SUPABASE_SINGLE_TABLE).insert(clean).then(({ error }) => {
        if (!error) refreshCloudLeaderboards();
    }).catch(() => {});
}

function saveSupabaseDualScore(entry) {
    const client = initSupabase();
    if (!client) return;
    const clean = sanitizeDualScore(entry);
    if (!clean) return;
    client.from(SUPABASE_DUAL_TABLE).insert(clean).then(({ error }) => {
        if (!error) refreshCloudLeaderboards();
    }).catch(() => {});
}

function saveSupabaseProfile(profile) {
    const client = initSupabase();
    if (!client) return;
    const clean = sanitizeProfile(profile);
    if (!clean) return;
    client.from(SUPABASE_PROFILE_TABLE).upsert(clean, { onConflict: 'player_key' }).then(({ error }) => {
        if (!error) refreshCloudLeaderboards();
    }).catch(() => {});
}

function sanitizeSingleScore(entry) {
    const scoreValue = Number(entry.score) || 0;
    const catchesValue = Number(entry.catches) || 0;
    if (scoreValue < 0 || scoreValue > 100000 || catchesValue < 0 || catchesValue > 100000) return null;
    return {
        ...entry,
        player: String(entry.player || 'Guest').slice(0, 40),
        score: scoreValue,
        catches: catchesValue,
        max_streak: Math.max(0, Math.min(100000, Number(entry.max_streak) || 0)),
        powerups: Math.max(0, Math.min(100000, Number(entry.powerups) || 0)),
        session_id: sessionId
    };
}

function sanitizeDualScore(entry) {
    const winnerScore = Number(entry.winner_score) || 0;
    const loserScore = Number(entry.loser_score) || 0;
    if (winnerScore < 0 || loserScore < 0 || winnerScore > 100000 || loserScore > 100000) return null;
    return {
        ...entry,
        winner: String(entry.winner || 'Unknown').slice(0, 40),
        loser: String(entry.loser || 'Unknown').slice(0, 40),
        winner_score: winnerScore,
        loser_score: loserScore,
        session_id: sessionId
    };
}

function sanitizeProfile(profile) {
    const normalized = normalizeProfile(profile);
    return {
        player_key: getPlayerKey(normalized.player),
        player: normalized.player,
        xp: Math.max(0, Math.min(9999999, normalized.xp)),
        games: Math.max(0, Math.min(999999, normalized.games)),
        total_catches: Math.max(0, Math.min(9999999, normalized.totalCatches)),
        best_score: Math.max(0, Math.min(100000, normalized.bestScore)),
        best_streak: Math.max(0, Math.min(100000, normalized.bestStreak)),
        powerups: Math.max(0, Math.min(999999, normalized.powerUps)),
        wins: Math.max(0, Math.min(999999, normalized.wins)),
        losses: Math.max(0, Math.min(999999, normalized.losses)),
        favorite_skin: normalized.favoriteSkin,
        updated_at: new Date().toISOString()
    };
}

function mergeLeaderboards(localRows, cloudRows) {
    const seen = new Set();
    return [...cloudRows, ...localRows]
        .filter((entry) => {
            const key = `${entry.player}|${entry.score}|${entry.date || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => b.score - a.score || (b.date || 0) - (a.date || 0));
}

function mergeDualLeaderboards(localRows, cloudRows) {
    const seen = new Set();
    return [...cloudRows, ...localRows]
        .filter((entry) => {
            const key = `${entry.winner}|${entry.loser}|${entry.winnerScore}|${entry.loserScore}|${entry.date || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => b.winnerScore - a.winnerScore || b.loserScore - a.loserScore || (b.date || 0) - (a.date || 0));
}

function createTopThreeRows(scene, leaderboard) {
    const top3 = leaderboard.slice(0, 3);
    if (top3.length === 0) {
        return [
            scene.add.text(GAME_WIDTH / 2, 430, 'No scores yet', {
                fontSize: '24px',
                fill: '#455a64',
                fontFamily: 'Trebuchet MS'
            }).setOrigin(0.5)
        ];
    }

    const rows = [];
    top3.forEach((entry, index) => {
        const y = 425 + index * 35;
        const place = index === 0 ? '1st' : index === 1 ? '2nd' : '3rd';
        const placeText = scene.add.text(80, y, place, {
            fontSize: '23px',
            fill: index === 0 ? '#f57f17' : index === 1 ? '#546e7a' : '#bf360c',
            fontFamily: 'Trebuchet MS',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        const avatar = createAvatar(scene, getAvatarKey(entry.player), 128, y, 0.1);
        const playerTextRow = scene.add.text(158, y, entry.player, {
            fontSize: '22px',
            fill: '#1b5e20',
            fontFamily: 'Trebuchet MS',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        const scoreRow = scene.add.text(400, y, String(entry.score), {
            fontSize: '22px',
            fill: '#0d47a1',
            fontFamily: 'Trebuchet MS',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        rows.push(placeText, avatar, playerTextRow, scoreRow);
    });
    return rows;
}

function burstSparkles(scene, x, y, pieces = 12) {
    for (let i = 0; i < pieces; i++) {
        const spark = scene.add.circle(x, y, Phaser.Math.Between(2, 5), Phaser.Display.Color.RandomRGB().color, 0.95);
        scene.tweens.add({
            targets: spark,
            x: x + Phaser.Math.Between(-80, 80),
            y: y + Phaser.Math.Between(-60, 60),
            alpha: 0,
            scale: 0.2,
            duration: Phaser.Math.Between(350, 650),
            onComplete: () => spark.destroy()
        });
    }
}
