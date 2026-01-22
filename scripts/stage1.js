// ========== 第一阶段逻辑 ==========

// 全局状态
const gameState = {
    mousePos: { x: window.innerWidth/2, y: window.innerHeight/2 },
    isLocked: false,
    isNearButton: false,
    isInCoreZone: false,
    energy: 100,
    failCount: 0,
    isFrozen: false,
    isInsideGravityWell: false,
    startTime: 0,
    attemptTimer: 0,
    timerInterval: null,
    energyDepletionStartTime: 0,
    timeNearButton: 0,
    currentResistance: 0,
    buttonFound: false,
    buttonOffset: { x: 0, y: 0 },
    canClickButton: false,
    
    lastMouseMoveTime: 0,
    distractionTimerInterval: null,
    distractionCountdown: 1.0,
    isDistractionActive: false,
    
    centerHoldStartTime: 0,
    isInCenterZone: false,
    centerHoldInterval: null
};

// 常量
const GRAVITY_WELL_RADIUS = 200;
const RESISTANCE_AREA_RADIUS = 400;
const BUTTON_RADIUS = 29.5;
const HALO_RADIUS = 50;

const HIGH_RESISTANCE_RADIUS = 200;
const MEDIUM_RESISTANCE_RADIUS = 300;
const LOW_RESISTANCE_RADIUS = 350;

const AD_ATTRACTION_RADIUS = 100;
const AD_ATTRACTION_FORCE = 0.15;

const DISTRACTION_TIMEOUT = 1000;

const CENTER_ZONE_RADIUS = 40;
const CENTER_HOLD_TIME = 2000;

const RESISTANCE_ENERGY_COST_MULTIPLIER = 2.0;
const AD_ESCAPE_ENERGY_COST_MULTIPLIER = 2.0;
const BUTTON_REPULSION_ENERGY_COST_MULTIPLIER = 1.5;

// 元素引用
let gravityWell, taskBtn, taskButtonContainer, buttonHalo, zone1, zone2, energyFill, energyValue;
let gravityWellCenter, zone1Center, zone2Center, zone1Rect, zone2Rect;

// 初始化第一阶段
function initFirstStage() {
    console.log('初始化第一阶段');
    
    // 获取元素
    gravityWell = document.getElementById('gravityWell');
    taskBtn = document.getElementById('taskBtn');
    taskButtonContainer = document.getElementById('taskButtonContainer');
    buttonHalo = document.getElementById('buttonHalo');
    zone1 = document.getElementById('zone1');
    zone2 = document.getElementById('zone2');
    energyFill = document.getElementById('energyFill');
    energyValue = document.getElementById('energyValue');
    
    if (!gravityWell || !taskBtn || !energyFill || !energyValue) {
        console.error('第一阶段元素未找到');
        return;
    }
    
    // 重置状态
    gameState.mousePos = { x: window.innerWidth/2, y: window.innerHeight/2 };
    gameState.energy = 100;
    gameState.failCount = 0;
    gameState.isFrozen = false;
    gameState.isInsideGravityWell = false;
    gameState.startTime = 0;
    gameState.attemptTimer = 0;
    gameState.energyDepletionStartTime = 0;
    gameState.timeNearButton = 0;
    gameState.currentResistance = 0;
    gameState.buttonFound = false;
    gameState.buttonOffset = { x: 0, y: 0 };
    gameState.canClickButton = false;
    gameState.lastMouseMoveTime = Date.now();
    gameState.distractionCountdown = 1.0;
    gameState.isDistractionActive = false;
    gameState.centerHoldStartTime = 0;
    gameState.isInCenterZone = false;
    
    // 更新UI
    energyFill.style.width = '100%';
    energyValue.textContent = '100%';
    energyValue.style.color = '#333';
    
    const failCountDisplay = document.getElementById('failCountDisplay');
    if (failCountDisplay) {
        failCountDisplay.textContent = '失败次数: 0';
        failCountDisplay.style.color = '#666';
    }
    
    // 计算位置
    updateElementPositions();
    
    // 显示自定义光标
    const customCursor = document.getElementById('customCursor');
    if (customCursor) {
        customCursor.style.display = 'block';
        customCursor.style.left = `${gameState.mousePos.x - 10}px`;
        customCursor.style.top = `${gameState.mousePos.y - 10}px`;
    }
    
    // 显示鼠标锁定提示
    const lockHint = document.getElementById('lockHint');
    if (lockHint) lockHint.classList.remove('hidden');
    
    console.log('第一阶段初始化完成');
}

// 更新元素位置
function updateElementPositions() {
    if (!gravityWell || !zone1 || !zone2) return;
    
    gravityWellRect = gravityWell.getBoundingClientRect();
    gravityWellCenter = {
        x: gravityWellRect.left + gravityWellRect.width / 2,
        y: gravityWellRect.top + gravityWellRect.height / 2
    };

    zone1Rect = zone1.getBoundingClientRect();
    zone2Rect = zone2.getBoundingClientRect();
    zone1Center = {
        x: zone1Rect.left + zone1Rect.width / 2,
        y: zone1Rect.top + zone1Rect.height / 2
    };
    zone2Center = {
        x: zone2Rect.left + zone2Rect.width / 2,
        y: zone2Rect.top + zone2Rect.height / 2
    };
}

