import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';
import { AssetManager } from '../assets/AssetManager';

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
  baseX: number; // Base position for animation
  animationOffset: number; // Phase offset for animation
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
}

interface UFO {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
}

interface NiceMessage {
  x: number;
  y: number;
  startTime: number;
  active: boolean;
}

export class GameScene implements Scene {
  private engine: GameEngine;
  private assetManager: AssetManager;
  private player: Entity;
  private targets: Entity[];
  private bullets: Bullet[];
  private ufo: UFO | null = null;
  private niceMessage: NiceMessage | null = null;
  private gameStartTime = 0;
  private lastUFOSpawnTime = 0;
  private ufoDefeated = false;
  private lastShotTime = 0;
  private shotCooldown = 200; // ms
  private shootPressed = false;
  private completionTime = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.assetManager = AssetManager.getInstance();
    
    this.player = {
      x: 0, y: 0, width: 32, height: 32,
      vx: 0, vy: 0, hp: 1, active: true,
      baseX: 0, animationOffset: 0
    };
    
    this.targets = [];
    this.bullets = [];
  }

  init(): void {
    // Clear asset cache to ensure new designs are loaded
    this.assetManager.clearCache();
    
    const canvas = this.engine.getCanvas();
    
    // Initialize game timer
    this.gameStartTime = Date.now();
    
    // Initialize player
    this.player.x = canvas.width / 2 - 16;
    this.player.y = canvas.height - 60;
    this.player.hp = 1;
    this.player.active = true;
    this.player.baseX = canvas.width / 2 - 16;
    this.player.animationOffset = 0;
    this.player.sprite = this.assetManager.createPlayerSprite();
    
    // Initialize targets (4x larger size)
    this.targets = [
      {
        x: canvas.width / 4 - 96,
        y: canvas.height / 2 - 96,
        width: 192,
        height: 192,
        vx: 0,
        vy: 0,
        hp: 10,
        active: true,
        sprite: this.assetManager.createTargetSprite(),
        baseX: canvas.width / 4 - 96,
        animationOffset: 0 // Left target starts at 0
      },
      {
        x: (canvas.width * 3) / 4 - 96,
        y: canvas.height / 2 - 96,
        width: 192,
        height: 192,
        vx: 0,
        vy: 0,
        hp: 10,
        active: true,
        sprite: this.assetManager.createTargetSprite(),
        baseX: (canvas.width * 3) / 4 - 96,
        animationOffset: Math.PI / 3 // Right target offset by π/3 (60 degrees)
      }
    ];
    
    this.bullets = [];
    this.ufo = null;
    this.niceMessage = null;
    this.lastUFOSpawnTime = 0;
    this.ufoDefeated = false;
    this.lastShotTime = 0;
    this.shootPressed = false;
    this.completionTime = 0;
  }

  update(_deltaTime: number): void {
    const input = this.engine.getInputState();
    const canvas = this.engine.getCanvas();
    
    // Update target animations (swaying motion)
    const currentTime = Date.now() / 1000; // Convert to seconds
    this.targets.forEach(target => {
      if (target.active) {
        // Gentle horizontal swaying motion
        const swayAmount = 15; // Maximum pixel offset
        const swaySpeed = 1.5; // Speed of the sway
        target.x = target.baseX + Math.sin(currentTime * swaySpeed + target.animationOffset) * swayAmount;
      }
    });
    
    // Update UFO (spawn after 5 seconds)
    this.updateUFO(canvas);
    
    // Update NICE message
    this.updateNiceMessage();
    
    // Update player movement
    this.player.vx = 0;
    if (input.left) this.player.vx = -5;
    if (input.right) this.player.vx = 5;
    
    this.player.x += this.player.vx;
    this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, this.player.x));
    
    // Handle shooting with proper button press detection
    if (input.shoot && !this.shootPressed && Date.now() - this.lastShotTime > this.shotCooldown) {
      this.createBullet();
      this.lastShotTime = Date.now();
      this.shootPressed = true;
    } else if (!input.shoot) {
      this.shootPressed = false;
    }
    
    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bullet.vy;
      bullet.x += bullet.vx;
      
      // Remove bullets that go off screen
      if (bullet.y < 0 || bullet.y > canvas.height || 
          bullet.x < 0 || bullet.x > canvas.width) {
        return false;
      }
      
      return bullet.active;
    });
    
    // Check collisions
    this.checkCollisions();
    
    // Check UFO collisions
    this.checkUFOCollisions();
    
    // Check win condition
    const activeTargets = this.targets.filter(t => t.active && t.hp > 0);
    if (activeTargets.length === 0) {
      // All targets destroyed - shouldn't happen in this game
      if (this.completionTime === 0) {
        this.completionTime = Date.now();
      } else if (Date.now() - this.completionTime >= 1000) {
        this.engine.setState('result');
      }
    } else if (activeTargets.length === 1) {
      // One target destroyed
      const destroyedTarget = this.targets.find(t => !t.active || t.hp <= 0);
      if (destroyedTarget) {
        if (this.completionTime === 0) {
          this.completionTime = Date.now();
        } else if (Date.now() - this.completionTime >= 1000) {
          const result = destroyedTarget === this.targets[0] ? 'left' : 'right';
          this.engine.setGameResult(result);
          this.engine.setState('result');
        }
      }
    }
  }

  private createBullet(): void {
    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y,
      vx: 0,
      vy: -8,
      active: true,
      sprite: this.assetManager.createBulletSprite()
    });
  }

  private checkCollisions(): void {
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      this.targets.forEach(target => {
        if (!target.active || target.hp <= 0) return;
        
        if (this.isColliding(bullet, target)) {
          bullet.active = false;
          target.hp--;
          
          if (target.hp <= 0) {
            target.active = false;
          }
        }
      });
    });
  }

  private isColliding(bullet: Bullet, target: Entity): boolean {
    // Circular collision detection for ramen bowl targets
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;
    const targetRadius = 80; // Same as bowl radius in AssetManager
    
    const bulletCenterX = bullet.x + 2;
    const bulletCenterY = bullet.y + 4;
    
    const distance = Math.sqrt(
      (bulletCenterX - targetCenterX) ** 2 + 
      (bulletCenterY - targetCenterY) ** 2
    );
    
    return distance <= targetRadius;
  }
  
  private updateUFO(canvas: HTMLCanvasElement): void {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.gameStartTime;
    
    // Don't spawn UFO if it has been defeated
    if (this.ufoDefeated) {
      return;
    }
    
    // Spawn UFO logic
    if (!this.ufo) {
      let shouldSpawn = false;
      
      // First UFO after 3 seconds
      if (elapsedTime >= 3000 && this.lastUFOSpawnTime === 0) {
        shouldSpawn = true;
      }
      // Subsequent UFOs every 10 seconds after the last one was spawned
      else if (this.lastUFOSpawnTime > 0 && currentTime - this.lastUFOSpawnTime >= 10000) {
        shouldSpawn = true;
      }
      
      if (shouldSpawn) {
        this.ufo = {
          x: canvas.width,
          y: 50, // Fixed position in upper part of screen
          width: 80,
          height: 40,
          vx: -4, // Move left slightly faster
          active: true,
          sprite: this.createUFOSprite()
        };
        this.lastUFOSpawnTime = currentTime;
        console.log('UFO spawned at:', this.ufo.x, this.ufo.y, 'Time since last spawn:', this.lastUFOSpawnTime > 0 ? (currentTime - this.lastUFOSpawnTime) / 1000 + 's' : 'First spawn');
      }
    }
    
    // Update UFO movement
    if (this.ufo && this.ufo.active) {
      this.ufo.x += this.ufo.vx;
      
      // Remove UFO when it goes off screen
      if (this.ufo.x + this.ufo.width < 0) {
        console.log('UFO removed - went off screen');
        this.ufo = null;
      }
    }
  }
  
  private updateNiceMessage(): void {
    if (this.niceMessage && this.niceMessage.active) {
      const elapsedTime = Date.now() - this.niceMessage.startTime;
      
      // Hide message after 2 seconds
      if (elapsedTime >= 2000) {
        this.niceMessage = null;
      }
    }
  }
  
  private checkUFOCollisions(): void {
    if (!this.ufo || !this.ufo.active) return;
    
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      // Simple rectangular collision detection for UFO
      if (bullet.x < this.ufo!.x + this.ufo!.width &&
          bullet.x + 4 > this.ufo!.x &&
          bullet.y < this.ufo!.y + this.ufo!.height &&
          bullet.y + 8 > this.ufo!.y) {
        
        // UFO hit!
        bullet.active = false;
        this.ufo!.active = false;
        this.ufoDefeated = true; // Mark UFO as defeated
        
        // Show NICE message
        this.niceMessage = {
          x: this.ufo!.x,
          y: this.ufo!.y,
          startTime: Date.now(),
          active: true
        };
        
        console.log('UFO defeated! No more UFOs will spawn.');
        
        // Remove UFO after a short delay
        setTimeout(() => {
          this.ufo = null;
        }, 100);
      }
    });
  }
  
  private createUFOSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    
    // Draw UFO body (ellipse)
    ctx.fillStyle = '#C0C0C0';
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(40, 25, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw UFO dome
    ctx.fillStyle = '#ADD8E6';
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(40, 20, 25, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw lights
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 6; i++) {
      const x = 15 + i * 10;
      ctx.beginPath();
      ctx.arc(x, 25, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render player
    if (this.player.active && this.player.sprite) {
      ctx.drawImage(this.player.sprite, this.player.x, this.player.y);
    }
    
    // Render targets
    this.targets.forEach((target, index) => {
      if (target.active && target.sprite) {
        ctx.drawImage(target.sprite, target.x, target.y, target.width, target.height);
        
        // Add text labels
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        const textX = target.x + target.width / 2;
        const textY = target.y + target.height / 2;
        
        const text = index === 0 ? 'RAMEN' : 'SPICY RAMEN';
        ctx.strokeText(text, textX, textY);
        ctx.fillText(text, textX, textY);
        ctx.restore();
        
        // HP bar
        const barWidth = 80; // Increased for larger targets
        const barHeight = 8;
        const barX = target.x + (target.width - barWidth) / 2;
        const barY = target.y - 15;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = target.hp > 3 ? '#0f0' : '#f00';
        ctx.fillRect(barX, barY, (target.hp / 10) * barWidth, barHeight);
      }
    });
    
    // Render bullets
    this.bullets.forEach(bullet => {
      if (bullet.active && bullet.sprite) {
        ctx.drawImage(bullet.sprite, bullet.x, bullet.y);
      }
    });
    
    // Render UFO
    if (this.ufo && this.ufo.active && this.ufo.sprite) {
      ctx.drawImage(this.ufo.sprite, this.ufo.x, this.ufo.y);
    }
    
    // Render NICE message
    if (this.niceMessage && this.niceMessage.active) {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 3;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      
      const text = 'NICE!';
      ctx.strokeText(text, this.niceMessage.x + 30, this.niceMessage.y + 20);
      ctx.fillText(text, this.niceMessage.x + 30, this.niceMessage.y + 20);
      ctx.restore();
    }
  }

  cleanup(): void {
    this.bullets = [];
    this.ufo = null;
    this.niceMessage = null;
    this.lastUFOSpawnTime = 0;
    this.ufoDefeated = false;
  }
}