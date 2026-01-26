// ========== 第一阶段逻辑 ==========

// 全局状态
const gameState = {
    mousePos: { x: window.innerWidth * 0.15, y: window.innerHeight * 0.25 },
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
    centerHoldInterval: null,
    
    isSuccessful: false,
    
    // 自动广告吸引相关
    autoAttractionInterval: null,
    lastMovementTime: 0,
    isBeingAttracted: false
};

// 常量 - 修改了广告吸引力的范围和强度
const GRAVITY_WELL_RADIUS = 200;
const RESISTANCE_AREA_RADIUS = 450; // 扩大外部区域，增加快速移动的范围
const BUTTON_RADIUS = 29.5;
const HALO_RADIUS = 50;

// 修改：调整阻力区域半径，使阻力梯度更明显
const HIGH_RESISTANCE_RADIUS = 150;  // 缩小核心高阻力区域
const MEDIUM_RESISTANCE_RADIUS = 250; // 中等阻力区域
const LOW_RESISTANCE_RADIUS = 350;    // 低阻力区域

// 修改：适度的广告吸引力范围和强度
const AD_ATTRACTION_RADIUS = 300;  // 缩小到200px，只在广告附近吸引
const AD_ATTRACTION_FORCE = 0.5;   // 降低到0.3，温和的吸引力

const DISTRACTION_TIMEOUT = 1000;

const CENTER_ZONE_RADIUS = 50; // 从40增加到50，扩大成功区域
const CENTER_HOLD_TIME = 2000; // 从2000降到1500毫秒，更容易成功

const RESISTANCE_ENERGY_COST_MULTIPLIER = 2.0;
const AD_ESCAPE_ENERGY_COST_MULTIPLIER = 1.0;  // 降低到1.2，减少逃脱广告的能量消耗
const BUTTON_REPULSION_ENERGY_COST_MULTIPLIER = 1.5;

// 自动广告吸引常量
const AUTO_ATTRACTION_DELAY = 10; // 鼠标停止300毫秒后开始自动吸引
const AUTO_ATTRACTION_SPEED = 1.5; // 自动吸引的速度，降低防止太快

// 元素引用
let gravityWell, taskBtn, taskButtonContainer, buttonHalo, zone1, zone2, zone3, zone4, zone5, zone6, energyFill, energyValue;
let gravityWellRect, gravityWellCenter, zone1Rect, zone2Rect, zone3Rect, zone4Rect, zone5Rect, zone6Rect;
let zone1Center, zone2Center, zone3Center, zone4Center, zone5Center, zone6Center;

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
    zone3 = document.getElementById('zone3');
    zone4 = document.getElementById('zone4');
    zone5 = document.getElementById('zone5');
    zone6 = document.getElementById('zone6');
    energyFill = document.getElementById('energyFill');
    energyValue = document.getElementById('energyValue');
    
    if (!gravityWell || !taskBtn || !energyFill || !energyValue) {
        console.error('第一阶段元素未找到');
        return;
    }
    
    // 重置状态
    gameState.mousePos = { x: window.innerWidth * 0.15, y: window.innerHeight * 0.25 };
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
    zone3Rect = zone3.getBoundingClientRect();
    zone4Rect = zone4.getBoundingClientRect();
    zone5Rect = zone5.getBoundingClientRect();
    zone6Rect = zone6.getBoundingClientRect();
    
    zone1Center = {
        x: zone1Rect.left + zone1Rect.width / 2,
        y: zone1Rect.top + zone1Rect.height / 2
    };
    zone2Center = {
        x: zone2Rect.left + zone2Rect.width / 2,
        y: zone2Rect.top + zone2Rect.height / 2
    };
    zone3Center = {
        x: zone3Rect.left + zone3Rect.width / 2,
        y: zone3Rect.top + zone3Rect.height / 2
    };
    zone4Center = {
        x: zone4Rect.left + zone4Rect.width / 2,
        y: zone4Rect.top + zone4Rect.height / 2
    };
    zone5Center = {
        x: zone5Rect.left + zone5Rect.width / 2,
        y: zone5Rect.top + zone5Rect.height / 2
    };
    zone6Center = {
        x: zone6Rect.left + zone6Rect.width / 2,
        y: zone6Rect.top + zone6Rect.height / 2
    };
}

