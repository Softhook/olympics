let currentSport = 'MENU';
let score = 0;
let globalFrameCount = 0;

// --- Best Scores ---
let bestScores = {
    RUNNING: null, LONG_JUMP: null, DISCUS: null, HIGH_JUMP: null,
    SWIMMING: null, SKATING: null, SHOOTING: null, ARCHERY: null, FOOTBALL: null
};

// --- Common Game Variables ---
let player = { size: 24 };
let pixelUnit = 6;

// --- Sport Specific Variables (declarations) ---
let runPlayerX, runPlayerY, runSpeed, runStartTime, runFinishLineX, runFinished, runFinalTime, runKeyAlternator;
let ljPlayerX, ljPlayerY, ljRunSpeed, ljTakeoffX, ljJumpVX, ljJumpVY, ljGravityLJ, ljFoulLineX, ljLandingX, ljDistance, ljPhase, ljKeyAlternator, ljPowerMeter, ljAngleMeterLJ;
let discusPlayerX, discusPlayerY, discusArmAngle, discusCurrentPowerSetting, discusLockedPower, discusX, discusY, discusVX, discusVY, discusGravityD, discusLandingX, discusDistanceD, discusMaxPower, discusReleaseAngleD, discusPhase, discusAngleMeterD;
let hjPlayerX, hjPlayerY, hjRunSpeed, hjTakeoffX, hjJumpVX, hjJumpVY, hjGravityHJ, hjBarHeight, hjCurrentMaxHeight, hjAttemptsLeft, hjBarCleared, hjPhase, hjKeyAlternator, hjPowerMeter, hjAngleMeterHJ;
const INITIAL_BAR_HEIGHT = 150; const BAR_HEIGHT_INCREMENT = 5;
let swPlayerY, swSpeed, swStamina, swMaxStamina, swStaminaRegen, swStaminaDrain, swStartTime, swFinishLineY, swFinalTime, swKeyAlternator, swPhase;
let skPlayerX, skSpeed, skEffort, skMaxEffort, skEffortRegen, skEffortDrainBoost, skStartTime, skFinishLineX_sk, skFinalTime_sk, skPhase, skIsCharging;
let shReticleX, shReticleY, shTargets = [], shScore, shAmmo, shTimeLeft, shGameDuration = 30, shStartTime, shPhase;
const SH_NUM_TARGETS = 5; const SH_TARGET_SIZE = 40;
// Archery variables
let archCursorY, archPower, archMaxPower, archWindSpeed, archTargetCenterX, archTargetCenterY, archTargetSize, archArrows, archScore, archPhase, archPowerMeter, archArcherX;
// Football (penalty) variables  
let fbCursorX, fbCursorY, fbCursorSpeedX, fbCursorSpeedY, fbGoalWidth, fbGoalHeight, fbGoalX, fbGoalY, fbGoalkeeperX, fbGoalkeeperY, fbBallX, fbBallY, fbBallVX, fbBallVY, fbScore, fbPhase;
let fbGravity; // Added for football gravity

const SPORTS = ["RUNNING", "LONG_JUMP", "DISCUS", "HIGH_JUMP", "SWIMMING", "SKATING", "SHOOTING", "ARCHERY", "FOOTBALL"];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100);
    textAlign(CENTER, CENTER);
    strokeWeight(pixelUnit / 3);
    rectMode(CORNER); // Default rect mode
    resetAllSports();
    currentSport = 'MENU';
}

function resetAllSports() {
    resetRunning(); resetLongJump(); resetDiscus(); resetHighJump();
    resetSwimming(); resetSkating(); resetShooting(); resetArchery(); resetFootball();
    // Explicitly reset scores for sports that accumulate them across retries within a session
    fbScore = 0; 
    // archScore = 0; // If archery score should also reset here
    // shScore = 0; // If shooting score should also reset here
}

function resetRunning() {
    runPlayerX = 50 + player.size; runPlayerY = height * 0.75; runSpeed = 0;
    runStartTime = 0; runFinishLineX = width - 100; runFinished = false;
    runFinalTime = 0; runKeyAlternator = 0;
}
function resetLongJump() {
    ljPlayerX = 50 + player.size; ljPlayerY = height * 0.75; ljRunSpeed = 0;
    ljTakeoffX = 0; ljJumpVX = 0; ljJumpVY = 0; ljGravityLJ = 0.25;
    ljFoulLineX = width * 0.4; ljLandingX = 0; ljDistance = 0; ljPhase = 'instructions';
    ljPowerMeter = { value: 0, increasing: true, maxValue: 100, speed: 2.5 };
    ljAngleMeterLJ = { value: 15, increasing: true, minValue: 15, maxValue: 75, speed: 1.5 };
    ljKeyAlternator = 0;
}
function resetDiscus() {
    discusPlayerX = width * 0.2; discusPlayerY = height * 0.6; discusArmAngle = 0;
    discusCurrentPowerSetting = 0; discusLockedPower = 0; discusX = discusPlayerX;
    discusY = discusPlayerY; discusVX = 0; discusVY = 0; discusGravityD = 0.08;
    discusLandingX = 0; discusDistanceD = 0; discusMaxPower = 100;
    discusReleaseAngleD = 45; discusPhase = 'instructions';
    discusAngleMeterD = { value: 30, increasing: true, minValue: 20, maxValue: 60, speed: 1.2 };
}
function resetHighJump() {
    hjPlayerX = 50 + player.size; hjPlayerY = height * 0.75; hjRunSpeed = 0;
    hjTakeoffX = width * 0.5 - (player.size * 2.8) - player.size;
    hjJumpVX = 0; hjJumpVY = 0; hjGravityHJ = 0.28;
    let startingBar = INITIAL_BAR_HEIGHT;
    if(hjPhase === 'result' || (hjPhase === 'instructions' && hjAttemptsLeft < 3 && !hjBarCleared) ) { // Retrying same height or coming from menu after a fail
        startingBar = hjBarHeight || INITIAL_BAR_HEIGHT; // Keep current if exists, else initial
         if(hjBarCleared) { // If they just cleared and are now at results or instructions
            startingBar = hjCurrentMaxHeight + BAR_HEIGHT_INCREMENT;
         }
    } else if (bestScores.HIGH_JUMP !== null) { // Coming from menu with a previous best
         startingBar = max(INITIAL_BAR_HEIGHT, bestScores.HIGH_JUMP + BAR_HEIGHT_INCREMENT);
    }

    hjBarHeight = startingBar;
    hjCurrentMaxHeight = bestScores.HIGH_JUMP || 0; // Max ever cleared
    hjAttemptsLeft = 3; hjBarCleared = false; hjPhase = 'instructions';
    hjPowerMeter = { value: 0, increasing: true, maxValue: 100, speed: 2.0 };
    hjAngleMeterHJ = { value: 60, increasing: true, minValue: 45, maxValue: 85, speed: 1.3 };
    hjKeyAlternator = 0;
}
function resetSwimming() {
    swPlayerY = height - player.size * 2; swSpeed = 0; swMaxStamina = 100;
    swStamina = swMaxStamina; swStaminaRegen = 0.2; swStaminaDrain = 5;
    swStartTime = 0; swFinishLineY = player.size * 2; swFinalTime = 0;
    swKeyAlternator = 0; swPhase = 'instructions';
}
function resetSkating() {
    skPlayerX = 50 + player.size; skSpeed = 0; skMaxEffort = 100; skEffort = skMaxEffort;
    skEffortRegen = 0.1; skEffortDrainBoost = 15; skStartTime = 0;
    skFinishLineX_sk = width - 100; skFinalTime_sk = 0; skPhase = 'instructions';
    skIsCharging = false;
}
function resetShooting() {
    shReticleX = width / 2; shReticleY = height / 2; shTargets = [];
    for (let i = 0; i < SH_NUM_TARGETS; i++) { spawnNewTarget(i); }
    shScore = 0; shAmmo = 15; shTimeLeft = shGameDuration;
    shStartTime = 0; shPhase = 'instructions';
}
function resetArchery() {
    archCursorY = height * 0.5; archPower = 0; archMaxPower = 100;
    archWindSpeed = (Math.random() - 0.5) * 4; // Random wind between -2 and 2
    archTargetCenterX = width * 0.85; archTargetCenterY = height * 0.5;
    archTargetSize = player.size * 3; archArrows = 5; archScore = 0;
    archPhase = 'instructions';
    archPowerMeter = { value: 0, increasing: true, maxValue: 100, speed: 2.0 };
    archArcherX = width * 0.2;  // Store archer's X position for consistent use
}

function resetArrow() {
    // Reset arrow for a new shot
    archPower = 0;
}
function resetFootball() {
    fbCursorX = width * 0.5; fbCursorY = height * 0.5;
    fbCursorSpeedX = 2; fbCursorSpeedY = 1.5;
    fbGoalWidth = player.size * 10; fbGoalHeight = player.size * 7;
    fbGoalX = width * 0.5 - fbGoalWidth * 0.5; fbGoalY = height * 0.3;
    fbGoalkeeperX = fbGoalX + fbGoalWidth * 0.5;
    fbGoalkeeperY = fbGoalY + fbGoalHeight/2;
    fbBallX = width * 0.5; fbBallY = height * 0.75;
    fbBallVX = 0; fbBallVY = 0;
    // fbScore = 0; // REMOVED - Score is reset when game selected from menu or in resetAllSports
    fbPhase = 'instructions';
    fbGravity = 0.1; // Initialize football gravity
}

function spawnNewTarget(index) {
    shTargets[index] = {
        x: random(width*0.15, width*0.85), y: random(height*0.15, height*0.65),
        size: SH_TARGET_SIZE + random(-pixelUnit*1.5, pixelUnit*1.5), active: true,
        color1: color(random(360),80,90), color2: color(random(360),90,70),
        color3: color(random(360),100,100)
    };
}

