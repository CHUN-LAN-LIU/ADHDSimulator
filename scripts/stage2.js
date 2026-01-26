// ========== 十任务分散布局变量 ==========
const tenTasksState = {
    startTime: 0,
    timerInterval: null,
    attemptTimer: 0,
    buttons: [],
    correctTaskIndex: -1,
    blueErrorButtons: [], // 改为数组，存储多个蓝色错误按钮索引
    buttonMoveInterval: null,
    colorChangeInterval: null,
    isActive: false,
    extraButtonsInterval: null, // 新增：额外按钮定时器
    extraButtonCount: 0, // 新增：额外按钮计数
    maxButtons: 30, // 新增：最大按钮数量限制
    buttonRepelInterval: null, // 新增：按钮弹开定时器
    buttonRepelChance: 0 // 禁用正确按钮弹开效果
};

// 颜色数组 - 各种干扰颜色（纯色）
const distractionColors = [
    { name: "红色", color: "#F44336" },
    { name: "橙色", color: "#FF9800" },
    { name: "黄色", color: "#FFEB3B" },
    { name: "绿色", color: "#4CAF50" },
    { name: "紫色", color: "#9C27B0" },
    { name: "粉色", color: "#E91E63" },
    { name: "棕色", color: "#795548" },
    { name: "灰色", color: "#9E9E9E" }
];

// 正确按钮颜色 - 蓝色纯色
const correctColor = {
    name: "蓝色",
    color: "#2196F3"
};

// 清理十任务阶段
function cleanupTenTasksStage() {
    console.log('清理十任务阶段');
    
    if (tenTasksState.timerInterval) {
        clearInterval(tenTasksState.timerInterval);
        tenTasksState.timerInterval = null;
    }
    
    if (tenTasksState.buttonMoveInterval) {
        clearInterval(tenTasksState.buttonMoveInterval);
        tenTasksState.buttonMoveInterval = null;
    }
    
    if (tenTasksState.colorChangeInterval) {
        clearInterval(tenTasksState.colorChangeInterval);
        tenTasksState.colorChangeInterval = null;
    }
    
    if (tenTasksState.extraButtonsInterval) {
        clearInterval(tenTasksState.extraButtonsInterval);
        tenTasksState.extraButtonsInterval = null;
    }
    
    if (tenTasksState.buttonRepelInterval) {
        clearInterval(tenTasksState.buttonRepelInterval);
        tenTasksState.buttonRepelInterval = null;
    }
    
    tenTasksState.isActive = false;
    tenTasksState.blueErrorButtons = []; // 清空蓝色错误按钮数组
    tenTasksState.extraButtonCount = 0;
    
    // 移除body的stage2类
    document.body.classList.remove('stage2-active');
}

