const GAME_WIDTH = 480;
const GAME_HEIGHT = 640;
const LEFT_X = 120;
const RIGHT_X = 360;
const HAND_Y = 510;
const POTATO_Y_OFFSET = 60;
const BASE_HAND_SCALE = 0.44;
const BASE_CATCH_WIDTH = 170;
const BASE_CATCH_HEIGHT = 56;
const MIN_CATCH_WIDTH = 72;
const MIN_CATCH_HEIGHT = 30;
const CATCH_SHRINK_PER_SCORE = 2.8;

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
let welcomeText;
let daddyCheerText;
let soundToggleText;
let dualMatch;
let dualPlayerNames = { mouse: null, keyboard: null };

const game = new Phaser.Game(config);

function preload() {
    this.load.image('potato', 'https://i.imgur.com/6QKQ4Qp.png');
    this.load.image('hand', 'https://i.imgur.com/1Q9Z1Zm.png');
    this.load.image('avatar_bryle', 'assets/images/bryle.png');
    this.load.image('avatar_prince', 'assets/images/Prince.png');
    this.load.image('avatar_josh', 'assets/images/josh.png');
    this.load.image('avatar_mommy', 'assets/images/mommy.png');
    this.load.image('avatar_daddy', 'assets/images/daddy.png');
}

function create() {
    createAnimatedBackground(this);
    const leaderboard = getLeaderboard();
    bestScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
    soundEnabled = localStorage.getItem('tabandatato_sound') !== 'off';

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

    showIntro(this);
}