function drawStadiumBackground(groundColor1, groundColor2) { /* ... (Code from previous step) ... */ }
function drawSpectators(x,y,w,h,numRows,numCols,distant) { /* ... (Code from previous step) ... */ }
function drawPlayer8Bit(px,py,psize,state,armParam,facingRight) { /* ... (Code from previous step) ... */ }
function drawPoolBackground() { /* ... (Code from previous step) ... */ }
function drawIceRinkBackground() { /* ... (Code from previous step) ... */ }
function drawShootingRangeBackground() { /* ... (Code from previous step) ... */ }
function drawMenu() { /* ... (Code from previous step) ... */ }
function showInstructions(message, sportResetFunction) { /* ... (Code from previous step) ... */ }
function showResult(sportName,resultText,sportResetFunction,sportSpecificInstructionReset) { /* ... (Code from previous step) ... */ }

// (The full graphics functions are long, so I'm using the comment placeholders for brevity here.
// Assume they are correctly copied from the previous step where they were provided in full.)
function drawStadiumBackground(groundColor1 = color(30, 70, 60), groundColor2 = color(40, 60, 50)) { noStroke(); fill(195, 60, 100); rect(0, 0, width, height * 0.6); fill(120, 30, 40); let skylineHeight = height * 0.04; for (let i = 0; i < width; i += pixelUnit * 5) { let buildingHeightOffset = sin(i * 0.03 / (pixelUnit/6) + globalFrameCount*0.01) * pixelUnit * 1.5; rect(i, height * 0.6 - skylineHeight - buildingHeightOffset - pixelUnit*2, pixelUnit * 5, skylineHeight + buildingHeightOffset + pixelUnit*2); } fill(0, 0, 30); rect(0, height * 0.6 - skylineHeight - pixelUnit * 5.5, width, pixelUnit * 3.5); drawSpectators(0, height * 0.6 - skylineHeight - pixelUnit * 5, width, pixelUnit * 3, 1, floor(width / (pixelUnit * 1.2)), true); let standHeight = height * 0.18; let standY = height * 0.6 - standHeight - skylineHeight - pixelUnit * 5.5; fill(0, 0, 50); rect(0, standY, width, standHeight); stroke(0,0,30); strokeWeight(pixelUnit/3); for(let i=0; i < 3; i++){ line(0, standY + (standHeight/3)*i, width, standY + (standHeight/3)*i); } noStroke(); drawSpectators(0, standY + pixelUnit * 0.5, width, standHeight - pixelUnit, 2, floor(width / (pixelUnit * 1.5))); fill(groundColor1); rect(0, height * 0.6, width, height * 0.4); fill(groundColor2); rect(0, height * 0.6 + pixelUnit * 5, width, height * 0.4 - pixelUnit*5); }
function drawSpectators(x, y, w, h, numRows, numCols, distant = false) { let specSizeBase = distant ? pixelUnit * 0.5 : pixelUnit * 1.1; let rowHeight = h / numRows; let colWidth = w / numCols; rectMode(CENTER); noStroke(); for (let r = 0; r < numRows; r++) { for (let c = 0; c < numCols; c++) { let baseHue = (c * 13 + r * 23 + (distant?180:0)) % 360; let animatedHue = (baseHue + globalFrameCount * 0.3) % 360; let sat = distant ? 30 : 60 + sin(c*0.5+r*0.3+globalFrameCount*0.02)*10; let brt = distant ? 40 : 70 + cos(c*0.3+r*0.5+globalFrameCount*0.02)*10; fill(animatedHue, sat, brt); let specSize = specSizeBase * (1 + sin(globalFrameCount*0.1 + c*0.2 + r*0.3)*0.08); rect(x + c * colWidth + colWidth / 2, y + r * rowHeight + rowHeight / 2, specSize, specSize * 1.1); } } rectMode(CORNER); }
function drawPlayer8Bit(px, py, psize, state = "idle", armParam = 0, facingRight = true) { 
    push(); 
    translate(px, py - psize/2); 
    if (!facingRight) { scale(-1, 1); } 
    noStroke(); 
    rectMode(CENTER); 
    let headH = psize*0.35; let headW = psize*0.3; let bodyH = psize*0.45; let bodyW = psize*0.35; let legH = psize*0.5; let legW = psize*0.18; let armH = psize*0.4; let armW = psize*0.15; 
    let skinTone = color(30,40,95); let outfitColor = color(210, 80,100); let darkOutfitColor = color(hue(outfitColor), saturation(outfitColor)*0.8, brightness(outfitColor)*0.7); 
    let legY = bodyH/2; let legAngle1 = 0, legAngle2 = 0; let armAngle1 = 0, armAngle2 = 0; 
    if (state === "running" || state === "run_lj" || state === "run_hj") { 
        let cycle = sin(globalFrameCount*0.5); legAngle1 = cycle*(PI/4); legAngle2 = -cycle*(PI/4); armAngle1 = -cycle*(PI/5); armAngle2 = cycle*(PI/5); 
    } else if (state === "jumping_power") { 
        legY = bodyH/2 + legH*0.15; legH *= 0.8; bodyH *=0.9; armAngle1 = PI/3.5; armAngle2 = PI/3.5; 
    } else if (state === "jumping_arch") { 
        armAngle1 = -PI/2.5; armAngle2 = -PI/2; legAngle1 = PI/4; legAngle2 = PI/3; bodyH *= 0.8; 
    } 
    fill(darkOutfitColor); 
    push(); translate(-legW*0.75, legY); rotate(legAngle1); rect(0, legH/2, legW, legH); pop(); 
    push(); translate(legW*0.75, legY); rotate(legAngle2); rect(0, legH/2, legW, legH); pop(); 
    fill(outfitColor); rect(0, 0, bodyW, bodyH); 
    if (state === "spin_discus" || state === "discus_throw_angle") { 
        let currentArmAngle = (state === "spin_discus") ? armParam : radians(-discusReleaseAngleD + (facingRight?0:180)); 
        push(); translate(0, -bodyH*0.1); rotate(currentArmAngle); fill(skinTone); rect(armH/1.8, 0, armH*1.2, armW); 
        if(state === "discus_throw_angle" || (state === "spin_discus" && discusCurrentPowerSetting > 0)) { 
            fill(20,80,80); ellipse(armH*1.2, 0, psize*0.25, psize*0.2); 
        } 
        pop(); 
        push(); translate(0, -bodyH*0.1); rotate(PI/5); fill(skinTone); rect(0, armH/2.5, armW*0.9, armH*0.7); pop(); 
    } else { 
        fill(skinTone); 
        push(); translate(-bodyW*0.05, -bodyH*0.2+armH*0.1); rotate(armAngle1); rect(0, armH/2, armW, armH); pop(); 
        push(); translate(bodyW*0.05, -bodyH*0.2+armH*0.1); rotate(armAngle2); rect(0, armH/2, armW, armH); pop(); 
    } 
    fill(skinTone); rect(0, -bodyH/2 - headH/2.2, headW, headH); 
    fill(40,70,30); rect(0, -bodyH/2 - headH/2 - headH*0.15, headW*1.05, headH*0.55); 
    pop(); // Missing pop() call - this was causing the coordinate system issue!
    rectMode(CORNER); 
}
function drawPoolBackground() { noStroke(); fill(200,80,80); rect(0,0,width,height); let numLanes=5; let laneWidth=width/(numLanes+1); for(let i=0; i<numLanes+2; i++){ fill(190,40,100); if(i===0 || i===numLanes+1){ rect(i*laneWidth-pixelUnit*2,0,pixelUnit*4,height); } else { for(let y=0; y<height; y+=pixelUnit*3){ rect(i*laneWidth-pixelUnit/2,y,pixelUnit,pixelUnit*2); }}} fill(0,0,70); rect(0,height-pixelUnit*6,width,pixelUnit*6); rect(0,0,width,pixelUnit*6); fill(0,0,30); rect(0,0,pixelUnit*12,height); drawSpectators(pixelUnit,pixelUnit*6,pixelUnit*10,height-pixelUnit*12,floor((height-pixelUnit*12)/(pixelUnit*3)),2); fill(0,0,30); rect(width-pixelUnit*12,0,pixelUnit*12,height); drawSpectators(width-pixelUnit*11,pixelUnit*6,pixelUnit*10,height-pixelUnit*12,floor((height-pixelUnit*12)/(pixelUnit*3)),2); }
function drawIceRinkBackground() { noStroke(); fill(210,10,85); rect(0,0,width,height*0.4); let standHeight=height*0.18; let standY=height*0.4-standHeight; fill(0,0,50); rect(0,standY,width,standHeight); drawSpectators(0,standY+pixelUnit,width,standHeight-pixelUnit*2,2,floor(width/(pixelUnit*2))); fill(180,20,100); rect(0,height*0.4,width,height*0.6); fill(0,0,70); rect(0,height*0.4-pixelUnit*1.5,width,pixelUnit*3); rect(0,height-pixelUnit*1.5,width,pixelUnit*3); }
function drawShootingRangeBackground() { noStroke(); fill(40,20,50); rect(0,0,width,height); fill(30,30,40); rect(0,height*0.8,width,height*0.2); fill(20,15,30); triangle(0,0,width*0.15,height*0.15,0,height); triangle(width,0,width*0.85,height*0.15,width,height); for(let i=0;i<5;i++){fill(0,0,20);rect(width*0.15+i*width*0.14,height*0.2,pixelUnit*1.5,height*0.55);} }
function drawMenu() { 
    textSize(constrain(width/15,30,70));
    fill(0,0,100);
    textAlign(CENTER,CENTER);
    text("P5 Power Games Pixel!",width/2,height/8);
    
    let buttonWidth=min(width*0.7,400);
    let buttonHeight=min(height*0.07,55);
    let spacing=buttonHeight+pixelUnit*1.5;
    let totalButtonHeight=SPORTS.length*spacing;
    let startY=max(height/2-totalButtonHeight/2+buttonHeight/2,height/8+80);
    
    rectMode(CENTER);
    noStroke();
    
    for(let i=0;i<SPORTS.length;i++){
        let sportNameKey=SPORTS[i];
        let sportDisplayName=sportNameKey.replace("_"," ");
        let buttonY=startY+i*spacing;
        let buttonHue=(360/SPORTS.length*i)%360;
        let mouseOver=(mouseX>width/2-buttonWidth/2&&mouseX<width/2+buttonWidth/2&&mouseY>buttonY-buttonHeight/2&&mouseY<buttonY+buttonHeight/2);
        
        fill(buttonHue,mouseOver?95:70,mouseOver?100:80);
        rect(width/2,buttonY,buttonWidth,buttonHeight,pixelUnit);
        
        fill(0,0,mouseOver?5:100);
        textSize(buttonHeight*0.35);
        text(sportDisplayName,width/2,buttonY-buttonHeight*0.1);
        
        let bestScoreDisplay="Best: ---";
        if(sportNameKey==="RUNNING"&&bestScores.RUNNING!==null)
            bestScoreDisplay=`Best: ${bestScores.RUNNING.toFixed(2)}s`;
        else if(sportNameKey==="LONG_JUMP"&&bestScores.LONG_JUMP!==null)
            bestScoreDisplay=`Best: ${bestScores.LONG_JUMP.toFixed(2)}m`;
        else if(sportNameKey==="DISCUS"&&bestScores.DISCUS!==null)
            bestScoreDisplay=`Best: ${bestScores.DISCUS.toFixed(2)}m`;
        else if(sportNameKey==="HIGH_JUMP"&&bestScores.HIGH_JUMP!==null)
            bestScoreDisplay=`Best: ${bestScores.HIGH_JUMP}cm`;
        else if(sportNameKey==="SWIMMING"&&bestScores.SWIMMING!==null)
            bestScoreDisplay=`Best: ${bestScores.SWIMMING.toFixed(2)}s`;
        else if(sportNameKey==="SKATING"&&bestScores.SKATING!==null)
            bestScoreDisplay=`Best: ${bestScores.SKATING.toFixed(2)}s`;
        else if(sportNameKey==="SHOOTING"&&bestScores.SHOOTING!==null)
            bestScoreDisplay=`Best: ${bestScores.SHOOTING}pts`;
        else if(sportNameKey==="ARCHERY"&&bestScores.ARCHERY!==null)
            bestScoreDisplay=`Best: ${bestScores.ARCHERY}pts`;
        else if(sportNameKey==="FOOTBALL"&&bestScores.FOOTBALL!==null)
            bestScoreDisplay=`Best: ${bestScores.FOOTBALL} goals`;
        
        textSize(buttonHeight*0.22);
        fill(0,0,mouseOver?15:85);
        text(bestScoreDisplay,width/2,buttonY+buttonHeight*0.23);
    }
    
    rectMode(CORNER);
    fill(0,0,100);
    textSize(buttonHeight*0.3);
    text("Click a sport to start!",width/2,startY+SPORTS.length*spacing+pixelUnit*2);
}
function showInstructions(message,sportResetFunction){fill(20,80,30,0.95);rectMode(CENTER);noStroke();rect(width/2,height/2,min(width*0.8,pixelUnit*100),min(height*0.7,pixelUnit*80),pixelUnit*2);fill(0,0,100);textSize(constrain(pixelUnit*3,14,32));textAlign(CENTER,CENTER);text(message,width/2,height/2-pixelUnit*5,min(width*0.75,pixelUnit*90)-pixelUnit*2,min(height*0.6,pixelUnit*70)-pixelUnit*10);textSize(constrain(pixelUnit*2.5,12,24));text("Press M for Menu",width/2,height/2+min(height*0.7,pixelUnit*80)/2-pixelUnit*7);rectMode(CORNER);}
function showResult(sportName,resultText,sportResetFunction,sportSpecificInstructionReset){fill(20,80,30,0.95);rectMode(CENTER);noStroke();rect(width/2,height/2,min(width*0.7,pixelUnit*90),min(height*0.5,pixelUnit*70),pixelUnit*2);fill(0,0,100);textSize(constrain(pixelUnit*4.5,20,48));textAlign(CENTER,CENTER);text(`${sportName} Result`,width/2,height/2-min(height*0.5,pixelUnit*70)/2+pixelUnit*10);textSize(constrain(pixelUnit*3.5,16,36));text(resultText,width/2,height/2+pixelUnit*2);textSize(constrain(pixelUnit*2.5,12,24));text("SPACE: Retry\nM: Menu",width/2,height/2+min(height*0.5,pixelUnit*70)/2-pixelUnit*10);rectMode(CORNER);window.retryCallback=sportSpecificInstructionReset;}

