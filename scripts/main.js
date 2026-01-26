// ========== 主逻辑和初始化 ==========

// 全局变量
window.gameState = window.gameState || {};
window.isAudioEnabled = false;
window.audioContext = null;

// 自定义光标交互处理
function setupCustomCursor() {
    const customCursor = document.getElementById('customCursor');
    if (!customCursor) return;
    
    // 确保光标不会阻止点击
    customCursor.style.pointerEvents = 'none';
    
    // 更新光标位置
    document.addEventListener('mousemove', (e) => {
        // 只在第一阶段锁定状态下更新自定义光标位置
        if (window.gameState.isLocked) {
            customCursor.style.left = `${e.clientX - 10}px`;
            customCursor.style.top = `${e.clientY - 10}px`;
        }
    });
}

// 初始化游戏元素
function initGameElements() {
    console.log('初始化游戏元素');
    
    // 初始化第一阶段
    if (window.initFirstStage) {
        window.initFirstStage();
    }
    
    // 设置自定义光标
    setupCustomCursor();
    
    // 设置任务按钮点击事件
    if (window.setupTaskButtonClick) {
        window.setupTaskButtonClick();
    }
    
    console.log('游戏元素初始化完成');
}

// Pointer Lock API 设置
function setupPointerLock() {
    const gravityWell = document.getElementById('gravityWell');
    
    if (!gravityWell) return;
    
    // 点击重力井开始游戏
    gravityWell.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startScreen = document.getElementById('startScreen');
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        
        // 如果开始界面或十任务界面显示中，不处理
        if ((startScreen && startScreen.style.display === 'flex') || 
            (tenTasksScreen && tenTasksScreen.style.display === 'flex')) {
            return;
        }
        
        if (!window.gameState.isLocked) {
            console.log('请求指针锁定');
            
            // 请求指针锁定
            if (gravityWell.requestPointerLock) {
                gravityWell.requestPointerLock();
            } else if (gravityWell.mozRequestPointerLock) {
                gravityWell.mozRequestPointerLock();
            }
        }
    });
}

// 修复的指针锁定变化处理
function handleLockChange() {
    const gravityWell = document.getElementById('gravityWell');
    const lockHint = document.getElementById('lockHint');
    const customCursor = document.getElementById('customCursor');
    
    if (document.pointerLockElement === gravityWell || 
        document.mozPointerLockElement === gravityWell) {
        console.log('指针锁定成功');
        
        // 添加鼠标移动监听
        document.addEventListener('mousemove', window.handleMouseMove, false);
        window.gameState.isLocked = true;
        document.body.classList.add('pointer-locked');
        
        // 显示自定义光标
        if (customCursor) {
            customCursor.style.display = 'block';
        }
        
        // 隐藏锁定提示
        if (lockHint) lockHint.classList.add('hidden');
        
        // 开始游戏计时器
        if (window.startTimer) {
            window.startTimer();
        }
    } else {
        console.log('指针锁定解除');
        
        // 移除鼠标移动监听
        document.removeEventListener('mousemove', window.handleMouseMove, false);
        document.body.classList.remove('pointer-locked');
        window.gameState.isLocked = false;
        
        // 隐藏自定义光标
        if (customCursor) {
            customCursor.style.display = 'none';
        }
        
        // 显示锁定提示
        if (lockHint) {
            lockHint.classList.remove('hidden');
            lockHint.style.display = 'block';
        }
        
        // 恢复系统光标
        document.body.style.cursor = 'default';
        
        // 停止声音
        if (window.stopCurrentSound) {
            window.stopCurrentSound();
        }
        
        // 停止计时器
        if (window.stopTimer) {
            window.stopTimer();
        }
    }
}