function update() {
    if (gameState === 'playing' && potato && potato.y > GAME_HEIGHT + 20) {
        loseLife(this);
    }
    if (gameState === 'dual') {
        updateDual(this);
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

    const mascot = scene.add.image(GAME_WIDTH / 2, 360, 'potato').setScale(0.28);
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
    const backBtn = createButton(scene, GAME_WIDTH / 2, 510, 'Back', '#546e7a', () => showIntro(scene), 180, 26);

    modeSelectGroup.addMultiple([title, onePlayerBtn, twoPlayerBtn, backBtn]);
}

function showPlayerSelect(scene) {
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
    cleanupGroup('modeSelectGroup');
    cleanupDualGame(scene);
    cleanupGroup('playerSelectGroup');
    cleanupGroup('guestRoleGroup');
    cleanupGroup('dualPlayerSelectGroup');
    cleanupGroup('dualGuestRoleGroup');
    cleanupGroup('gameOverGroup');
    cleanupGame(scene);

    gameState = 'playing';
    score = 0;
    catchCount = 0;
    canSwitch = true;
    potatoInFlight = false;
    clearPowerUp(scene, true);

    scene.physics.world.gravity.y = 600;
    scene.physics.world.setBoundsCollision(true, true, false, false);

    gameplayGroup = scene.add.group();

    leftHand = scene.physics.add.staticImage(LEFT_X, HAND_Y, 'hand').setScale(BASE_HAND_SCALE);
    rightHand = scene.physics.add.staticImage(RIGHT_X, HAND_Y, 'hand').setScale(BASE_HAND_SCALE);
    leftHand.refreshBody();
    rightHand.refreshBody();

    leftCatchZone = scene.add.rectangle(LEFT_X, HAND_Y + 14, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.2);
    leftCatchZone.setStrokeStyle(3, 0x2e7d32, 0.55);
    scene.physics.add.existing(leftCatchZone, false);
    leftCatchZone.body.setAllowGravity(false);
    leftCatchZone.body.setImmovable(true);

    rightCatchZone = scene.add.rectangle(RIGHT_X, HAND_Y + 14, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.2);
    rightCatchZone.setStrokeStyle(3, 0x2e7d32, 0.55);
    scene.physics.add.existing(rightCatchZone, false);
    rightCatchZone.body.setAllowGravity(false);
    rightCatchZone.body.setImmovable(true);

    potato = scene.physics.add.image(leftHand.x, leftHand.y - POTATO_Y_OFFSET, 'potato').setScale(0.2);
    potato.setCollideWorldBounds(true);
    potato.setBounce(0.85, 0.05);
    potato.setAngularDrag(80);

    leftCollider = scene.physics.add.collider(potato, leftCatchZone, () => onCatch(scene, leftHand));
    rightCollider = scene.physics.add.collider(potato, rightCatchZone, () => onCatch(scene, rightHand));

    scoreText = scene.add.text(GAME_WIDTH / 2, 16, 'Score: 0', makeHudStyle(26, '#1b5e20')).setOrigin(0.5, 0);
    bestText = scene.add.text(GAME_WIDTH - 18, 16, `Best: ${bestScore}`, makeHudStyle(22, '#0d47a1')).setOrigin(1, 0);
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
    if (welcomeText) gameplayGroup.add(welcomeText);
    if (daddyCheerText) gameplayGroup.add(daddyCheerText);

    currentHand = leftHand;
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

    scene.physics.world.gravity.y = 560 + Math.min(score * 8, 220);

    scoreText.setText(`Score: ${score}`);
    updateCatchZoneSizeForScore();

    if (score > bestScore) {
        bestScore = score;
        bestText.setText(`Best: ${bestScore}`);
    }

    popText(scoreText, scene);
    popHand(hand, scene);
    burstSparkles(scene, hand.x, hand.y - 48);
    playSfx('catch');
    maybeTriggerPowerUp(scene);
    if (selectedPlayer === 'Daddy') {
        showDaddyCheer(scene, hand.x, hand.y - 90);
        burstSparkles(scene, hand.x, hand.y - 90, 18);
    }
}

function loseLife(scene) {
    if (gameState !== 'playing') return;

    scene.cameras.main.shake(220, 0.007);
    playSfx('miss');
    finishGame(scene);
}

function finishGame(scene) {
    gameState = 'gameover';
    canSwitch = false;
    potatoInFlight = false;

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
    dualPlayerNames = { mouse: null, keyboard: null };
    showDualPlayerSelect(scene, 'mouse');
}

function showDualPlayerSelect(scene, slot) {
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
    dualGroup = scene.add.group();
    dualResultGroup = null;

    const divider = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, 6, 0xffffff, 0.75);
    const topBg = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0xffffff, 0.08);
    const bottomBg = scene.add.rectangle(GAME_WIDTH / 2, (GAME_HEIGHT * 3) / 4, GAME_WIDTH, GAME_HEIGHT / 2, 0xffffff, 0.06);

    const mouseName = names?.mouse || 'Mouse';
    const keyboardName = names?.keyboard || 'Keyboard';

    const mouseTitle = scene.add.text(14, 12, `${mouseName} (Mouse/Touch)`, {
        fontSize: '22px',
        fill: '#006064',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    });
    const keyboardTitle = scene.add.text(14, 332, `${keyboardName} (Space/Up)`, {
        fontSize: '22px',
        fill: '#4a148c',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    });
    const seriesText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Best of 3 - Round 1\n0 : 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#1565c0',
        strokeThickness: 4
    }).setOrigin(0.5);
    const exitBtn = createButton(scene, GAME_WIDTH - 72, 20, 'Exit', '#546e7a', () => showIntro(scene), 120, 20);

    dualMatch = {
        ended: false,
        round: 1,
        maxWins: 2,
        seriesText,
        mouse: createDualLanePlayer(scene, mouseName, 250, '#00838f'),
        keyboard: createDualLanePlayer(scene, keyboardName, 565, '#6a1b9a')
    };

    dualGroup.addMultiple([topBg, bottomBg, divider, mouseTitle, keyboardTitle, seriesText, exitBtn]);
    updateDualSeriesHud();
}