// 初始化十任务布局
function initTenTasksLayout() {
    console.log('初始化十任务布局');
    
    // 清理可能存在的旧状态
    cleanupTenTasksStage();
    
    // 设置body为第二阶段状态
    document.body.classList.add('stage2-active');
    document.body.style.cursor = 'default';
    
    // 获取元素
    const tenTasksContainer = document.getElementById('tenTasksContainer');
    if (!tenTasksContainer) return;
    
    // 清空容器
    tenTasksContainer.innerHTML = '';
    tenTasksState.buttons = [];
    tenTasksState.isActive = true;
    tenTasksState.extraButtonCount = 0;
    
    // 重置时间
    tenTasksState.startTime = Date.now();
    tenTasksState.attemptTimer = 0;
    
    // 定义任务列表 - 确保"构思总体框架"在其中
    const taskNames = [
        "收拾房间",
        "拿充电线", 
        "再次确认任务要求",
        "选择报告中使用的图片",
        "找到提交报告的邮箱",
        "回消息",
        "总结与反思",
        "描述报告细节内容",
        "构思总体框架",  // 正确任务
        "检查报告格式",
        "查看天气预报",
        "整理桌面图标",
        "调整椅子高度",
        "喝口水",
        "检查手机通知",
        "拉伸一下",
        "回忆昨天的事",
        "计划晚餐吃什么",
        "数一下有几个按钮",
        "思考人生意义"
    ];
    
    // 找到"构思总体框架"的索引
    tenTasksState.correctTaskIndex = taskNames.indexOf("构思总体框架");
    
    // 初始随机选择4个错误按钮显示为蓝色（增加干扰）
    let errorButtonIndices = [];
    for (let i = 0; i < taskNames.length; i++) {
        if (i !== tenTasksState.correctTaskIndex) {
            errorButtonIndices.push(i);
        }
    }
    
    // 随机选择4个蓝色错误按钮
    const blueErrorButtons = [];
    for (let i = 0; i < 3; i++) {
        if (errorButtonIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * errorButtonIndices.length);
            blueErrorButtons.push(errorButtonIndices[randomIndex]);
            errorButtonIndices.splice(randomIndex, 1); // 移除已选中的
        }
    }
    
    tenTasksState.blueErrorButtons = blueErrorButtons; // 存储所有蓝色错误按钮索引
    
    // 获取容器尺寸
    const containerWidth = tenTasksContainer.offsetWidth;
    const containerHeight = tenTasksContainer.offsetHeight;
    
    // 预定义的网格位置（确保按钮不重叠）- 扩展为20个位置
    const gridPositions = [
        {x: 0.10, y: 0.15},
        {x: 0.30, y: 0.15},
        {x: 0.50, y: 0.15},
        {x: 0.70, y: 0.15},
        {x: 0.90, y: 0.15},
        {x: 0.10, y: 0.35},
        {x: 0.30, y: 0.35},
        {x: 0.50, y: 0.35},
        {x: 0.70, y: 0.35},
        {x: 0.90, y: 0.35},
        {x: 0.10, y: 0.55},
        {x: 0.30, y: 0.55},
        {x: 0.50, y: 0.55},
        {x: 0.70, y: 0.55},
        {x: 0.90, y: 0.55},
        {x: 0.20, y: 0.75},
        {x: 0.40, y: 0.75},
        {x: 0.60, y: 0.75},
        {x: 0.80, y: 0.75},
        {x: 0.50, y: 0.90}
    ];
    
    // 打乱位置数组，使按钮随机分布
    const shuffledPositions = [...gridPositions].sort(() => Math.random() - 0.5);
    
    // 创建20个任务按钮（初始数量）
    const initialButtonCount = taskNames.length; // 使用所有任务名称
    for (let i = 0; i < initialButtonCount; i++) {
        const isCorrect = i === tenTasksState.correctTaskIndex;
        const isBlueError = tenTasksState.blueErrorButtons.includes(i); // 检查是否是蓝色错误按钮
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'scattered-task-btn-container';
        buttonContainer.style.position = 'absolute';
        
        const position = shuffledPositions[i];
        
        const finalX = Math.max(60, Math.min(containerWidth - 60, position.x * containerWidth));
        const finalY = Math.max(60, Math.min(containerHeight - 60, position.y * containerHeight));
        
        buttonContainer.style.left = `${finalX}px`;
        buttonContainer.style.top = `${finalY}px`;
        buttonContainer.style.transform = 'translate(-50%, -50%)';
        
        const taskButton = document.createElement('button');
        taskButton.className = 'scattered-task-btn';
        taskButton.id = `scatteredTaskBtn${i}`;
        
        // 设置按钮文本
        const buttonText = document.createElement('div');
        buttonText.className = 'scattered-task-btn-text';
        
        const title = document.createElement('div');
        title.className = 'scattered-task-btn-title';
        title.textContent = taskNames[i];
        
        buttonText.appendChild(title);
        taskButton.appendChild(buttonText);
        buttonContainer.appendChild(taskButton);
        
        tenTasksContainer.appendChild(buttonContainer);
        
        // 初始速度和方向
        const speed = 0.5 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        
        const buttonInfo = {
            element: taskButton,
            container: buttonContainer,
            isCorrect: isCorrect,
            x: finalX,
            y: finalY,
            name: taskNames[i],
            velocity: velocity,
            colorChangeTimer: 0,
            currentColorIndex: Math.floor(Math.random() * distractionColors.length),
            isBlueError: isBlueError,
            isExtraButton: false, // 标记是否为额外添加的按钮
            repelForce: { x: 0, y: 0 }, // 新增：弹开力
            repelTimer: 0 // 新增：弹开计时器
        };
        
        // 为正确按钮添加特殊类名
        if (isCorrect) {
            taskButton.classList.add('correct-task-btn');
            // 确保正确按钮使用原来的蓝色 #2196F3
            taskButton.style.background = '#2196F3';
        } else if (isBlueError) {
            // 蓝色错误按钮 - 显示为蓝色，但要与正确按钮区分
            taskButton.style.background = '#2196F3';
        } else {
            // 其他错误按钮设置随机颜色
            const color = distractionColors[buttonInfo.currentColorIndex];
            taskButton.style.background = color.color;
        }
        
        tenTasksState.buttons.push(buttonInfo);
        
        // 为每个按钮添加点击事件 - 使用捕获阶段确保处理
        taskButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleTaskButtonClick(i);
        }, {capture: true});
    }
    
    // 更新十任务界面的提示文字
    const tenTasksHint = document.getElementById('tenTasksHint');
    if (tenTasksHint) {
        tenTasksHint.textContent = "找到正确的蓝色任务按钮并点击（注意：有多个蓝色按钮，只有一个是正确的，错误的蓝色按钮会变换颜色）";
    }
    
    // 启动十任务阶段计时器
    if (tenTasksState.timerInterval) clearInterval(tenTasksState.timerInterval);
    tenTasksState.timerInterval = setInterval(() => {
        if (!tenTasksState.isActive) return;
        
        tenTasksState.attemptTimer = (Date.now() - tenTasksState.startTime) / 1000;
        const tenTasksTimer = document.getElementById('tenTasksTimer');
        if (tenTasksTimer) tenTasksTimer.textContent = `用时: ${tenTasksState.attemptTimer.toFixed(1)}秒`;
    }, 100);
    
    // 启动按钮移动动画
    startButtonMovement();
    
    // 启动颜色变化动画
    startColorChanges();
    
    // 新增：启动按钮弹开效果
    startButtonRepelEffect();
    
    // 新增：启动额外按钮添加定时器
    startExtraButtonsTimer();
    
    console.log('十任务布局初始化完成');
    console.log('正确按钮索引:', tenTasksState.correctTaskIndex);
    console.log('初始蓝色错误按钮索引:', tenTasksState.blueErrorButtonIndex);
}