function draw() {
    globalFrameCount++;
    background(0);
    fill(0,0,100); stroke(0,0,0); strokeWeight(pixelUnit/3); // Default drawing settings
    textAlign(CENTER,CENTER); // Ensure text alignment is consistent

    if (currentSport === 'MENU') {
        background(50,70,80); // Simple menu background
        drawMenu();
    } else if (currentSport === 'RUNNING') {
        console.log("Drawing Running sport");
        drawRunning();
    } else if (currentSport === 'LONG_JUMP') {
        console.log("Drawing Long Jump sport");
        drawLongJump();
    } else if (currentSport === 'DISCUS') {
        console.log("Drawing Discus sport");
        drawDiscus();
    } else if (currentSport === 'HIGH_JUMP') {
        console.log("Drawing High Jump sport");
        drawHighJump();
    } else if (currentSport === 'SWIMMING') {
        console.log("Drawing Swimming sport");
        drawSwimming();
    } else if (currentSport === 'SKATING') {
        console.log("Drawing Skating sport");
        drawSkating();
    } else if (currentSport === 'SHOOTING') {
        console.log("Drawing Shooting sport");
        drawShooting();
    } else if (currentSport === 'ARCHERY') {
        console.log("Drawing Archery sport");
        drawArchery();
    } else if (currentSport === 'FOOTBALL') {
        console.log("Drawing Football sport");
        drawFootball();
    }
}

function drawRunning() {
    drawStadiumBackground(color(30, 70, 60), color(40, 60, 50));
    if (!runStartTime || runFinished) {
        let instructionsText = "RUNNING:\n1. Press SPACE to start\n2. Alternate LEFT/RIGHT arrows quickly";
        showInstructions(instructionsText, resetRunning);
        if (runFinished) {
            showResult("Running", `Time: ${runFinalTime.toFixed(2)}s`, resetRunning, () => {});
        }
        return;
    }
    
    // Draw track
    let trackWidth = width - 100;
    noStroke();
    fill(200, 60, 50);
    rect(50, height * 0.75 - pixelUnit, trackWidth, pixelUnit * 2);
    
    // Draw finish line
    fill(0, 0, 100);
    for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
            rect(runFinishLineX, height * 0.75 - pixelUnit + i * pixelUnit/5, pixelUnit/2, pixelUnit/5);
        }
    }
    
    // Draw player
    drawPlayer8Bit(runPlayerX, runPlayerY, player.size, "running");
    
    // Move player
    runPlayerX += runSpeed;
    runSpeed = max(0, runSpeed - 0.05); // Reduced deceleration
    
    // Check if finished
    if (runPlayerX > runFinishLineX && !runFinished) {
        runFinished = true;
        runFinalTime = (millis() - runStartTime) / 1000;
        if (bestScores.RUNNING === null || runFinalTime < bestScores.RUNNING) {
            bestScores.RUNNING = runFinalTime;
        }
    }
}

function drawLongJump() {
    drawStadiumBackground(color(30, 70, 60), color(40, 60, 50));
    
    if (ljPhase === 'instructions') {
        showInstructions("LONG JUMP:\n1. Press SPACE to start\n2. Alternate LEFT/RIGHT arrows to run\n3. Press SPACE at foul line to jump\n4. Time your power and angle", resetLongJump);
        return;
    }
    
    if (ljPhase === 'result') {
        showResult("Long Jump", ljDistance === "FOUL" ? "FOUL!" : `Distance: ${ljDistance.toFixed(2)}m`, resetLongJump, () => {ljPhase = 'instructions';});
        return;
    }
    
    // Draw track and pit
    noStroke();
    fill(200, 60, 50); // Track color
    rect(50, height * 0.75 - pixelUnit, width - 200, pixelUnit * 2);
    
    // Draw foul line
    stroke(255); strokeWeight(pixelUnit/2);
    line(ljFoulLineX, height * 0.75 - pixelUnit * 3, ljFoulLineX, height * 0.75 + pixelUnit * 3);
    
    // Draw sand pit
    noStroke();
    fill(60, 80, 80); // Sand color
    rect(ljFoulLineX + pixelUnit, height * 0.75 - pixelUnit * 2, width * 0.4, pixelUnit * 4);
    
    if (ljPhase === 'run') {
        drawPlayer8Bit(ljPlayerX, ljPlayerY, player.size, "running");
        ljPlayerX += ljRunSpeed;
        ljRunSpeed = max(0, ljRunSpeed - 0.05); // Reduced deceleration
    } else if (ljPhase === 'takeoff_power') {
        drawPlayer8Bit(ljTakeoffX, ljPlayerY, player.size, "jumping_power");
        
        // Power meter
        fill(0, 0, 0, 80); rect(width/2 - 100, 30, 200, 20);
        fill(0, 100, 100); 
        rect(width/2 - 100, 30, map(ljPowerMeter.value, 0, ljPowerMeter.maxValue, 0, 200), 20);
        ljPowerMeter.value += ljPowerMeter.increasing ? ljPowerMeter.speed : -ljPowerMeter.speed;
        if (ljPowerMeter.value >= ljPowerMeter.maxValue || ljPowerMeter.value <= 0) {
            ljPowerMeter.increasing = !ljPowerMeter.increasing;
        }
    } else if (ljPhase === 'takeoff_angle') {
        drawPlayer8Bit(ljTakeoffX, ljPlayerY, player.size, "jumping_power");
        
        // Angle meter
        fill(0, 0, 0, 80); rect(width/2 - 100, 30, 200, 20);
        fill(0, 50, 100); 
        rect(width/2 - 100, 30, map(ljAngleMeterLJ.value, ljAngleMeterLJ.minValue, ljAngleMeterLJ.maxValue, 0, 200), 20);
        ljAngleMeterLJ.value += ljAngleMeterLJ.increasing ? ljAngleMeterLJ.speed : -ljAngleMeterLJ.speed;
        if (ljAngleMeterLJ.value >= ljAngleMeterLJ.maxValue || ljAngleMeterLJ.value <= ljAngleMeterLJ.minValue) {
            ljAngleMeterLJ.increasing = !ljAngleMeterLJ.increasing;
        }
    } else if (ljPhase === 'flight') {
        drawPlayer8Bit(ljPlayerX, ljPlayerY, player.size, "jumping_arch");
        
        // Update physics
        ljPlayerX += ljJumpVX;
        ljPlayerY += ljJumpVY;
        ljJumpVY += ljGravityLJ;
        
        // Check landing
        if (ljPlayerY > height * 0.75) {
            ljLandingX = ljPlayerX;
            ljDistance = (ljLandingX - ljFoulLineX) / 20; // Scale to meters
            ljPhase = 'result';
            if (bestScores.LONG_JUMP === null || ljDistance > bestScores.LONG_JUMP) {
                bestScores.LONG_JUMP = ljDistance;
            }
        }
    }
}

