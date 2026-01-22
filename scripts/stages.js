// ========== 阶段管理和屏幕切换 ==========

// 恢复鼠标正常状态
function restoreMouseState() {
    console.log('恢复鼠标状态');
    
    // 确保退出指针锁定
    if (document.pointerLockElement || document.mozPointerLockElement) {
        document.exitPointerLock();
    }
    
    // 重置body样式
    document.body.classList.remove('pointer-locked');
    document.body.style.cursor = 'default';
    
    // 隐藏自定义光标
    const customCursor = document.getElementById('customCursor');
    if (customCursor) {
        customCursor.style.display = 'none';
    }
    
    // 显示系统光标
    const style = document.createElement('style');
    style.id = 'mouse-restore-style';
    style.textContent = `
        body { cursor: default !important; }
        * { cursor: auto !important; }
    `;
    document.head.appendChild(style);
}

// 清理第一阶段的所有资源和事件监听
function cleanupFirstStage() {
    console.log('清理第一阶段资源');
    
    // 恢复鼠标状态
    if (window.restoreMouseState) {
        window.restoreMouseState();
    }
    
    // 停止所有计时器
    if (window.gameState) {
        if (window.gameState.timerInterval) {
            clearInterval(window.gameState.timerInterval);
            window.gameState.timerInterval = null;
        }
        if (window.gameState.distractionTimerInterval) {
            clearInterval(window.gameState.distractionTimerInterval);
            window.gameState.distractionTimerInterval = null;
        }
        if (window.gameState.centerHoldInterval) {
            clearInterval(window.gameState.centerHoldInterval);
            window.gameState.centerHoldInterval = null;
        }
        
        // 重置游戏状态
        window.gameState.isLocked = false;
        window.gameState.isFrozen = false;
    }
    
    // 停止声音
    if (window.stopCurrentSound) {
        window.stopCurrentSound();
    }
    
    // 移除鼠标移动监听
    if (window.handleMouseMove) {
        document.removeEventListener('mousemove', window.handleMouseMove);
    }
    
    // 移除临时样式
    const tempStyle = document.getElementById('mouse-restore-style');
    if (tempStyle) {
        tempStyle.remove();
    }
}

// 显示过渡阶段
function showTransitionScreen() {
    console.log('显示过渡阶段');
    
    // 清理第一阶段
    cleanupFirstStage();
    
    // 隐藏所有第一界面的元素
    const elementsToHide = [
        '.gravity-well', '.entertainment-zones', '.energy-bar', 
        '.energy-value', '.timer-display', '.resistance-indicator', 
        '.find-button-hint', '.distraction-timer', '.button-instruction', 
        '.audio-control', '.lock-hint', '.audio-hint', '.center-hint', 
        '.fail-count-display', '.custom-cursor'
    ];
    
    elementsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
        });
    });
    
    // 隐藏任务完成提示
    const taskCompleteHint = document.getElementById('taskCompleteHint');
    if (taskCompleteHint) taskCompleteHint.style.display = 'none';
    
    // 显示过渡阶段
    const transitionScreen = document.getElementById('transitionScreen');
    if (transitionScreen) {
        transitionScreen.style.display = 'flex';
        console.log('过渡阶段已显示');
        
        // 确保过渡阶段可以点击
        transitionScreen.style.cursor = 'pointer';
        transitionScreen.style.pointerEvents = 'auto';
    }
}

// 显示十任务分散布局界面
function showTenTasksScreen() {
    console.log('显示十任务界面');
    
    // 清理第一阶段
    cleanupFirstStage();
    
    // 隐藏过渡阶段
    const transitionScreen = document.getElementById('transitionScreen');
    if (transitionScreen) {
        transitionScreen.style.display = 'none';
    }
    
    // 确保指针锁定完全退出
    setTimeout(() => {
        if (document.pointerLockElement || document.mozPointerLockElement) {
            document.exitPointerLock();
        }
        
        // 重置body样式
        document.body.classList.remove('pointer-locked');
        document.body.style.cursor = 'default';
        
        // 显示十任务界面
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        if (tenTasksScreen) {
            tenTasksScreen.style.display = 'flex';
            console.log('十任务界面已显示');
            
            // 确保界面可以交互
            tenTasksScreen.style.pointerEvents = 'auto';
            tenTasksScreen.style.cursor = 'default';
        }
        
        // 初始化十任务布局
        if (window.initTenTasksLayout) {
            setTimeout(() => {
                window.initTenTasksLayout();
            }, 100);
        }
    }, 100);
}