// 新增：启动按钮弹开效果
function startButtonRepelEffect() {
    if (tenTasksState.buttonRepelInterval) clearInterval(tenTasksState.buttonRepelInterval);
    
    tenTasksState.buttonRepelInterval = setInterval(() => {
        if (!tenTasksState.isActive) return;
        
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        if (!tenTasksScreen || tenTasksScreen.style.display !== 'flex') return;
        
        // 更新所有按钮的弹开计时器
        tenTasksState.buttons.forEach((button, index) => {
            if (!button || !button.element) return;
            
            button.repelTimer++;
            
            // 每1秒检查一次是否需要弹开
            if (button.repelTimer >= 60) { // 60帧 ≈ 1秒
                button.repelTimer = 0;
                
                // 只有正确按钮才有90%的概率弹开
                if (button.isCorrect && Math.random() < tenTasksState.buttonRepelChance) {
                    applyButtonRepelEffect(button);
                }
            }
            
            // 应用持续的弹开力
            if (Math.abs(button.repelForce.x) > 0.1 || Math.abs(button.repelForce.y) > 0.1) {
                // 减缓弹开力
                button.repelForce.x *= 0.9;
                button.repelForce.y *= 0.9;
                
                // 应用弹开力到按钮速度
                button.velocity.x += button.repelForce.x * 0.1;
                button.velocity.y += button.repelForce.y * 0.1;
                
                // 限制最大速度
                const maxSpeed = 5;
                const currentSpeed = Math.sqrt(button.velocity.x * button.velocity.x + button.velocity.y * button.velocity.y);
                if (currentSpeed > maxSpeed) {
                    button.velocity.x = (button.velocity.x / currentSpeed) * maxSpeed;
                    button.velocity.y = (button.velocity.y / currentSpeed) * maxSpeed;
                }
                
                // 给按钮添加弹开视觉反馈
                if (button.element) {
                    button.element.style.boxShadow = `0 0 20px rgba(255, 0, 0, 0.7), inset 0 0 10px rgba(255, 255, 255, 0.3)`;
                    
                    // 短暂闪烁效果
                    button.element.style.animation = 'none';
                    setTimeout(() => {
                        if (button.element && button.element.style) {
                            button.element.style.animation = 'repelPulse 0.5s';
                        }
                    }, 10);
                }
            }
        });
    }, 16); // 约60fps
}