function drawDiscus() {
    drawStadiumBackground(color(30, 70, 60), color(40, 60, 50));
    
    if (discusPhase === 'instructions') {
        showInstructions("DISCUS:\n1. Press SPACE to start\n2. Press SPACE to set power\n3. Press SPACE to set angle", resetDiscus);
        return;
    }
    
    if (discusPhase === 'result') {
        showResult("Discus", `Distance: ${discusDistanceD.toFixed(2)}m`, resetDiscus, () => {discusPhase = 'instructions';});
        return;
    }
    
    // Draw circle
    noFill(); stroke(255); strokeWeight(pixelUnit/2);
    ellipse(discusPlayerX, height * 0.6, player.size * 4, player.size * 4);
    
    // Draw player and discus
    if (discusPhase === 'spin') {
        discusArmAngle += 0.1;
        discusCurrentPowerSetting = min(discusMaxPower, discusCurrentPowerSetting + 0.5);
        drawPlayer8Bit(discusPlayerX, discusPlayerY, player.size, "spin_discus", discusArmAngle);
        
        // Power meter
        fill(0, 0, 0, 80); rect(width/2 - 100, 30, 200, 20);
        fill(30, 100, 100); 
        rect(width/2 - 100, 30, map(discusCurrentPowerSetting, 0, discusMaxPower, 0, 200), 20);
    } else if (discusPhase === 'angle') {
        drawPlayer8Bit(discusPlayerX, discusPlayerY, player.size, "discus_throw_angle");
        
        // Angle meter
        fill(0, 0, 0, 80); rect(width/2 - 100, 30, 200, 20);
        fill(200, 80, 100); 
        rect(width/2 - 100, 30, map(discusAngleMeterD.value, discusAngleMeterD.minValue, discusAngleMeterD.maxValue, 0, 200), 20);
        discusReleaseAngleD = discusAngleMeterD.value;
        discusAngleMeterD.value += discusAngleMeterD.increasing ? discusAngleMeterD.speed : -discusAngleMeterD.speed;
        if (discusAngleMeterD.value >= discusAngleMeterD.maxValue || discusAngleMeterD.value <= discusAngleMeterD.minValue) {
            discusAngleMeterD.increasing = !discusAngleMeterD.increasing;
        }
    } else if (discusPhase === 'flight') {
        // Draw discus
        fill(200, 30, 80);
        ellipse(discusX, discusY, player.size * 0.4, player.size * 0.3);
        
        // Update physics
        discusX += discusVX;
        discusY += discusVY;
        discusVY += discusGravityD;
        
        // Check landing
        if (discusY > height * 0.6) {
            discusLandingX = discusX;
            discusDistanceD = (discusLandingX - discusPlayerX) / 15; // Scale to meters
            discusPhase = 'result';
            if (bestScores.DISCUS === null || discusDistanceD > bestScores.DISCUS) {
                bestScores.DISCUS = discusDistanceD;
            }
        }
    }
}

function drawHighJump() {
    drawStadiumBackground(color(30, 70, 60), color(40, 60, 50));
    
    if (hjPhase === 'instructions') {
        showInstructions(`HIGH JUMP (${hjBarHeight}cm):\n1. Press SPACE to start\n2. Alternate LEFT/RIGHT arrows to run\n3. Press SPACE at takeoff to jump\n4. Time power and angle`, resetHighJump);
        return;
    }
    
    if (hjPhase === 'result') {
        let resultText = hjBarCleared ? 
            `Cleared ${hjBarHeight}cm!` : 
            `Failed at ${hjBarHeight}cm\n(${hjAttemptsLeft} attempts left)`;
        showResult("High Jump", resultText, resetHighJump, () => {hjPhase = 'instructions';});
        return;
    }
    
    // Draw runway
    noStroke(); fill(200, 60, 50);
    rect(50, height * 0.75 - pixelUnit, width * 0.4, pixelUnit * 2);
    
    // Draw bar and standards
    let barY = height * 0.75 - hjBarHeight / 3;
    stroke(255); strokeWeight(pixelUnit);
    line(width * 0.5, barY, width * 0.6, barY); // Bar
    
    stroke(150, 60, 80); strokeWeight(pixelUnit * 2);
    line(width * 0.5, barY, width * 0.5, height * 0.75); // Left standard
    line(width * 0.6, barY, width * 0.6, height * 0.75); // Right standard
    
    if (hjPhase === 'run') {
        drawPlayer8Bit(hjPlayerX, hjPlayerY, player.size, "running");
        hjPlayerX += hjRunSpeed;
        hjRunSpeed = max(0, hjRunSpeed - 0.05); // Reduced deceleration
    } else if (hjPhase === 'power') {
        drawPlayer8Bit(hjPlayerX, hjPlayerY, player.size, "jumping_power");
        
        // Power meter
        fill(0, 0, 0, 80); rect(width/2 - 100, 30, 200, 20);
        fill(0, 100, 100); 
        rect(width/2 - 100, 30, map(hjPowerMeter.value, 0, hjPowerMeter.maxValue, 0, 200), 20);
        hjPowerMeter.value += hjPowerMeter.increasing ? hjPowerMeter.speed : -hjPowerMeter.speed;
        if (hjPowerMeter.value >= hjPowerMeter.maxValue || hjPowerMeter.value <= 0) {
            hjPowerMeter.increasing = !hjPowerMeter.increasing;
        }
    } else if (hjPhase === 'angle') {
        drawPlayer8Bit(hjPlayerX, hjPlayerY, player.size, "jumping_power");
        
        // Angle meter
        fill(0, 0, 0, 80); rect(width/2 - 100, 30, 200, 20);
        fill(0, 50, 100); 
        rect(width/2 - 100, 30, map(hjAngleMeterHJ.value, hjAngleMeterHJ.minValue, hjAngleMeterHJ.maxValue, 0, 200), 20);
        hjAngleMeterHJ.value += hjAngleMeterHJ.increasing ? hjAngleMeterHJ.speed : -hjAngleMeterHJ.speed;
        if (hjAngleMeterHJ.value >= hjAngleMeterHJ.maxValue || hjAngleMeterHJ.value <= hjAngleMeterHJ.minValue) {
            hjAngleMeterHJ.increasing = !hjAngleMeterHJ.increasing;
        }
    } else if (hjPhase === 'flight') {
        drawPlayer8Bit(hjPlayerX, hjPlayerY, player.size, "jumping_arch");
        
        // Update physics
        hjPlayerX += hjJumpVX;
        hjPlayerY += hjJumpVY;
        hjJumpVY += hjGravityHJ;
        
        // Check bar clearance
        let barCleared = false;
        if (hjPlayerX > width * 0.5 && hjPlayerX < width * 0.6) {
            barCleared = hjPlayerY < barY - player.size / 2;
        }
        
        // Check landing
        if (hjPlayerY > height * 0.75) {
            hjBarCleared = barCleared;
            if (hjBarCleared) {
                hjCurrentMaxHeight = hjBarHeight;
            } else {
                hjAttemptsLeft--;
                if (hjAttemptsLeft <= 0) {
                    // Failed all attempts
                }
            }
            hjPhase = 'result';
        }
    }
}

function drawSwimming() {
    drawPoolBackground();
    
    if (swPhase === 'instructions') {
        showInstructions("SWIMMING:\n1. Press SPACE to start\n2. Alternate UP/DOWN arrows to swim\n3. Manage stamina", resetSwimming);
        return;
    }
    
    if (swPhase === 'result') {
        showResult("Swimming", `Time: ${swFinalTime.toFixed(2)}s`, resetSwimming, () => {swPhase = 'instructions';});
        return;
    }
    
    // Draw lane dividers (already in pool background)
    
    // Draw swimmer
    let swimState = "idle";
    if (swSpeed > 0.1) {
        swimState = "running"; // Reuse running animation for swimming
    }
    drawPlayer8Bit(width/2, swPlayerY, player.size, swimState);
    
    // Move swimmer
    swPlayerY -= swSpeed;
    swSpeed = max(0, swSpeed - 0.03); // Water resistance
    
    // Stamina bar
    fill(0, 0, 0, 80); rect(10, 10, 150, 15);
    fill(30, 100, 100); 
    rect(10, 10, map(swStamina, 0, swMaxStamina, 0, 150), 15);
    
    // Regenerate stamina
    swStamina = min(swMaxStamina, swStamina + swStaminaRegen);
    
    // Check if finished
    if (swPlayerY <= swFinishLineY && swPhase === 'swim') {
        swPhase = 'result';
        swFinalTime = (millis() - swStartTime) / 1000;
        if (bestScores.SWIMMING === null || swFinalTime < bestScores.SWIMMING) {
            bestScores.SWIMMING = swFinalTime;
        }
    }
}

