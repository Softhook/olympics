// Olympic Games Test Script
// This script runs automated tests for all the sports games
// Add this to your HTML file before the closing body tag:
// <script src="game-tester.js"></script>

class GameTester {
  constructor() {
    this.testQueue = [];
    this.currentTest = null;
    this.testResults = {};
    this.isRunning = false;
    this.logElement = null;
    this.setupUI();
  }

  setupUI() {
    // Create test control panel
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.backgroundColor = 'rgba(0,0,0,0.7)';
    panel.style.color = 'white';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.zIndex = '1000';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.fontSize = '14px';
    panel.style.maxWidth = '300px';
    panel.style.maxHeight = '400px';
    panel.style.overflowY = 'auto';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Game Tester';
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '16px';
    panel.appendChild(title);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginBottom = '10px';
    
    const runButton = this.createButton('Run All Tests', () => this.runAllTests());
    const stopButton = this.createButton('Stop Tests', () => this.stopTests());
    
    buttonContainer.appendChild(runButton);
    buttonContainer.appendChild(stopButton);
    panel.appendChild(buttonContainer);

    // Add sport-specific test buttons
    const sportButtons = document.createElement('div');
    sportButtons.style.display = 'flex';
    sportButtons.style.flexWrap = 'wrap';
    sportButtons.style.gap = '5px';
    sportButtons.style.marginBottom = '10px';
    
    // Add buttons for each sport
    const sports = ["RUNNING", "LONG_JUMP", "DISCUS", "HIGH_JUMP", "SWIMMING", "SKATING", "SHOOTING", "ARCHERY", "FOOTBALL"];
    
    sports.forEach(sport => {
      const button = this.createButton(sport, () => this.testSingleGame(sport), 'small');
      sportButtons.appendChild(button);
    });
    
    panel.appendChild(sportButtons);
    
    // Add log section
    const logTitle = document.createElement('div');
    logTitle.textContent = 'Test Log:';
    logTitle.style.fontWeight = 'bold';
    logTitle.style.marginBottom = '5px';
    panel.appendChild(logTitle);
    
    this.logElement = document.createElement('div');
    this.logElement.style.maxHeight = '200px';
    this.logElement.style.overflowY = 'auto';
    this.logElement.style.backgroundColor = 'rgba(0,0,0,0.3)';
    this.logElement.style.padding = '5px';
    this.logElement.style.borderRadius = '3px';
    this.logElement.style.fontSize = '12px';
    panel.appendChild(this.logElement);
    
    document.body.appendChild(panel);
  }
  
  createButton(text, onClick, size = 'normal') {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.padding = size === 'small' ? '3px 6px' : '5px 10px';
    button.style.borderRadius = '3px';
    button.style.border = 'none';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.fontSize = size === 'small' ? '10px' : '12px';
    button.addEventListener('click', onClick);
    return button;
  }

