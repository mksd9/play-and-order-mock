export class AssetManager {
  private static instance: AssetManager;
  private canvasCache = new Map<string, HTMLCanvasElement>();
  private audioCache = new Map<string, HTMLAudioElement>();

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  createPlayerSprite(): HTMLCanvasElement {
    if (this.canvasCache.has('player')) {
      return this.canvasCache.get('player')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Simple triangle spaceship
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(16, 4);
    ctx.lineTo(8, 28);
    ctx.lineTo(16, 20);
    ctx.lineTo(24, 28);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(14, 24, 4, 4);

    this.canvasCache.set('player', canvas);
    return canvas;
  }

  createTargetSprite(): HTMLCanvasElement {
    if (this.canvasCache.has('target')) {
      return this.canvasCache.get('target')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    // Enemy ship - rounded rectangle with details
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(8, 16, 32, 16);
    
    // Wings
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(4, 20, 8, 8);
    ctx.fillRect(36, 20, 8, 8);
    
    // Cockpit
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(20, 18, 8, 4);

    this.canvasCache.set('target', canvas);
    return canvas;
  }

  createExplosionSprite(): HTMLCanvasElement {
    if (this.canvasCache.has('explosion')) {
      return this.canvasCache.get('explosion')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256; // 8 frames * 32px
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Create 8 explosion frames
    for (let i = 0; i < 8; i++) {
      const x = i * 32;
      const size = 4 + i * 2;
      const alpha = 1 - (i / 8);
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = i < 4 ? '#ffff00' : '#ff8800';
      
      // Draw explosion particles
      for (let j = 0; j < 6; j++) {
        const px = x + 16 + Math.cos(j) * size;
        const py = 16 + Math.sin(j) * size;
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
      
      ctx.globalAlpha = 1;
    }

    this.canvasCache.set('explosion', canvas);
    return canvas;
  }

  createBulletSprite(): HTMLCanvasElement {
    if (this.canvasCache.has('bullet')) {
      return this.canvasCache.get('bullet')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#00ffff';
    ctx.fillRect(0, 0, 4, 8);

    this.canvasCache.set('bullet', canvas);
    return canvas;
  }

  createShotSound(): HTMLAudioElement {
    if (this.audioCache.has('shot')) {
      return this.audioCache.get('shot')!;
    }

    const audio = new Audio();
    
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // For now, return a dummy audio element
    // In a real implementation, you'd convert the Web Audio to a data URL
    this.audioCache.set('shot', audio);
    return audio;
  }

  createExplosionSound(): HTMLAudioElement {
    if (this.audioCache.has('explosion')) {
      return this.audioCache.get('explosion')!;
    }

    const audio = new Audio();
    // Placeholder - in real implementation, create noise-based explosion sound
    this.audioCache.set('explosion', audio);
    return audio;
  }

  createShortMovie(): HTMLVideoElement {
    const video = document.createElement('video');
    video.width = 320;
    video.height = 240;
    video.muted = true;
    video.loop = false;
    
    // Create a simple procedural video using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;
    
    // Simple animation frame
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 320, 240);
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', 160, 120);
    ctx.fillText('Thanks for playing!', 160, 160);
    
    // Convert canvas to blob URL (placeholder)
    canvas.toBlob((blob) => {
      if (blob) {
        video.src = URL.createObjectURL(blob);
      }
    });
    
    return video;
  }
}