function drawSkating() {
    drawIceRinkBackground();
    
    if (skPhase === 'instructions') {
        showInstructions("SPEED SKATING:\n1. Press SPACE to start charging\n2. Release SPACE to skate\n3. Press SPACE or RIGHT ARROW for speed boosts\n4. Manage effort", resetSkating);
        return;
    }
    
    if (skPhase === 'result') {
        showResult("Speed Skating", `Time: ${skFinalTime_sk.toFixed(2)}s`, resetSkating, () => {skPhase = 'instructions';});
        return;
    }
    
    // Draw track
    stroke(0, 0, 70); strokeWeight(pixelUnit);
    noFill();
    rect(100, height * 0.5, width - 200, height * 0.3);
    
    // Draw skater
    let skaterState = skIsCharging ? "jumping_power" : "running";
    drawPlayer8Bit(skPlayerX, height * 0.65, player.size, skaterState);
    
    // Move skater
    skPlayerX += skSpeed;
    skSpeed = max(0, skSpeed - 0.02); // Friction
    
    // Effort bar
    fill(0, 0, 0, 80); rect(10, 10, 150, 15);
    fill(210, 80, 100); 
    rect(10, 10, map(skEffort, 0, skMaxEffort, 0, 150), 15);
    
    // Regenerate effort
    skEffort = min(skMaxEffort, skEffort + skEffortRegen);
    
    // Display timer
    if (skPhase === 'glide' || skPhase === 'charge') {
        let currentTime = (millis() - skStartTime) / 1000;
        fill(0, 0, 100); textSize(24);
        text(`Time: ${currentTime.toFixed(2)}s`, width/2, 30);
    }
    
    // Check if finished
    if (skPlayerX >= skFinishLineX_sk && (skPhase === 'glide' || skPhase === 'charge')) {
        skPhase = 'result';
        skFinalTime_sk = (millis() - skStartTime) / 1000;
        if (bestScores.SKATING === null || skFinalTime_sk < bestScores.SKATING) {
            bestScores.SKATING = skFinalTime_sk;
        }
    }
}

