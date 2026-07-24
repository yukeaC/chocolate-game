// ============================================================
// sound.js · 音效系统（36 种纯合成音效）
// ============================================================

console.log('🔊 音效系统加载中...');

// ============================================================
// 音效引擎
// ============================================================

var SoundEngine = {
    _ctx: null,
    _masterVolume: 0.7,
    _isMuted: false,
    _enabled: true,

    init: function() {
        // 首次点击页面时激活 AudioContext
        document.addEventListener('click', function() {
            if (!SoundEngine._ctx) {
                SoundEngine._ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (SoundEngine._ctx.state === 'suspended') {
                    SoundEngine._ctx.resume();
                }
                console.log('🔊 AudioContext 已激活');
            }
        }, { once: true });

        // 从 localStorage 读取音量设置
        try {
            var saved = localStorage.getItem('sound_settings');
            if (saved) {
                var settings = JSON.parse(saved);
                SoundEngine._masterVolume = settings.volume || 0.7;
                SoundEngine._isMuted = settings.muted || false;
            }
        } catch(e) {}
    },

    getCtx: function() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
        return this._ctx;
    },

        play: function(soundFn) {
        if (!this._enabled || this._isMuted) return;

        var ctx = this.getCtx();
        // 如果上下文未运行，尝试恢复
        if (ctx.state === 'suspended') {
            try {
                ctx.resume();
            } catch(e) {
                if (!this._warned) {
                    console.warn('⚠️ AudioContext 未激活，需要用户手势。音效将在点击后生效。');
                    this._warned = true;
                }
                return;
            }
        }

        if (ctx.state !== 'running') {
            if (!this._warned) {
                console.warn('⚠️ AudioContext 未运行，跳过音效。');
                this._warned = true;
            }
            return;
        }

        try {
            var gain = ctx.createGain();
            gain.gain.value = this._masterVolume * 0.5;
            gain.connect(ctx.destination);
            soundFn(ctx, gain);
        } catch(e) {
            // 静默处理
        }
    },

    setVolume: function(value) {
        this._masterVolume = Math.max(0, Math.min(1, value));
        try {
            localStorage.setItem('sound_settings', JSON.stringify({
                volume: this._masterVolume,
                muted: this._isMuted
            }));
        } catch(e) {}
    },

    toggleMute: function() {
        this._isMuted = !this._isMuted;
        try {
            localStorage.setItem('sound_settings', JSON.stringify({
                volume: this._masterVolume,
                muted: this._isMuted
            }));
        } catch(e) {}
        return this._isMuted;
    },

    getVolume: function() { return this._masterVolume; },
    isMuted: function() { return this._isMuted; },

    // 启用/禁用音效（用于设置面板）
    setEnabled: function(enabled) {
        this._enabled = enabled;
    }
};

// ============================================================
// 36 种音效定义
// ============================================================

var S = {};

// ---- UI 交互 (6) ----
S.click = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.12);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1100;
    g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.02); o2.stop(ctx.currentTime + 0.06);
};

S.clickHeavy = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 400;
    g.gain.setValueAtTime(0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 600;
    g2.gain.setValueAtTime(0.1, ctx.currentTime + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.12);
};

S.switch = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(250, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.35);
};

S.open = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(350, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1300;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.12); o2.stop(ctx.currentTime + 0.18);
};

S.close = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(700, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
};

S.slotClick = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 500;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 300;
    g2.gain.setValueAtTime(0.12, ctx.currentTime + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.02); o2.stop(ctx.currentTime + 0.15);
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.06, ctx.currentTime + 0.06);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    src.connect(g3); g3.connect(out); src.start(ctx.currentTime + 0.06);
};

// ---- 奖励/成就 (6) ----
S.levelUp = function(ctx, out) {
    [523, 659, 784, 1047, 1318].forEach(function(f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t = ctx.currentTime + i * 0.1;
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2);
    });
};

S.achievement = function(ctx, out) {
    [660, 880, 1100, 1320, 1760].forEach(function(f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t = ctx.currentTime + i * 0.1;
        var d = (i === 4) ? 0.35 : 0.15;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + d);
    });
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 2200;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.45);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.45); o2.stop(ctx.currentTime + 0.6);
};