// 新增：应用按钮弹开效果
function applyButtonRepelEffect(button) {
    if (!button) return;
    
    // 随机生成弹开方向
    const angle = Math.random() * Math.PI * 2;
    const forceStrength = 2 + Math.random() * 3; // 弹开强度
    
    button.repelForce.x += Math.cos(angle) * forceStrength;
    button.repelForce.y += Math.sin(angle) * forceStrength;
    
    // 视觉反馈
    if (button.element) {
        button.element.style.transform = 'scale(1.15)';
        button.element.style.boxShadow = `0 0 30px rgba(255, 50, 50, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.4)`;
        
        // 0.3秒后恢复
        setTimeout(() => {
            if (button.element && button.element.style) {
                button.element.style.transform = 'scale(1)';
                if (!button.isCorrect) {
                    button.element.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(255, 255, 255, 0.2)';
                }
            }
        }, 300);
    }
    
    // 音效
    if (window.isAudioEnabled && window.audioContext) {
        try {
            const repelSound = window.audioContext.createOscillator();
            const repelGain = window.audioContext.createGain();
            
            repelSound.type = 'triangle';
            repelSound.frequency.setValueAtTime(300, window.audioContext.currentTime);
            repelSound.frequency.exponentialRampToValueAtTime(150, window.audioContext.currentTime + 0.2);
            
            repelGain.gain.setValueAtTime(0.1, window.audioContext.currentTime);
            repelGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.2);
            
            repelSound.connect(repelGain);
            repelGain.connect(window.audioContext.destination);
            
            repelSound.start();
            repelSound.stop(window.audioContext.currentTime + 0.2);
        } catch (e) {
            console.error('音频播放错误:', e);
        }
    }
}

// 新增：启动额外按钮添加定时器
function startExtraButtonsTimer() {
    if (tenTasksState.extraButtonsInterval) clearInterval(tenTasksState.extraButtonsInterval);
    
    tenTasksState.extraButtonsInterval = setInterval(() => {
        if (!tenTasksState.isActive) return;
        
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        if (!tenTasksScreen || tenTasksScreen.style.display !== 'flex') return;
        
        // 每3秒添加3个额外按钮
        for (let i = 0; i < 3; i++) {
            if (tenTasksState.buttons.length < tenTasksState.maxButtons) {
                addExtraButton();
            }
        }
        
        // 更新提示
        const tenTasksHint = document.getElementById('tenTasksHint');
        if (tenTasksHint) {
            tenTasksHint.innerHTML = `找到蓝色正确任务按钮并点击<br>
            <small>干扰按钮数量: ${tenTasksState.buttons.length} (最大: ${tenTasksState.maxButtons}) | 正确按钮弹开概率: 90% | 每3秒增加3个干扰按钮</small>`;
        }
    }, 3000); // 每3秒执行一次
}