// 开始计时器
function startTimer() {
    console.log('开始计时器');
    gameState.startTime = Date.now();
    gameState.energyDepletionStartTime = 0;
    gameState.timeNearButton = 0;
    gameState.lastMouseMoveTime = Date.now();
    
    const randomZone = Math.random() > 0.5 ? zone1Center : zone2Center;
    gameState.mousePos.x = randomZone.x;
    gameState.mousePos.y = randomZone.y;
    
    const customCursor = document.getElementById('customCursor');
    if (customCursor) {
        customCursor.style.left = `${gameState.mousePos.x - 10}px`;
        customCursor.style.top = `${gameState.mousePos.y - 10}px`;
    }
    
    gameState.buttonOffset.x = (Math.random() - 0.5) * 20;
    gameState.buttonOffset.y = (Math.random() - 0.5) * 20;
    taskButtonContainer.style.transform = `translate(-50%, -50%) translate(${gameState.buttonOffset.x}px, ${gameState.buttonOffset.y}px)`;
    
    updateFailCountDisplay();
    
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.attemptTimer = (Date.now() - gameState.startTime) / 1000;
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) timerDisplay.textContent = `尝试时间: ${gameState.attemptTimer.toFixed(1)}秒`;
        
        const resistanceIndicator = document.getElementById('resistanceIndicator');
        if (resistanceIndicator) {
            resistanceIndicator.textContent = `当前阻力: ${Math.round(gameState.currentResistance * 100)}%`;
            if (gameState.currentResistance > 0.7) {
                resistanceIndicator.style.color = '#F44336';
                resistanceIndicator.style.fontWeight = 'bold';
            } else if (gameState.currentResistance > 0.4) {
                resistanceIndicator.style.color = '#FF9800';
            } else {
                resistanceIndicator.style.color = '#666';
            }
        }
        
        const findButtonHint = document.getElementById('findButtonHint');
        if (findButtonHint) {
            if (gameState.canClickButton) {
                findButtonHint.textContent = "按钮稳定！现在可以点击！";
                findButtonHint.style.color = "#4CAF50";
                findButtonHint.style.fontWeight = "bold";
                findButtonHint.style.background = "rgba(76, 175, 80, 0.2)";
            } else if (gameState.buttonFound) {
                findButtonHint.textContent = "已找到按钮！等待稳定...";
                findButtonHint.style.color = "#FF9800";
                findButtonHint.style.fontWeight = "bold";
            } else if (gameState.isNearButton) {
                findButtonHint.textContent = "接近按钮中...保持稳定";
                findButtonHint.style.color = "#FF9800";
            } else {
                findButtonHint.textContent = "";
            }
        }
    }, 100);
    
    startDistractionDetection();
    startCenterHoldDetection();
}

// 停止计时器
function stopTimer() {
    console.log('停止计时器');
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    stopDistractionDetection();
    stopCenterHoldDetection();
}

// 更新失败次数显示
function updateFailCountDisplay() {
    const failCountDisplay = document.getElementById('failCountDisplay');
    if (!failCountDisplay) return;
    
    failCountDisplay.textContent = `失败次数: ${gameState.failCount}`;
    
    if (gameState.failCount >= 3) {
        failCountDisplay.style.color = '#F44336';
        failCountDisplay.style.fontWeight = 'bold';
        failCountDisplay.style.background = 'rgba(255, 255, 255, 0.95)';
        failCountDisplay.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.4)';
    } else if (gameState.failCount >= 2) {
        failCountDisplay.style.color = '#FF9800';
        failCountDisplay.style.fontWeight = 'bold';
        failCountDisplay.style.background = 'rgba(255, 255, 255, 0.9)';
        failCountDisplay.style.boxShadow = '0 2px 6px rgba(255, 152, 0, 0.3)';
    } else if (gameState.failCount >= 1) {
        failCountDisplay.style.color = '#FFC107';
        failCountDisplay.style.fontWeight = 'normal';
        failCountDisplay.style.background = 'rgba(255, 255, 255, 0.85)';
        failCountDisplay.style.boxShadow = '0 2px 5px rgba(255, 193, 7, 0.3)';
    } else {
        failCountDisplay.style.color = '#666';
        failCountDisplay.style.fontWeight = 'normal';
        failCountDisplay.style.background = 'rgba(255, 255, 255, 0.8)';
        failCountDisplay.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    }
}

// 能量条逻辑
function reduceEnergy(amount) {
    gameState.energy = Math.max(0, gameState.energy - amount);
    energyFill.style.width = `${gameState.energy}%`;
    energyValue.textContent = `${Math.round(gameState.energy)}%`;
    
    if (gameState.energy < 20) {
        energyValue.style.color = '#F44336';
        energyValue.style.fontWeight = 'bold';
    } else if (gameState.energy < 50) {
        energyValue.style.color = '#FF9800';
        energyValue.style.fontWeight = 'normal';
    } else {
        energyValue.style.color = '#333';
        energyValue.style.fontWeight = 'normal';
    }
}

function restoreEnergy(amount) {
    gameState.energy = Math.min(100, gameState.energy + amount);
    energyFill.style.width = `${gameState.energy}%`;
    energyValue.textContent = `${Math.round(gameState.energy)}%`;
    
    if (gameState.energy < 20) {
        energyValue.style.color = '#F44336';
        energyValue.style.fontWeight = 'bold';
    } else if (gameState.energy < 50) {
        energyValue.style.color = '#FF9800';
        energyValue.style.fontWeight = 'normal';
    } else {
        energyValue.style.color = '#333';
        energyValue.style.fontWeight = 'normal';
    }
}