// 显示成功界面
function showSuccessScreen(attemptTimer, timeNearButton, failCount, energy) {
    console.log('显示成功界面');
    
    // 清理第一阶段
    cleanupFirstStage();
    
    // 清理十任务阶段
    if (window.tenTasksState) {
        if (window.tenTasksState.timerInterval) {
            clearInterval(window.tenTasksState.timerInterval);
        }
        if (window.tenTasksState.buttonMoveInterval) {
            clearInterval(window.tenTasksState.buttonMoveInterval);
        }
        if (window.tenTasksState.colorChangeInterval) {
            clearInterval(window.tenTasksState.colorChangeInterval);
        }
    }
    
    // 隐藏所有界面的元素
    const allElements = [
        '.gravity-well', '.entertainment-zones', '.energy-bar', 
        '.energy-value', '.timer-display', '.resistance-indicator', 
        '.find-button-hint', '.distraction-timer', '.button-instruction', 
        '.audio-control', '.lock-hint', '.audio-hint', '.center-hint', 
        '.fail-count-display', '.ten-tasks-screen', '.custom-cursor',
        '.transition-screen'
    ];
    
    allElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
        });
    });
    
    // 计算实际在按钮附近的时间
    const actualTimeNearButton = timeNearButton || 0;
    
    // 更新成功界面的统计数据
    const finalTime = document.getElementById('finalTime');
    const finalStableTime = document.getElementById('finalStableTime');
    const finalFails = document.getElementById('finalFails');
    const finalEnergy = document.getElementById('finalEnergy');
    
    if (finalTime) finalTime.textContent = `${attemptTimer?.toFixed(1) || '0.0'}s`;
    if (finalStableTime) finalStableTime.textContent = `${actualTimeNearButton.toFixed(1)}s`;
    if (finalFails) finalFails.textContent = failCount || 0;
    if (finalEnergy) finalEnergy.textContent = `${Math.round(energy || 100)}%`;
    
    // 创建庆祝动画
    if (window.createCelebrationAnimation) {
        window.createCelebrationAnimation();
    }
    
    // 显示成功界面
    const successScreen = document.getElementById('successScreen');
    if (successScreen) {
        successScreen.style.display = 'flex';
        console.log('成功界面已显示');
        
        // 确保成功界面可以点击
        successScreen.style.cursor = 'default';
        successScreen.style.pointerEvents = 'auto';
    }
    
    // 播放庆祝音乐
    if (window.isAudioEnabled && window.audioContext) {
        if (window.playCelebrationMusic) {
            window.playCelebrationMusic();
        }
    }
}

// 创建庆祝动画
function createCelebrationAnimation() {
    const celebrationAnimation = document.getElementById('celebrationAnimation');
    if (!celebrationAnimation) return;
    
    celebrationAnimation.innerHTML = '';
    
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.background = color;
        
        confetti.style.left = `${Math.random() * 100}%`;
        
        const size = 5 + Math.random() * 15;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size * 2}px`;
        
        const delay = Math.random() * 3;
        const duration = 3 + Math.random() * 4;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.animationDuration = `${duration}s`;
        
        celebrationAnimation.appendChild(confetti);
    }
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    console.log('Stages.js 初始化');
    
    // 过渡阶段点击事件
    const transitionScreen = document.getElementById('transitionScreen');
    if (transitionScreen) {
        transitionScreen.addEventListener('click', (e) => {
            console.log('过渡阶段点击');
            e.preventDefault();
            e.stopPropagation();
            
            // 隐藏过渡阶段
            transitionScreen.style.display = 'none';
            
            // 显示十任务阶段
            showTenTasksScreen();
        });
    }
    
    // 继续按钮事件
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', (e) => {
            console.log('继续按钮点击');
            e.preventDefault();
            e.stopPropagation();
            
            // 隐藏成功界面
            const successScreen = document.getElementById('successScreen');
            if (successScreen) successScreen.style.display = 'none';
            
            // 显示过渡阶段
            showTransitionScreen();
        });
    }
    
    // 返回开始按钮事件
    const backToStart = document.getElementById('backToStart');
    if (backToStart) {
        backToStart.addEventListener('click', (e) => {
            console.log('返回开始按钮点击');
            e.preventDefault();
            e.stopPropagation();
            location.reload();
        });
    }
    
    // 暴露函数到全局
    window.showTransitionScreen = showTransitionScreen;
    window.showTenTasksScreen = showTenTasksScreen;
    window.showSuccessScreen = showSuccessScreen;
    window.createCelebrationAnimation = createCelebrationAnimation;
    window.cleanupFirstStage = cleanupFirstStage;
    window.restoreMouseState = restoreMouseState;
});