function createDualLanePlayer(scene, label, handsY, accentColor) {
    const player = {
        label,
        score: 0,
        totalScore: 0,
        wins: 0,
        canSwitch: true,
        inFlight: false,
        currentSide: 'left',
        topLimit: Math.max(0, handsY - 170),
        missLimit: Math.min(GAME_HEIGHT + 20, handsY + 90)
    };

    player.leftHand = scene.physics.add.staticImage(LEFT_X, handsY, 'hand').setScale(0.34);
    player.rightHand = scene.physics.add.staticImage(RIGHT_X, handsY, 'hand').setScale(0.34);
    player.leftHand.refreshBody();
    player.rightHand.refreshBody();

    player.leftZone = scene.add.rectangle(LEFT_X, handsY + 14, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.18);
    player.leftZone.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(accentColor).color, 0.75);
    scene.physics.add.existing(player.leftZone, false);
    player.leftZone.body.setAllowGravity(false);
    player.leftZone.body.setImmovable(true);

    player.rightZone = scene.add.rectangle(RIGHT_X, handsY + 14, BASE_CATCH_WIDTH, BASE_CATCH_HEIGHT, 0xffffff, 0.18);
    player.rightZone.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(accentColor).color, 0.75);
    scene.physics.add.existing(player.rightZone, false);
    player.rightZone.body.setAllowGravity(false);
    player.rightZone.body.setImmovable(true);

    player.potato = scene.physics.add.image(LEFT_X, handsY - POTATO_Y_OFFSET, 'potato').setScale(0.2);
    player.potato.setCollideWorldBounds(true);
    player.potato.setBounce(0.85, 0.05);
    player.potato.setAngularDrag(80);
    player.potato.setVelocity(0);

    player.leftCollider = scene.physics.add.collider(player.potato, player.leftZone, () => onDualCatch(scene, player, 'left'));
    player.rightCollider = scene.physics.add.collider(player.potato, player.rightZone, () => onDualCatch(scene, player, 'right'));

    const hudY = handsY < GAME_HEIGHT / 2 ? 42 : 362;
    player.scoreText = scene.add.text(GAME_WIDTH - 16, hudY, `${label}: 0`, {
        fontSize: '24px',
        fill: accentColor,
        fontFamily: 'Trebuchet MS',
        fontStyle: 'bold'
    }).setOrigin(1, 0.5);

    dualGroup.addMultiple([
        player.leftZone,
        player.rightZone,
        player.leftHand,
        player.rightHand,
        player.potato,
        player.scoreText
    ]);

    return player;
}

function switchDualHand(scene, controlKey) {
    if (!dualMatch || dualMatch.ended) return;
    const player = controlKey === 'mouse' ? dualMatch.mouse : dualMatch.keyboard;
    if (!player || !player.canSwitch) return;

    player.canSwitch = false;
    player.inFlight = true;
    const targetSide = player.currentSide === 'left' ? 'right' : 'left';
    const targetX = targetSide === 'left' ? LEFT_X : RIGHT_X;
    const throwBoost = Math.min(player.score * 4, 120);
    const throwPower = 280 + throwBoost;

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
    player.score += 1;
    player.totalScore += 1;
    player.scoreText.setText(`${player.label}: ${player.score}`);
    updateDualCatchZoneSize(player);
    popText(player.scoreText, scene);
    burstSparkles(scene, side === 'left' ? LEFT_X : RIGHT_X, player.leftHand.y - 48, 10);
    playSfx('catch');
}

function updateDual(scene) {
    if (!dualMatch || dualMatch.ended) return;

    const mouseMissed = dualMatch.mouse.potato.y > dualMatch.mouse.missLimit;
    const keyboardMissed = dualMatch.keyboard.potato.y > dualMatch.keyboard.missLimit;

    if (mouseMissed || keyboardMissed) {
        finishDualRound(scene, mouseMissed ? dualMatch.mouse.label : dualMatch.keyboard.label);
    }
}

function updateDualCatchZoneSize(player) {
    const widthShrink = player.score * (CATCH_SHRINK_PER_SCORE + player.score * 0.03);
    const heightShrink = player.score * (0.9 + player.score * 0.01);
    const nextWidth = Math.max(MIN_CATCH_WIDTH, BASE_CATCH_WIDTH - widthShrink);
    const nextHeight = Math.max(MIN_CATCH_HEIGHT, BASE_CATCH_HEIGHT - heightShrink);

    player.leftZone.setSize(nextWidth, nextHeight);
    player.rightZone.setSize(nextWidth, nextHeight);
    player.leftZone.body.setSize(nextWidth, nextHeight, true);
    player.rightZone.body.setSize(nextWidth, nextHeight, true);
}