// 分心倒计时功能
function startDistractionDetection() {
    if (gameState.distractionTimerInterval) clearInterval(gameState.distractionTimerInterval);
    
    gameState.distractionTimerInterval = setInterval(() => {
        const currentTime = Date.now();
        const timeSinceLastMove = currentTime - gameState.lastMouseMoveTime;
        
        gameState.distractionCountdown = Math.max(0, (DISTRACTION_TIMEOUT - timeSinceLastMove) / 1000);
        
        const distractionTimer = document.getElementById('distractionTimer');
        if (distractionTimer) {
            if (timeSinceLastMove > 500) {
                distractionTimer.style.display = 'block';
                distractionTimer.textContent = `分心倒计时: ${gameState.distractionCountdown.toFixed(1)}秒`;
                
                if (gameState.distractionCountdown < 0.3) {
                    distractionTimer.style.color = '#F44336';
                    distractionTimer.style.background = 'rgba(255, 255, 255, 0.95)';
                } else if (gameState.distractionCountdown < 0.7) {
                    distractionTimer.style.color = '#FF9800';
                    distractionTimer.style.background = 'rgba(255, 255, 255, 0.9)';
                } else {
                    distractionTimer.style.color = '#4CAF50';
                    distractionTimer.style.background = 'rgba(255, 255, 255, 0.8)';
                }
            } else {
                distractionTimer.style.display = 'none';
            }
        }
        
        if (timeSinceLastMove >= DISTRACTION_TIMEOUT && !gameState.isDistractionActive && gameState.isLocked && !gameState.isFrozen) {
            triggerDistraction();
        }
    }, 50);
}

function stopDistractionDetection() {
    if (gameState.distractionTimerInterval) {
        clearInterval(gameState.distractionTimerInterval);
        gameState.distractionTimerInterval = null;
    }
    const distractionTimer = document.getElementById('distractionTimer');
    if (distractionTimer) distractionTimer.style.display = 'none';
}

function updateMouseMoveTime() {
    gameState.lastMouseMoveTime = Date.now();
    gameState.isDistractionActive = false;
}

function triggerDistraction() {
    gameState.isDistractionActive = true;
    
    const randomZone = Math.random() > 0.5 ? zone1Center : zone2Center;
    const targetX = randomZone.x;
    const targetY = randomZone.y;
    
    if (window.isAudioEnabled && window.audioContext) {
        const distractionSound = window.audioContext.createOscillator();
        const distractionGain = window.audioContext.createGain();
        
        distractionSound.type = 'triangle';
        distractionSound.frequency.setValueAtTime(400, window.audioContext.currentTime);
        distractionSound.frequency.exponentialRampToValueAtTime(1000, window.audioContext.currentTime + 0.2);
        
        distractionGain.gain.setValueAtTime(0.3, window.audioContext.currentTime);
        distractionGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.3);
        
        distractionSound.connect(distractionGain);
        distractionGain.connect(window.audioContext.destination);
        
        distractionSound.start();
        distractionSound.stop(window.audioContext.currentTime + 0.3);
    }
    
    const distractionHint = document.createElement('div');
    distractionHint.textContent = "注意力快速分散！";
    distractionHint.style.position = 'absolute';
    distractionHint.style.top = '200px';
    distractionHint.style.left = '50%';
    distractionHint.style.transform = 'translateX(-50%)';
    distractionHint.style.color = '#FF5722';
    distractionHint.style.fontSize = '14px';
    distractionHint.style.fontWeight = 'bold';
    distractionHint.style.background = 'rgba(255, 255, 255, 0.95)';
    distractionHint.style.padding = '8px 15px';
    distractionHint.style.borderRadius = '8px';
    distractionHint.style.zIndex = '1001';
    distractionHint.style.boxShadow = '0 3px 15px rgba(255, 87, 34, 0.6)';
    document.body.appendChild(distractionHint);
    
    gameState.mousePos.x = targetX;
    gameState.mousePos.y = targetY;
    const customCursor = document.getElementById('customCursor');
    if (customCursor) {
        customCursor.style.left = `${gameState.mousePos.x - 10}px`;
        customCursor.style.top = `${gameState.mousePos.y - 10}px`;
        
        customCursor.style.transform = 'scale(1.3)';
        customCursor.style.background = '#FF5722';
    }
    
    setTimeout(() => {
        if (customCursor) {
            customCursor.style.transform = 'scale(1)';
            customCursor.style.background = '#666';
        }
        document.body.removeChild(distractionHint);
        updateMouseMoveTime();
    }, 300);
    
    const selectedZone = randomZone === zone1Center ? zone1 : zone2;
    selectedZone.style.boxShadow = '0 8px 40px rgba(255, 87, 34, 0.9)';
    selectedZone.style.transform = 'scale(1.15)';
    selectedZone.style.borderColor = '#FF5722';
    
    setTimeout(() => {
        selectedZone.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
        selectedZone.style.transform = 'scale(1)';
        selectedZone.style.borderColor = '#FF9800';
    }, 800);
}