S.itemGet = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(500, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1600;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.08); o2.stop(ctx.currentTime + 0.15);
};

S.coin = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 2400;
    g2.gain.setValueAtTime(0.06, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime); o2.stop(ctx.currentTime + 0.25);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 3600;
    g3.gain.setValueAtTime(0.03, ctx.currentTime + 0.02);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.02); o3.stop(ctx.currentTime + 0.15);
};

S.victory = function(ctx, out) {
    [523, 659, 784, 1047, 1318, 1568, 1760].forEach(function(f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t = ctx.currentTime + i * 0.08;
        var d = (i === 6) ? 0.5 : 0.18;
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + d);
    });
};

S.orderComplete = function(ctx, out) {
    [660, 880, 1100, 1320].forEach(function(f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t = ctx.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2);
    });
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1540;
    g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.4);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.4); o2.stop(ctx.currentTime + 0.6);
};

// ---- 游戏操作 (15) ----
S.workshopDone = function(ctx, out) {
    [880, 1108].forEach(function(f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        var t = ctx.currentTime + i * 0.15;
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.25);
    });
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'square'; o2.frequency.value = 150;
    g2.gain.setValueAtTime(0.03, ctx.currentTime + 0.2);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.2); o2.stop(ctx.currentTime + 0.4);
};

S.workshopStart = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(150, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(400, ctx.currentTime + 0.15);
    o2.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.35);
    g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.15); o2.stop(ctx.currentTime + 0.4);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 800;
    g3.gain.setValueAtTime(0.04, ctx.currentTime + 0.35);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.35); o3.stop(ctx.currentTime + 0.45);
};

S.collect = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1200;
    g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.1); o2.stop(ctx.currentTime + 0.25);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 600;
    g3.gain.setValueAtTime(0.06, ctx.currentTime + 0.2);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.2); o3.stop(ctx.currentTime + 0.28);
};

S.unlock = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(350, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.15);
    o.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.38);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1400;
    g2.gain.setValueAtTime(0.05, ctx.currentTime + 0.2);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.2); o2.stop(ctx.currentTime + 0.3);
};

S.plant = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(250, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 800;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.08);
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.06, ctx.currentTime + 0.08);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    src.connect(g3); g3.connect(out); src.start(ctx.currentTime + 0.08);
};

S.fishCatch = function(ctx, out) {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
        var t = i / ctx.sampleRate;
        d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.35;
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.45, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    src.connect(g); g.connect(out); src.start(ctx.currentTime);
    var o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
    o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
    g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g2); g2.connect(out); o.start(ctx.currentTime + 0.05); o.stop(ctx.currentTime + 0.3);
};

S.fishCast = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(250, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(700, ctx.currentTime + 0.08);
    o2.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.2);
    g2.gain.setValueAtTime(0.03, ctx.currentTime + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.08); o2.stop(ctx.currentTime + 0.25);
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.05, ctx.currentTime + 0.05);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    src.connect(g3); g3.connect(out); src.start(ctx.currentTime + 0.05);
};

S.mine = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 120;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.15, ctx.currentTime + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    src.connect(g2); g2.connect(out); src.start(ctx.currentTime + 0.06);
    var o2 = ctx.createOscillator(), g3 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 300;
    g3.gain.setValueAtTime(0.04, ctx.currentTime + 0.12);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o2.connect(g3); g3.connect(out); o2.start(ctx.currentTime + 0.12); o2.stop(ctx.currentTime + 0.2);
};

S.cook = function(ctx, out) {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
        var t = i / ctx.sampleRate;
        d[i] = (Math.random() * 2 - 1) * Math.sin(t * 30 + Math.random() * 0.5) * Math.exp(-t * 4) * 0.15;
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    src.connect(g); g.connect(out); src.start(ctx.currentTime);
    var o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 200;
    g2.gain.setValueAtTime(0.03, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g2); g2.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
};

