import './style.css'
import { GameEngine } from './GameEngine'

// Initialize the game
const gameEngine = new GameEngine();
gameEngine.start();

// Handle page unload
window.addEventListener('beforeunload', () => {
  gameEngine.destroy();
});