// 新增：添加额外干扰按钮
function addExtraButton() {
    const tenTasksContainer = document.getElementById('tenTasksContainer');
    if (!tenTasksContainer) return;
    
    const containerWidth = tenTasksContainer.offsetWidth;
    const containerHeight = tenTasksContainer.offsetHeight;
    
    // 随机位置
    const x = 60 + Math.random() * (containerWidth - 120);
    const y = 60 + Math.random() * (containerHeight - 120);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'scattered-task-btn-container extra-button';
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.left = `${x}px`;
    buttonContainer.style.top = `${y}px`;
    buttonContainer.style.transform = 'translate(-50%, -50%)';
    
    const taskButton = document.createElement('button');
    taskButton.className = 'scattered-task-btn';
    taskButton.id = `extraTaskBtn${tenTasksState.buttons.length}`;
    
    // 设置按钮文本 - 使用额外的干扰任务名称
    const extraTaskNames = [
        "查看天气预报",
        "整理桌面图标",
        "调整椅子高度",
        "喝口水",
        "检查手机通知",
        "拉伸一下",
        "回忆昨天的事",
        "计划晚餐吃什么",
        "数一下有几个按钮",
        "思考人生意义"
    ];
    
    const buttonText = document.createElement('div');
    buttonText.className = 'scattered-task-btn-text';
    
    const title = document.createElement('div');
    title.className = 'scattered-task-btn-title';
    title.textContent = extraTaskNames[Math.floor(Math.random() * extraTaskNames.length)];
    
    buttonText.appendChild(title);
    taskButton.appendChild(buttonText);
    buttonContainer.appendChild(taskButton);
    
    tenTasksContainer.appendChild(buttonContainer);
    
    // 初始速度和方向
    const speed = 0.8 + Math.random() * 2.0; // 比普通按钮更快
    const angle = Math.random() * Math.PI * 2;
    const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
    
    // 随机彩色渐变背景
    const colorIndex = Math.floor(Math.random() * distractionColors.length);
    const color = distractionColors[colorIndex];
    const colorIndex2 = Math.floor(Math.random() * distractionColors.length);
    const color2 = distractionColors[colorIndex2];
    // 使用渐变色让额外按钮更显眼
    taskButton.style.background = `linear-gradient(135deg, ${color.color} 0%, ${color2.color} 100%)`;
    
    const buttonInfo = {
        element: taskButton,
        container: buttonContainer,
        isCorrect: false,
        x: x,
        y: y,
        name: title.textContent,
        velocity: velocity,
        colorChangeTimer: 0,
        currentColorIndex: colorIndex,
        isBlueError: false,
        isExtraButton: true, // 标记为额外按钮
        repelForce: { x: 0, y: 0 },
        repelTimer: 0
    };
    
    tenTasksState.buttons.push(buttonInfo);
    tenTasksState.extraButtonCount++;
    
    // 为额外按钮添加点击事件
    taskButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        handleTaskButtonClick(tenTasksState.buttons.length - 1);
    }, {capture: true});
    
    // 视觉反馈
    buttonContainer.style.opacity = '0';
    buttonContainer.style.transform = 'translate(-50%, -50%) scale(0.5)';
    
    setTimeout(() => {
        buttonContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        buttonContainer.style.opacity = '1';
        buttonContainer.style.transform = 'translate(-50%, -50%) scale(1)';
        
        setTimeout(() => {
            buttonContainer.style.transition = '';
        }, 500);
    }, 10);
    
    // 音效
    if (window.isAudioEnabled && window.audioContext) {
        try {
            const addSound = window.audioContext.createOscillator();
            const addGain = window.audioContext.createGain();
            
            addSound.type = 'sine';
            addSound.frequency.setValueAtTime(200 + Math.random() * 200, window.audioContext.currentTime);
            
            addGain.gain.setValueAtTime(0.05, window.audioContext.currentTime);
            addGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.3);
            
            addSound.connect(addGain);
            addGain.connect(window.audioContext.destination);
            
            addSound.start();
            addSound.stop(window.audioContext.currentTime + 0.3);
        } catch (e) {
            console.error('音频播放错误:', e);
        }
    }
}