S.grind = function(ctx, out) {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
        var t = i / ctx.sampleRate;
        d[i] = (Math.random() * 2 - 1) * Math.sin(t * 60 + t * t * 20) * Math.exp(-t * 5) * 0.2;
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    src.connect(g); g.connect(out); src.start(ctx.currentTime);
    var o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'square'; o.frequency.value = 100;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.4);
};

S.energyComplete = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(500, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    o.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.3);
    o.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.45);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.55);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1800;
    g2.gain.setValueAtTime(0.03, ctx.currentTime + 0.3);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.3); o2.stop(ctx.currentTime + 0.4);
};

S.bet = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 600;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.12);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'square'; o2.frequency.value = 200;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.15);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 900;
    g3.gain.setValueAtTime(0.04, ctx.currentTime + 0.1);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.1); o3.stop(ctx.currentTime + 0.18);
};

S.acceptQuest = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(350, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.12);
    o.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1000;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.12); o2.stop(ctx.currentTime + 0.2);
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.04, ctx.currentTime + 0.2);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    src.connect(g3); g3.connect(out); src.start(ctx.currentTime + 0.2);
};

S.trade = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(500, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1400;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.06); o2.stop(ctx.currentTime + 0.18);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 700;
    g3.gain.setValueAtTime(0.03, ctx.currentTime + 0.15);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.15); o3.stop(ctx.currentTime + 0.22);
};

S.numberInput = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 1000;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.06);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1400;
    g2.gain.setValueAtTime(0.03, ctx.currentTime + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.02); o2.stop(ctx.currentTime + 0.05);
};

// ---- 探险/世界 (3) ----
S.sail = function(ctx, out) {
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.7, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
        var t = i / ctx.sampleRate;
        d[i] = (Math.random() * 2 - 1) * Math.sin(t * 15 + t * t * 2) * Math.exp(-t * 2) * 0.2;
    }
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    src.connect(g); g.connect(out); src.start(ctx.currentTime);
    var buf2 = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    var d2 = buf2.getChannelData(0);
    for (var i = 0; i < d2.length; i++) d2[i] = (Math.random() * 2 - 1) * 0.04;
    var src2 = ctx.createBufferSource(); src2.buffer = buf2;
    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    src2.connect(g2); g2.connect(out); src2.start(ctx.currentTime + 0.15);
    var o = ctx.createOscillator(), g3 = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 100;
    g3.gain.setValueAtTime(0.02, ctx.currentTime);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.connect(g3); g3.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.6);
};

S.discover = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.15);
    o.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.38);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
    o2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
    g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.12); o2.stop(ctx.currentTime + 0.3);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 1600;
    g3.gain.setValueAtTime(0.03, ctx.currentTime + 0.25);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.25); o3.stop(ctx.currentTime + 0.35);
};

S.arrive = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(500, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.25);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1100;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.08); o2.stop(ctx.currentTime + 0.18);
    var o3 = ctx.createOscillator(), g3 = ctx.createGain();
    o3.type = 'sine'; o3.frequency.value = 600;
    g3.gain.setValueAtTime(0.03, ctx.currentTime + 0.15);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o3.connect(g3); g3.connect(out); o3.start(ctx.currentTime + 0.15); o3.stop(ctx.currentTime + 0.25);
};

// ---- 状态反馈 (5) ----
S.error = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(250, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 180;
    g2.gain.setValueAtTime(0.05, ctx.currentTime + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.35);
};

S.warning = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 440;
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.2, ctx.currentTime + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.37);
    g.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.62);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.62);
};

S.success = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(450, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.16);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 1400;
    g2.gain.setValueAtTime(0.05, ctx.currentTime + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.06); o2.stop(ctx.currentTime + 0.12);
};

S.cancel = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(650, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
};

S.cardFlip = function(ctx, out) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(650, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.connect(g); g.connect(out); o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.12);
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = 900;
    g2.gain.setValueAtTime(0.04, ctx.currentTime + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o2.connect(g2); g2.connect(out); o2.start(ctx.currentTime + 0.04); o2.stop(ctx.currentTime + 0.1);
    var buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    var src = ctx.createBufferSource(); src.buffer = buf;
    var g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.04, ctx.currentTime + 0.06);
    g3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    src.connect(g3); g3.connect(out); src.start(ctx.currentTime + 0.06);
};