// ESC键处理
function setupEscapeHandler() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const tenTasksScreen = document.getElementById('tenTasksScreen');
            const startScreen = document.getElementById('startScreen');
            
            // 如果在十任务界面
            if (tenTasksScreen && tenTasksScreen.style.display === 'flex') {
                // 退出十任务界面
                if (window.cleanupTenTasksStage) {
                    window.cleanupTenTasksStage();
                }
                tenTasksScreen.style.display = 'none';
                location.reload();
                return;
            } 
            // 如果在指针锁定状态
            else if (window.gameState && window.gameState.isLocked) {
                // 退出指针锁定
                document.exitPointerLock();
            }
            // 如果在游戏界面但未锁定
            else if (startScreen && startScreen.style.display === 'none') {
                // 先恢复鼠标状态
                if (window.restoreMouseState) {
                    window.restoreMouseState();
                }
                
                // 重新显示开始界面
                startScreen.style.display = 'flex';
                document.querySelectorAll('.gravity-well, .entertainment-zones, .energy-bar, .energy-value, .timer-display, .resistance-indicator, .fail-count-display, .button-instruction, .audio-control, .lock-hint, .audio-hint').forEach(el => {
                    el.style.display = 'none';
                });
                
                // 重置自定义光标
                const customCursor = document.getElementById('customCursor');
                if (customCursor) {
                    customCursor.style.display = 'none';
                }
            }
        }
    });
}

// 开始界面处理
function setupStartScreen() {
    const startScreen = document.getElementById('startScreen');
    if (!startScreen) return;
    
    startScreen.addEventListener('click', () => {
        console.log('开始界面点击');
        
        // 隐藏开始界面
        startScreen.style.display = 'none';
        
        // 显示核心游戏界面
        const gameElements = [
            '.gravity-well', '.entertainment-zones', '.energy-bar', 
            '.energy-value', '.timer-display', '.resistance-indicator', 
            '.fail-count-display', '.button-instruction', '.audio-control', 
            '.lock-hint', '.audio-hint'
        ];
        
        gameElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'block';
            });
        });
        
        // 初始化游戏
        initGameElements();
        
        // 更新元素位置
        if (window.updateElementPositions) {
            window.updateElementPositions();
        }
        
        console.log('游戏界面已显示');
        
        // 自动触发指针锁定
        setTimeout(() => {
            const gravityWell = document.getElementById('gravityWell');
            if (gravityWell && !window.gameState.isLocked) {
                console.log('自动请求指针锁定');
                if (gravityWell.requestPointerLock) {
                    gravityWell.requestPointerLock();
                } else if (gravityWell.mozRequestPointerLock) {
                    gravityWell.mozRequestPointerLock();
                }
            }
        }, 100);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化');
    
    // 1. 设置开始界面
    setupStartScreen();
    
    // 2. 设置指针锁定
    setupPointerLock();
    
    // 3. 设置指针锁定变化事件
    document.addEventListener('pointerlockchange', handleLockChange, false);
    document.addEventListener('mozpointerlockchange', handleLockChange, false);
    
    // 4. 设置ESC键处理
    setupEscapeHandler();
    
    // 5. 设置全局变量
    window.handleLockChange = handleLockChange;
    
    // 6. 初始化：隐藏所有游戏界面，只显示开始界面
    const gameElements = [
        '.gravity-well', '.entertainment-zones', '.energy-bar', 
        '.energy-value', '.timer-display', '.resistance-indicator', 
        '.fail-count-display', '.button-instruction', '.audio-control', 
        '.lock-hint', '.audio-hint', '.custom-cursor'
    ];
    
    gameElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.display = 'none';
        });
    });
    
    // 隐藏其他提示
    const taskCompleteHint = document.getElementById('taskCompleteHint');
    if (taskCompleteHint) taskCompleteHint.style.display = 'none';
    
    const correctChoiceHint = document.getElementById('correctChoiceHint');
    if (correctChoiceHint) correctChoiceHint.style.display = 'none';
    
    // 确保开始界面显示
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.style.display = 'flex';
    
    // 初始光标样式
    document.body.style.cursor = 'default';
    document.body.classList.remove('pointer-locked', 'stage2-active');
    
    // 调整导航栏位置
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.position = 'absolute';
        navbar.style.top = '0';
    }
    
    console.log('初始化完成，等待用户点击开始界面');
});

// 窗口大小调整
window.addEventListener('resize', () => {
    if (window.updateElementPositions) {
        window.updateElementPositions();
    }
});

// 清理函数
window.addEventListener('beforeunload', () => {
    if (window.audioContext) {
        window.audioContext.close();
    }
    
    // 清理所有定时器
    if (window.cleanupFirstStage) {
        window.cleanupFirstStage();
    }
    
    if (window.cleanupTenTasksStage) {
        window.cleanupTenTasksStage();
    }
});