function finishDualRound(scene, loserLabel) {
    if (!dualMatch || dualMatch.ended) return;
    dualMatch.ended = true;

    const loser = loserLabel === dualMatch.mouse.label ? dualMatch.mouse : dualMatch.keyboard;
    const winner = loser === dualMatch.mouse ? dualMatch.keyboard : dualMatch.mouse;
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
    const info = scene.add.text(GAME_WIDTH / 2, 302, `${loser.label} missed the catch\nSeries: ${dualMatch.mouse.wins} - ${dualMatch.keyboard.wins}`, {
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
    resetDualPlayerForRound(dualMatch.mouse);
    resetDualPlayerForRound(dualMatch.keyboard);
    dualMatch.ended = false;
    updateDualSeriesHud();
}

function resetDualPlayerForRound(player) {
    if (!player) return;
    player.score = 0;
    player.canSwitch = true;
    player.inFlight = false;
    player.currentSide = 'left';
    if (player.leftHand) player.potato.setPosition(player.leftHand.x, player.leftHand.y - POTATO_Y_OFFSET);
    player.potato.setVelocity(0);
    player.potato.setAngularVelocity(0);
    player.scoreText.setText(`${player.label}: 0`);
    updateDualCatchZoneSize(player);
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

    if (gameplayGroup) {
        gameplayGroup.destroy(true);
        gameplayGroup = null;
    }
    clearPowerUp(scene, true);

    scene.physics.world.gravity.y = 600;
}

function cleanupDualGame(scene) {
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
        });
        dualMatch = null;
    }

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

function updateCatchZoneSizeForScore() {
    if (!leftCatchZone || !rightCatchZone) return;

    const widthShrink = score * (CATCH_SHRINK_PER_SCORE + score * 0.03);
    const heightShrink = score * (0.9 + score * 0.01);
    const bonus = activePowerUp && activePowerUp.type === 'bigbox' ? 1.35 : 1;
    const nextWidth = Math.max(MIN_CATCH_WIDTH, (BASE_CATCH_WIDTH - widthShrink) * bonus);
    const nextHeight = Math.max(MIN_CATCH_HEIGHT, (BASE_CATCH_HEIGHT - heightShrink) * bonus);

    leftCatchZone.setSize(nextWidth, nextHeight);
    rightCatchZone.setSize(nextWidth, nextHeight);
    leftCatchZone.body.setSize(nextWidth, nextHeight, true);
    rightCatchZone.body.setSize(nextWidth, nextHeight, true);

    const alpha = Phaser.Math.Linear(0.2, 0.08, (BASE_CATCH_WIDTH - nextWidth) / (BASE_CATCH_WIDTH - MIN_CATCH_WIDTH));
    leftCatchZone.setFillStyle(0xffffff, alpha);
    rightCatchZone.setFillStyle(0xffffff, alpha);
}

function maybeTriggerPowerUp(scene) {
    if (activePowerUp || catchCount === 0 || catchCount % 7 !== 0) return;
    const types = ['freeze', 'bigbox', 'double'];
    const type = types[Phaser.Math.Between(0, types.length - 1)];
    activatePowerUp(scene, type);
}

function activatePowerUp(scene, type) {
    clearPowerUp(scene, true);
    activePowerUp = { type };
    if (!powerUpText) return;

    if (type === 'freeze') {
        scene.physics.world.gravity.y = Math.max(380, scene.physics.world.gravity.y * 0.7);
        powerUpText.setText('Power-Up: Freeze Time!');
    } else if (type === 'bigbox') {
        powerUpText.setText('Power-Up: Big Catch Box!');
        updateCatchZoneSizeForScore();
    } else {
        powerUpText.setText('Power-Up: Double Score x2!');
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
    if (leftCatchZone && rightCatchZone) updateCatchZoneSizeForScore();
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
    localStorage.removeItem('tabandatato_leaderboard');
    localStorage.removeItem('tabandatato_dual_leaderboard');
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