// 中心区域保持功能
function startCenterHoldDetection() {
    if (gameState.centerHoldInterval) clearInterval(gameState.centerHoldInterval);
    
    gameState.centerHoldInterval = setInterval(() => {
        if (!gameState.isLocked || gameState.isFrozen) return;
        
        const distanceToCenter = Math.hypot(gameState.mousePos.x - gravityWellCenter.x, gameState.mousePos.y - gravityWellCenter.y);
        
        const nowInCenterZone = distanceToCenter <= CENTER_ZONE_RADIUS;
        
        const centerHint = document.getElementById('centerHint');
        if (centerHint) {
            if (nowInCenterZone && !gameState.isInCenterZone) {
                gameState.isInCenterZone = true;
                gameState.centerHoldStartTime = Date.now();
                
                centerHint.style.display = 'block';
                centerHint.textContent = "保持稳定...";
                centerHint.style.color = '#4CAF50';
            } else if (!nowInCenterZone && gameState.isInCenterZone) {
                gameState.isInCenterZone = false;
                gameState.centerHoldStartTime = 0;
                centerHint.style.display = 'none';
            }
            
            if (gameState.isInCenterZone) {
                const holdTime = Date.now() - gameState.centerHoldStartTime;
                const remainingTime = Math.max(0, CENTER_HOLD_TIME - holdTime);
                
                if (remainingTime <= 0) {
                    clearInterval(gameState.centerHoldInterval);
                    triggerCenterSuccess();
                } else {
                    const secondsRemaining = (remainingTime / 1000).toFixed(1);
                    centerHint.textContent = `${secondsRemaining}s`;
                    
                    if (remainingTime > 1500) {
                        centerHint.style.color = '#4CAF50';
                    } else if (remainingTime > 800) {
                        centerHint.style.color = '#FF9800';
                    } else {
                        centerHint.style.color = '#F44336';
                    }
                }
            }
        }
    }, 100);
}

function stopCenterHoldDetection() {
    if (gameState.centerHoldInterval) {
        clearInterval(gameState.centerHoldInterval);
        gameState.centerHoldInterval = null;
    }
    const centerHint = document.getElementById('centerHint');
    if (centerHint) {
        centerHint.style.display = 'none';
    }
    gameState.isInCenterZone = false;
    gameState.centerHoldStartTime = 0;
}

function triggerCenterSuccess() {
    if (window.isAudioEnabled && window.audioContext) {
        const successOscillator = window.audioContext.createOscillator();
        const successGain = window.audioContext.createGain();
        
        successOscillator.type = 'sine';
        successOscillator.frequency.setValueAtTime(523.25, window.audioContext.currentTime);
        successOscillator.frequency.setValueAtTime(659.25, window.audioContext.currentTime + 0.1);
        successOscillator.frequency.setValueAtTime(783.99, window.audioContext.currentTime + 0.2);
        
        successGain.gain.setValueAtTime(0, window.audioContext.currentTime);
        successGain.gain.linearRampToValueAtTime(0.3, window.audioContext.currentTime + 0.05);
        successGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.5);
        
        successOscillator.connect(successGain);
        successGain.connect(window.audioContext.destination);
        
        successOscillator.start();
        successOscillator.stop(window.audioContext.currentTime + 0.5);
    }
    
    const centerHint = document.getElementById('centerHint');
    if (centerHint) {
        centerHint.textContent = "成功！";
        centerHint.style.color = '#4CAF50';
    }
    
    setTimeout(() => {
        // 先恢复鼠标状态
        restoreMouseState();
        
        // 然后显示过渡界面
        if (window.showTransitionScreen) {
            window.showTransitionScreen();
        }
    }, 1000);
}