// 启动按钮移动动画
function startButtonMovement() {
    if (tenTasksState.buttonMoveInterval) clearInterval(tenTasksState.buttonMoveInterval);
    
    tenTasksState.buttonMoveInterval = setInterval(() => {
        if (!tenTasksState.isActive) return;
        
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        if (!tenTasksScreen || tenTasksScreen.style.display !== 'flex') return;
        
        const tenTasksContainer = document.getElementById('tenTasksContainer');
        if (!tenTasksContainer) return;
        
        const containerWidth = tenTasksContainer.offsetWidth;
        const containerHeight = tenTasksContainer.offsetHeight;
        const buttonRadius = 35;
        
        tenTasksState.buttons.forEach((button) => {
            if (!button || !button.container) return;
            
            // 更新位置
            button.x += button.velocity.x;
            button.y += button.velocity.y;
            
            // 边界碰撞检测
            if (button.x < buttonRadius) {
                button.x = buttonRadius;
                button.velocity.x = Math.abs(button.velocity.x);
            } else if (button.x > containerWidth - buttonRadius) {
                button.x = containerWidth - buttonRadius;
                button.velocity.x = -Math.abs(button.velocity.x);
            }
            
            if (button.y < buttonRadius) {
                button.y = buttonRadius;
                button.velocity.y = Math.abs(button.velocity.y);
            } else if (button.y > containerHeight - buttonRadius) {
                button.y = containerHeight - buttonRadius;
                button.velocity.y = -Math.abs(button.velocity.y);
            }
            
            // 更新按钮位置
            button.container.style.left = `${button.x}px`;
            button.container.style.top = `${button.y}px`;
            
            // 随机改变方向（模拟布朗运动）
            if (Math.random() < 0.05) {
                const angleChange = (Math.random() - 0.5) * 0.5;
                const currentAngle = Math.atan2(button.velocity.y, button.velocity.x);
                const newAngle = currentAngle + angleChange;
                const speed = Math.sqrt(button.velocity.x * button.velocity.x + button.velocity.y * button.velocity.y);
                
                button.velocity.x = Math.cos(newAngle) * speed;
                button.velocity.y = Math.sin(newAngle) * speed;
            }
            
            // 额外按钮有更活跃的运动
            if (button.isExtraButton && Math.random() < 0.1) {
                const randomImpulse = (Math.random() - 0.5) * 0.5;
                button.velocity.x += randomImpulse;
                button.velocity.y += randomImpulse;
            }
        });
    }, 16);
}

// 启动颜色变化动画 - 修改后的版本
function startColorChanges() {
    if (tenTasksState.colorChangeInterval) clearInterval(tenTasksState.colorChangeInterval);
    
    tenTasksState.colorChangeInterval = setInterval(() => {
        if (!tenTasksState.isActive) return;
        
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        if (!tenTasksScreen || tenTasksScreen.style.display !== 'flex') return;
        
        // 检查所有按钮的颜色变化计时器
        tenTasksState.buttons.forEach((button) => {
            if (!button || !button.element) return;
            
            // 正确按钮永远不变颜色 - 保持蓝色 #2196F3
            if (button.isCorrect) {
                button.element.style.background = '#2196F3'; // 确保正确按钮始终保持原来的蓝色
                return;
            }
            
            button.colorChangeTimer++;
            
            // 每2秒改变一次颜色（120帧 * 16ms ≈ 1.92秒）
            if (button.colorChangeTimer >= 120) {
                button.colorChangeTimer = 0;
                
                // 如果是当前蓝色错误按钮，需要转移蓝色身份
                if (button.isBlueError) {
                    button.isBlueError = false;
                    
                    // 从所有非蓝色、非正确的错误按钮中随机选一个
                    const availableButtons = tenTasksState.buttons.filter(b => 
                        !b.isCorrect && 
                        !b.isBlueError && 
                        b !== button
                    );
                    
                    if (availableButtons.length > 0) {
                        // 随机选择一个新按钮成为蓝色错误按钮
                        const newBlueButton = availableButtons[Math.floor(Math.random() * availableButtons.length)];
                        
                        // 设置新按钮为蓝色错误按钮
                        newBlueButton.isBlueError = true;
                        newBlueButton.element.style.background = '#2196F3'; // 原来的蓝色
                        
                        console.log('蓝色错误按钮转移:', '从按钮', tenTasksState.buttons.indexOf(button), '转移到按钮', tenTasksState.buttons.indexOf(newBlueButton));
                    }
                    
                    // 当前按钮变为随机干扰颜色
                    let newColorIndex;
                    do {
                        newColorIndex = Math.floor(Math.random() * distractionColors.length);
                    } while (newColorIndex === button.currentColorIndex && distractionColors.length > 1);
                    
                    button.currentColorIndex = newColorIndex;
                    const color = distractionColors[newColorIndex];
                    button.element.style.background = color.color;
                    
                } else {
                    // 普通错误按钮的颜色变化
                    let newColorIndex;
                    do {
                        newColorIndex = Math.floor(Math.random() * distractionColors.length);
                    } while (newColorIndex === button.currentColorIndex && distractionColors.length > 1);
                    
                    button.currentColorIndex = newColorIndex;
                    const color = distractionColors[newColorIndex];
                    
                    // 额外按钮使用渐变色，普通按钮使用纯色
                    if (button.isExtraButton) {
                        const colorIndex2 = Math.floor(Math.random() * distractionColors.length);
                        const color2 = distractionColors[colorIndex2];
                        button.element.style.background = `linear-gradient(135deg, ${color.color} 0%, ${color2.color} 100%)`;
                    } else {
                        button.element.style.background = color.color;
                    }
                }
                
                // 添加颜色变化动画效果
                if (button.element) {
                    button.element.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        if (button.element && button.element.style) {
                            button.element.style.transform = 'scale(1)';
                        }
                    }, 200);
                }
            }
        });
    }, 16); // 约60fps
}

