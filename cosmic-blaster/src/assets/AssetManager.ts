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

  clearCache(): void {
    this.canvasCache.clear();
    this.audioCache.clear();
  }

  createPlayerSprite(): HTMLCanvasElement {
    if (this.canvasCache.has('player')) {
      return this.canvasCache.get('player')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas to ensure transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simple triangle spaceship with transparent background
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
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    // Ramen bowl shape - side view
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bowlWidth = 140;
    const bowlHeight = 100;
    
    // Bowl base (bottom half circle)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(centerX, centerY + 20, bowlWidth / 2, 0, Math.PI);
    ctx.fill();
    
    // Bowl walls (side rectangles)
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(centerX - bowlWidth / 2, centerY - 30, 10, 50);
    ctx.fillRect(centerX + bowlWidth / 2 - 10, centerY - 30, 10, 50);
    
    // Bowl rim (top edge)
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(centerX - bowlWidth / 2 - 5, centerY - 35, bowlWidth + 10, 8);
    
    // Soup surface (rectangle)
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(centerX - bowlWidth / 2 + 10, centerY - 30, bowlWidth - 20, 6);
    
    // Soup highlight
    ctx.fillStyle = '#FFB347';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(centerX - 30, centerY - 28, 25, 3);
    ctx.globalAlpha = 1;
    
    // Noodles (wavy lines visible from side)
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = centerX - 50 + i * 20;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 25);
      ctx.quadraticCurveTo(x + 5, centerY - 15, x + 10, centerY - 5);
      ctx.quadraticCurveTo(x + 15, centerY + 5, x + 20, centerY + 15);
      ctx.stroke();
    }
    
    // Toppings visible from side
    // Green onion (vertical strips)
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(centerX - 40, centerY - 25, 3, 8);
    ctx.fillRect(centerX - 25, centerY - 23, 3, 6);
    ctx.fillRect(centerX + 20, centerY - 26, 3, 9);
    
    // Chashu pork (round slices)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 18, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 18, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(centerX + 30, centerY - 20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(centerX + 30, centerY - 20, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Soft-boiled egg half
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.arc(centerX + 5, centerY - 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(centerX + 5, centerY - 15, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Menma (bamboo shoots sticking up)
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(centerX - 5, centerY - 30, 2, 12);
    ctx.fillRect(centerX + 15, centerY - 28, 2, 10);
    
    // Steam effect
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const x = centerX - 30 + i * 20;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 35);
      ctx.quadraticCurveTo(x + 3, centerY - 45, x - 2, centerY - 55);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

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

  createSignSprite(): HTMLCanvasElement {
    if (this.canvasCache.has('sign')) {
      return this.canvasCache.get('sign')!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    // Sign post
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(86, 120, 20, 72);

    // Sign board
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(20, 60, 152, 80);

    // Sign board border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 60, 152, 80);

    // Shadow effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(24, 64, 152, 80);

    // Sign board (main area)
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(20, 60, 148, 76);

    this.canvasCache.set('sign', canvas);
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