// 处理鼠标相对移动：圆形阻力场计算
function handleMouseMove(e) {
    if (gameState.isFrozen) return;
    
    // 确保 event 对象有正确的值
    if (!e.movementX && !e.movementY) {
        // 对于某些浏览器，可能需要使用不同的属性
        e.movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        e.movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    }
    
    updateMouseMoveTime();

    const distanceToCenter = Math.hypot(gameState.mousePos.x - gravityWellCenter.x, gameState.mousePos.y - gravityWellCenter.y);
    
    const buttonCenterX = gravityWellCenter.x + gameState.buttonOffset.x;
    const buttonCenterY = gravityWellCenter.y + gameState.buttonOffset.y;
    const distanceToButton = Math.hypot(gameState.mousePos.x - buttonCenterX, gameState.mousePos.y - buttonCenterY);
    
    gameState.isInsideGravityWell = distanceToCenter <= GRAVITY_WELL_RADIUS;
    
    const effectiveButtonRadius = BUTTON_RADIUS * 1.5;
    gameState.isNearButton = distanceToButton <= effectiveButtonRadius;
    
    let adAttractionForce = 0;
    
    let distanceToZone1 = 0;
    let distanceToZone2 = 0;
    
    const zone1Left = zone1Rect.left;
    const zone1Right = zone1Rect.right;
    const zone1Top = zone1Rect.top;
    const zone1Bottom = zone1Rect.bottom;
    
    const zone1ExtendedLeft = zone1Left - 100;
    const zone1ExtendedRight = zone1Right + 100;
    const zone1ExtendedTop = zone1Top - 100;
    const zone1ExtendedBottom = zone1Bottom + 100;
    
    const isInZone1Extended = gameState.mousePos.x >= zone1ExtendedLeft && 
                             gameState.mousePos.x <= zone1ExtendedRight && 
                             gameState.mousePos.y >= zone1ExtendedTop && 
                             gameState.mousePos.y <= zone1ExtendedBottom;
    
    if (isInZone1Extended) {
        const distToLeft = Math.abs(gameState.mousePos.x - zone1ExtendedLeft);
        const distToRight = Math.abs(gameState.mousePos.x - zone1ExtendedRight);
        const distToTop = Math.abs(gameState.mousePos.y - zone1ExtendedTop);
        const distToBottom = Math.abs(gameState.mousePos.y - zone1ExtendedBottom);
        
        distanceToZone1 = Math.min(distToLeft, distToRight, distToTop, distToBottom);
        distanceToZone1 = 100 - distanceToZone1;
    }
    
    const zone2Left = zone2Rect.left;
    const zone2Right = zone2Rect.right;
    const zone2Top = zone2Rect.top;
    const zone2Bottom = zone2Rect.bottom;
    
    const zone2ExtendedLeft = zone2Left - 100;
    const zone2ExtendedRight = zone2Right + 100;
    const zone2ExtendedTop = zone2Top - 100;
    const zone2ExtendedBottom = zone2Bottom + 100;
    
    const isInZone2Extended = gameState.mousePos.x >= zone2ExtendedLeft && 
                             gameState.mousePos.x <= zone2ExtendedRight && 
                             gameState.mousePos.y >= zone2ExtendedTop && 
                             gameState.mousePos.y <= zone2ExtendedBottom;
    
    if (isInZone2Extended) {
        const distToLeft = Math.abs(gameState.mousePos.x - zone2ExtendedLeft);
        const distToRight = Math.abs(gameState.mousePos.x - zone2ExtendedRight);
        const distToTop = Math.abs(gameState.mousePos.y - zone2ExtendedTop);
        const distToBottom = Math.abs(gameState.mousePos.y - zone2ExtendedBottom);
        
        distanceToZone2 = Math.min(distToLeft, distToRight, distToTop, distToBottom);
        distanceToZone2 = 100 - distanceToZone2;
    }
    
    let nearestAdDistance = 0;
    if (distanceToZone1 > 0 && distanceToZone2 > 0) {
        nearestAdDistance = Math.max(distanceToZone1, distanceToZone2);
    } else if (distanceToZone1 > 0) {
        nearestAdDistance = distanceToZone1;
    } else if (distanceToZone2 > 0) {
        nearestAdDistance = distanceToZone2;
    }
    
    if (nearestAdDistance > 0) {
        adAttractionForce = nearestAdDistance / 100;
        adAttractionForce = adAttractionForce * AD_ATTRACTION_FORCE;
        
        if (window.isAudioEnabled && window.audioContext && adAttractionForce > 0.03) {
            const adSound = window.audioContext.createOscillator();
            const adGain = window.audioContext.createGain();
            
            adSound.type = 'sine';
            adSound.frequency.setValueAtTime(120 + (adAttractionForce * 80), window.audioContext.currentTime);
            
            adGain.gain.setValueAtTime(adAttractionForce * 0.1, window.audioContext.currentTime);
            
            adSound.connect(adGain);
            adGain.connect(window.audioContext.destination);
            
            adSound.start();
            adSound.stop(window.audioContext.currentTime + 0.1);
        }
        
        const customCursor = document.getElementById('customCursor');
        if (customCursor) {
            customCursor.style.transform = `scale(${1 + adAttractionForce * 0.2})`;
            if (distanceToZone1 >= distanceToZone2 && distanceToZone1 > 0) {
                customCursor.style.background = '#2196F3';
            } else {
                customCursor.style.background = '#E91E63';
            }
        }
    }
    
    // ========== 核心工作区阻力计算 ==========
    let resistance = 0;
    let zoneType = 'outside';
    
    if (distanceToCenter <= HIGH_RESISTANCE_RADIUS) {
        resistance = 0.8;
        zoneType = 'high';
        gameState.isInCoreZone = true;
        
        if (gameState.isNearButton) {
            gameState.buttonFound = true;
            taskBtn.style.boxShadow = `0 0 25px rgba(255, 255, 100, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.25)`;
            buttonHalo.style.opacity = '0.4';
        }
    } else if (distanceToCenter <= MEDIUM_RESISTANCE_RADIUS) {
        const normalized = (distanceToCenter - HIGH_RESISTANCE_RADIUS) / (MEDIUM_RESISTANCE_RADIUS - HIGH_RESISTANCE_RADIUS);
        resistance = 0.7 - (normalized * 0.2);
        zoneType = 'medium';
        gameState.isInCoreZone = false;
    } else if (distanceToCenter <= LOW_RESISTANCE_RADIUS) {
        const normalized = (distanceToCenter - MEDIUM_RESISTANCE_RADIUS) / (LOW_RESISTANCE_RADIUS - MEDIUM_RESISTANCE_RADIUS);
        resistance = 0.5 - (normalized * 0.2);
        zoneType = 'low';
        gameState.isInCoreZone = false;
    } else if (distanceToCenter <= RESISTANCE_AREA_RADIUS) {
        const normalized = (distanceToCenter - LOW_RESISTANCE_RADIUS) / (RESISTANCE_AREA_RADIUS - LOW_RESISTANCE_RADIUS);
        resistance = 0.3 - (normalized * 0.2);
        zoneType = 'verylow';
        gameState.isInCoreZone = false;
    } else {
        resistance = 0;
        zoneType = 'outside';
        gameState.isInCoreZone = false;
    }
    
    gameState.currentResistance = resistance;
    
    // ========== 应用阻力和吸引力 ==========
    const moveX = e.movementX * (1 - resistance);
    const moveY = e.movementY * (1 - resistance);
    
    // ========== 克服阻力消耗能量 ==========
    if (resistance > 0) {
        const movementMagnitude = Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY);
        if (movementMagnitude > 0) {
            const resistanceEnergyCost = movementMagnitude * resistance * RESISTANCE_ENERGY_COST_MULTIPLIER * 0.01;
            reduceEnergy(resistanceEnergyCost);
            
            if (resistanceEnergyCost > 0.5) {
                const intensity = Math.min(1, resistanceEnergyCost / 2);
                const customCursor = document.getElementById('customCursor');
                if (customCursor) {
                    customCursor.style.background = `rgb(${200 + Math.floor(55 * intensity)}, ${160 - Math.floor(100 * intensity)}, ${120 - Math.floor(70 * intensity)})`;
                }
            }
        }
    }
    
    if (adAttractionForce > 0) {
        let targetCenter;
        if (distanceToZone1 >= distanceToZone2 && distanceToZone1 > 0) {
            targetCenter = zone1Center;
        } else {
            targetCenter = zone2Center;
        }
        
        const angleToAd = Math.atan2(targetCenter.y - gameState.mousePos.y, targetCenter.x - gameState.mousePos.x);
        const attractionStrength = adAttractionForce * 30;
        const attractionX = Math.cos(angleToAd) * attractionStrength;
        const attractionY = Math.sin(angleToAd) * attractionStrength;
        
        gameState.mousePos.x += moveX + attractionX;
        gameState.mousePos.y += moveY + attractionY;
        
        const adScale = 1 + adAttractionForce * 0.05;
        const adShadowIntensity = 25 + (adAttractionForce * 20);
        
        if (distanceToZone1 >= distanceToZone2 && distanceToZone1 > 0) {
            zone1.style.boxShadow = `0 8px ${adShadowIntensity}px rgba(33, 150, 243, 0.7)`;
            zone1.style.transform = `scale(${adScale})`;
        } else {
            zone2.style.boxShadow = `0 8px ${adShadowIntensity}px rgba(233, 30, 99, 0.7)`;
            zone2.style.transform = `scale(${adScale})`;
        }
        
        const userMoveAngle = Math.atan2(e.movementY, e.movementX);
        const angleDifference = Math.abs(angleToAd - userMoveAngle);
        
        if (angleDifference > Math.PI/2) {
            const resistanceStrength = Math.min(1, (angleDifference - Math.PI/2) / (Math.PI/2));
            const energyCost = adAttractionForce * resistanceStrength * AD_ESCAPE_ENERGY_COST_MULTIPLIER;
            
            reduceEnergy(energyCost);
            
            const customCursor = document.getElementById('customCursor');
            if (customCursor) {
                customCursor.style.animation = 'none';
                setTimeout(() => {
                    customCursor.style.animation = 'cursorResist 0.3s';
                }, 10);
            }
            
            if (window.isAudioEnabled && window.audioContext) {
                const resistSound = window.audioContext.createOscillator();
                const resistGain = window.audioContext.createGain();
                
                resistSound.type = 'sawtooth';
                resistSound.frequency.setValueAtTime(200 + (resistanceStrength * 300), window.audioContext.currentTime);
                
                resistGain.gain.setValueAtTime(resistanceStrength * 0.15, window.audioContext.currentTime);
                resistGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.2);
                
                resistSound.connect(resistGain);
                resistGain.connect(window.audioContext.destination);
                
                resistSound.start();
                resistSound.stop(window.audioContext.currentTime + 0.2);
            }
        }
        
    } else {
        gameState.mousePos.x += moveX;
        gameState.mousePos.y += moveY;
        
        zone1.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
        zone1.style.transform = 'scale(1)';
        zone2.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
        zone2.style.transform = 'scale(1)';
        
        const customCursor = document.getElementById('customCursor');
        if (customCursor && (!gameState.isInCoreZone || !gameState.isNearButton)) {
            customCursor.style.transform = 'scale(1)';
            customCursor.style.background = '#666';
        }
        
        let recoveryRate = 0.10;
        if (zoneType === 'high') recoveryRate = 0.02;
        else if (zoneType === 'medium') recoveryRate = 0.04;
        else if (zoneType === 'low') recoveryRate = 0.07;
        else if (zoneType === 'verylow') recoveryRate = 0.12;
        else if (zoneType === 'outside') recoveryRate = 0.15;
        
        restoreEnergy(recoveryRate);
    }

    const customCursor = document.getElementById('customCursor');
    if (customCursor) {
        customCursor.style.left = `${gameState.mousePos.x - 10}px`;
        customCursor.style.top = `${gameState.mousePos.y - 10}px`;
    }

    if (gameState.isInCoreZone && gameState.isNearButton) {
        const repulsionForce = 1 - (distanceToButton / (effectiveButtonRadius * 1.2));
        
        if (gameState.energyDepletionStartTime === 0) {
            gameState.energyDepletionStartTime = Date.now();
        }
        
        gameState.timeNearButton += 0.016;
        
        if (window.isAudioEnabled) {
            window.playCurrentSound(repulsionForce);
        }
        
        if (customCursor) {
            customCursor.style.transform = `scale(${1 + repulsionForce * 1.5})`;
            customCursor.style.opacity = `${0.8 - repulsionForce * 0.3}`;
            customCursor.style.background = `rgb(${Math.floor(200 - repulsionForce * 80)}, ${Math.floor(160 - repulsionForce * 80)}, ${Math.floor(120 - repulsionForce * 50)})`;
        }
        
        const shakeAmount = 15;
        const xShake = (Math.random() - 0.5) * 2 * shakeAmount * repulsionForce;
        const yShake = (Math.random() - 0.5) * 2 * shakeAmount * repulsionForce;
        
        gameState.buttonOffset.x = gameState.buttonOffset.x * 0.7 + xShake * 0.3;
        gameState.buttonOffset.y = gameState.buttonOffset.y * 0.7 + yShake * 0.3;
        
        taskButtonContainer.style.transform = `translate(-50%, -50%) translate(${gameState.buttonOffset.x}px, ${gameState.buttonOffset.y}px)`;
        
        const totalShake = Math.abs(gameState.buttonOffset.x) + Math.abs(gameState.buttonOffset.y);
        gameState.canClickButton = totalShake < 3;
        
        if (gameState.canClickButton) {
            taskBtn.style.boxShadow = `0 0 30px rgba(76, 175, 80, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.3)`;
            taskBtn.style.background = '#4CAF50'; // 纯色
        }
        
        buttonHalo.style.boxShadow = `0 0 ${12 + repulsionForce * 18}px rgba(255, 100, 100, ${0.3 + repulsionForce * 0.25})`;
        
        const timeInZone = (Date.now() - gameState.energyDepletionStartTime) / 1000;
        const targetEnergy = Math.max(0, 100 - (timeInZone / 4) * 100);
        const energyDiff = gameState.energy - targetEnergy;
        
        if (energyDiff > 0) {
            reduceEnergy(energyDiff * BUTTON_REPULSION_ENERGY_COST_MULTIPLIER);
        }
        
        if (distanceToButton < BUTTON_RADIUS) {
            const pushForce = 0.25 + repulsionForce * 0.35;
            const angleToCenter = Math.atan2(gameState.mousePos.y - buttonCenterY, gameState.mousePos.x - buttonCenterX);
            
            const randomAngleOffset = (Math.random() - 0.5) * 0.5;
            const finalAngle = angleToCenter + randomAngleOffset;
            
            gameState.mousePos.x += Math.cos(finalAngle) * pushForce * 25;
            gameState.mousePos.y += Math.sin(finalAngle) * pushForce * 25;
            
            gameState.mousePos.x += (Math.random() - 0.5) * pushForce * 12;
            gameState.mousePos.y += (Math.random() - 0.5) * pushForce * 12;
        }
        
    } else if (!adAttractionForce) {
        gameState.energyDepletionStartTime = 0;
        gameState.buttonFound = false;
        gameState.canClickButton = false;
        
        if (window.isAudioEnabled) {
            window.stopCurrentSound();
        }
        
        if (customCursor && !adAttractionForce && (!gameState.isInCoreZone || !gameState.isNearButton)) {
            customCursor.style.transform = 'scale(1)';
            customCursor.style.opacity = '1';
            customCursor.style.background = '#666';
        }
        
        gameState.buttonOffset.x *= 0.85;
        gameState.buttonOffset.y *= 0.85;
        taskButtonContainer.style.transform = `translate(-50%, -50%) translate(${gameState.buttonOffset.x}px, ${gameState.buttonOffset.y}px)`;
        
        taskBtn.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.15)';
        taskBtn.style.background = '#333'; // 纯色
        buttonHalo.style.boxShadow = 'none';
        buttonHalo.style.opacity = '0.25';
        
        let recoveryRate = 0.10;
        if (zoneType === 'high') recoveryRate = 0.02;
        else if (zoneType === 'medium') recoveryRate = 0.04;
        else if (zoneType === 'low') recoveryRate = 0.07;
        else if (zoneType === 'verylow') recoveryRate = 0.12;
        else if (zoneType === 'outside') recoveryRate = 0.15;
        
        restoreEnergy(recoveryRate);
    }

    if (gameState.energy <= 0 && !gameState.isFrozen) {
        gameState.isFrozen = true;
        const customCursor = document.getElementById('customCursor');
        if (customCursor) customCursor.style.background = '#f00';
        
        if (window.isAudioEnabled && window.audioContext) {
            const screamOscillator = window.audioContext.createOscillator();
            const screamGain = window.audioContext.createGain();
            
            screamOscillator.type = 'sine';
            screamOscillator.frequency.setValueAtTime(1000, window.audioContext.currentTime);
            screamOscillator.frequency.exponentialRampToValueAtTime(100, window.audioContext.currentTime + 1.5);
            
            screamGain.gain.setValueAtTime(0.5, window.audioContext.currentTime);
            screamGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 1.5);
            
            screamOscillator.connect(screamGain);
            screamGain.connect(window.audioContext.destination);
            
            screamOscillator.start();
            screamOscillator.stop(window.audioContext.currentTime + 1.5);
        }
        
        setTimeout(() => {
            triggerDiagnosisOverlay();
        }, 500);
    }
}

