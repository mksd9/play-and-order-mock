export interface InputState {
  left: boolean;
  right: boolean;
  shoot: boolean;
}

export class InputManager {
  private static instance: InputManager;
  private inputState: InputState = {
    left: false,
    right: false,
    shoot: false
  };

  static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  init(): void {
    this.setupTouchControls();
    this.setupKeyboardControls();
    this.preventDefaultBehaviors();
  }

  private setupTouchControls(): void {
    const leftBtn = document.getElementById('move-left') as HTMLButtonElement;
    const rightBtn = document.getElementById('move-right') as HTMLButtonElement;
    const shootBtn = document.getElementById('shoot') as HTMLButtonElement;

    // Left button
    leftBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.inputState.left = true;
    });
    leftBtn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.inputState.left = false;
    });
    leftBtn.addEventListener('pointerleave', (e) => {
      e.preventDefault();
      this.inputState.left = false;
    });

    // Right button
    rightBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.inputState.right = true;
    });
    rightBtn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.inputState.right = false;
    });
    rightBtn.addEventListener('pointerleave', (e) => {
      e.preventDefault();
      this.inputState.right = false;
    });

    // Shoot button
    shootBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.inputState.shoot = true;
    });
    shootBtn.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.inputState.shoot = false;
    });
    shootBtn.addEventListener('pointerleave', (e) => {
      e.preventDefault();
      this.inputState.shoot = false;
    });
  }

  private setupKeyboardControls(): void {
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.inputState.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.inputState.right = true;
          e.preventDefault();
          break;
        case 'Space':
        case 'Enter':
          this.inputState.shoot = true;
          e.preventDefault();
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.inputState.left = false;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.inputState.right = false;
          e.preventDefault();
          break;
        case 'Space':
        case 'Enter':
          this.inputState.shoot = false;
          e.preventDefault();
          break;
      }
    });
  }

  private preventDefaultBehaviors(): void {
    // Prevent scrolling/zooming
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Prevent context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Prevent reload during game
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
    });
  }

  getInputState(): InputState {
    return { ...this.inputState };
  }

  reset(): void {
    this.inputState = {
      left: false,
      right: false,
      shoot: false
    };
  }
}