// 开始计时器
function startTimer() {
    console.log('开始计时器');
    gameState.startTime = Date.now();
    gameState.energyDepletionStartTime = 0;
    gameState.timeNearButton = 0;
    gameState.lastMouseMoveTime = Date.now();
    
    // 让鼠标出现在中心区域旁边，用户容易看到的位置
    // 在中心上方150-200px的位置，这样既能看见又不会太远
    const offsetDistance = 150 + Math.random() * 50; // 150-200px
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3; // 中心上方±30度范围
    gameState.mousePos.x = gravityWellCenter.x + Math.cos(angle) * offsetDistance;
    gameState.mousePos.y = gravityWellCenter.y + Math.sin(angle) * offsetDistance;
    
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
    startAutoAttraction(); // 启动自动广告吸引
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
    stopAutoAttraction(); // 停止自动广告吸引
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
    gameState.lastMovementTime = Date.now(); // 更新移动时间
    gameState.isDistractionActive = false;
    gameState.isBeingAttracted = false; // 重置吸引状态
}

// ========== 自动广告吸引功能 ==========
function startAutoAttraction() {
    if (gameState.autoAttractionInterval) clearInterval(gameState.autoAttractionInterval);
    
    gameState.autoAttractionInterval = setInterval(() => {
        // 如果已经成功、冻结或未锁定，停止吸引
        if (gameState.isFrozen || !gameState.isLocked || gameState.isSuccessful) return;
        
        const now = Date.now();
        const timeSinceLastMove = now - gameState.lastMovementTime;
        
        // 如果鼠标停止移动超过300毫秒，开始自动吸引
        if (timeSinceLastMove > AUTO_ATTRACTION_DELAY) {
            const buttonCenterX = gravityWellCenter.x + gameState.buttonOffset.x;
            const buttonCenterY = gravityWellCenter.y + gameState.buttonOffset.y;
            const distanceToButton = Math.hypot(gameState.mousePos.x - buttonCenterX, gameState.mousePos.y - buttonCenterY);
            
            // 只有在离按钮100px之外才被广告吸引
            if (distanceToButton > 100) {
                // 找到最近的广告
                const allZones = [
                    { center: zone1Center, element: zone1, color: '#4caf50' },
                    { center: zone2Center, element: zone2, color: '#ff9800' },
                    { center: zone3Center, element: zone3, color: '#9c27b0' },
                    { center: zone4Center, element: zone4, color: '#f44336' },
                    { center: zone5Center, element: zone5, color: '#2196f3' },
                    { center: zone6Center, element: zone6, color: '#ff5722' }
                ];
                
                let closestZone = null;
                let closestDistance = Infinity;
                
                for (const zone of allZones) {
                    const dist = Math.hypot(zone.center.x - gameState.mousePos.x, zone.center.y - gameState.mousePos.y);
                    if (dist < closestDistance) {
                        closestDistance = dist;
                        closestZone = zone;
                    }
                }
                
                // 如果最近的广告在500px范围内，开始吸引
                if (closestZone && closestDistance < 500) {
                    gameState.isBeingAttracted = true;
                    
                    // 计算向广告移动的向量
                    const angle = Math.atan2(closestZone.center.y - gameState.mousePos.y, closestZone.center.x - gameState.mousePos.x);
                    
                    // 移动速度随距离递增，越近越快
                    const normalizedDist = Math.min(1, closestDistance / 500);
                    const speed = AUTO_ATTRACTION_SPEED * (1.5 - normalizedDist); // 1.5到0.5倍速度
                    
                    const moveX = Math.cos(angle) * speed;
                    const moveY = Math.sin(angle) * speed;
                    
                    // 更新鼠标位置
                    gameState.mousePos.x += moveX;
                    gameState.mousePos.y += moveY;
                    
                    // 更新光标显示
                    const customCursor = document.getElementById('customCursor');
                    if (customCursor) {
                        customCursor.style.left = `${gameState.mousePos.x - 10}px`;
                        customCursor.style.top = `${gameState.mousePos.y - 10}px`;
                        customCursor.style.background = closestZone.color;
                        customCursor.style.transform = 'scale(1.2)';
                    }
                    
                    // 广告视觉反馈
                    if (closestZone.element) {
                        const attractionStrength = Math.min(1, (500 - closestDistance) / 500);
                        closestZone.element.style.boxShadow = `0 8px ${30 + attractionStrength * 40}px ${closestZone.color}`;
                        closestZone.element.style.transform = `scale(${1 + attractionStrength * 0.15})`;
                        closestZone.element.style.borderWidth = '4px';
                        closestZone.element.style.borderColor = closestZone.color;
                    }
                    
                    // 音频反馈
                    if (window.isAudioEnabled && window.audioContext && closestDistance < 300) {
                        const attractionStrength = (300 - closestDistance) / 300;
                        if (Math.random() < 0.1) { // 10%概率播放声音，避免过于频繁
                            const adSound = window.audioContext.createOscillator();
                            const adGain = window.audioContext.createGain();
                            
                            adSound.type = 'sine';
                            adSound.frequency.setValueAtTime(120 + (attractionStrength * 200), window.audioContext.currentTime);
                            adGain.gain.setValueAtTime(attractionStrength * 0.05, window.audioContext.currentTime);  // 降低音量：0.15→0.05
                        }
                    }
                } else {
                    gameState.isBeingAttracted = false;
                }
            } else {
                gameState.isBeingAttracted = false;
            }
        } else {
            gameState.isBeingAttracted = false;
            
            // 重置所有广告的视觉效果
            const allZoneElements = [zone1, zone2, zone3, zone4, zone5, zone6];
            for (const zoneEl of allZoneElements) {
                if (zoneEl) {
                    zoneEl.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
                    zoneEl.style.transform = 'scale(1)';
                    zoneEl.style.borderWidth = '3px';
                }
            }
        }
    }, 16); // 60fps
}