// 按钮点击判定
function setupTaskButtonClick() {
    if (!taskBtn) return;
    
    taskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (gameState.isFrozen) return;
        
        const buttonCenterX = gravityWellCenter.x + gameState.buttonOffset.x;
        const buttonCenterY = gravityWellCenter.y + gameState.buttonOffset.y;
        const distanceToButton = Math.hypot(gameState.mousePos.x - buttonCenterX, gameState.mousePos.y - buttonCenterY);
        
        const isMouseOverButton = distanceToButton <= BUTTON_RADIUS * 1.1;
        
        if (isMouseOverButton && gameState.isInCoreZone && gameState.canClickButton) {
            if (window.isAudioEnabled && window.audioContext) {
                const successOscillator = window.audioContext.createOscillator();
                const successGain = window.audioContext.createGain();
                
                successOscillator.type = 'sine';
                successOscillator.frequency.setValueAtTime(523.25, window.audioContext.currentTime);
                successOscillator.frequency.setValueAtTime(659.25, window.audioContext.currentTime + 0.1);
                successOscillator.frequency.setValueAtTime(783.99, window.audioContext.currentTime + 0.2);
                
                successGain.gain.setValueAtTime(0, window.audioContext.currentTime);
                successGain.gain.linearRampToValueAtTime(0.3, window.audioContext.currentTime + 0.05);
                successGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.5);
                
                successOscillator.connect(successGain);
                successGain.connect(window.audioContext.destination);
                
                successOscillator.start();
                successOscillator.stop(window.audioContext.currentTime + 0.5);
            }
            
            const taskCompleteHint = document.getElementById('taskCompleteHint');
            if (taskCompleteHint) {
                taskCompleteHint.style.display = 'block';
                
                setTimeout(() => {
                    taskCompleteHint.style.display = 'none';
                    
                    // 先恢复鼠标状态
                    restoreMouseState();
                    
                    // 然后显示过渡界面
                    if (window.showTransitionScreen) {
                        window.showTransitionScreen();
                    }
                }, 1000);
            }
        } else {
            gameState.failCount++;
            
            updateFailCountDisplay();
            
            const failHint = document.createElement('div');
            failHint.textContent = `点击失败！按钮不稳定 (失败次数: ${gameState.failCount})`;
            failHint.style.position = 'absolute';
            failHint.style.top = '200px';
            failHint.style.left = '50%';
            failHint.style.transform = 'translateX(-50%)';
            failHint.style.color = '#F44336';
            failHint.style.fontSize = '14px';
            failHint.style.fontWeight = 'bold';
            failHint.style.background = 'rgba(255, 255, 255, 0.95)';
            failHint.style.padding = '8px 15px';
            failHint.style.borderRadius = '8px';
            failHint.style.zIndex = '1001';
            failHint.style.boxShadow = '0 3px 15px rgba(244, 67, 54, 0.6)';
            document.body.appendChild(failHint);
            
            setTimeout(() => {
                document.body.removeChild(failHint);
            }, 1000);
            
            if (window.isAudioEnabled && window.audioContext) {
                const failSound = window.audioContext.createOscillator();
                const failGain = window.audioContext.createGain();
                
                failSound.type = 'sawtooth';
                failSound.frequency.setValueAtTime(200, window.audioContext.currentTime);
                failSound.frequency.exponentialRampToValueAtTime(100, window.audioContext.currentTime + 0.3);
                
                failGain.gain.setValueAtTime(0.2, window.audioContext.currentTime);
                failGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.3);
                
                failSound.connect(failGain);
                failGain.connect(window.audioContext.destination);
                
                failSound.start();
                failSound.stop(window.audioContext.currentTime + 0.3);
            }
            
            if (gameState.failCount >= 3) {
                setTimeout(() => {
                    triggerDiagnosisOverlay();
                }, 500);
            }
        }
    });
}