function drawShooting() {
    drawShootingRangeBackground();
    
    if (shPhase === 'instructions') {
        showInstructions("SHOOTING:\n1. Use ARROW KEYS or mouse to aim\n2. Click or press SPACE to shoot\n3. Score as many points as possible in 30 seconds", resetShooting);
        return;
    }
    
    if (shPhase === 'result') {
        showResult("Shooting", `Score: ${shScore} points`, resetShooting, () => {shPhase = 'instructions';});
        return;
    }
    
    // Calculate time remaining
    if (shStartTime > 0) {
        shTimeLeft = shGameDuration - (millis() - shStartTime) / 1000;
        if (shTimeLeft <= 0) {
            shTimeLeft = 0;
            shPhase = 'result';
            if (bestScores.SHOOTING === null || shScore > bestScores.SHOOTING) {
                bestScores.SHOOTING = shScore;
            }
        }
    }
    
    // Draw targets
    for (let i = 0; i < shTargets.length; i++) {
        let t = shTargets[i];
        if (t.active) {
            noStroke();
            fill(t.color1); ellipse(t.x, t.y, t.size, t.size);
            fill(t.color2); ellipse(t.x, t.y, t.size * 0.7, t.size * 0.7);
            fill(t.color3); ellipse(t.x, t.y, t.size * 0.3, t.size * 0.3);
        }
    }
    
    // Draw reticle
    stroke(255, 0, 0); strokeWeight(pixelUnit/2); noFill();
    ellipse(shReticleX, shReticleY, pixelUnit * 3, pixelUnit * 3);
    line(shReticleX - pixelUnit * 5, shReticleY, shReticleX - pixelUnit * 1.5, shReticleY);
    line(shReticleX + pixelUnit * 1.5, shReticleY, shReticleX + pixelUnit * 5, shReticleY);
    line(shReticleX, shReticleY - pixelUnit * 5, shReticleX, shReticleY - pixelUnit * 1.5);
    line(shReticleX, shReticleY + pixelUnit * 1.5, shReticleX, shReticleY + pixelUnit * 5);
    
    // Update reticle position - Use both mouse and arrow keys
    // The game still responds to mouse movements as original, but also supports arrow keys
    if (keyIsDown(LEFT_ARROW)) { shReticleX -= 5; }
    if (keyIsDown(RIGHT_ARROW)) { shReticleX += 5; }
    if (keyIsDown(UP_ARROW)) { shReticleY -= 5; }
    if (keyIsDown(DOWN_ARROW)) { shReticleY += 5; }
    
    // If mouse moved, use mouse position (overrides arrow keys)
    if (abs(mouseX - pmouseX) > 0 || abs(mouseY - pmouseY) > 0) {
        shReticleX = mouseX;
        shReticleY = mouseY;
    }
    
    // Keep reticle on screen
    shReticleX = constrain(shReticleX, 0, width);
    shReticleY = constrain(shReticleY, 0, height);
    
    // Draw HUD
    fill(0, 0, 0, 80); rect(10, 10, 300, 30);
    fill(0, 0, 100); textSize(pixelUnit * 2);
    text(`Score: ${shScore} | Ammo: ${shAmmo} | Time: ${shTimeLeft.toFixed(1)}s`, 160, 25);
}
function drawArchery() {
    drawStadiumBackground(color(140, 70, 60), color(120, 40, 50));
    if (archPhase === 'instructions') {
        showInstructions("ARCHERY:\n1. UP/DOWN to aim\n2. Hold SPACE to power\n3. Release to shoot\n\nSPACE to start.", resetArchery);
        return;
    }
    if (archPhase === 'result') {
        showResult("Archery", `${archScore} points\n${archArrows} arrows left`, resetArchery, () => {archPhase = 'instructions';});
        return;
    }
    
    // Draw target
    noStroke();
    fill(0, 0, 0); ellipse(archTargetCenterX, archTargetCenterY, archTargetSize * 1.05, archTargetSize * 1.05);
    fill(0, 0, 100); ellipse(archTargetCenterX, archTargetCenterY, archTargetSize, archTargetSize);
    fill(0, 100, 100); ellipse(archTargetCenterX, archTargetCenterY, archTargetSize * 0.8, archTargetSize * 0.8);
    fill(0, 0, 100); ellipse(archTargetCenterX, archTargetCenterY, archTargetSize * 0.6, archTargetSize * 0.6);
    fill(0, 100, 100); ellipse(archTargetCenterX, archTargetCenterY, archTargetSize * 0.4, archTargetSize * 0.4);
    fill(0, 0, 100); ellipse(archTargetCenterX, archTargetCenterY, archTargetSize * 0.2, archTargetSize * 0.2);
    
    // Draw archer and bow
    const archerX = archArcherX;
    drawPlayer8Bit(archerX, archCursorY, player.size, "idle");
    
    // Draw bow and arrow
    stroke(120, 50, 40); strokeWeight(pixelUnit * 0.5);
    noFill();
    let bowCurve = map(archPower, 0, archMaxPower, 0, pixelUnit * 2);
    beginShape();
    vertex(archerX + player.size * 0.5, archCursorY - player.size * 0.4);
    bezierVertex(
        archerX + player.size * 0.5 + bowCurve, archCursorY - player.size * 0.2,
        archerX + player.size * 0.5 + bowCurve, archCursorY + player.size * 0.2, 
        archerX + player.size * 0.5, archCursorY + player.size * 0.4
    );
    endShape();
    stroke(0); strokeWeight(pixelUnit * 0.3);
    line(archerX + player.size * 0.5, archCursorY - player.size * 0.4, 
         archerX + player.size * 0.5, archCursorY + player.size * 0.4);
    
    if (archPower > 0) {
        // Draw arrow
        stroke(200, 30, 80); strokeWeight(pixelUnit * 0.3);
        line(archerX + player.size * 0.5, archCursorY, 
             archerX + player.size * 0.5 - map(archPower, 0, archMaxPower, 0, player.size), archCursorY);
        // Arrow head
        fill(200, 30, 80); noStroke();
        triangle(
            archerX + player.size * 0.5 - map(archPower, 0, archMaxPower, 0, player.size), archCursorY - pixelUnit * 0.5,
            archerX + player.size * 0.5 - map(archPower, 0, archMaxPower, 0, player.size) - pixelUnit, archCursorY,
            archerX + player.size * 0.5 - map(archPower, 0, archMaxPower, 0, player.size), archCursorY + pixelUnit * 0.5
        );
    }
    
    // Wind indicator
    noStroke();
    fill(0, 0, 0, 50); rect(pixelUnit, pixelUnit * 2, pixelUnit * 40, pixelUnit * 6, pixelUnit);
    fill(0, 0, 100); textSize(pixelUnit * 2.2); 
    text(`Wind: ${archWindSpeed > 0 ? "→" : "←"} ${abs(archWindSpeed).toFixed(1)}`, pixelUnit * 20, pixelUnit * 5);
    
    // Arrows & score
    fill(0, 0, 0, 50); rect(width - pixelUnit * 36, pixelUnit * 2, pixelUnit * 35, pixelUnit * 6, pixelUnit);
    fill(0, 0, 100);
    text(`Arrows: ${archArrows} | Score: ${archScore}`, width - pixelUnit * 18.5, pixelUnit * 5);
    
    // Power meter if charging
    if (archPhase === 'charging') {
        fill(0, 0, 0, 50); rect(width/2 - pixelUnit * 30, 10, pixelUnit * 60, pixelUnit * 16, pixelUnit);
        fill(0, 0, 100); textSize(pixelUnit * 2.5);
        text("Power", width/2, 10 + pixelUnit * 4.5);
        
        rectMode(CORNER); fill(0, 0, 30);
        rect(width/2 - pixelUnit * 15, 10 + pixelUnit * 8.5, pixelUnit * 30, pixelUnit * 4);
        fill(30, 100, 100);
        rect(width/2 - pixelUnit * 15, 10 + pixelUnit * 8.5, map(archPower, 0, archMaxPower, 0, pixelUnit * 30), pixelUnit * 4);
        
        if (keyIsDown(32)) { // SPACE key
            archPower = min(archMaxPower, archPower + 1.5);
        }
    }
    
    // Handle arrow flight
    if (archPhase === 'flight') {
        // Draw the flying arrow
        let arrowX = archPowerMeter.value;
        let arrowY = archCursorY + archWindSpeed * arrowX / 40;
        
        push();
        translate(arrowX, arrowY);
        rotate(atan2(archWindSpeed, 40)); // Angle the arrow based on wind
        
        // Draw arrow shaft
        stroke(200, 30, 80); strokeWeight(pixelUnit * 0.3);
        line(0, 0, -player.size, 0);
        
        // Arrow head
        fill(200, 30, 80); noStroke();
        triangle(0, -pixelUnit * 0.5, pixelUnit, 0, 0, pixelUnit * 0.5);
        
        // Arrow fletchings
        fill(0, 0, 70);
        triangle(-player.size + pixelUnit, -pixelUnit * 0.8, -player.size + pixelUnit * 0.5, 0, -player.size + pixelUnit, pixelUnit * 0.8);
        pop();
        
        // Move the arrow
        archPowerMeter.value += 8;
        
        // Check if arrow hit the target
        if (arrowX >= archTargetCenterX) {
            // Calculate distance from center
            let distFromCenter = dist(archTargetCenterX, archTargetCenterY, arrowX, arrowY);
            
            // Scoring based on distance from center
            if (distFromCenter < archTargetSize * 0.1) {
                archScore += 10; // Bullseye
            } else if (distFromCenter < archTargetSize * 0.2) {
                archScore += 9;
            } else if (distFromCenter < archTargetSize * 0.3) {
                archScore += 7;
            } else if (distFromCenter < archTargetSize * 0.4) {
                archScore += 5;
            } else if (distFromCenter < archTargetSize * 0.5) {
                archScore += 3;
            } else if (distFromCenter < archTargetSize * 0.55) {
                archScore += 1;
            }
            
            archArrows--;
            if (archArrows <= 0) {
                archPhase = 'result';
                if (bestScores.ARCHERY === null || archScore > bestScores.ARCHERY) {
                    bestScores.ARCHERY = archScore;
                }
            } else {
                archPhase = 'aiming';
                archPower = 0;
            }
        }
        
        // If arrow missed the target completely
        if (arrowX > width + player.size || arrowY < 0 || arrowY > height) {
            archArrows--;
            if (archArrows <= 0) {
                archPhase = 'result';
                if (bestScores.ARCHERY === null || archScore > bestScores.ARCHERY) {
                    bestScores.ARCHERY = archScore;
                }
            } else {
                archPhase = 'aiming';
                archPower = 0;
            }
        }
    }
}
function drawFootball() {
    drawStadiumBackground(color(110, 80, 60), color(0, 70, 30));
    if (fbPhase === 'instructions') {
        showInstructions("FOOTBALL PENALTY:\n1. Use ARROW KEYS to aim at target\n2. Press SPACE to kick\n3. Score goals past the goalkeeper\n\nSPACE to start.", resetFootball);
        return;
    }
    if (fbPhase === 'result') {
        showResult("Football", `${fbScore} goals`, resetFootball, () => {fbPhase = 'instructions';});
        return;
    }
    
    // Draw goal
    noFill(); stroke(0, 0, 100); strokeWeight(pixelUnit);
    rect(fbGoalX, fbGoalY, fbGoalWidth, fbGoalHeight);
    // Goal net
    stroke(0, 0, 100); strokeWeight(pixelUnit/3);
    for(let x = 0; x <= fbGoalWidth; x += pixelUnit * 1.5) {
        line(fbGoalX + x, fbGoalY, fbGoalX + x, fbGoalY + fbGoalHeight);
    }
    for(let y = 0; y <= fbGoalHeight; y += pixelUnit * 1.5) {
        line(fbGoalX, fbGoalY + y, fbGoalX + fbGoalWidth, fbGoalY + y);
    }
    
    // Draw goalkeeper
    fbGoalkeeperY = fbGoalY + fbGoalHeight/2;
    if (fbPhase === 'aiming') {
        // Goalkeeper moves slightly based on cursor position
        fbGoalkeeperY = map(
            fbCursorY, 
            fbGoalY, fbGoalY + fbGoalHeight,
            fbGoalY + fbGoalHeight * 0.2, fbGoalY + fbGoalHeight * 0.8,
            true
        );
    } else if (fbPhase === 'kicked') {
        // Goalkeeper tries to save
        fbGoalkeeperY = map(
            fbBallY,
            fbGoalY, fbGoalY + fbGoalHeight,
            fbGoalY + pixelUnit * 2, fbGoalY + fbGoalHeight - pixelUnit * 2,
            true
        );
    }
    
    drawPlayer8Bit(fbGoalkeeperX, fbGoalkeeperY, player.size, "jumping_power", 0, false);
    
    // Draw player
    if (fbPhase === 'aiming' || fbPhase === 'ready') {
        drawPlayer8Bit(fbBallX - player.size * 0.8, fbBallY, player.size, fbPhase === 'ready' ? "jumping_power" : "idle");
    }
    
    // Draw ball - MOVED EARLIER
    noStroke(); fill(0, 0, 100);
    ellipse(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6);
    
    // Ball rotation visual effect (only if kicked)
    if (fbPhase === 'kicked') {
        let rotateFrames = floor(globalFrameCount / 3) % 4;
        stroke(0); strokeWeight(pixelUnit/4); noFill();
        if (rotateFrames === 0) {
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, 0, PI/2);
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI, PI*3/2);
        } else if (rotateFrames === 1) {
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI/4, PI*3/4);
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI*5/4, PI*7/4);
        } else if (rotateFrames === 2) {
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI/2, PI);
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI*3/2, PI*2);
        } else {
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI*3/4, PI*5/4);
            arc(fbBallX, fbBallY, player.size * 0.6, player.size * 0.6, PI*7/4, PI*9/4);
        }
    }
    
    if (fbPhase === 'aiming') {
        // Manual aim with arrow keys
        if (keyIsDown(LEFT_ARROW)) {
            fbCursorX -= 3;
        } else if (keyIsDown(RIGHT_ARROW)) {
            fbCursorX += 3;
        }
        
        if (keyIsDown(UP_ARROW)) {
            fbCursorY -= 3;
        } else if (keyIsDown(DOWN_ARROW)) {
            fbCursorY += 3;
        }
        
        // If no keys are pressed, use automatic movement
        if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
            fbCursorX += fbCursorSpeedX;
            fbCursorY += fbCursorSpeedY;
        }
        
        // Bounce cursor at boundaries
        if (fbCursorX < fbGoalX || fbCursorX > fbGoalX + fbGoalWidth) {
            fbCursorSpeedX *= -1;
            fbCursorX = constrain(fbCursorX, fbGoalX, fbGoalX + fbGoalWidth);
        }
        
        if (fbCursorY < fbGoalY || fbCursorY > fbGoalY + fbGoalHeight) {
            fbCursorSpeedY *= -1;
            fbCursorY = constrain(fbCursorY, fbGoalY, fbGoalY + fbGoalHeight);
        }
        
        // Draw cursor
        stroke(0, 100, 100); noFill(); strokeWeight(pixelUnit/2);
        ellipse(fbCursorX, fbCursorY, player.size * 0.7, player.size * 0.7);
        line(fbCursorX - player.size * 0.5, fbCursorY, fbCursorX + player.size * 0.5, fbCursorY);
        line(fbCursorX, fbCursorY - player.size * 0.5, fbCursorX, fbCursorY + player.size * 0.5);
    } else if (fbPhase === 'kicked') {
        // Move the ball
        fbBallX += fbBallVX;
        fbBallY += fbBallVY;
        fbBallVY += fbGravity; // Apply gravity
        
        // Ball rotation visual effect is already handled by the ball drawing section

        const ballRadius = player.size * 0.3;
        const goalFrontEdgeY = fbGoalY + fbGoalHeight; // Bottom edge of goal on screen (ball approaches from higher Y)
        const goalBackEdgeY = fbGoalY;               // Top edge of goal on screen (back of net)
        const goalLeftEdgeX = fbGoalX;
        const goalRightEdgeX = fbGoalX + fbGoalWidth;

        // Check for events IF the ball's state is still 'kicked'
        if (fbPhase === 'kicked') { // Ensure we only process this logic once per outcome
            // Condition 1: Ball reaches goal's vertical plane (between front and back edges)
            // Check if the ball's leading edge (fbBallY - ballRadius for upward moving ball) has reached the goal's front plane
            if (fbBallVY < 0 && (fbBallY - ballRadius) <= goalFrontEdgeY && (fbBallY + ballRadius) >= goalBackEdgeY) {
                // Ball is vertically within the goal's depth. Now check horizontal position.
                if ((fbBallX + ballRadius) >= goalLeftEdgeX && (fbBallX - ballRadius) <= goalRightEdgeX) {
                    // Ball is horizontally aligned with the goal posts.
                    // Check for goalkeeper save.
                    // Effective save distance: sum of keeper's effective radius and ball's radius
                    if (dist(fbBallX, fbBallY, fbGoalkeeperX, fbGoalkeeperY) < (player.size * 0.7 + ballRadius)) { 
                        fbPhase = 'result'; // Saved
                        // Optional: Add bounce physics here for visual feedback
                        // Example: fbBallVY *= -0.5; fbBallVX = (fbBallX - fbGoalkeeperX) * 0.1; 
                    } else {
                        // Not saved, and within X/Y bounds of goal = GOAL!
                        // Consider a goal scored if the center of the ball passes into the goal area.
                        // For a ball moving upwards (Y decreasing), this means fbBallY is less than goalFrontEdgeY.
                        if (fbBallY < goalFrontEdgeY ) { // Check if ball center is past the front line
                           fbScore++;
                           if (bestScores.FOOTBALL === null || fbScore > bestScores.FOOTBALL) {
                               bestScores.FOOTBALL = fbScore;
                           }
                           fbPhase = 'result'; // Transition to result phase to show score
                        }
                        // If it's in the mouth but not fully past line, it continues to fly for this frame.
                        // It should be caught in the next frame if conditions are still met.
                    }
                } else {
                    // Ball is at goal depth (Y) but missed wide (X is outside posts).
                    fbPhase = 'result'; // Missed wide
                }
            }
            // Condition 2: Ball went clearly over the bar or past the goal's Y-plane without scoring
            else if (fbBallVY < 0 && (fbBallY + ballRadius) < goalBackEdgeY) { // Ball's bottom edge went above goal's top edge
                fbPhase = 'result'; // Missed (over the top)
            }
            // Condition 3: Ball went off general screen bounds (sides or too far behind player)
            else if (fbBallX + ballRadius < 0 || fbBallX - ballRadius > width || fbBallY - ballRadius > height) {
                fbPhase = 'result'; // Off screen
            }
        }
    }
    
    // Score display
    noStroke(); fill(0, 0, 0, 50);
    rect(width/2 - pixelUnit * 20, pixelUnit * 2, pixelUnit * 40, pixelUnit * 6, pixelUnit);
    fill(0, 0, 100); textSize(pixelUnit * 2.5);
    text(`Score: ${fbScore} Goals`, width/2, pixelUnit * 5);
}