  log(message, isHeader = false) {
    const entry = document.createElement('div');
    entry.textContent = message;
    if (isHeader) {
      entry.style.fontWeight = 'bold';
      entry.style.marginTop = '5px';
    }
    this.logElement.appendChild(entry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
    console.log(message);
  }

  runAllTests() {
    if (this.isRunning) {
      this.log('Tests already running!');
      return;
    }

    this.log('Starting all tests...', true);
    this.isRunning = true;
    this.testResults = {};
    
    // Queue all tests
    this.testQueue = [
      { name: "MENU", duration: 1000 },
      { name: "RUNNING", duration: 6000 },
      { name: "LONG_JUMP", duration: 7000 },
      { name: "HIGH_JUMP", duration: 7000 },
      { name: "DISCUS", duration: 7000 },
      { name: "SWIMMING", duration: 6000 },
      { name: "SKATING", duration: 6000 },
      { name: "SHOOTING", duration: 6000 },
      { name: "ARCHERY", duration: 8000 },
      { name: "FOOTBALL", duration: 5000 },
      { name: "MENU", duration: 1000 } // Return to menu at the end
    ];
    
    // Start test sequence
    this.processNextTest();
  }

  testSingleGame(sport) {
    if (this.isRunning) {
      this.log(`Cannot start test for ${sport} - tests already running!`);
      return;
    }

    this.log(`Testing ${sport}...`, true);
    this.isRunning = true;
    this.testResults = {};
    
    // Queue just this test
    this.testQueue = [
      { name: "MENU", duration: 1000 },  // Go to menu first
      { name: sport, duration: sport === "FOOTBALL" ? 6000 : 8000 },
      { name: "MENU", duration: 1000 }   // Return to menu at the end
    ];
    
    // Start test sequence
    this.processNextTest();
  }

  processNextTest() {
    if (this.testQueue.length === 0 || !this.isRunning) {
      this.isRunning = false;
      this.log('All tests completed!', true);
      return;
    }

    this.currentTest = this.testQueue.shift();
    this.log(`Running test: ${this.currentTest.name}`);
    
    if (this.currentTest.name === "MENU") {
      this.simulateMenuSelection(this.testQueue[0]?.name);
      setTimeout(() => this.processNextTest(), this.currentTest.duration);
    } else {
      this.testGame(this.currentTest.name, this.currentTest.duration);
    }
  }

  stopTests() {
    if (!this.isRunning) {
      this.log('No tests running.');
      return;
    }
    
    this.isRunning = false;
    this.testQueue = [];
    this.log('Tests stopped.', true);
    
    // Go back to menu
    this.simulateKeyPress('m');
  }

  simulateMenuSelection(nextSport) {
    // If there's no next sport, we're done
    if (!nextSport || nextSport === "MENU") return;
    
    this.log(`Selecting ${nextSport} from menu`);
    
    // Find the button position for the sport
    setTimeout(() => {
      if (typeof width === 'undefined' || typeof height === 'undefined' || 
          typeof pixelUnit === 'undefined' || typeof min !== 'function' || typeof max !== 'function') {
        this.log("ERROR: p5.js core variables/functions not ready for menu selection. Skipping this action.", true);
        // The test sequence will continue via processNextTest's own timeout.
        return;
      }

      const sports = ["RUNNING", "LONG_JUMP", "DISCUS", "HIGH_JUMP", "SWIMMING", "SKATING", "SHOOTING", "ARCHERY", "FOOTBALL"];
      const index = sports.indexOf(nextSport);
      
      if (index !== -1) {
        // Calculate approximate button position based on index
        const buttonHeight = min(height * 0.07, 55);
        const spacing = buttonHeight + pixelUnit * 1.5; 
        const totalButtonHeight = sports.length * spacing;
        const startY = max(height/2 - totalButtonHeight/2 + buttonHeight/2, height/8 + 80);
        
        const buttonY = startY + index * spacing;
        const buttonX = width/2;
        
        // Simulate mouse click on the sport button
        this.simulateMouseClick(buttonX, buttonY);
      }
    }, 500);
  }

  testGame(sport, duration) {
    this.log(`Testing ${sport} gameplay...`);
    
    // Start game-specific test
    switch(sport) {
      case "RUNNING":
        this.testRunning();
        break;
      case "LONG_JUMP":
        this.testLongJump();
        break;
      case "HIGH_JUMP":
        this.testHighJump();
        break;
      case "DISCUS":
        this.testDiscus();
        break;
      case "SWIMMING":
        this.testSwimming();
        break;
      case "SKATING":
        this.testSkating();
        break;
      case "SHOOTING":
        this.testShooting();
        break;
      case "ARCHERY":
        this.testArchery();
        break;
      case "FOOTBALL":
        this.testFootball();
        break;
    }
    
    // Schedule next test after this one completes
    setTimeout(() => {
      this.processNextTest();
    }, duration);
  }

  testRunning() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Simulate key presses for running
    let keyIndex = 0;
    const keyInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(keyInterval);
        return;
      }
      