// 触发诊断图层
function triggerDiagnosisOverlay() {
    gameState.isFrozen = true;
    if (window.stopCurrentSound) {
        window.stopCurrentSound();
    }
    stopTimer();
    stopCenterHoldDetection();
    
    // 先恢复鼠标状态
    restoreMouseState();
    
    const diagnosisOverlay = document.getElementById('diagnosisOverlay');
    if (diagnosisOverlay) diagnosisOverlay.style.display = 'flex';
    
    const lockHint = document.getElementById('lockHint');
    if (lockHint) lockHint.style.display = 'none';
    
    document.querySelectorAll('.gravity-well, .entertainment-zones, .energy-bar, .energy-value, .timer-display, .resistance-indicator, .find-button-hint, .distraction-timer, .button-instruction, .audio-control, .custom-cursor, .lock-hint, .audio-hint, .center-hint, .fail-count-display').forEach(el => {
        el.style.display = 'none';
    });
    
    const tenTasksScreen = document.getElementById('tenTasksScreen');
    if (tenTasksScreen) tenTasksScreen.style.display = 'none';
    
    const transitionScreen = document.getElementById('transitionScreen');
    if (transitionScreen) transitionScreen.style.display = 'none';
}

// 恢复鼠标正常状态
function restoreMouseState() {
    console.log('恢复鼠标状态');
    
    // 停止所有计时器
    stopTimer();
    stopDistractionDetection();
    stopCenterHoldDetection();
    
    // 重置游戏状态
    gameState.isLocked = false;
    gameState.isFrozen = true;
    
    // 停止声音
    if (window.stopCurrentSound) {
        window.stopCurrentSound();
    }
    
    // 移除指针锁定
    if (document.pointerLockElement || document.mozPointerLockElement) {
        document.exitPointerLock();
    }
    
    // 移除鼠标移动监听
    document.removeEventListener('mousemove', handleMouseMove);
    
    // 重置body样式
    document.body.classList.remove('pointer-locked');
    document.body.style.cursor = 'default';
    
    // 隐藏自定义光标
    const customCursor = document.getElementById('customCursor');
    if (customCursor) {
        customCursor.style.display = 'none';
    }
    
    // 移除锁定提示
    const lockHint = document.getElementById('lockHint');
    if (lockHint) {
        lockHint.style.display = 'none';
    }
    
    // 强制显示系统光标
    setTimeout(() => {
        document.body.style.cursor = 'default';
        document.querySelectorAll('*').forEach(el => {
            el.style.cursor = 'auto';
        });
    }, 50);
}

// 暴露函数到全局
window.gameState = gameState;
window.initFirstStage = initFirstStage;
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.stopFirstStage = stopTimer;
window.handleMouseMove = handleMouseMove;
window.updateElementPositions = updateElementPositions;
window.setupTaskButtonClick = setupTaskButtonClick;
window.restoreMouseState = restoreMouseState;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Stage1.js 初始化');
    
    setupTaskButtonClick();
    
    // 诊断图层点击事件
    const diagnosisOverlay = document.getElementById('diagnosisOverlay');
    if (diagnosisOverlay) {
        diagnosisOverlay.addEventListener('click', () => {
            diagnosisOverlay.style.display = 'none';
            const lockHint = document.getElementById('lockHint');
            if (lockHint) {
                lockHint.style.display = 'block';
                lockHint.classList.remove('hidden');
            }
            location.reload();
        });
    }
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        updateElementPositions();
    });
    
    console.log('Stage1.js 初始化完成');
});