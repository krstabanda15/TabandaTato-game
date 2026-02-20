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
const BOX_MOVE_SCORE_TRIGGER = 10;
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
let selectedPlayer = 'Guest';
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
let dualGroup;
let dualResultGroup;
let bgGroup;

let scoreText;
let bestText;
let playerText;
let timerText;
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
let boxMoveEvent = null;
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
    const leaderboard = getLeaderboard();
    bestScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
    soundEnabled = localStorage.getItem('tabandatato_sound') !== 'off';
    singleTimerEnabled = localStorage.getItem('tabandatato_timer_single') !== 'off';
    dualTimerEnabled = true;
    singleTimerSeconds = clampTimerSeconds(parseInt(localStorage.getItem('tabandatato_timer_single_seconds'), 10) || 30);
    dualTimerSeconds = 120;

    this.input.on('pointerdown', (pointer, gameObjects) => {
        if (gameObjects.length > 0) return;
        if (gameState === 'playing') {
            switchHand(this);
        } else if (gameState === 'dual') {
            switchDualHand(this, 'mouse');
        }
    });
    this.input.keyboard.on('keydown-SPACE', () => {
        if (gameState === 'dual') switchDualHand(this, 'keyboard');
    });
    this.input.keyboard.on('keydown-UP', () => {
        if (gameState === 'dual') switchDualHand(this, 'keyboard');
    });
    this.input.keyboard.addCapture(['SPACE', 'UP']);

    showIntro(this);
}