      // Alternate between left and right arrow keys
      this.simulateKeyPress(keyIndex % 2 === 0 ? 'ArrowLeft' : 'ArrowRight');
      keyIndex++;
    }, 100);
    
    // Clear interval after 5 seconds
    setTimeout(() => {
      clearInterval(keyInterval);
      this.log(`Running test completed`);
    }, 5000);
  }

  testLongJump() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Run phase - alternate left/right
    let runKeyInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(runKeyInterval);
        return;
      }
      
      this.simulateKeyPress(Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight');
    }, 100);
    
    // Jump at foul line
    setTimeout(() => {
      clearInterval(runKeyInterval);
      this.simulateKeyPress(' '); // Jump
      
      // Set power
      setTimeout(() => {
        this.simulateKeyPress(' ');
        
        // Set angle
        setTimeout(() => {
          this.simulateKeyPress(' ');
        }, 700);
      }, 700);
    }, 2500);
  }

  testHighJump() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Run phase - alternate left/right
    let runKeyInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(runKeyInterval);
        return;
      }
      
      this.simulateKeyPress(Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight');
    }, 100);
    
    // Jump at takeoff point
    setTimeout(() => {
      clearInterval(runKeyInterval);
      this.simulateKeyPress(' '); // Jump
      
      // Set power
      setTimeout(() => {
        this.simulateKeyPress(' ');
        
        // Set angle
        setTimeout(() => {
          this.simulateKeyPress(' ');
        }, 700);
      }, 700);
    }, 2500);
  }

  testDiscus() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Set power
    setTimeout(() => {
      this.simulateKeyPress(' ');
      
      // Set angle
      setTimeout(() => {
        this.simulateKeyPress(' ');
      }, 700);
    }, 1500);
  }

  testSwimming() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Swim phase - alternate up/down
    let swimKeyInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(swimKeyInterval);
        return;
      }
      
      this.simulateKeyPress(Math.random() < 0.5 ? 'ArrowUp' : 'ArrowDown');
    }, 150);
    
    // Stop swimming after 5 seconds
    setTimeout(() => {
      clearInterval(swimKeyInterval);
    }, 5000);
  }

  testSkating() {
    // Start the game (charge)
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Release charge after a second
    setTimeout(() => {
      this.simulateKeyPress(' ', true); // Key up event for space
      
      // Boost periodically
      setTimeout(() => this.simulateKeyPress(' '), 1000);
      setTimeout(() => this.simulateKeyPress('ArrowRight'), 2000);
      setTimeout(() => this.simulateKeyPress(' '), 3000);
    }, 1000);
  }

  testShooting() {
    // Start the game
    setTimeout(() => {
      if (typeof width === 'undefined' || typeof height === 'undefined' || typeof random !== 'function') {
        this.log("ERROR: p5.js globals not ready for Shooting test. Skipping this action.", true);
        // The test sequence will continue via processNextTest's own timeout.
        return;
      }
      // Game starts on click in instructions
      this.simulateMouseClick(width/2, height/2);
      
      // Start shooting
      let shootCount = 0;
      const shootInterval = setInterval(() => {
        if (!this.isRunning || shootCount >= 10) {
          clearInterval(shootInterval);
          return;
        }
        
        // Move reticle to random position
        const reticleX = random(width * 0.2, width * 0.8);
        const reticleY = random(height * 0.2, height * 0.6);
        this.simulateMouseMove(reticleX, reticleY);
        
        // Shoot either with mouse or space
        if (Math.random() < 0.5) {
          this.simulateMouseClick(reticleX, reticleY);
        } else {
          this.simulateKeyPress(' ');
        }
        
        shootCount++;
      }, 300);
    }, 500);
  }

  testArchery() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Aim with up/down arrows
    setTimeout(() => {
      // Move cursor randomly
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.simulateKeyPress(Math.random() < 0.5 ? 'ArrowUp' : 'ArrowDown');
        }, i * 100);
      }
      
      // Start charging
      setTimeout(() => {
        this.simulateKeyPress(' ');
        
        // Hold space to charge
        this.simulateKeyDown(' ');
        
        // Release to shoot
        setTimeout(() => {
          this.simulateKeyUp(' ');
          
          // Shoot remaining arrows
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              // Aim
              for (let j = 0; j < 3; j++) {
                setTimeout(() => {
                  this.simulateKeyPress(Math.random() < 0.5 ? 'ArrowUp' : 'ArrowDown');
                }, j * 100);
              }
              
              // Charge and shoot
              setTimeout(() => {
                this.simulateKeyPress(' '); // Start charging
                this.simulateKeyDown(' '); // Hold space
                
                setTimeout(() => {
                  this.simulateKeyUp(' '); // Release to shoot
                }, 800);
              }, 500);
            }, i * 1500);
          }
        }, 1000);
      }, 800);
    }, 1000);
  }

  testFootball() {
    // Start the game
    setTimeout(() => this.simulateKeyPress(' '), 500);
    
    // Move cursor with arrows
    setTimeout(() => {
      // Move cursor to aim
      const directions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const dir = directions[Math.floor(Math.random() * directions.length)];
          this.simulateKeyPress(dir);
        }, i * 100);
      }
      
      // Kick the ball
      setTimeout(() => {
        this.simulateKeyPress(' ');
        this.log("Kicked the ball!");
      }, 1500);
      
    }, 1000);
  }

  // Utility methods for simulating user input
  simulateKeyPress(key, releaseOnly = false) {
    if (!releaseOnly) {
      this.simulateKeyDown(key);
    }
    this.simulateKeyUp(key);
  }
  
  simulateKeyDown(key) {
    const keyEvent = new KeyboardEvent('keydown', {
      key: key,
      code: key === ' ' ? 'Space' : key,
      keyCode: this.getKeyCode(key),
      which: this.getKeyCode(key),
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(keyEvent);
  }
  
  simulateKeyUp(key) {
    const keyEvent = new KeyboardEvent('keyup', {
      key: key,
      code: key === ' ' ? 'Space' : key,
      keyCode: this.getKeyCode(key),
      which: this.getKeyCode(key),
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(keyEvent);
    
    // Trigger keyReleased function directly if it exists
    if (typeof keyReleased === 'function') {
      keyCode = this.getKeyCode(key);  // Set the global keyCode
      if (key === ' ') {
        keyCode = 32;
      }
      keyReleased();
    }
  }
  
  getKeyCode(key) {
    // Return key codes for common keys
    switch(key) {
      case ' ': return 32;  // Space
      case 'ArrowLeft': return 37;
      case 'ArrowUp': return 38;
      case 'ArrowRight': return 39;
      case 'ArrowDown': return 40;
      case 'a': case 'A': return 65;
      case 'd': case 'D': return 68;
      case 'm': case 'M': return 77;
      case 's': case 'S': return 83;
      case 'w': case 'W': return 87;
      default: return key.charCodeAt(0);
    }
  }

  simulateMouseClick(x, y) {
    // Update global mouseX and mouseY used by p5.js
    mouseX = x;
    mouseY = y;
    
    // Create and dispatch mouse events
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    document.dispatchEvent(mouseEvent);
    
    // Also call mousePressed directly if it exists
    if (typeof mousePressed === 'function') {
      mousePressed();
    }
    
    // Mouse up
    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    document.dispatchEvent(mouseUpEvent);
  }
  
  simulateMouseMove(x, y) {
    // Update global mouseX and mouseY used by p5.js
    mouseX = x;
    mouseY = y;
    
    // Create and dispatch mouse move event
    const mouseMoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    document.dispatchEvent(mouseMoveEvent);
  }
}

// Initialize the tester when the sketch is fully loaded
function setupGameTester() {
  // Wait a moment to ensure the p5.js sketch is fully initialized
  setTimeout(() => {
    window.gameTester = new GameTester();
    console.log("Game Tester initialized!");
  }, 1000);
}

// Initialize when document is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  setupGameTester();
} else {
  document.addEventListener("DOMContentLoaded", setupGameTester);
}

// Make sure it runs even if the p5.js sketch takes longer to initialize
window.addEventListener('load', () => {
  if (!window.gameTester) {
    setupGameTester();
  }
});