function keyPressed() {
    if (key === 'm' || key === 'M') {
        if (currentSport !== 'MENU') {
             if ( (currentSport === 'RUNNING' && (runStartTime === 0 || runFinished)) ||
                  (currentSport === 'LONG_JUMP' && (ljPhase === 'instructions' || ljPhase === 'result')) ||
                  (currentSport === 'DISCUS' && (discusPhase === 'instructions' || discusPhase === 'result')) ||
                  (currentSport === 'HIGH_JUMP' && (hjPhase === 'instructions' || hjPhase === 'result')) ||
                  (currentSport === 'SWIMMING' && (swPhase === 'instructions' || swPhase === 'result')) ||
                  (currentSport === 'SKATING' && (skPhase === 'instructions' || skPhase === 'result')) ||
                  (currentSport === 'SHOOTING' && (shPhase === 'instructions' || shPhase === 'result')) ||
                  (currentSport === 'ARCHERY' && (archPhase === 'instructions' || archPhase === 'result')) ||
                  (currentSport === 'FOOTBALL' && (fbPhase === 'instructions' || fbPhase === 'result'))
                ) { resetAllSports(); currentSport = 'MENU'; }
        } return;
    }
    if (keyCode === 32) { // SPACE BAR
        if (currentSport === 'RUNNING') {
            if (runStartTime === 0 && !runFinished) { resetRunning(); runStartTime = millis(); }
            else if (runFinished) { resetRunning(); runStartTime = millis(); if(window.retryCallback) window.retryCallback(); }
        } else if (currentSport === 'LONG_JUMP') {
            if (ljPhase === 'instructions') { resetLongJump(); ljPhase = 'run'; }
            else if (ljPhase === 'result') { resetLongJump(); if(window.retryCallback) window.retryCallback(); else ljPhase = 'instructions'; }
            else if (ljPhase === 'run' && ljPlayerX >= ljFoulLineX - player.size * 1.5 && ljPlayerX <= ljFoulLineX + player.size*0.5) {
                ljTakeoffX = ljPlayerX; if (ljTakeoffX > ljFoulLineX) { ljDistance = "FOUL"; ljPhase = 'result'; return; }
                ljPhase = 'takeoff_power'; ljPowerMeter.value = 0; ljPowerMeter.increasing = true;
            } else if (ljPhase === 'run' && ljPlayerX > ljFoulLineX + player.size*0.5) { ljDistance = "FOUL (Late)"; ljPhase = 'result'; }
            else if (ljPhase === 'takeoff_power') { ljPhase = 'takeoff_angle'; ljAngleMeterLJ.value = ljAngleMeterLJ.minValue; ljAngleMeterLJ.increasing = true;}
            else if (ljPhase === 'takeoff_angle') {
                let jumpAngleRad = radians(ljAngleMeterLJ.value); let totalPower = (ljRunSpeed * 1.6 + ljPowerMeter.value / 7);
                ljJumpVX = totalPower * cos(jumpAngleRad); ljJumpVY = -totalPower * sin(jumpAngleRad);
                ljPlayerX = ljTakeoffX; ljPlayerY = height * 0.75; ljPhase = 'flight';
            }
        } else if (currentSport === 'DISCUS') {
            if (discusPhase === 'instructions') { resetDiscus(); discusPhase = 'spin'; discusCurrentPowerSetting = 0; discusArmAngle = 0; }
            else if (discusPhase === 'result') { resetDiscus(); if(window.retryCallback) window.retryCallback(); else discusPhase = 'instructions'; }
            else if (discusPhase === 'spin') { // Set power when space is pressed
                discusLockedPower = discusCurrentPowerSetting;
                discusPhase = 'angle';
                discusAngleMeterD.value = discusAngleMeterD.minValue; discusAngleMeterD.increasing = true;
            }
            else if (discusPhase === 'angle') { // This is the throw action
                let throwAngleRad = radians(discusReleaseAngleD); // Physics angle (0 deg = right, 90 deg = up)
                let throwStrength = discusLockedPower / 6;
                discusVX = throwStrength * cos(throwAngleRad);
                discusVY = -throwStrength * sin(throwAngleRad); // Negative for upward Y in p5

                // Calculate discus starting position to match player's hand based on sprite visuals
                // Player sprite arm angle is radians(-discusReleaseAngleD)
                // Arm length (distance from shoulder to hand/discus center) is player.size * 0.48 (derived from armH * 1.2 in drawPlayer8Bit)
                // Shoulder Y position: discusPlayerY (player's base Y) - player.size/2 (to body center) - bodyH*0.1 (shoulder offset from body center)
                // bodyH = player.size * 0.45, so bodyH*0.1 = player.size * 0.045
                // Effective shoulder Y from discusPlayerY = discusPlayerY - player.size * 0.5 - player.size * 0.045 = discusPlayerY - player.size * 0.545

                let armAngleForSprite = radians(-discusReleaseAngleD); // This is the angle the arm is visually drawn at
                let armLength = player.size * 0.48; 
                let shoulderYRelativeToPlayerOrigin = player.size * 0.545;

                discusX = discusPlayerX + armLength * cos(armAngleForSprite);
                discusY = (discusPlayerY - shoulderYRelativeToPlayerOrigin) + armLength * sin(armAngleForSprite);
                
                discusPhase = 'flight';
            }
        } else if (currentSport === 'HIGH_JUMP') {
            if (hjPhase === 'instructions') { resetHighJump(); hjPhase = 'run'; }
            else if (hjPhase === 'result') { resetHighJump(); if(window.retryCallback) window.retryCallback(); else hjPhase = 'instructions'; }
            else if (hjPhase === 'run' && hjPlayerX >= hjTakeoffX - player.size && hjPlayerX <= hjTakeoffX + player.size*0.5) {
                hjPlayerX = hjTakeoffX; // Snap to takeoff
                hjPhase = 'power'; hjPowerMeter.value = 0; hjPowerMeter.increasing = true;
            } else if (hjPhase === 'power') {
                hjPhase = 'angle'; hjAngleMeterHJ.value = hjAngleMeterHJ.minValue; hjAngleMeterHJ.increasing = true;
            } else if (hjPhase === 'angle') {
                let jumpAngleRad = radians(hjAngleMeterHJ.value);
                let totalPower = (hjRunSpeed * 0.9 + hjPowerMeter.value / 5.5);
                hjJumpVX = totalPower * cos(jumpAngleRad) * 0.35;
                hjJumpVY = -totalPower * sin(jumpAngleRad) * 1.2;
                hjPlayerX = hjTakeoffX; hjPlayerY = height * 0.75;
                hjBarCleared = false;
                hjPhase = 'flight';
            }
        } else if (currentSport === 'SWIMMING') {
             if (swPhase === 'instructions') { resetSwimming(); swStartTime = millis(); swPhase = 'swim'; }
             else if (swPhase === 'result') { resetSwimming(); if(window.retryCallback)window.retryCallback(); else swPhase = 'instructions'; }
        } else if (currentSport === 'SKATING') {
            if (skPhase === 'instructions') { resetSkating(); skIsCharging = true; skPhase = 'charge'; skStartTime = millis(); }
            else if (skPhase === 'result') { resetSkating(); if(window.retryCallback)window.retryCallback(); else skPhase = 'instructions'; }
            else if (skPhase === 'glide' && skEffort >= skEffortDrainBoost) { skSpeed += 1; skEffort -= skEffortDrainBoost; }
        } else if (currentSport === 'SHOOTING') {
            if (shPhase === 'instructions') { 
                resetShooting(); shStartTime = millis(); shPhase = 'play'; 
            }
            else if (shPhase === 'play' && shAmmo > 0) {
                // Shoot when space is pressed, implementing same functionality as mousePressed
                shAmmo--;
                for (let i = shTargets.length - 1; i >= 0; i--) {
                    let t = shTargets[i];
                    if (t.active && dist(shReticleX, shReticleY, t.x, t.y) < t.size / 2) {
                        shScore += 10; 
                        if (dist(shReticleX, shReticleY, t.x, t.y) < t.size*0.15) shScore += 15; 
                        else if (dist(shReticleX, shReticleY, t.x, t.y) < t.size*0.35) shScore += 5; 
                        spawnNewTarget(i); 
                        break; 
                    }
                }
                if (shAmmo <= 0) { 
                    shPhase = 'result'; 
                    if (bestScores.SHOOTING === null || shScore > bestScores.SHOOTING) { 
                        bestScores.SHOOTING = shScore; 
                    } 
                }
            }
            else if (shPhase === 'result') {
                resetShooting(); if(window.retryCallback)window.retryCallback(); else shPhase = 'instructions';
            }
        } else if (currentSport === 'ARCHERY') {
            if (archPhase === 'instructions') { resetArchery(); archPhase = 'aiming'; }
            else if (archPhase === 'result') { resetArchery(); if(window.retryCallback)window.retryCallback(); else archPhase = 'instructions'; }
            else if (archPhase === 'aiming') { archPhase = 'charging'; }
        } else if (currentSport === 'FOOTBALL') {
            console.log(`Football space press: current fbPhase = ${fbPhase}, keyCode = ${keyCode}`); // DEBUG LOG
            if (fbPhase === 'instructions') {
                resetFootball();
                fbPhase = 'aiming';
                console.log(`Football: phase changed to aiming`); // DEBUG LOG
            } else if (fbPhase === 'result') {
                resetFootball();
                if (window.retryCallback) {
                    window.retryCallback();
                    console.log(`Football: retryCallback called`); // DEBUG LOG
                } else {
                    fbPhase = 'instructions';
                    console.log(`Football: phase changed to instructions (from result)`); // DEBUG LOG
                }
            } else if (fbPhase === 'aiming') {
                // Immediate kick without setTimeout to avoid issues
                fbPhase = 'kicked';
                // Calculate velocity based on the distance and angle to the target
                let dx = fbCursorX - fbBallX;
                let dy = fbCursorY - fbBallY;
                let angle = atan2(dy, dx);
                let power = 12; // Fixed power for consistency
                fbBallVX = cos(angle) * power;
                fbBallVY = sin(angle) * power;
                console.log(`Football kicked! Velocity: ${fbBallVX}, ${fbBallVY}. New phase: ${fbPhase}`); // DEBUG LOG
            }
        }
    }
    // Mashing keys
    if (currentSport === 'RUNNING' && !runFinished && runStartTime > 0) {
        if (keyCode === LEFT_ARROW && runKeyAlternator !== 1) { runSpeed += 0.8; runKeyAlternator = 1; }
        else if (keyCode === RIGHT_ARROW && runKeyAlternator !== 2) { runSpeed += 0.8; runKeyAlternator = 2; }
        if (runSpeed > 10) runSpeed = 10; // Higher max speed
    }
    if ((currentSport === 'LONG_JUMP' && ljPhase === 'run') || (currentSport === 'HIGH_JUMP' && hjPhase === 'run')) {
        let currentSpeed = (currentSport === 'LONG_JUMP') ? ljRunSpeed : hjRunSpeed;
        let currentAlternator = (currentSport === 'LONG_JUMP') ? ljKeyAlternator : hjKeyAlternator;
        let increment = 0.8; let maxSpeed = 12; // Increased speed and max speed
        // Use LEFT/RIGHT arrows for running (also keep A/D as alternative)
        if ((keyCode === LEFT_ARROW || key === 'a' || key === 'A') && currentAlternator !== 1) { 
            currentSpeed += increment; 
            if (currentSport === 'LONG_JUMP') ljKeyAlternator = 1; else hjKeyAlternator = 1; 
        }
        else if ((keyCode === RIGHT_ARROW || key === 'd' || key === 'D') && currentAlternator !== 2) { 
            currentSpeed += increment; 
            if (currentSport === 'LONG_JUMP') ljKeyAlternator = 2; else hjKeyAlternator = 2; 
        }
        if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;
        if (currentSport === 'LONG_JUMP') ljRunSpeed = currentSpeed; else hjRunSpeed = currentSpeed;
    }
    if (currentSport === 'SWIMMING' && swPhase === 'swim' && swStamina > 0) {
        // Use UP/DOWN arrows for swimming (also keep W/S as alternative)
        if ((keyCode === UP_ARROW || key === 'w' || key === 'W') && swKeyAlternator !== 1) { 
            swSpeed += 0.25; 
            swStamina -= swStaminaDrain; 
            swKeyAlternator = 1; 
        }
        else if ((keyCode === DOWN_ARROW || key === 's' || key === 'S') && swKeyAlternator !== 2) { 
            swSpeed += 0.25; 
            swStamina -= swStaminaDrain; 
            swKeyAlternator = 2; 
        }
        if (swSpeed > 3.5) swSpeed = 3.5; if (swStamina < 0) swStamina = 0;
    }
    // Handle Archery aiming
    if (currentSport === 'ARCHERY' && archPhase === 'aiming') {
        if (keyCode === UP_ARROW) { archCursorY -= pixelUnit * 2; }
        else if (keyCode === DOWN_ARROW) { archCursorY += pixelUnit * 2; }
        // Keep cursor within bounds
        archCursorY = constrain(archCursorY, player.size, height - player.size);
    }
}
function keyReleased() {
    if (currentSport === 'RUNNING' && runStartTime > 0 && !runFinished) { 
        if (keyCode === LEFT_ARROW && runKeyAlternator === 1) runKeyAlternator = 0; 
        if (keyCode === RIGHT_ARROW && runKeyAlternator === 2) runKeyAlternator = 0;
    }
    
    if ((currentSport === 'LONG_JUMP' && ljPhase === 'run') || (currentSport === 'HIGH_JUMP' && hjPhase === 'run')) { 
        let currentAlternator = (currentSport === 'LONG_JUMP') ? ljKeyAlternator : hjKeyAlternator; 
        // Handle arrow keys and A/D keys
        if (((keyCode === LEFT_ARROW || key === 'a' || key === 'A') && currentAlternator === 1)) { 
            if (currentSport === 'LONG_JUMP') ljKeyAlternator = 0; 
            else hjKeyAlternator = 0; 
        } 
        if (((keyCode === RIGHT_ARROW || key === 'd' || key === 'D') && currentAlternator === 2)) { 
            if (currentSport === 'LONG_JUMP') ljKeyAlternator = 0; 
            else hjKeyAlternator = 0; 
        } 
    }
    if (currentSport === 'SWIMMING' && swPhase === 'swim') { 
        if ((keyCode === UP_ARROW || key === 'w' || key === 'W') && swKeyAlternator === 1) swKeyAlternator = 0; 
        if ((keyCode === DOWN_ARROW || key === 's' || key === 'S') && swKeyAlternator === 2) swKeyAlternator = 0; 
    }
    if (currentSport === 'SKATING' && skPhase === 'charge' && keyCode === 32) { // SPACE released for Skating Charge
        skIsCharging = false; skPhase = 'glide';
    }
    
    if (currentSport === 'ARCHERY' && archPhase === 'charging' && keyCode === 32) { // SPACE released for Archery
        // When SPACE is released in charging phase, shoot the arrow
        let launchPower = archPower;
        resetArrow();
        archPowerMeter.value = archArcherX + player.size * 0.5; // Starting position of the arrow
        archPhase = 'flight';
        console.log("Arrow shot with power:", launchPower); // Debug logging
    }
}