// 处理任务按钮点击
function handleTaskButtonClick(buttonIndex) {
    if (!tenTasksState.isActive) return;
    
    const button = tenTasksState.buttons[buttonIndex];
    
    if (!button) return;
    
    if (button.isCorrect) {
        // 点击了正确按钮
        triggerTenTasksSuccess();
    } else {
        // 点击了错误按钮
        if (button.isBlueError) {
            // 点击了蓝色的错误按钮
            triggerBlueErrorButtonClick(button);
        } else {
            // 点击了普通错误按钮
            triggerWrongButtonClick(button);
        }
    }
}

// 触发错误按钮点击效果
function triggerWrongButtonClick(button) {
    if (!button || !button.element) return;
    
    // 视觉反馈
    button.element.style.transform = 'scale(0.8)';
    button.element.style.boxShadow = '0 0 20px rgba(244, 67, 54, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)';
    
    // 音效
    if (window.isAudioEnabled && window.audioContext) {
        try {
            const wrongSound = window.audioContext.createOscillator();
            const wrongGain = window.audioContext.createGain();
            
            wrongSound.type = 'sawtooth';
            wrongSound.frequency.setValueAtTime(200, window.audioContext.currentTime);
            wrongSound.frequency.exponentialRampToValueAtTime(100, window.audioContext.currentTime + 0.3);
            
            wrongGain.gain.setValueAtTime(0.1, window.audioContext.currentTime);
            wrongGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.3);
            
            wrongSound.connect(wrongGain);
            wrongGain.connect(window.audioContext.destination);
            
            wrongSound.start();
            wrongSound.stop(window.audioContext.currentTime + 0.3);
        } catch (e) {
            console.error('音频播放错误:', e);
        }
    }
    
    // 0.3秒后恢复
    setTimeout(() => {
        if (button.element && button.element.style) {
            button.element.style.transform = 'scale(1)';
            button.element.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(255, 255, 255, 0.2)';
        }
    }, 300);
}