function stopAutoAttraction() {
    if (gameState.autoAttractionInterval) {
        clearInterval(gameState.autoAttractionInterval);
        gameState.autoAttractionInterval = null;
    }
    gameState.isBeingAttracted = false;
    
    // 重置所有广告的视觉效果
    const allZoneElements = [zone1, zone2, zone3, zone4, zone5, zone6];
    for (const zoneEl of allZoneElements) {
        if (zoneEl) {
            zoneEl.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            zoneEl.style.transform = 'scale(1)';
            zoneEl.style.borderWidth = '3px';
        }
    }
}

function triggerDistraction() {
    gameState.isDistractionActive = true;
    
    // 从6个广告区域中随机选择一个
    const zones = [zone1Center, zone2Center, zone3Center, zone4Center, zone5Center, zone6Center];
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    const targetX = randomZone.x;
    const targetY = randomZone.y;
    
    if (window.isAudioEnabled && window.audioContext) {
        const distractionSound = window.audioContext.createOscillator();
        const distractionGain = window.audioContext.createGain();
        
        distractionSound.type = 'sine';  // 改为更柔和的sine波
        distractionSound.frequency.setValueAtTime(400, window.audioContext.currentTime);
        distractionSound.frequency.exponentialRampToValueAtTime(1000, window.audioContext.currentTime + 0.2);
        
        distractionGain.gain.setValueAtTime(0.15, window.audioContext.currentTime);  // 降低音量：0.3→0.15
        distractionGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.3);
        
        distractionSound.connect(distractionGain);
        distractionGain.connect(window.audioContext.destination);
        
        distractionSound.start();
        distractionSound.stop(window.audioContext.currentTime + 0.3);
    }
    
    const distractionHint = document.createElement('div');
    distractionHint.textContent = "注意力快速分散！";
    distractionHint.style.position = 'fixed';
    distractionHint.style.bottom = '100px';
    distractionHint.style.left = '50%';
    distractionHint.style.transform = 'translateX(-50%)';
    distractionHint.style.color = '#fff';
    distractionHint.style.fontSize = '16px';
    distractionHint.style.fontWeight = 'bold';
    distractionHint.style.background = 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)';
    distractionHint.style.padding = '12px 24px';
    distractionHint.style.borderRadius = '25px';
    distractionHint.style.zIndex = '1001';
    distractionHint.style.boxShadow = '0 6px 20px rgba(255, 87, 34, 0.5)';
    document.body.appendChild(distractionHint);
    
    // 平滑吸附动画 - 记录起始位置
    const startX = gameState.mousePos.x;
    const startY = gameState.mousePos.y;
    const startTime = Date.now();
    const duration = 400; // 吸附动画持续时间（毫秒）
    
    const customCursor = document.getElementById('customCursor');
    
    // 使用动画帧实现平滑移动
    function animateAttraction() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // 0到1之间
        
        // 使用缓动函数（easeInOutCubic）使动画更自然
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // 计算当前位置
        gameState.mousePos.x = startX + (targetX - startX) * easeProgress;
        gameState.mousePos.y = startY + (targetY - startY) * easeProgress;
        
        // 更新光标位置
        if (customCursor) {
            customCursor.style.left = `${gameState.mousePos.x - 10}px`;
            customCursor.style.top = `${gameState.mousePos.y - 10}px`;
            
            // 动画过程中光标变化
            const scale = 1 + easeProgress * 0.3;
            customCursor.style.transform = `scale(${scale})`;
            customCursor.style.background = '#FF5722';
        }
        
        // 继续动画或结束
        if (progress < 1) {
            requestAnimationFrame(animateAttraction);
        } else {
            // 动画结束后的处理
            setTimeout(() => {
                if (customCursor) {
                    customCursor.style.transform = 'scale(1)';
                    customCursor.style.background = '#FF9800'; // 橙色高亮
                }
                document.body.removeChild(distractionHint);
                updateMouseMoveTime();
            }, 300);
        }
    }
    
    // 开始动画
    requestAnimationFrame(animateAttraction);
    
    // 根据随机选择的zone设置对应的DOM元素
    const zoneElements = [zone1, zone2, zone3, zone4, zone5, zone6];
    const zoneCenters = [zone1Center, zone2Center, zone3Center, zone4Center, zone5Center, zone6Center];
    const selectedZoneIndex = zoneCenters.indexOf(randomZone);
    const selectedZone = zoneElements[selectedZoneIndex];
    
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
    // 立即标记为成功，防止其他操作
    gameState.isSuccessful = true;
    gameState.isFrozen = true;
    
    if (window.isAudioEnabled && window.audioContext) {
        const successOscillator = window.audioContext.createOscillator();
        const successGain = window.audioContext.createGain();
        
        successOscillator.type = 'sine';
        successOscillator.frequency.setValueAtTime(523.25, window.audioContext.currentTime);
        successOscillator.frequency.setValueAtTime(659.25, window.audioContext.currentTime + 0.1);
        successOscillator.frequency.setValueAtTime(783.99, window.audioContext.currentTime + 0.2);

        successGain.gain.setValueAtTime(0, window.audioContext.currentTime);
        successGain.gain.linearRampToValueAtTime(0.2, window.audioContext.currentTime + 0.05);  // 降低音量：0.3→0.2
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
    // 如果已经成功或冻结，立即返回，不处理任何逻辑
    if (gameState.isFrozen || gameState.isSuccessful) return;
    
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
    let closestZoneCenter = null;
    let closestZoneDistance = Infinity;
    
    // 修改：只有在中心按钮100px之外才受到广告吸引力
    const isOutsideButtonRadius = distanceToButton > 100; // 100px之外
    
    if (isOutsideButtonRadius) {
        // 计算到所有6个广告区域中心的距离，找到最近的
        const allZones = [
            { center: zone1Center, element: zone1, color: '#4caf50' },
            { center: zone2Center, element: zone2, color: '#ff9800' },
            { center: zone3Center, element: zone3, color: '#9c27b0' },
            { center: zone4Center, element: zone4, color: '#f44336' },
            { center: zone5Center, element: zone5, color: '#2196f3' },
            { center: zone6Center, element: zone6, color: '#ff5722' }
        ];
        
        for (const zone of allZones) {
            const dist = Math.hypot(zone.center.x - gameState.mousePos.x, zone.center.y - gameState.mousePos.y);
            if (dist < closestZoneDistance) {
                closestZoneDistance = dist;
                closestZoneCenter = zone.center;
                gameState.closestZone = zone; // 保存最近的广告信息
            }
        }
        
        // 如果在吸引范围内，计算吸引力
        if (closestZoneDistance < AD_ATTRACTION_RADIUS) {
            // 吸引力随距离非线性增加（越近越强）
            const normalizedDist = closestZoneDistance / AD_ATTRACTION_RADIUS;
            adAttractionForce = (1 - normalizedDist) * (1 - normalizedDist) * AD_ATTRACTION_FORCE;
            
            // 音频反馈
            if (window.isAudioEnabled && window.audioContext && adAttractionForce > 0.05) {
                const adSound = window.audioContext.createOscillator();
                const adGain = window.audioContext.createGain();
                
                adSound.type = 'sine';
                adSound.frequency.setValueAtTime(120 + (adAttractionForce * 200), window.audioContext.currentTime);
                adGain.gain.setValueAtTime(adAttractionForce * 0.2, window.audioContext.currentTime);
                
                adSound.connect(adGain);
                adGain.connect(window.audioContext.destination);
                
                adSound.start();
                adSound.stop(window.audioContext.currentTime + 0.1);
            }
            
            // 视觉反馈 - 光标变色
            const customCursor = document.getElementById('customCursor');
            if (customCursor && gameState.closestZone) {
                customCursor.style.transform = `scale(${1 + adAttractionForce * 0.5})`;
                customCursor.style.background = gameState.closestZone.color;
            }
        }
    }
    
    // ========== 核心工作区阻力计算 ==========
    let resistance = 0;
    let zoneType = 'outside';
    
    // 修改：使用非线性阻力曲线，越靠近中心阻力越大，效果更明显
    if (distanceToCenter <= HIGH_RESISTANCE_RADIUS) {
        // 最内圈：使用指数增长的阻力，非常接近中心时几乎无法移动
        const innerRatio = 1 - (distanceToCenter / HIGH_RESISTANCE_RADIUS);
        resistance = 0.88 + (innerRatio * innerRatio * 0.105); // 0.88-0.985的阻力（提高了基础值和最大值）
        zoneType = 'high';
        gameState.isInCoreZone = true;
        
        if (gameState.isNearButton) {
            gameState.buttonFound = true;
            taskBtn.style.boxShadow = `0 0 25px rgba(255, 255, 100, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.25)`;
            buttonHalo.style.opacity = '0.4';
        }
    } else if (distanceToCenter <= MEDIUM_RESISTANCE_RADIUS) {
        // 中间圈：使用平方曲线，阻力明显但可以移动
        const normalized = (distanceToCenter - HIGH_RESISTANCE_RADIUS) / (MEDIUM_RESISTANCE_RADIUS - HIGH_RESISTANCE_RADIUS);
        resistance = 0.85 - (normalized * normalized * 0.25); // 0.6-0.85的阻力
        zoneType = 'medium';
        gameState.isInCoreZone = false;
    } else if (distanceToCenter <= LOW_RESISTANCE_RADIUS) {
        // 外圈：线性递减阻力
        const normalized = (distanceToCenter - MEDIUM_RESISTANCE_RADIUS) / (LOW_RESISTANCE_RADIUS - MEDIUM_RESISTANCE_RADIUS);
        resistance = 0.6 - (normalized * 0.35); // 0.25-0.6的阻力
        zoneType = 'low';
        gameState.isInCoreZone = false;
    } else if (distanceToCenter <= RESISTANCE_AREA_RADIUS) {
        // 边缘区：快速递减到零
        const normalized = (distanceToCenter - LOW_RESISTANCE_RADIUS) / (RESISTANCE_AREA_RADIUS - LOW_RESISTANCE_RADIUS);
        resistance = 0.25 - (normalized * 0.25); // 0-0.25的阻力
        zoneType = 'verylow';
        gameState.isInCoreZone = false;
    } else {
        // 外部：无阻力，移动速度加倍
        resistance = -0.5; // 负阻力=加速效果
        zoneType = 'outside';
        gameState.isInCoreZone = false;
    }
    
    gameState.currentResistance = Math.max(0, resistance);
    
    // ========== 应用阻力和吸引力 ==========
    // 修改：在外部区域（负阻力）时增加移动速度，内部区域减小移动速度
    let speedMultiplier;
    if (resistance < 0) {
        // 外部区域：1.5倍速度
        speedMultiplier = 1.5;
    } else {
        // 内部区域：应用阻力
        speedMultiplier = 1 - resistance;
    }
    
    const moveX = e.movementX * speedMultiplier;
    const moveY = e.movementY * speedMultiplier;
    
    // ========== 克服阻力消耗能量 ==========
    // 只有在有阻力（resistance > 0）的情况下才消耗能量
    if (resistance > 0) {
        const movementMagnitude = Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY);
        if (movementMagnitude > 0) {
            // 使用平方关系：阻力越大，能量消耗越多
            const resistanceEnergyCost = movementMagnitude * (resistance * resistance) * RESISTANCE_ENERGY_COST_MULTIPLIER * 0.015;
            reduceEnergy(resistanceEnergyCost);
            
            // 音频反馈：阻力越大，耳鸣声越强
            if (window.isAudioEnabled && resistance > 0.5) {
                window.playCurrentSound(resistance * 0.8); // 阻力越大声音越强
            }
            
            // 视觉反馈：高阻力时光标变红
            if (resistanceEnergyCost > 0.3) {
                const intensity = Math.min(1, resistanceEnergyCost / 1.5);
                const customCursor = document.getElementById('customCursor');
                if (customCursor) {
                    const red = 200 + Math.floor(55 * intensity);
                    const green = 160 - Math.floor(100 * intensity);
                    const blue = 120 - Math.floor(70 * intensity);
                    customCursor.style.background = `rgb(${red}, ${green}, ${blue})`;
                    customCursor.style.transform = `scale(${1 + intensity * 0.3})`; // 阻力越大光标越大
                }
            }
        }
    } else if (resistance < 0) {
        // 外部区域：快速恢复能量
        restoreEnergy(0.2);
    }
    
    // ========== 广告吸引力应用 ==========
    if (adAttractionForce > 0 && isOutsideButtonRadius && closestZoneCenter) {
        const targetCenter = closestZoneCenter;
        const angleToAd = Math.atan2(targetCenter.y - gameState.mousePos.y, targetCenter.x - gameState.mousePos.x);
        
        // 温和的吸引力强度 - 大幅降低防止抖动
        const attractionStrength = adAttractionForce * 15; // 从40降低到15
        
        // 非线性吸引力 - 越靠近广告吸引力越强，但衰减更快
        const normalizedDist = closestZoneDistance / AD_ATTRACTION_RADIUS;
        const proximityMultiplier = Math.pow(1 - normalizedDist, 3); // 使用三次方，让远离时快速衰减
        const finalAttractionStrength = attractionStrength * proximityMultiplier; // 完全依赖距离，不设最小值
        
        // 添加阑制，防止吸引力过强导致抖动
        const maxAttractionPerFrame = 2; // 每帧最大吸引像素
        const clampedAttractionStrength = Math.min(finalAttractionStrength, maxAttractionPerFrame);
        
        const attractionX = Math.cos(angleToAd) * clampedAttractionStrength;
        const attractionY = Math.sin(angleToAd) * clampedAttractionStrength;
        
        gameState.mousePos.x += moveX + attractionX;
        gameState.mousePos.y += moveY + attractionY;
        
        // 广告区域的视觉效果
        if (gameState.closestZone && gameState.closestZone.element) {
            const adScale = 1 + adAttractionForce * 0.15;
            const adShadowIntensity = 30 + (adAttractionForce * 40);
            const zoneElement = gameState.closestZone.element;
            const zoneColor = gameState.closestZone.color;
            
            zoneElement.style.boxShadow = `0 8px ${adShadowIntensity}px ${zoneColor}`;
            zoneElement.style.transform = `scale(${adScale})`;
            zoneElement.style.borderWidth = '4px';
            zoneElement.style.borderColor = zoneColor;
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
                resistSound.frequency.setValueAtTime(200 + (resistanceStrength * 400), window.audioContext.currentTime);
                
                resistGain.gain.setValueAtTime(resistanceStrength * 0.2, window.audioContext.currentTime);
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
        
        // 重置所有广告区域的视觉效果
        const allZoneElements = [zone1, zone2, zone3, zone4, zone5, zone6];
        for (const zoneEl of allZoneElements) {
            if (zoneEl) {
                zoneEl.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
                zoneEl.style.transform = 'scale(1)';
                zoneEl.style.borderWidth = '3px';
            }
        }
        
        const customCursor = document.getElementById('customCursor');
        if (customCursor && (!gameState.isInCoreZone || !gameState.isNearButton)) {
            customCursor.style.transform = 'scale(1)';
            customCursor.style.background = '#FF9800'; // 橙色高亮
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
            window.playCurrentSound(repulsionForce * 0.5); // 降低音量强度
        }
        
        if (customCursor) {
            customCursor.style.transform = `scale(${1 + repulsionForce * 0.8})`; // 减小缩放效果
            customCursor.style.opacity = `1`; // 保持不透明
            customCursor.style.background = `rgb(${Math.floor(200 - repulsionForce * 40)}, ${Math.floor(160 - repulsionForce * 40)}, ${Math.floor(120 - repulsionForce * 25)})`; // 减小颜色变化
        }
        
        // 大幅降低抖动强度，让按钮更稳定
        const shakeAmount = 5; // 从15降到5
        const xShake = (Math.random() - 0.5) * 2 * shakeAmount * repulsionForce * 0.3; // 额外降低30%
        const yShake = (Math.random() - 0.5) * 2 * shakeAmount * repulsionForce * 0.3;
        
        gameState.buttonOffset.x = gameState.buttonOffset.x * 0.8 + xShake * 0.2; // 更平滑的过渡
        gameState.buttonOffset.y = gameState.buttonOffset.y * 0.8 + yShake * 0.2;
        
        taskButtonContainer.style.transform = `translate(-50%, -50%) translate(${gameState.buttonOffset.x}px, ${gameState.buttonOffset.y}px)`;
        
        const totalShake = Math.abs(gameState.buttonOffset.x) + Math.abs(gameState.buttonOffset.y);
        gameState.canClickButton = totalShake < 8; // 从3提高到8，更容易点击
        
        if (gameState.canClickButton) {
            taskBtn.style.boxShadow = `0 0 30px rgba(76, 175, 80, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.3)`;
            taskBtn.style.background = '#4CAF50'; // 纯色
        }
        
        buttonHalo.style.boxShadow = `0 0 ${12 + repulsionForce * 18}px rgba(255, 100, 100, ${0.3 + repulsionForce * 0.25})`;
        
        const timeInZone = (Date.now() - gameState.energyDepletionStartTime) / 1000;
        const targetEnergy = Math.max(0, 100 - (timeInZone / 6) * 100); // 从4秒改为6秒，给更多时间
        const energyDiff = gameState.energy - targetEnergy;
        
        if (energyDiff > 0) {
            reduceEnergy(energyDiff * BUTTON_REPULSION_ENERGY_COST_MULTIPLIER * 0.5); // 降低能量消耗
        }
        
        // 移除斥力推开机制，让用户可以稳定停留在按钮上
        // 注释掉原有的斥力代码
        /*
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
        */
        
    } else if (!adAttractionForce || !isOutsideButtonRadius) {
        gameState.energyDepletionStartTime = 0;
        gameState.buttonFound = false;
        gameState.canClickButton = false;
        
        if (window.isAudioEnabled) {
            window.stopCurrentSound();
        }
        
        if (customCursor && !adAttractionForce && (!gameState.isInCoreZone || !gameState.isNearButton)) {
            customCursor.style.transform = 'scale(1)';
            customCursor.style.opacity = '1';
            customCursor.style.background = '#FF9800'; // 橙色高亮
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

    if (gameState.energy <= 0 && !gameState.isFrozen && !gameState.isSuccessful) {
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
        
        // 显示能量耗尽提示并在2秒后重置
        const energyDepletedHint = document.createElement('div');
        energyDepletedHint.style.position = 'fixed';
        energyDepletedHint.style.top = '50%';
        energyDepletedHint.style.left = '50%';
        energyDepletedHint.style.transform = 'translate(-50%, -50%)';
        energyDepletedHint.style.background = 'rgba(244, 67, 54, 0.95)';
        energyDepletedHint.style.color = 'white';
        energyDepletedHint.style.padding = '30px 50px';
        energyDepletedHint.style.borderRadius = '15px';
        energyDepletedHint.style.fontSize = '24px';
        energyDepletedHint.style.fontWeight = 'bold';
        energyDepletedHint.style.zIndex = '100000';
        energyDepletedHint.style.textAlign = 'center';
        energyDepletedHint.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
        energyDepletedHint.innerHTML = '<i class="fas fa-battery-empty"></i> 能量耗尽！<br><small style="font-size: 16px; margin-top: 10px; display: block;">正在重置...</small>';
        document.body.appendChild(energyDepletedHint);
        
        setTimeout(() => {
            document.body.removeChild(energyDepletedHint);
            // 重置游戏状态
            gameState.energy = 100;
            gameState.isFrozen = false;
            gameState.failCount = 0;
            gameState.attemptTimer = 0;
            gameState.timeNearButton = 0;
            gameState.currentResistance = 0;
            gameState.isInCenterZone = false;
            gameState.centerHoldStartTime = 0;
            
            // 重置UI
            if (energyFill) energyFill.style.width = '100%';
            if (energyValue) {
                energyValue.textContent = '100%';
                energyValue.style.color = 'var(--dark)';
            }
            if (customCursor) customCursor.style.background = 'var(--primary)';
            
            updateFailCountDisplay();
            
            console.log('游戏已重置');
        }, 2000);
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
            // 立即标记为成功，防止其他操作
            gameState.isSuccessful = true;
            gameState.isFrozen = true;
            
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
            failHint.style.position = 'fixed';
            failHint.style.bottom = '100px';
            failHint.style.left = '50%';
            failHint.style.transform = 'translateX(-50%)';
            failHint.style.color = '#fff';
            failHint.style.fontSize = '16px';
            failHint.style.fontWeight = 'bold';
            failHint.style.background = 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)';
            failHint.style.padding = '12px 24px';
            failHint.style.borderRadius = '25px';
            failHint.style.zIndex = '1001';
            failHint.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.5)';
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
        }
    });
}

// 恢复鼠标正常状态
function restoreMouseState() {
    console.log('恢复鼠标状态');
    
    // 立即标记为成功并冻结，防止能量耗尽提示出现
    gameState.isSuccessful = true;
    gameState.isFrozen = true;
    
    // 立即停止所有计时器和活动
    stopTimer();
    stopDistractionDetection();
    stopCenterHoldDetection();
    stopAutoAttraction(); // 停止自动广告吸引
    
    // 重置游戏状态
    gameState.isLocked = false;
    
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
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        updateElementPositions();
    });
    
    console.log('Stage1.js 初始化完成');
});