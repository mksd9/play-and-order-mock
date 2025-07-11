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
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
}

export class GameScene implements Scene {
  private engine: GameEngine;
  private assetManager: AssetManager;
  private player: Entity;
  private targets: Entity[];
  private bullets: Bullet[];
  private lastShotTime = 0;
  private shotCooldown = 200; // ms

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.assetManager = AssetManager.getInstance();
    
    this.player = {
      x: 0, y: 0, width: 32, height: 32,
      vx: 0, vy: 0, hp: 1, active: true
    };
    
    this.targets = [];
    this.bullets = [];
  }

  init(): void {
    const canvas = this.engine.getCanvas();
    
    // Initialize player
    this.player.x = canvas.width / 2 - 16;
    this.player.y = canvas.height - 60;
    this.player.hp = 1;
    this.player.active = true;
    this.player.sprite = this.assetManager.createPlayerSprite();
    
    // Initialize targets
    this.targets = [
      {
        x: canvas.width / 4 - 24,
        y: 50,
        width: 48,
        height: 48,
        vx: 0,
        vy: 0,
        hp: 10,
        active: true,
        sprite: this.assetManager.createTargetSprite()
      },
      {
        x: (canvas.width * 3) / 4 - 24,
        y: 50,
        width: 48,
        height: 48,
        vx: 0,
        vy: 0,
        hp: 10,
        active: true,
        sprite: this.assetManager.createTargetSprite()
      }
    ];
    
    this.bullets = [];
    this.lastShotTime = 0;
  }

  update(_deltaTime: number): void {
    const input = this.engine.getInputState();
    const canvas = this.engine.getCanvas();
    
    // Update player movement
    this.player.vx = 0;
    if (input.left) this.player.vx = -5;
    if (input.right) this.player.vx = 5;
    
    this.player.x += this.player.vx;
    this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, this.player.x));
    
    // Handle shooting
    if (input.shoot && Date.now() - this.lastShotTime > this.shotCooldown) {
      this.createBullet();
      this.lastShotTime = Date.now();
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
    
    // Check win condition
    const activeTargets = this.targets.filter(t => t.active && t.hp > 0);
    if (activeTargets.length === 0) {
      // All targets destroyed - shouldn't happen in this game
      this.engine.setState('result');
    } else if (activeTargets.length === 1) {
      // One target destroyed
      const destroyedTarget = this.targets.find(t => !t.active || t.hp <= 0);
      if (destroyedTarget) {
        const result = destroyedTarget === this.targets[0] ? 'left' : 'right';
        this.engine.setGameResult(result);
        this.engine.setState('result');
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
    return bullet.x < target.x + target.width &&
           bullet.x + 4 > target.x &&
           bullet.y < target.y + target.height &&
           bullet.y + 8 > target.y;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 73) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
    
    // Render player
    if (this.player.active && this.player.sprite) {
      ctx.drawImage(this.player.sprite, this.player.x, this.player.y);
    }
    
    // Render targets
    this.targets.forEach(target => {
      if (target.active && target.sprite) {
        ctx.drawImage(target.sprite, target.x, target.y);
        
        // HP bar
        const barWidth = 40;
        const barHeight = 4;
        const barX = target.x + (target.width - barWidth) / 2;
        const barY = target.y - 10;
        
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
  }

  cleanup(): void {
    this.bullets = [];
  }
}