function mousePressed() {
    if (currentSport === 'MENU') {
        let buttonWidth = min(width * 0.7, 400);
        let buttonHeight = min(height * 0.07, 55);
        let spacing = buttonHeight + pixelUnit * 1.5;
        let totalButtonHeight = SPORTS.length * spacing;
        let startY = max(height / 2 - totalButtonHeight / 2 + buttonHeight / 2, height / 8 + 80);

        for (let i = 0; i < SPORTS.length; i++) {
            let sportNameKey = SPORTS[i];
            let buttonY = startY + i * spacing;
            if (mouseX > width / 2 - buttonWidth / 2 && mouseX < width / 2 + buttonWidth / 2 &&
                mouseY > buttonY - buttonHeight / 2 && mouseY < buttonY + buttonHeight / 2) {
                
                // Reset sport-specific states and scores before switching
                if (sportNameKey === "RUNNING") { resetRunning(); currentSport = "RUNNING"; }
                else if (sportNameKey === "LONG_JUMP") { resetLongJump(); currentSport = "LONG_JUMP"; }
                else if (sportNameKey === "DISCUS") { resetDiscus(); currentSport = "DISCUS"; }
                else if (sportNameKey === "HIGH_JUMP") { resetHighJump(); currentSport = "HIGH_JUMP"; }
                else if (sportNameKey === "SWIMMING") { resetSwimming(); currentSport = "SWIMMING"; }
                else if (sportNameKey === "SKATING") { resetSkating(); currentSport = "SKATING"; }
                else if (sportNameKey === "SHOOTING") { resetShooting(); shScore = 0; currentSport = "SHOOTING"; } // Reset shooting score
                else if (sportNameKey === "ARCHERY") { resetArchery(); archScore = 0; currentSport = "ARCHERY"; } // Reset archery score
                else if (sportNameKey === "FOOTBALL") { 
                    resetFootball(); 
                    fbScore = 0; // Explicitly reset football score for a new session
                    currentSport = "FOOTBALL"; 
                }
                return; // Exit after sport selection
            }
        }
    } else if (currentSport === 'SHOOTING' && shPhase === 'play' && shAmmo > 0) {
        shAmmo--;
        for (let i = shTargets.length - 1; i >= 0; i--) {
            let t = shTargets[i];
            if (t.active && dist(shReticleX, shReticleY, t.x, t.y) < t.size / 2) {
                shScore += 10; 
                if (dist(shReticleX, shReticleY, t.x, t.y) < t.size*0.15) shScore += 15; 
                else if (dist(shReticleX, shReticleY, t.x, t.y) < t.size*0.35) shScore += 5; 
                spawnNewTarget(i); break; 
            }
        }
        if (shAmmo <= 0) { shPhase = 'result'; if (bestScores.SHOOTING === null || shScore > bestScores.SHOOTING) { bestScores.SHOOTING = shScore; } }
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    let previousSport = currentSport; resetAllSports(); currentSport = previousSport; 
    if (currentSport !== 'MENU') { // Re-initialize to instruction phase
        if (currentSport === 'RUNNING') { resetRunning(); } else if (currentSport === 'LONG_JUMP') { resetLongJump(); }
        else if (currentSport === 'DISCUS') { resetDiscus(); } else if (currentSport === 'HIGH_JUMP') { resetHighJump(); }
        else if (currentSport === 'SWIMMING') { resetSwimming(); } else if (currentSport === 'SKATING') { resetSkating(); }
        else if (currentSport === 'SHOOTING') { resetShooting(); } else if (currentSport === 'ARCHERY') { resetArchery(); }
        else if (currentSport === 'FOOTBALL') { resetFootball(); }
    }
    // Update fixed positions not covered by reset if needed
    if (currentSport === 'RUNNING') runFinishLineX = width - 100;
    if (currentSport === 'LONG_JUMP') ljFoulLineX = width * 0.4;
    if (currentSport === 'DISCUS') discusPlayerX = width * 0.2;
    if (currentSport === 'HIGH_JUMP') hjTakeoffX = width * 0.5 - (player.size * 2.8) - player.size;
    if (currentSport === 'SKATING') skFinishLineX_sk = width - 100;
    if (currentSport === 'ARCHERY') {
        archTargetCenterX = width * 0.85;
        archArcherX = width * 0.2;
    }
    if (currentSport === 'FOOTBALL') {
        fbGoalX = width * 0.5 - fbGoalWidth * 0.5;
        fbGoalkeeperX = fbGoalX + fbGoalWidth * 0.5;
    }
}