// ============================================================
// 便捷播放函数（对外接口）
// ============================================================

function playSound(soundName) {
    var fn = S[soundName];
    if (fn) {
        SoundEngine.play(fn);
    } else {
        console.warn('⚠️ 音效不存在: ' + soundName);
    }
}

// 常用音效的快捷别名
function soundClick() { playSound('click'); }
function soundClickHeavy() { playSound('clickHeavy'); }
function soundSwitch() { playSound('switch'); }
function soundOpen() { playSound('open'); }
function soundClose() { playSound('close'); }
function soundSlotClick() { playSound('slotClick'); }
function soundLevelUp() { playSound('levelUp'); }
function soundAchievement() { playSound('achievement'); }
function soundItemGet() { playSound('itemGet'); }
function soundCoin() { playSound('coin'); }
function soundVictory() { playSound('victory'); }
function soundOrderComplete() { playSound('orderComplete'); }
function soundWorkshopDone() { playSound('workshopDone'); }
function soundWorkshopStart() { playSound('workshopStart'); }
function soundCollect() { playSound('collect'); }
function soundUnlock() { playSound('unlock'); }
function soundPlant() { playSound('plant'); }
function soundFishCatch() { playSound('fishCatch'); }
function soundFishCast() { playSound('fishCast'); }
function soundMine() { playSound('mine'); }
function soundCook() { playSound('cook'); }
function soundGrind() { playSound('grind'); }
function soundEnergyComplete() { playSound('energyComplete'); }
function soundBet() { playSound('bet'); }
function soundAcceptQuest() { playSound('acceptQuest'); }
function soundTrade() { playSound('trade'); }
function soundNumberInput() { playSound('numberInput'); }
function soundSail() { playSound('sail'); }
function soundDiscover() { playSound('discover'); }
function soundArrive() { playSound('arrive'); }
function soundError() { playSound('error'); }
function soundWarning() { playSound('warning'); }
function soundSuccess() { playSound('success'); }
function soundCancel() { playSound('cancel'); }
function soundCardFlip() { playSound('cardFlip'); }

// ============================================================
// 初始化
// ============================================================

SoundEngine.init();

// 暴露全局接口
window.SoundEngine = SoundEngine;
window.playSound = playSound;
window.soundClick = soundClick;
window.soundClickHeavy = soundClickHeavy;
window.soundSwitch = soundSwitch;
window.soundOpen = soundOpen;
window.soundClose = soundClose;
window.soundSlotClick = soundSlotClick;
window.soundLevelUp = soundLevelUp;
window.soundAchievement = soundAchievement;
window.soundItemGet = soundItemGet;
window.soundCoin = soundCoin;
window.soundVictory = soundVictory;
window.soundOrderComplete = soundOrderComplete;
window.soundWorkshopDone = soundWorkshopDone;
window.soundWorkshopStart = soundWorkshopStart;
window.soundCollect = soundCollect;
window.soundUnlock = soundUnlock;
window.soundPlant = soundPlant;
window.soundFishCatch = soundFishCatch;
window.soundFishCast = soundFishCast;
window.soundMine = soundMine;
window.soundCook = soundCook;
window.soundGrind = soundGrind;
window.soundEnergyComplete = soundEnergyComplete;
window.soundBet = soundBet;
window.soundAcceptQuest = soundAcceptQuest;
window.soundTrade = soundTrade;
window.soundNumberInput = soundNumberInput;
window.soundSail = soundSail;
window.soundDiscover = soundDiscover;
window.soundArrive = soundArrive;
window.soundError = soundError;
window.soundWarning = soundWarning;
window.soundSuccess = soundSuccess;
window.soundCancel = soundCancel;
window.soundCardFlip = soundCardFlip;

console.log('🔊 音效系统加载完成，共 36 种音效');