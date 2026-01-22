// ========== Web Audio API 音频系统 ==========
let audioContext;
let oscillator;
let gainNode;
let noiseGainNode;
let noiseNode;
let filterNode;
let isAudioEnabled = false;
let isPlaying = false;

// 初始化音频上下文
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 60;
    
    noiseNode = audioContext.createBufferSource();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    
    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.frequency.value = 8000;
    filterNode.Q.value = 1;
    
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    
    noiseGainNode = audioContext.createGain();
    noiseGainNode.gain.value = 0;
    
    oscillator.connect(gainNode);
    noiseNode.connect(filterNode);
    filterNode.connect(noiseGainNode);
    gainNode.connect(audioContext.destination);
    noiseGainNode.connect(audioContext.destination);
    
    oscillator.start();
    noiseNode.start();
    
    isAudioEnabled = true;
    const audioControl = document.getElementById('audioControl');
    if (audioControl) audioControl.textContent = "🔊 关闭声音";
    
    // 暴露到全局
    window.audioContext = audioContext;
    window.isAudioEnabled = isAudioEnabled;
}

// 播放电流声
function playCurrentSound(intensity = 0.3) {
    if (!isAudioEnabled || !audioContext || audioContext.state === 'suspended') {
        return;
    }
    
    const baseFreq = 60 + (intensity * 40);
    const volume = Math.min(0.5, intensity * 0.8);
    const noiseVolume = Math.min(0.2, intensity * 0.3);
    
    oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq, 
        audioContext.currentTime + 0.1
    );
    
    gainNode.gain.exponentialRampToValueAtTime(
        volume, 
        audioContext.currentTime + 0.1
    );
    
    noiseGainNode.gain.exponentialRampToValueAtTime(
        noiseVolume, 
        audioContext.currentTime + 0.1
    );
    
    filterNode.frequency.setValueAtTime(
        7000 + Math.random() * 2000, 
        audioContext.currentTime
    );
    
    isPlaying = true;
}

// 停止电流声
function stopCurrentSound() {
    if (!isAudioEnabled || !audioContext) return;
    
    gainNode.gain.exponentialRampToValueAtTime(
        0.001, 
        audioContext.currentTime + 0.5
    );
    
    noiseGainNode.gain.exponentialRampToValueAtTime(
        0.001, 
        audioContext.currentTime + 0.5
    );
    
    isPlaying = false;
}

// 切换音频状态
function toggleAudio() {
    if (!isAudioEnabled) {
        initAudio();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } else {
        if (audioContext) {
            audioContext.suspend();
            isAudioEnabled = false;
            const audioControl = document.getElementById('audioControl');
            if (audioControl) audioControl.textContent = "🔇 开启声音";
            
            // 更新全局变量
            window.isAudioEnabled = isAudioEnabled;
        }
    }
}

// 播放庆祝音乐
function playCelebrationMusic() {
    if (!isAudioEnabled || !audioContext) return;
    
    const frequencies = [261.63, 329.63, 392.00, 523.25];
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1 + (index * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2 + (index * 0.1));
        
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 2.5);
    });
}

// 音频控制按钮事件
document.addEventListener('DOMContentLoaded', () => {
    const audioControl = document.getElementById('audioControl');
    if (audioControl) {
        audioControl.addEventListener('click', () => {
            toggleAudio();
        });
    }
    
    document.addEventListener('click', () => {
        if (!audioContext && isAudioEnabled) {
            initAudio();
        }
    });
    
    // 暴露函数到全局
    window.playCurrentSound = playCurrentSound;
    window.stopCurrentSound = stopCurrentSound;
    window.playCelebrationMusic = playCelebrationMusic;
});