function ensureCoreTextures(scene) {
    if (scene.textures.exists('potato')) scene.textures.remove('potato');
    if (scene.textures.exists('hand')) scene.textures.remove('hand');

    const potatoG = scene.make.graphics({ x: 0, y: 0, add: false });
    potatoG.fillStyle(0x8d6e63, 1);
    potatoG.fillEllipse(64, 64, 90, 70);
    potatoG.lineStyle(3, 0xd7ccc8, 0.9);
    potatoG.strokeEllipse(64, 64, 90, 70);
    potatoG.fillStyle(0x5d4037, 0.7);
    potatoG.fillEllipse(52, 52, 16, 10);
    potatoG.fillEllipse(78, 70, 14, 9);
    potatoG.fillEllipse(64, 80, 12, 8);
    potatoG.generateTexture('potato', 128, 128);
    potatoG.destroy();

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

function update(time, delta) {
    if (gameState === 'playing') {
        updateCatchZoneSizeForScore(this);
        updateSinglePowerUps(this, delta);
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
    if (gameState === 'dual' && dualTimerEnabled && dualTimerText) {
        const elapsedMs = getDualElapsedMs(this);
        const remainingSec = Math.max(0, Math.ceil((dualTimerSeconds * 1000 - elapsedMs) / 1000));
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
    cleanupGroup('introGroup');

    gameState = 'intro';
    introGroup = scene.add.group();

    const title = scene.add.text(GAME_WIDTH / 2, 160, 'TabandaTato', {
        fontSize: '58px',
        fill: '#5d4037',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff8e1',
        strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5);

    const subtitle = scene.add.text(GAME_WIDTH / 2, 250, 'Tap anywhere to pass the potato.\nKeep it hot, never let it drop!', {
        fontSize: '24px',
        fill: '#1a237e',
        align: 'center',
        fontFamily: 'Verdana',
        lineSpacing: 8
    }).setOrigin(0.5);

    const mascot = scene.add.image(GAME_WIDTH / 2, 360, 'potato').setDisplaySize(POTATO_INTRO_SIZE, POTATO_INTRO_SIZE);
    scene.tweens.add({
        targets: [title, mascot],
        y: '-=12',
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    const startBtn = createButton(scene, GAME_WIDTH / 2, 460, 'Start Game', '#43a047', () => showModeSelect(scene), 280, 34);
    const leaderboardBtn = createButton(scene, GAME_WIDTH / 2, 525, 'Leaderboard', '#ef6c00', () => showLeaderboard(scene), 260, 28);
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
    const hint = scene.add.text(GAME_WIDTH / 2, 540, 'One miss = game over. Keep the potato up!', {
        fontSize: '19px',
        fill: '#004d40',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5).setY(590);

    introGroup.addMultiple([title, subtitle, mascot, startBtn, leaderboardBtn, soundToggleText, hint]);
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

    gameState = 'select';
    modeSelectGroup = scene.add.group();

    const title = scene.add.text(GAME_WIDTH / 2, 180, 'Choose Game Mode', {
        fontSize: '50px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const onePlayerBtn = createButton(scene, GAME_WIDTH / 2, 300, 'One Player', '#2e7d32', () => showPlayerSelect(scene), 280, 34);
    const twoPlayerBtn = createButton(scene, GAME_WIDTH / 2, 390, 'Two Players', '#00838f', () => startDualSetup(scene), 280, 34);
    const onePlayerTimerToggle = createToggleButton(
        scene,
        GAME_WIDTH / 2 - 100,
        455,
        `1P Timer: ${singleTimerEnabled ? 'ON' : 'OFF'}`,
        '#6d4c41',
        () => toggleSingleTimer(onePlayerTimerToggle),
        200,
        20
    );
    const onePlayerTimerOption = createToggleButton(
        scene,
        GAME_WIDTH / 2 + 112,
        455,
        `1P: ${singleTimerSeconds}s`,
        '#5d4037',
        () => cycleSingleTimerSeconds(onePlayerTimerOption),
        160,
        20
    );
    const backBtn = createButton(scene, GAME_WIDTH / 2, 510, 'Back', '#546e7a', () => showIntro(scene), 180, 26);

    backBtn.setY(560);
    modeSelectGroup.addMultiple([
        title,
        onePlayerBtn,
        twoPlayerBtn,
        onePlayerTimerToggle,
        onePlayerTimerOption,
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

    const title = scene.add.text(GAME_WIDTH / 2, 150, 'Choose Your Hero', {
        fontSize: '46px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 6
    }).setOrigin(0.5);

    const players = ['Bryle', 'Prince', 'Josh', 'Guest'];
    const colors = ['#1976d2', '#00897b', '#f4511e', '#6d4c41'];
    const buttons = players.map((name, index) => {
        const y = 250 + index * 82;
        const btn = createButton(
            scene,
            GAME_WIDTH / 2 + 35,
            y,
            name,
            colors[index],
            () => {
                if (name === 'Guest') {
                    showGuestRoleSelect(scene);
                    return;
                }
                selectedPlayer = name;
                startActualGame(scene);
            },
            220,
            30
        );
        const avatar = createAvatar(scene, getAvatarKey(name), GAME_WIDTH / 2 - 95, y, 0.2);
        return [btn, avatar];
    }).flat();

    const backBtn = createButton(scene, GAME_WIDTH / 2, 590, 'Back', '#546e7a', () => showIntro(scene), 170, 24);
    playerSelectGroup.addMultiple([title, ...buttons, backBtn]);
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
    cleanupDualGame(scene);

    gameState = 'leaderboard';
    leaderboardGroup = scene.add.group();

    const panel = scene.add.rectangle(GAME_WIDTH / 2, 330, 440, 600, 0xffffff, 0.95);
    panel.setStrokeStyle(4, 0xffb74d, 1);
    const title = scene.add.text(GAME_WIDTH / 2, 90, 'High Scores', {
        fontSize: '52px',
        fill: '#e65100',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff3e0',
        strokeThickness: 7
    }).setOrigin(0.5);

    const leaderboard = getLeaderboard();
    const entries = leaderboard.slice(0, 5);
    const rows = [];

    const singleTitle = scene.add.text(GAME_WIDTH / 2, 140, '1 Player', {
        fontSize: '30px',
        fill: '#2e7d32',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    if (entries.length === 0) {
        rows.push(scene.add.text(GAME_WIDTH / 2, 225, 'No 1-player scores yet', {
            fontSize: '22px',
            fill: '#455a64',
            align: 'center',
            fontFamily: 'Trebuchet MS'
        }).setOrigin(0.5));
    } else {
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
    const dualTitle = scene.add.text(GAME_WIDTH / 2, 365, '2 Players', {
        fontSize: '30px',
        fill: '#00838f',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const dualEntries = getDualLeaderboard().slice(0, 5);
    if (dualEntries.length === 0) {
        rows.push(scene.add.text(GAME_WIDTH / 2, 430, 'No 2-player scores yet', {
            fontSize: '22px',
            fill: '#455a64',
            align: 'center',
            fontFamily: 'Trebuchet MS'
        }).setOrigin(0.5));
    } else {
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
    }

    const resetBtn = createButton(scene, GAME_WIDTH / 2, 540, 'Reset Leaderboard', '#c62828', () => {
        resetLeaderboard();
        showLeaderboard(scene);
    }, 280, 24);
    const backBtn = createButton(scene, GAME_WIDTH / 2, 590, 'Back', '#546e7a', () => showIntro(scene), 170, 24);
    leaderboardGroup.addMultiple([panel, title, singleTitle, divider, dualTitle, ...rows, resetBtn, backBtn]);
}

function startActualGame(scene) {
    applyGameWidth(scene, SINGLE_GAME_WIDTH);
    cleanupGroup('modeSelectGroup');
    cleanupDualGame(scene);
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGame(scene);

    gameState = 'playing';
    runStartMs = scene.time.now;
    singleLastPowerType = null;
    singleShieldCharges = 0;
    score = 0;
    catchCount = 0;
    canSwitch = true;
    potatoInFlight = false;
    singleDifficultyLevel = 0;
    freezeStartedAt = null;
    freezeTotalMs = 0;
    clearPowerUp(scene, true);

    scene.physics.world.gravity.y = 600;
    scene.physics.world.setBoundsCollision(true, true, false, false);

    gameplayGroup = scene.add.group();
    ensureSinglePowerIconTextures(scene);
    singlePowerUpGroup = scene.add.group();

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

    potato = scene.physics.add.image(leftHand.x, leftHand.y - POTATO_Y_OFFSET, 'potato').setDisplaySize(POTATO_GAME_SIZE, POTATO_GAME_SIZE);
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

    scoreText = scene.add.text(GAME_WIDTH / 2, 16, 'Score: 0', makeHudStyle(26, '#1b5e20')).setOrigin(0.5, 0);
    bestText = scene.add.text(GAME_WIDTH - 18, 16, `Best: ${bestScore}`, makeHudStyle(22, '#0d47a1')).setOrigin(1, 0);
    timerText = singleTimerEnabled
        ? scene.add.text(18, 16, `Time: ${singleTimerSeconds}s`, makeHudStyle(22, '#4e342e')).setOrigin(0, 0)
        : null;
    playerText = scene.add.text(GAME_WIDTH / 2, 56, `Player: ${selectedPlayer}`, makeHudStyle(20, '#263238')).setOrigin(0.5, 0);
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
    const gameHintText = scene.add.text(GAME_WIDTH / 2, selectedPlayer === 'Daddy' ? 124 : 94, 'Catch box starts big, then gets smaller', {
        fontSize: '20px',
        fill: '#004d40',
        fontFamily: 'Trebuchet MS'
    }).setOrigin(0.5).setAlpha(0.85);
    powerUpText = scene.add.text(GAME_WIDTH / 2, selectedPlayer === 'Daddy' ? 154 : 124, '', {
        fontSize: '20px',
        fill: '#d32f2f',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    gameplayGroup.addMultiple([
        leftCatchZone, rightCatchZone, leftHand, rightHand, potato,
        scoreText, bestText, playerText, gameHintText, powerUpText
    ]);
    if (timerText) gameplayGroup.add(timerText);
    if (welcomeText) gameplayGroup.add(welcomeText);
    if (daddyCheerText) gameplayGroup.add(daddyCheerText);

    resetMovingBoxes(scene);
    currentHand = leftHand;
    scheduleNextSinglePowerUp(scene);
}

function switchHand(scene) {
    if (!canSwitch || !potato || gameState !== 'playing') return;

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
    const gain = activePowerUp && activePowerUp.type === 'double' ? 2 : 1;
    score += gain;

    applySingleDifficulty(scene);
    const gravityBoost = Math.min(singleDifficultyLevel * 24, 160);
    scene.physics.world.gravity.y = 560 + Math.min(score * 8, 220) + gravityBoost;

    scoreText.setText(`Score: ${score}`);
    updateCatchZoneSizeForScore(scene);
    maybeEnableMovingBoxes(scene);

    if (score > bestScore) {
        bestScore = score;
        bestText.setText(`Best: ${bestScore}`);
    }

    popText(scoreText, scene);
    popHand(hand, scene);
    burstSparkles(scene, hand.x, hand.y - 48);
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
    score += 2;

    scene.physics.world.gravity.y = 560 + Math.min(score * 8, 220);

    scoreText.setText(`Score: ${score}`);
    updateCatchZoneSizeForScore(scene);

    if (score > bestScore) {
        bestScore = score;
        bestText.setText(`Best: ${bestScore}`);
    }

    popText(scoreText, scene);
    popHand(hand, scene);
    burstSparkles(scene, hand.x, hand.y - 48);
    playSfx('catch');
    if (selectedPlayer === 'Daddy') {
        showDaddyCheer(scene, hand.x, hand.y - 90);
        burstSparkles(scene, hand.x, hand.y - 90, 18);
    }
}

function loseLife(scene) {
    if (gameState !== 'playing') return;
    if (singleShieldCharges > 0 && potato && currentHand) {
        singleShieldCharges -= 1;
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

    scene.cameras.main.shake(220, 0.007);
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

    if (potato) {
        potato.setVelocity(0);
        potato.setAngularVelocity(0);
        potato.setTint(0xff8a80);
    }

    saveLeaderboardEntry(selectedPlayer, score);
    const leaderboard = getLeaderboard();
    bestScore = leaderboard.length > 0 ? leaderboard[0].score : bestScore;

    cleanupGroup('gameOverGroup');
    gameOverGroup = scene.add.group();

    const panel = scene.add.rectangle(GAME_WIDTH / 2, 330, 420, 500, 0xffffff, 0.94);
    panel.setStrokeStyle(4, 0xff7043, 1);
    const title = scene.add.text(GAME_WIDTH / 2, 230, 'Great Try!', {
        fontSize: '54px',
        fill: '#e65100',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold',
        stroke: '#fff3e0',
        strokeThickness: 7
    }).setOrigin(0.5);
    const summary = scene.add.text(GAME_WIDTH / 2, 300, `Player: ${selectedPlayer}\nScore: ${score}\nBest: ${bestScore}`, {
        fontSize: '30px',
        fill: '#263238',
        align: 'center',
        fontFamily: 'Trebuchet MS',
        lineSpacing: 10
    }).setOrigin(0.5);

    const top3Title = scene.add.text(GAME_WIDTH / 2, 380, 'Top 3', {
        fontSize: '30px',
        fill: '#4a148c',
        fontFamily: 'Comic Sans MS',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    const topThreeRows = createTopThreeRows(scene, leaderboard);

    const replay = createButton(scene, GAME_WIDTH / 2, 540, 'Play Again', '#2e7d32', () => startActualGame(scene), 250, 30);
    const menu = createButton(scene, GAME_WIDTH / 2, 600, 'Main Menu', '#1565c0', () => showIntro(scene), 250, 30);

    gameOverGroup.addMultiple([panel, title, summary, top3Title, ...topThreeRows, replay, menu]);
    burstSparkles(scene, GAME_WIDTH / 2, 210, 26);
    clearPowerUp(scene, true);
    playSfx('win');
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
        const btn = createButton(
            scene,
            GAME_WIDTH / 2 + 35,
            y,
            name,
            colors[index],
            () => {
                if (name === 'Guest') {
                    showDualGuestRoleSelect(scene, slot);
                    return;
                }
                completeDualPlayerChoice(scene, slot, name);
            },
            220,
            30
        );
        const avatar = createAvatar(scene, getAvatarKey(name), GAME_WIDTH / 2 - 95, y, 0.2);
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

    const mommyAvatar = createAvatar(scene, 'avatar_mommy', GAME_WIDTH / 2 - 100, 340, 0.2);
    const mommyBtn = createButton(scene, GAME_WIDTH / 2 + 35, 340, 'Mommy', '#ad1457', () => {
        completeDualPlayerChoice(scene, slot, 'Mommy');
    }, 220, 30);

    const daddyAvatar = createAvatar(scene, 'avatar_daddy', GAME_WIDTH / 2 - 100, 430, 0.2);
    const daddyBtn = createButton(scene, GAME_WIDTH / 2 + 35, 430, 'Daddy', '#6a1b9a', () => {
        completeDualPlayerChoice(scene, slot, 'Daddy');
    }, 220, 30);

    const backBtn = createButton(scene, GAME_WIDTH / 2, 560, 'Back', '#546e7a', () => showDualPlayerSelect(scene, slot), 170, 24);
    dualGuestRoleGroup.addMultiple([title, question, mommyAvatar, mommyBtn, daddyAvatar, daddyBtn, backBtn]);
}

function completeDualPlayerChoice(scene, slot, name) {
    dualPlayerNames[slot] = name;
    if (slot === 'mouse') {
        showDualPlayerSelect(scene, 'keyboard');
        return;
    }
    startDualGame(scene, dualPlayerNames);
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

    gameState = 'dual';
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
    const seriesText = scene.add.text(GAME_WIDTH / 2, 12, 'Best of 3 - Round 1\n0 : 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#1565c0',
        strokeThickness: 4
    }).setOrigin(0.5, 0);
    const exitBtn = createButton(scene, GAME_WIDTH - 60, 92, 'Exit', '#546e7a', () => showIntro(scene), 120, 20);
    dualTimerText = dualTimerEnabled
        ? scene.add.text(GAME_WIDTH / 2, 14, `Time: ${dualTimerSeconds}s`, {
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
        maxWins: 2,
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


    scheduleNextDualPowerUp(scene);

    dualGroup.addMultiple([
        leftPanel,
        rightPanel,
        divider,
        mousePortrait,
        keyboardPortrait,
        mouseTitle,
        keyboardTitle,
        seriesText,
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
    if (!dualMatch || dualMatch.ended || !dualPowerUpGroup) return;
    if (dualPowerSpawnEvent) {
        dualPowerSpawnEvent.remove(false);
        dualPowerSpawnEvent = null;
    }
    dualPowerSpawnEvent = scene.time.delayedCall(Phaser.Math.Between(6000, 10000), () => {
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

function finishDualRound(scene, loserLabel, reasonText = 'missed the catch') {
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

    if (mouse.score > keyboard.score) {
        winner = mouse;
        loser = keyboard;
    } else if (keyboard.score > mouse.score) {
        winner = keyboard;
        loser = mouse;
    } else {
        if (loserLabel) {
            loser = loserLabel === mouse.label ? mouse : keyboard;
            winner = loser === mouse ? keyboard : mouse;
        } else {
            const mouseY = mouse.potato?.y ?? 0;
            const keyboardY = keyboard.potato?.y ?? 0;
            loser = mouseY > keyboardY ? mouse : keyboard;
            winner = loser === mouse ? keyboard : mouse;
        }
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
    scheduleNextDualPowerUp(scene);
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
    dualMatch.seriesText.setText(`Best of 3 - Round ${dualMatch.round}\n${dualMatch.mouse.wins} : ${dualMatch.keyboard.wins}`);
}

function endDualSeries(scene, winner, loser) {
    if (!dualMatch) return;
    const currentNames = { mouse: dualMatch.mouse.label, keyboard: dualMatch.keyboard.label };
    saveDualLeaderboardEntry(winner.label, loser.label, winner.totalScore, loser.totalScore);
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

    if (gameplayGroup) {
        gameplayGroup.destroy(true);
        gameplayGroup = null;
    }
    clearPowerUp(scene, true);

    scene.physics.world.gravity.y = 600;
}

function cleanupDualGame(scene) {
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
        fixedWidth: width
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
        fixedWidth: width
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

function cycleDualTimerSeconds(buttonText) {
    const idx = TIMER_OPTIONS.indexOf(dualTimerSeconds);
    dualTimerSeconds = TIMER_OPTIONS[(idx + 1) % TIMER_OPTIONS.length];
    localStorage.setItem('tabandatato_timer_dual_seconds', String(dualTimerSeconds));
    if (buttonText) buttonText.setText(`2P: ${dualTimerSeconds}s`);
}

function clampTimerSeconds(value) {
    return TIMER_OPTIONS.includes(value) ? value : 30;
}

function finishDualRoundByTimer(scene) {
    if (!dualMatch || dualMatch.ended) return;
    finishDualRound(scene, null, 'time is up');
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

    const widthShrink = score * (CATCH_SHRINK_PER_SCORE + score * 0.03);
    const heightShrink = score * (0.9 + score * 0.01);
    const levelWidthShrink = singleDifficultyLevel * 6;
    const levelHeightShrink = singleDifficultyLevel * 1.2;
    const elapsedSec = Math.max(0, ((scene?.time.now ?? 0) - runStartMs) / 1000);
    const timeWidthShrink = elapsedSec * CATCH_SHRINK_PER_SECOND;
    const timeHeightShrink = elapsedSec * 0.62;
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
    if (currentScore < BOX_MOVE_SCORE_TRIGGER) return 0;
    return Math.floor((currentScore - BOX_MOVE_SCORE_TRIGGER) / DIFFICULTY_SCORE_STEP) + 1;
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
    if (score < BOX_MOVE_SCORE_TRIGGER) return;
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
    if (score < BOX_MOVE_SCORE_TRIGGER || boxMoveEvent) return;
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
    const boostChance = score >= BOX_MOVE_SCORE_TRIGGER ? Math.max(0.32, 0.62 - level * 0.05) : 0.68;
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
        singleShieldCharges = Math.min(3, singleShieldCharges + 1);
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

function createAvatar(scene, key, x, y, scale) {
    const avatar = scene.add.image(x, y, key).setScale(scale);
    avatar.setDisplaySize(40, 40);
    return avatar;
}

function getLeaderboard() {
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
    const leaderboard = getLeaderboard();
    leaderboard.push({
        player: player || 'Guest',
        score: Number(playerScore) || 0,
        date: Date.now()
    });
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmed = leaderboard.slice(0, 50);
    localStorage.setItem('tabandatato_leaderboard', JSON.stringify(trimmed));
}

function resetLeaderboard() {
    const singleTop = getLeaderboard().slice(0, 3);
    const dualTop = getDualLeaderboard().slice(0, 3);
    localStorage.setItem('tabandatato_leaderboard', JSON.stringify(singleTop));
    localStorage.setItem('tabandatato_dual_leaderboard', JSON.stringify(dualTop));
}

function getDualLeaderboard() {
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
    const leaderboard = getDualLeaderboard();
    leaderboard.push({
        winner: winner || 'Unknown',
        loser: loser || 'Unknown',
        winnerScore: Number(winnerScore) || 0,
        loserScore: Number(loserScore) || 0,
        date: Date.now()
    });
    leaderboard.sort((a, b) => b.winnerScore - a.winnerScore || b.loserScore - a.loserScore);
    localStorage.setItem('tabandatato_dual_leaderboard', JSON.stringify(leaderboard.slice(0, 50)));
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