// 触发蓝色错误按钮点击效果
function triggerBlueErrorButtonClick(button) {
    if (!button || !button.element) return;
    
    // 视觉反馈 - 特殊效果表示点击了蓝色错误按钮
    button.element.style.transform = 'scale(0.8)';
    button.element.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.9), inset 0 0 10px rgba(255, 255, 255, 0.3)';
    button.element.style.background = '#FF0000'; // 临时变为红色
    
    // 音效 - 特殊的错误音
    if (window.isAudioEnabled && window.audioContext) {
        try {
            const blueErrorSound = window.audioContext.createOscillator();
            const blueErrorGain = window.audioContext.createGain();
            
            blueErrorSound.type = 'square';
            blueErrorSound.frequency.setValueAtTime(150, window.audioContext.currentTime);
            blueErrorSound.frequency.exponentialRampToValueAtTime(50, window.audioContext.currentTime + 0.4);
            
            blueErrorGain.gain.setValueAtTime(0.15, window.audioContext.currentTime);
            blueErrorGain.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.4);
            
            blueErrorSound.connect(blueErrorGain);
            blueErrorGain.connect(window.audioContext.destination);
            
            blueErrorSound.start();
            blueErrorSound.stop(window.audioContext.currentTime + 0.4);
        } catch (e) {
            console.error('音频播放错误:', e);
        }
    }
    
    // 显示特殊错误提示
    const errorHint = document.createElement('div');
    errorHint.textContent = "这是蓝色干扰项！真正的正确按钮只有一个";
    errorHint.style.position = 'absolute';
    errorHint.style.top = '200px';
    errorHint.style.left = '50%';
    errorHint.style.transform = 'translateX(-50%)';
    errorHint.style.color = '#F44336';
    errorHint.style.fontSize = '14px';
    errorHint.style.fontWeight = 'bold';
    errorHint.style.background = 'rgba(255, 255, 255, 0.95)';
    errorHint.style.padding = '8px 15px';
    errorHint.style.borderRadius = '8px';
    errorHint.style.zIndex = '1001';
    errorHint.style.boxShadow = '0 3px 15px rgba(244, 67, 54, 0.6)';
    document.body.appendChild(errorHint);
    
    // 0.5秒后恢复
    setTimeout(() => {
        if (button.element && button.element.style) {
            button.element.style.transform = 'scale(1)';
            button.element.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(255, 255, 255, 0.2)';
            button.element.style.background = '#2196F3'; // 恢复原来的蓝色
        }
        document.body.removeChild(errorHint);
    }, 500);
}

// 十任务阶段成功
function triggerTenTasksSuccess() {
    tenTasksState.isActive = false;
    
    cleanupTenTasksStage();
    
    const correctChoiceHint = document.getElementById('correctChoiceHint');
    if (correctChoiceHint) {
        correctChoiceHint.style.display = 'block';
        correctChoiceHint.textContent = `成功！找到并点击了正确按钮。用时：${tenTasksState.attemptTimer.toFixed(1)}秒`;
    }
    
    if (window.isAudioEnabled && window.audioContext) {
        try {
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
        } catch (e) {
            console.error('音频播放错误:', e);
        }
    }
    
    setTimeout(() => {
        if (correctChoiceHint) correctChoiceHint.style.display = 'none';
        
        // 获取第一阶段的统计数据
        const attemptTimer = window.gameState?.attemptTimer || 0;
        const timeNearButton = window.gameState?.timeNearButton || 0;
        const failCount = window.gameState?.failCount || 0;
        const energy = window.gameState?.energy || 100;
        
        // 显示成功界面
        if (window.showSuccessScreen) {
            window.showSuccessScreen(attemptTimer, timeNearButton, failCount, energy);
        }
    }, 1500);
}

// 暴露函数到全局
window.initTenTasksLayout = initTenTasksLayout;
window.tenTasksState = tenTasksState;
window.cleanupTenTasksStage = cleanupTenTasksStage;

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    console.log('Stage2.js 初始化');
    
    // 十任务返回按钮事件
    const tenTasksBackBtn = document.getElementById('tenTasksBackBtn');
    if (tenTasksBackBtn) {
        tenTasksBackBtn.addEventListener('click', () => {
            cleanupTenTasksStage();
            
            const tenTasksScreen = document.getElementById('tenTasksScreen');
            if (tenTasksScreen) tenTasksScreen.style.display = 'none';
            
            location.reload();
        });
    }
    
    // ESC键处理 - 十任务阶段
    document.addEventListener('keydown', (e) => {
        const tenTasksScreen = document.getElementById('tenTasksScreen');
        if (tenTasksScreen && tenTasksScreen.style.display === 'flex') {
            if (e.key === 'Escape') {
                cleanupTenTasksStage();
                tenTasksScreen.style.display = 'none';
                location.reload();
            }
        }
    });
    
    console.log('Stage2.js 初始化完成');
});