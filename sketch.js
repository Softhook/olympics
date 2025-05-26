
let currentSport = 'MENU';
let score = 0;
let globalFrameCount = 0;

// --- Best Scores ---
let bestScores = {
    RUNNING: null, LONG_JUMP: null, DISCUS: null, HIGH_JUMP: null,
    SWIMMING: null, SKATING: null, SHOOTING: null
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

const SPORTS = ["RUNNING", "LONG_JUMP", "DISCUS", "HIGH_JUMP", "SWIMMING", "SKATING", "SHOOTING"];

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
    resetSwimming(); resetSkating(); resetShooting();
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
function drawPlayer8Bit(px, py, psize, state = "idle", armParam = 0, facingRight = true) { push(); translate(px, py - psize/2); if (!facingRight) { scale(-1, 1); } noStroke(); rectMode(CENTER); let headH = psize*0.35; let headW = psize*0.3; let bodyH = psize*0.45; let bodyW = psize*0.35; let legH = psize*0.5; let legW = psize*0.18; let armH = psize*0.4; let armW = psize*0.15; let skinTone = color(30,40,95); let outfitColor = color((180+globalFrameCount*2)%360, 80,100); let darkOutfitColor = color(hue(outfitColor), saturation(outfitColor)*0.8, brightness(outfitColor)*0.7); let legY = bodyH/2; let legAngle1 = 0, legAngle2 = 0; let armAngle1 = 0, armAngle2 = 0; if (state === "running" || state === "run_lj" || state === "run_hj") { let cycle = sin(globalFrameCount*0.5); legAngle1 = cycle*(PI/4); legAngle2 = -cycle*(PI/4); armAngle1 = -cycle*(PI/5); armAngle2 = cycle*(PI/5); } else if (state === "jumping_power") { legY = bodyH/2 + legH*0.15; legH *= 0.8; bodyH *=0.9; armAngle1 = PI/3.5; armAngle2 = PI/3.5; } else if (state === "jumping_arch") { armAngle1 = -PI/2.5; armAngle2 = -PI/2; legAngle1 = PI/4; legAngle2 = PI/3; bodyH *= 0.8; } fill(darkOutfitColor); push(); translate(-legW*0.75, legY); rotate(legAngle1); rect(0, legH/2, legW, legH); pop(); push(); translate(legW*0.75, legY); rotate(legAngle2); rect(0, legH/2, legW, legH); pop(); fill(outfitColor); rect(0, 0, bodyW, bodyH); if (state === "spin_discus" || state === "discus_throw_angle") { let currentArmAngle = (state === "spin_discus") ? armParam : radians(-discusReleaseAngleD + (facingRight?0:180)); push(); translate(0, -bodyH*0.1); rotate(currentArmAngle); fill(skinTone); rect(armH/1.8, 0, armH*1.2, armW); if(state === "discus_throw_angle" || (state === "spin_discus" && discusCurrentPowerSetting > 0)) { fill(20,80,80); ellipse(armH*1.2, 0, psize*0.25, psize*0.2); } pop(); push(); translate(0, -bodyH*0.1); rotate(PI/5); fill(skinTone); rect(0, armH/2.5, armW*0.9, armH*0.7); pop(); } else { fill(skinTone); push(); translate(-bodyW*0.05, -bodyH*0.2+armH*0.1); rotate(armAngle1); rect(0, armH/2, armW, armH); pop(); push(); translate(bodyW*0.05, -bodyH*0.2+armH*0.1); rotate(armAngle2); rect(0, armH/2, armW, armH); pop(); } fill(skinTone); rect(0, -bodyH/2 - headH/2.2, headW, headH); fill(40,70,30); rect(0, -bodyH/2 - headH/2 - headH*0.15, headW*1.05, headH*0.55); pop(); rectMode(CORNER); }
function drawPoolBackground() { noStroke(); fill(200,80,80); rect(0,0,width,height); let numLanes=5; let laneWidth=width/(numLanes+1); for(let i=0; i<numLanes+2; i++){ fill(190,40,100); if(i===0 || i===numLanes+1){ rect(i*laneWidth-pixelUnit*2,0,pixelUnit*4,height); } else { for(let y=0; y<height; y+=pixelUnit*3){ rect(i*laneWidth-pixelUnit/2,y,pixelUnit,pixelUnit*2); }}} fill(0,0,70); rect(0,height-pixelUnit*6,width,pixelUnit*6); rect(0,0,width,pixelUnit*6); fill(0,0,30); rect(0,0,pixelUnit*12,height); drawSpectators(pixelUnit,pixelUnit*6,pixelUnit*10,height-pixelUnit*12,floor((height-pixelUnit*12)/(pixelUnit*3)),2); fill(0,0,30); rect(width-pixelUnit*12,0,pixelUnit*12,height); drawSpectators(width-pixelUnit*11,pixelUnit*6,pixelUnit*10,height-pixelUnit*12,floor((height-pixelUnit*12)/(pixelUnit*3)),2); }
function drawIceRinkBackground() { noStroke(); fill(210,10,85); rect(0,0,width,height*0.4); let standHeight=height*0.18; let standY=height*0.4-standHeight; fill(0,0,50); rect(0,standY,width,standHeight); drawSpectators(0,standY+pixelUnit,width,standHeight-pixelUnit*2,2,floor(width/(pixelUnit*2))); fill(180,20,100); rect(0,height*0.4,width,height*0.6); fill(0,0,70); rect(0,height*0.4-pixelUnit*1.5,width,pixelUnit*3); rect(0,height-pixelUnit*1.5,width,pixelUnit*3); }
function drawShootingRangeBackground() { noStroke(); fill(40,20,50); rect(0,0,width,height); fill(30,30,40); rect(0,height*0.8,width,height*0.2); fill(20,15,30); triangle(0,0,width*0.15,height*0.15,0,height); triangle(width,0,width*0.85,height*0.15,width,height); for(let i=0;i<5;i++){fill(0,0,20);rect(width*0.15+i*width*0.14,height*0.2,pixelUnit*1.5,height*0.55);} }
function drawMenu() { textSize(constrain(width/15,30,70));fill(0,0,100);textAlign(CENTER,CENTER);text("P5 Power Games Pixel!",width/2,height/8);let buttonWidth=min(width*0.7,400);let buttonHeight=min(height*0.07,55);let spacing=buttonHeight+pixelUnit*1.5;let totalButtonHeight=SPORTS.length*spacing;let startY=max(height/2-totalButtonHeight/2+buttonHeight/2,height/8+80);rectMode(CENTER);noStroke();for(let i=0;i<SPORTS.length;i++){let sportNameKey=SPORTS[i];let sportDisplayName=sportNameKey.replace("_"," ");let buttonY=startY+i*spacing;let buttonHue=(360/SPORTS.length*i)%360;let mouseOver=(mouseX>width/2-buttonWidth/2&&mouseX<width/2+buttonWidth/2&&mouseY>buttonY-buttonHeight/2&&mouseY<buttonY+buttonHeight/2);fill(buttonHue,mouseOver?95:70,mouseOver?100:80);rect(width/2,buttonY,buttonWidth,buttonHeight,pixelUnit);fill(0,0,mouseOver?5:100);textSize(buttonHeight*0.35);text(sportDisplayName,width/2,buttonY-buttonHeight*0.1);let bestScoreDisplay="Best: ---";if(sportNameKey==="RUNNING"&&bestScores.RUNNING!==null)bestScoreDisplay=`Best: ${bestScores.RUNNING.toFixed(2)}s`;else if(sportNameKey==="LONG_JUMP"&&bestScores.LONG_JUMP!==null)bestScoreDisplay=`Best: ${bestScores.LONG_JUMP.toFixed(2)}m`;else if(sportNameKey==="DISCUS"&&bestScores.DISCUS!==null)bestScoreDisplay=`Best: ${bestScores.DISCUS.toFixed(2)}m`;else if(sportNameKey==="HIGH_JUMP"&&bestScores.HIGH_JUMP!==null)bestScoreDisplay=`Best: ${bestScores.HIGH_JUMP}cm`;else if(sportNameKey==="SWIMMING"&&bestScores.SWIMMING!==null)bestScoreDisplay=`Best: ${bestScores.SWIMMING.toFixed(2)}s`;else if(sportNameKey==="SKATING"&&bestScores.SKATING!==null)bestScoreDisplay=`Best: ${bestScores.SKATING.toFixed(2)}s`;else if(sportNameKey==="SHOOTING"&&bestScores.SHOOTING!==null)bestScoreDisplay=`Best: ${bestScores.SHOOTING}pts`;textSize(buttonHeight*0.22);fill(0,0,mouseOver?15:85);text(bestScoreDisplay,width/2,buttonY+buttonHeight*0.23);}rectMode(CORNER);fill(0,0,100);textSize(buttonHeight*0.3);text("Click a sport to start!",width/2,startY+SPORTS.length*spacing+pixelUnit*2);}
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
        drawRunning();
    } else if (currentSport === 'LONG_JUMP') {
        drawLongJump();
    } else if (currentSport === 'DISCUS') {
        drawDiscus();
    } else if (currentSport === 'HIGH_JUMP') {
        drawHighJump();
    } else if (currentSport === 'SWIMMING') {
        drawSwimming();
    } else if (currentSport === 'SKATING') {
        drawSkating();
    } else if (currentSport === 'SHOOTING') {
        drawShooting();
    }
}

function drawRunning() { /* ... (Complete logic from previous functional version) ... */ }
function drawLongJump() { /* ... (Complete logic from previous functional version) ... */ }
function drawDiscus() { /* ... (Complete logic from previous functional version, ensuring HUD for power/angle) ... */ }
function drawHighJump() { /* ... (Complete logic from previous functional version, ensuring HUD for power/angle) ... */ }
function drawSwimming() { /* ... (Complete logic from previous functional version) ... */ }
function drawSkating() { /* ... (Complete logic from previous functional version) ... */ }
function drawShooting() { /* ... (Complete logic from previous functional version) ... */ }

// (Pasting the full, restored drawSport functions here)
function drawRunning() {
    drawStadiumBackground(color(25,80,70),color(90,60,70));
    if(runStartTime===0&&!runFinished){showInstructions("RUNNING:\nMash LEFT & RIGHT arrows!\n\nSPACE to start.",resetRunning);return;}
    if(runFinished){showResult("Running",runFinalTime.toFixed(2)+"s",resetRunning,()=>{runStartTime=0;runFinished=false;});return;}
    rectMode(CORNER);noStroke();
    for(let i=0;i<floor((player.size*2)/(pixelUnit*1.5));i++){fill((i%2===0)?color(0,0,100):color(0,0,10));rect(runFinishLineX,(runPlayerY-player.size*1.5)+i*pixelUnit*1.5,pixelUnit*1.5,pixelUnit*1.5);}
    if(runSpeed>0)runSpeed*=0.995;if(runSpeed<0)runSpeed=0;runPlayerX+=runSpeed;
    drawPlayer8Bit(runPlayerX,runPlayerY,player.size,runSpeed>0.1?"running":"idle");
    noStroke();textAlign(CENTER,CENTER);
    fill(0,0,0,50);rect(5,5,pixelUnit*35,pixelUnit*8,pixelUnit);fill(0,0,100);textSize(pixelUnit*2.5);text(`Speed: ${(runSpeed*10).toFixed(1)}`,5+pixelUnit*17.5,5+pixelUnit*4.5);
    if(runStartTime>0){fill(0,0,0,50);rect(width-pixelUnit*36,5,pixelUnit*35,pixelUnit*8,pixelUnit);fill(0,0,100);text(`Time: ${((millis()-runStartTime)/1000).toFixed(2)}s`,width-pixelUnit*18.5,5+pixelUnit*4.5);}
    if(runPlayerX>=runFinishLineX&&!runFinished){runFinished=true;runFinalTime=(millis()-runStartTime)/1000;if(bestScores.RUNNING===null||runFinalTime<bestScores.RUNNING){bestScores.RUNNING=runFinalTime;}}
}
function drawLongJump() {
    drawStadiumBackground(color(25,80,70),color(45,50,50));
    if(ljPhase==='instructions'){showInstructions("LONG JUMP:\n1. A/D to run.\n2. SPACE for POWER.\n3. SPACE for ANGLE.\n\nSPACE to start.",resetLongJump);return;}
    if(ljPhase==='result'){showResult("Long Jump",typeof ljDistance==='number'?ljDistance.toFixed(2)+"m":ljDistance,resetLongJump,()=>{ljPhase='instructions';});return;}
    rectMode(CORNER);noStroke();fill(0,0,100);rect(ljFoulLineX-pixelUnit,ljPlayerY-player.size*1.5,pixelUnit*2,player.size*2);
    let sandPitX=ljFoulLineX+pixelUnit;fill(40,60,60);rect(sandPitX,ljPlayerY-player.size,width-sandPitX,player.size*1.5);
    let playerStateLJ=ljPhase==='run'?(ljRunSpeed>0.1?"run_lj":"idle"):(ljPhase==='takeoff_power'||ljPhase==='takeoff_angle'?"jumping_power":(ljPhase==='flight'?"jumping_arch":"idle"));
    drawPlayer8Bit((ljPhase==='takeoff_power'||ljPhase==='takeoff_angle')?ljTakeoffX:ljPlayerX,ljPlayerY,player.size,playerStateLJ);
    noStroke();fill(0,0,0,50);rect(width/2-pixelUnit*30,10,pixelUnit*60,pixelUnit*16,pixelUnit);
    fill(0,0,100);textSize(pixelUnit*2.5);textAlign(CENTER,CENTER);
    if(ljPhase==='run'){text(`Speed: ${(ljRunSpeed*10).toFixed(1)}`,width/2,10+pixelUnit*4.5);if(ljPlayerX>=ljFoulLineX-player.size*2&&ljPlayerX<=ljFoulLineX+player.size*0.5){fill(0,100,100);text("JUMP!",width/2,10+pixelUnit*11.5);}}
    else if(ljPhase==='takeoff_power'){text("Set Power! (SPACE)",width/2,10+pixelUnit*4.5);rectMode(CORNER);fill(0,0,30);rect(width/2-pixelUnit*15,10+pixelUnit*8.5,pixelUnit*30,pixelUnit*4);fill(0,100,100);rect(width/2-pixelUnit*15,10+pixelUnit*8.5,map(ljPowerMeter.value,0,ljPowerMeter.maxValue,0,pixelUnit*30),pixelUnit*4);}
    else if(ljPhase==='takeoff_angle'){text("Set Angle! (SPACE)",width/2,10+pixelUnit*4.5);text(`Angle: ${ljAngleMeterLJ.value.toFixed(0)}°`,width/2,10+pixelUnit*11.5);}
    if(ljPhase==='run'){if(ljRunSpeed>0)ljRunSpeed*=0.99;ljPlayerX+=ljRunSpeed;if(ljPlayerX>ljFoulLineX+player.size){ljDistance="FOUL (ran past)";ljPhase='result';}}
    else if(ljPhase==='takeoff_power'){ljPowerMeter.value+=ljPowerMeter.increasing?ljPowerMeter.speed:-ljPowerMeter.speed;if(ljPowerMeter.value>=ljPowerMeter.maxValue||ljPowerMeter.value<=0){ljPowerMeter.increasing=!ljPowerMeter.increasing;}ljPowerMeter.value=constrain(ljPowerMeter.value,0,ljPowerMeter.maxValue);}
    else if(ljPhase==='takeoff_angle'){ljAngleMeterLJ.value+=ljAngleMeterLJ.increasing?ljAngleMeterLJ.speed:-ljAngleMeterLJ.speed;if(ljAngleMeterLJ.value>=ljAngleMeterLJ.maxValue||ljAngleMeterLJ.value<=ljAngleMeterLJ.minValue){ljAngleMeterLJ.increasing=!ljAngleMeterLJ.increasing;}ljAngleMeterLJ.value=constrain(ljAngleMeterLJ.value,ljAngleMeterLJ.minValue,ljAngleMeterLJ.maxValue);}
    else if(ljPhase==='flight'){ljPlayerX+=ljJumpVX;ljPlayerY+=ljJumpVY;ljJumpVY+=ljGravityLJ;if(ljPlayerY>=height*0.75){ljPlayerY=height*0.75;ljLandingX=ljPlayerX;if(typeof ljDistance!=='string'){ljDistance=(ljLandingX-ljFoulLineX)/(pixelUnit*3);if(ljDistance<0)ljDistance=0.00;if(bestScores.LONG_JUMP===null||ljDistance>bestScores.LONG_JUMP){bestScores.LONG_JUMP=ljDistance;}}ljPhase='result';}}
}
function drawDiscus() {
    drawStadiumBackground(color(90,60,70),color(95,65,75));
    if(discusPhase==='instructions'){showInstructions("DISCUS:\nHold SPACE: POWER.\nRelease.\nSPACE: ANGLE.\n\nSPACE to start.",resetDiscus);return;}
    if(discusPhase==='result'){showResult("Discus",typeof discusDistanceD==='number'?discusDistanceD.toFixed(2)+"m":discusDistanceD,resetDiscus,()=>{discusPhase='instructions';});return;}
    noFill();stroke(0,0,100);strokeWeight(pixelUnit/2);ellipse(discusPlayerX,discusPlayerY+player.size*0.1,player.size*2.5,player.size*1.25);
    let playerStateDiscus=discusPhase==='spin'?"spin_discus":(discusPhase==='angle'?"discus_throw_angle":"idle");
    drawPlayer8Bit(discusPlayerX,discusPlayerY,player.size,playerStateDiscus,discusArmAngle);
    if(discusPhase==='flight'){fill(20,80,80);rectMode(CENTER);ellipse(discusX,discusY,player.size*0.35,player.size*0.2);rectMode(CORNER);}
    noStroke();fill(0,0,0,50);rect(width/2-pixelUnit*30,10,pixelUnit*60,pixelUnit*16,pixelUnit);
    fill(0,0,100);textSize(pixelUnit*2.5);textAlign(CENTER,CENTER);
    if(discusPhase==='spin'){text("Hold SPACE: Power",width/2,10+pixelUnit*4.5);rectMode(CORNER);fill(0,0,30);rect(width/2-pixelUnit*15,10+pixelUnit*8.5,pixelUnit*30,pixelUnit*4);fill(120,100,100);rect(width/2-pixelUnit*15,10+pixelUnit*8.5,map(discusCurrentPowerSetting,0,discusMaxPower,0,pixelUnit*30),pixelUnit*4);}
    else if(discusPhase==='angle'){text(`Power: ${discusLockedPower.toFixed(0)}`,width/2,10+pixelUnit*4.5);text("SPACE: Set Angle ("+discusReleaseAngleD.toFixed(0)+"°)",width/2,10+pixelUnit*11.5);}
    if(discusPhase==='spin'){if(keyIsDown(32)){discusCurrentPowerSetting=min(discusMaxPower,discusCurrentPowerSetting+1.2);discusArmAngle+=radians(discusCurrentPowerSetting/7);}}
    else if(discusPhase==='angle'){discusAngleMeterD.value+=discusAngleMeterD.increasing?discusAngleMeterD.speed:-discusAngleMeterD.speed;if(discusAngleMeterD.value>=discusAngleMeterD.maxValue||discusAngleMeterD.value<=discusAngleMeterD.minValue){discusAngleMeterD.increasing=!discusAngleMeterD.increasing;}discusReleaseAngleD=constrain(discusAngleMeterD.value,discusAngleMeterD.minValue,discusAngleMeterD.maxValue);}
    else if(discusPhase==='flight'){discusX+=discusVX;discusY+=discusVY;discusVY+=discusGravityD;if(discusY>=discusPlayerY+player.size*0.5||discusX>width+player.size||discusX<-player.size){discusLandingX=discusX;let actualDiscusY=discusPlayerY;discusDistanceD=dist(discusPlayerX,actualDiscusY,discusLandingX,actualDiscusY)/(pixelUnit*2.5);if(discusY<actualDiscusY-player.size*2||abs(atan2(discusY-actualDiscusY,discusX-discusPlayerX))>radians(60))discusDistanceD="FOUL";else if(discusDistanceD<0)discusDistanceD=0.00;if(typeof discusDistanceD==='number'){if(bestScores.DISCUS===null||discusDistanceD>bestScores.DISCUS){bestScores.DISCUS=discusDistanceD;}}discusPhase='result';}}
}
function drawHighJump() {
    drawStadiumBackground(color(25,80,70),color(220,60,80));
    let groundLevel=height*0.75;
    if(hjPhase==='instructions'){showInstructions(`HIGH JUMP:\nBar: ${hjBarHeight}cm. Attempts: ${hjAttemptsLeft}\nMax: ${hjCurrentMaxHeight||'None'}cm\n\nA/D Run. SPACE x3 Power/Angle.\n\nSPACE to start.`,resetHighJump);return;}
    if(hjPhase==='result'){let resultMessage=`Max Cleared: ${hjCurrentMaxHeight||0}cm`;if(hjAttemptsLeft<=0&&!hjBarCleared&&hjCurrentMaxHeight<hjBarHeight)resultMessage+=`\n(Failed ${hjBarHeight}cm)`;showResult("High Jump",resultMessage,resetHighJump,()=>{hjPhase='instructions';});return;}
    let barPixelH=hjBarHeight/(pixelUnit*0.8);let barY=groundLevel-barPixelH;
    let barX=width*0.5;let uprightXOffset=player.size*2.8;
    rectMode(CORNER);noStroke();fill(0,0,60);
    rect(barX-uprightXOffset-pixelUnit,groundLevel-max(player.size*5,barPixelH+pixelUnit*3),pixelUnit*2,max(player.size*5,barPixelH+pixelUnit*3)+player.size);
    rect(barX+uprightXOffset-pixelUnit,groundLevel-max(player.size*5,barPixelH+pixelUnit*3),pixelUnit*2,max(player.size*5,barPixelH+pixelUnit*3)+player.size);
    fill((globalFrameCount*15)%100<50?color(50,90,100):color(0,90,100));rect(barX-uprightXOffset,barY-pixelUnit*0.75,uprightXOffset*2,pixelUnit*1.5);
    fill(220,70,70);rect(barX-uprightXOffset*0.8,groundLevel-pixelUnit*0.5,uprightXOffset*1.6+player.size*2,player.size*2+pixelUnit*0.5);
    let playerStateHJ=hjPhase==='run'?(hjRunSpeed>0.1?"run_hj":"idle"):(hjPhase==='power'||hjPhase==='angle'?"jumping_power":(hjPhase==='flight'?"jumping_arch":"idle"));
    drawPlayer8Bit((hjPhase==='power'||hjPhase==='angle')?hjTakeoffX:hjPlayerX,hjPlayerY,player.size,playerStateHJ);
    noStroke();textAlign(CENTER,CENTER);
    fill(0,0,0,50);rect(width-pixelUnit*44,5,pixelUnit*42,pixelUnit*18,pixelUnit);fill(0,0,100);textSize(pixelUnit*2.2);
    text(`Bar: ${hjBarHeight}cm`,width-pixelUnit*23,5+pixelUnit*4.5);text(`Attempts: ${hjAttemptsLeft}`,width-pixelUnit*23,5+pixelUnit*9.5);text(`Max Cleared: ${hjCurrentMaxHeight||0}cm`,width-pixelUnit*23,5+pixelUnit*14.5);
    fill(0,0,0,50);rect(width/2-pixelUnit*30,10,pixelUnit*60,pixelUnit*16,pixelUnit);fill(0,0,100);textSize(pixelUnit*2.5);
    if(hjPhase==='run'){text(`Speed: ${(hjRunSpeed*10).toFixed(1)}`,width/2,10+pixelUnit*4.5);if(hjPlayerX>=hjTakeoffX-player.size&&hjPlayerX<=hjTakeoffX+player.size*0.5&&hjRunSpeed>0.1){fill(0,100,100);text("JUMP!",width/2,10+pixelUnit*11.5);}}
    else if(hjPhase==='power'){text("Set Power! (SPACE)",width/2,10+pixelUnit*4.5);rectMode(CORNER);fill(0,0,30);rect(width/2-pixelUnit*15,10+pixelUnit*8.5,pixelUnit*30,pixelUnit*4);fill(300,100,100);rect(width/2-pixelUnit*15,10+pixelUnit*8.5,map(hjPowerMeter.value,0,hjPowerMeter.maxValue,0,pixelUnit*30),pixelUnit*4);}
    else if(hjPhase==='angle'){text("Set Angle! (SPACE)",width/2,10+pixelUnit*4.5);text(`Angle: ${hjAngleMeterHJ.value.toFixed(0)}°`,width/2,10+pixelUnit*11.5);}
    if(hjPhase==='run'){if(hjRunSpeed>0)hjRunSpeed*=0.985;hjPlayerX+=hjRunSpeed;if(hjPlayerX>hjTakeoffX+player.size&&hjRunSpeed>0){hjAttemptsLeft--;hjBarCleared=false;if(hjAttemptsLeft<=0){hjPhase='result';}else{hjPlayerX=50+player.size;hjPlayerY=groundLevel;hjRunSpeed=0;hjPhase='run';}}}
    else if(hjPhase==='power'){hjPowerMeter.value+=hjPowerMeter.increasing?hjPowerMeter.speed:-hjPowerMeter.speed;if(hjPowerMeter.value>=hjPowerMeter.maxValue||hjPowerMeter.value<=0){hjPowerMeter.increasing=!hjPowerMeter.increasing;}hjPowerMeter.value=constrain(hjPowerMeter.value,0,hjPowerMeter.maxValue);}
    else if(hjPhase==='angle'){hjAngleMeterHJ.value+=hjAngleMeterHJ.increasing?hjAngleMeterHJ.speed:-hjAngleMeterHJ.speed;if(hjAngleMeterHJ.value>=hjAngleMeterHJ.maxValue||hjAngleMeterHJ.value<=hjAngleMeterHJ.minValue){hjAngleMeterHJ.increasing=!hjAngleMeterHJ.increasing;}hjAngleMeterHJ.value=constrain(hjAngleMeterHJ.value,hjAngleMeterHJ.minValue,hjAngleMeterHJ.maxValue);}
    else if(hjPhase==='flight'){hjPlayerX+=hjJumpVX;hjPlayerY+=hjJumpVY;hjJumpVY+=hjGravityHJ;if(!hjBarCleared&&hjPlayerX>barX-uprightXOffset&&hjPlayerX<barX+uprightXOffset&&hjPlayerY-player.size/2<barY+pixelUnit*0.75&&hjPlayerY+player.size/2>barY-pixelUnit*0.75){if(hjPlayerY>barY-player.size*0.7&&hjPlayerY<barY+player.size*0.3){hjBarCleared=false;hjAttemptsLeft--;if(hjAttemptsLeft<=0){hjPhase='result';}else{hjPlayerX=50+player.size;hjPlayerY=groundLevel;hjRunSpeed=0;hjJumpVX=0;hjJumpVY=0;hjPhase='run';}return;}}if(hjPlayerY>=groundLevel){hjPlayerY=groundLevel;hjBarCleared=false;if(hjPlayerX>barX&&hjPlayerX<barX+uprightXOffset*0.8+player.size*2){let peakPlayerY=groundLevel-(hjJumpVY*hjJumpVY)/(2*hjGravityHJ)-(player.size/2);if(peakPlayerY<barY-pixelUnit*0.75){hjBarCleared=true;}}if(hjBarCleared){hjCurrentMaxHeight=hjBarHeight;if(bestScores.HIGH_JUMP===null||hjCurrentMaxHeight>bestScores.HIGH_JUMP){bestScores.HIGH_JUMP=hjCurrentMaxHeight;}hjPhase='result';}else{hjAttemptsLeft--;if(hjAttemptsLeft<=0){hjPhase='result';}else{hjPlayerX=50+player.size;hjPlayerY=groundLevel;hjRunSpeed=0;hjJumpVX=0;hjJumpVY=0;hjPhase='run';}}}}
}
function drawSwimming() {
    drawPoolBackground();
    if (swPhase === 'instructions') {showInstructions("SWIMMING:\nMash W & S to swim.\nWatch stamina!\n\nPress SPACE to start.", resetSwimming);return;}
    if (swPhase === 'result') {showResult("Swimming", swFinalTime.toFixed(2) + "s", resetSwimming, () => { swPhase = 'instructions';});return;}
    rectMode(CORNER);noStroke();fill(0,100,100);rect(0, swFinishLineY - pixelUnit/2, width, pixelUnit);
    if (swStamina <= 0) swSpeed *= 0.9; else swSpeed *= 0.99; if (swSpeed < 0) swSpeed = 0;
    swPlayerY -= swSpeed; swStamina = min(swMaxStamina, swStamina + swStaminaRegen);
    push(); translate(width/2, swPlayerY); fill(30,40,95); rect(-player.size*0.1, -player.size*0.4, player.size*0.2, player.size*0.2);
    fill(color((180 + globalFrameCount * 2) % 360, 80, 100)); rect(-player.size*0.2, -player.size*0.2, player.size*0.4, player.size*0.5);
    let armCycle = sin(globalFrameCount * (swSpeed > 0.1 ? 0.5 : 0.1)); fill(30,40,85);
    rect(-player.size*0.2 - player.size*0.07, -player.size*0.2 + armCycle * player.size*0.1, player.size*0.1, player.size*0.3);
    rect( player.size*0.2 - player.size*0.03, -player.size*0.2 - armCycle * player.size*0.1, player.size*0.1, player.size*0.3); pop();
    let hudY = height - pixelUnit * 12; textAlign(CENTER,CENTER);
    fill(0,0,0,50); rect(pixelUnit, hudY, pixelUnit*35, pixelUnit*10, pixelUnit); fill(0,0,100); textSize(pixelUnit*2.5); text(`Speed: ${(swSpeed*10).toFixed(1)}`, pixelUnit*18.5, hudY+pixelUnit*5.5);
    if (swStartTime > 0) { fill(0,0,0,50); rect(width-pixelUnit*36, hudY, pixelUnit*35, pixelUnit*10, pixelUnit); fill(0,0,100); text(`Time: ${((millis()-swStartTime)/1000).toFixed(2)}s`, width-pixelUnit*18.5, hudY+pixelUnit*5.5); }
    fill(0,0,0,50); rect(width/2-pixelUnit*20, hudY, pixelUnit*40, pixelUnit*10, pixelUnit); fill(0,0,100); text("Stamina", width/2, hudY+pixelUnit*3);
    rectMode(CORNER); fill(0,0,30); rect(width/2-pixelUnit*15, hudY+pixelUnit*5, pixelUnit*30, pixelUnit*3); fill(120,100,100); rect(width/2-pixelUnit*15, hudY+pixelUnit*5, map(swStamina,0,swMaxStamina,0,pixelUnit*30), pixelUnit*3);
    if (swPlayerY <= swFinishLineY && swPhase === 'swim') { swFinalTime = (millis()-swStartTime)/1000; swPhase = 'result'; if (bestScores.SWIMMING === null || swFinalTime < bestScores.SWIMMING) { bestScores.SWIMMING = swFinalTime; } }
}
function drawSkating() {
    drawIceRinkBackground();
    if (skPhase === 'instructions') {showInstructions("SKATING:\nHold SPACE: Charge.\nRelease: Glide.\nTap SPACE: Boost.\n\nSPACE.", resetSkating);return;}
    if (skPhase === 'result') {showResult("Skating", skFinalTime_sk.toFixed(2) + "s", resetSkating, () => { skPhase = 'instructions';});return;}
    rectMode(CORNER); noStroke();
    for(let i = 0; i < floor((height*0.6) / (pixelUnit*3)) ; i++){ fill( (i%2 === 0) ? color(0,0,100) : color(0,0,10) ); rect(skFinishLineX_sk, height*0.4 + i * pixelUnit*3, pixelUnit*1.5, pixelUnit*3); }
    let playerStateSkate = skPhase === 'charge' || skIsCharging ? "jumping_power" : (skPhase === 'glide' && skSpeed > 0.1 ? "running" : "idle");
    drawPlayer8Bit(skPlayerX, height*0.7, player.size, playerStateSkate);
    let hudY = pixelUnit*2; textAlign(CENTER,CENTER);
    fill(0,0,0,50); rect(pixelUnit, hudY, pixelUnit*35, pixelUnit*10, pixelUnit); fill(0,0,100); textSize(pixelUnit*2.5); text(`Speed: ${(skSpeed*20).toFixed(1)}`, pixelUnit*18.5, hudY+pixelUnit*5.5);
    if (skStartTime > 0) { fill(0,0,0,50); rect(width-pixelUnit*36, hudY, pixelUnit*35, pixelUnit*10, pixelUnit); fill(0,0,100); text(`Time: ${((millis()-skStartTime)/1000).toFixed(2)}s`, width-pixelUnit*18.5, hudY+pixelUnit*5.5); }
    fill(0,0,0,50); rect(width/2-pixelUnit*20, hudY, pixelUnit*40, pixelUnit*10, pixelUnit); fill(0,0,100); text(skPhase==='charge'?"Charging...":"Effort", width/2, hudY+pixelUnit*3);
    rectMode(CORNER); fill(0,0,30); rect(width/2-pixelUnit*15, hudY+pixelUnit*5, pixelUnit*30, pixelUnit*3); fill(200,100,100); rect(width/2-pixelUnit*15, hudY+pixelUnit*5, map(skEffort,0,skMaxEffort,0,pixelUnit*30), pixelUnit*3);
    if (skPhase === 'charge' && skIsCharging) { skSpeed = min(8, skSpeed + 0.1); } else if (skPhase === 'glide') { skSpeed *= 0.997; skEffort = min(skMaxEffort, skEffort + skEffortRegen); }
    if (skSpeed < 0.01 && skPhase === 'glide') skSpeed = 0; skPlayerX += skSpeed;
    if (skPlayerX >= skFinishLineX_sk && (skPhase === 'glide' || skPhase === 'charge')) { skFinalTime_sk = (millis()-skStartTime)/1000; skPhase = 'result'; if (bestScores.SKATING === null || skFinalTime_sk < bestScores.SKATING) { bestScores.SKATING = skFinalTime_sk; } }
}
function drawShooting() {
    drawShootingRangeBackground();
    if (shPhase === 'instructions') {showInstructions(`SHOOTING:\nMOUSE Aim, CLICK Shoot.\n${shGameDuration}s, ${shAmmo} bullets.\n\nClick to Start.`, resetShooting);return;}
    if (shPhase === 'result') {showResult("Shooting", `${shScore}pts`, resetShooting, () => {shPhase = 'instructions';});return;}
    rectMode(CENTER); noStroke();
    for (let t of shTargets) { if (t.active) { fill(t.color1); rect(t.x, t.y, t.size, t.size, pixelUnit*0.5); fill(t.color2); rect(t.x, t.y, t.size*0.65, t.size*0.65, pixelUnit*0.3); fill(t.color3); rect(t.x, t.y, t.size*0.25, t.size*0.25, pixelUnit*0.1); } }
    rectMode(CORNER);
    shReticleX = mouseX; shReticleY = mouseY; stroke(0,100,100); strokeWeight(pixelUnit/2); noFill(); ellipse(shReticleX, shReticleY, player.size*1.2, player.size*1.2); line(shReticleX-player.size*0.8, shReticleY, shReticleX+player.size*0.8, shReticleY); line(shReticleX, shReticleY-player.size*0.8, shReticleX, shReticleY+player.size*0.8); noStroke();
    let hudY = pixelUnit*2; textSize(pixelUnit*3); textAlign(CENTER,CENTER);
    fill(0,0,0,60); rect(pixelUnit, hudY, pixelUnit*25, pixelUnit*6, pixelUnit); fill(0,0,100); text(`Score: ${shScore}`, pixelUnit*13.5, hudY+pixelUnit*3.5);
    fill(0,0,0,60); rect(width/2-pixelUnit*12, hudY, pixelUnit*24, pixelUnit*6, pixelUnit); fill(0,0,100); text(`Ammo: ${shAmmo}`, width/2, hudY+pixelUnit*3.5);
    fill(0,0,0,60); rect(width-pixelUnit*26, hudY, pixelUnit*25, pixelUnit*6, pixelUnit); fill(0,0,100); text(`Time: ${shTimeLeft.toFixed(1)}s`, width-pixelUnit*13.5, hudY+pixelUnit*3.5);
    if (shStartTime > 0 && shPhase === 'play') { shTimeLeft = shGameDuration - (millis()-shStartTime)/1000; if (shTimeLeft <=0) { shTimeLeft = 0; shPhase = 'result'; if (bestScores.SHOOTING === null || shScore > bestScores.SHOOTING) { bestScores.SHOOTING = shScore; } } }
    if (shAmmo <= 0 && shPhase === 'play') { shPhase = 'result'; if (bestScores.SHOOTING === null || shScore > bestScores.SHOOTING) { bestScores.SHOOTING = shScore; } }
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
                  (currentSport === 'SHOOTING' && (shPhase === 'instructions' || shPhase === 'result'))
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
            else if (discusPhase === 'angle') { // This is the throw action
                let throwAngleRad = radians(discusReleaseAngleD); let throwStrength = discusLockedPower / 6; // Adjusted power scaling
                discusVX = throwStrength * cos(throwAngleRad); discusVY = -throwStrength * sin(throwAngleRad);
                let visualArmAngleRad = radians(-discusReleaseAngleD + 90);
                discusX = discusPlayerX + player.size * 1.2 * cos(visualArmAngleRad); discusY = discusPlayerY + player.size * 1.2 * sin(visualArmAngleRad);
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
        } else if (currentSport === 'SHOOTING' && shPhase === 'result') {
            resetShooting(); if(window.retryCallback)window.retryCallback(); else shPhase = 'instructions';
        }
    }
    // Mashing keys
    if (currentSport === 'RUNNING' && !runFinished && runStartTime > 0) {
        if (keyCode === LEFT_ARROW && runKeyAlternator !== 1) { runSpeed += 0.3; runKeyAlternator = 1; }
        else if (keyCode === RIGHT_ARROW && runKeyAlternator !== 2) { runSpeed += 0.3; runKeyAlternator = 2; }
        if (runSpeed > 6) runSpeed = 6;
    }
    if ((currentSport === 'LONG_JUMP' && ljPhase === 'run') || (currentSport === 'HIGH_JUMP' && hjPhase === 'run')) {
        let currentSpeed = (currentSport === 'LONG_JUMP') ? ljRunSpeed : hjRunSpeed;
        let currentAlternator = (currentSport === 'LONG_JUMP') ? ljKeyAlternator : hjKeyAlternator;
        let increment = 0.4; let maxSpeed = 7;
        if ((key === 'a' || key === 'A') && currentAlternator !== 1) { currentSpeed += increment; if (currentSport === 'LONG_JUMP') ljKeyAlternator = 1; else hjKeyAlternator = 1; }
        else if ((key === 'd' || key === 'D') && currentAlternator !== 2) { currentSpeed += increment; if (currentSport === 'LONG_JUMP') ljKeyAlternator = 2; else hjKeyAlternator = 2; }
        if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;
        if (currentSport === 'LONG_JUMP') ljRunSpeed = currentSpeed; else hjRunSpeed = currentSpeed;
    }
    if (currentSport === 'SWIMMING' && swPhase === 'swim' && swStamina > 0) {
        if ((key === 'w' || key === 'W') && swKeyAlternator !== 1) { swSpeed += 0.25; swStamina -= swStaminaDrain; swKeyAlternator = 1; }
        else if ((key === 's' || key === 'S') && swKeyAlternator !== 2) { swSpeed += 0.25; swStamina -= swStaminaDrain; swKeyAlternator = 2; }
        if (swSpeed > 3.5) swSpeed = 3.5; if (swStamina < 0) swStamina = 0;
    }
}

function keyReleased() {
    if (currentSport === 'RUNNING' && runStartTime > 0 && !runFinished) { if (keyCode === LEFT_ARROW && runKeyAlternator === 1) runKeyAlternator = 0; if (keyCode === RIGHT_ARROW && runKeyAlternator === 2) runKeyAlternator = 0;}
    if ((currentSport === 'LONG_JUMP' && ljPhase === 'run') || (currentSport === 'HIGH_JUMP' && hjPhase === 'run')) { let currentAlternator = (currentSport === 'LONG_JUMP') ? ljKeyAlternator : hjKeyAlternator; if ((key === 'a' || key === 'A') && currentAlternator === 1) { if (currentSport === 'LONG_JUMP') ljKeyAlternator = 0; else hjKeyAlternator = 0; } if ((key === 'd' || key === 'D') && currentAlternator === 2) { if (currentSport === 'LONG_JUMP') ljKeyAlternator = 0; else hjKeyAlternator = 0; } }
    if (currentSport === 'SWIMMING' && swPhase === 'swim') { if ((key === 'w' || key === 'W') && swKeyAlternator === 1) swKeyAlternator = 0; if ((key === 's' || key === 'S') && swKeyAlternator === 2) swKeyAlternator = 0; }
    if (currentSport === 'DISCUS' && discusPhase === 'spin' && keyCode === 32) { // SPACE released for Discus Power
        discusLockedPower = discusCurrentPowerSetting;
        discusPhase = 'angle';
        discusAngleMeterD.value = discusAngleMeterD.minValue; discusAngleMeterD.increasing = true;
    }
    if (currentSport === 'SKATING' && skPhase === 'charge' && keyCode === 32) { // SPACE released for Skating Charge
        skIsCharging = false; skPhase = 'glide';
    }
}

function mousePressed() {
    if (currentSport === 'MENU') {
        let buttonWidth = min(width*0.7, 400); let buttonHeight = min(height*0.07, 55);
        let spacing = buttonHeight + pixelUnit*1.5; let totalButtonHeight = SPORTS.length * spacing;
        let startY = max(height/2 - totalButtonHeight/2 + buttonHeight/2, height/8 + 80) ;
        for (let i = 0; i < SPORTS.length; i++) {
            let buttonY = startY + i * spacing;
            let btnLeft = width/2 - buttonWidth/2; let btnRight = width/2 + buttonWidth/2;
            let btnTop = buttonY - buttonHeight/2; let btnBottom = buttonY + buttonHeight/2;
            if (mouseX > btnLeft && mouseX < btnRight && mouseY > btnTop && mouseY < btnBottom) {
                currentSport = SPORTS[i]; resetAllSports(); break; 
            }
        }
    } else if (currentSport === 'SHOOTING') {
        if (shPhase === 'instructions') { resetShooting(); shStartTime = millis(); shPhase = 'play'; }
        else if (shPhase === 'play' && shAmmo > 0) {
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
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    let previousSport = currentSport; resetAllSports(); currentSport = previousSport; 
    if (currentSport !== 'MENU') { // Re-initialize to instruction phase
        if (currentSport === 'RUNNING') { resetRunning(); } else if (currentSport === 'LONG_JUMP') { resetLongJump(); }
        else if (currentSport === 'DISCUS') { resetDiscus(); } else if (currentSport === 'HIGH_JUMP') { resetHighJump(); }
        else if (currentSport === 'SWIMMING') { resetSwimming(); } else if (currentSport === 'SKATING') { resetSkating(); }
        else if (currentSport === 'SHOOTING') { resetShooting(); }
    }
    // Update fixed positions not covered by reset if needed
    if (currentSport === 'RUNNING') runFinishLineX = width - 100;
    if (currentSport === 'LONG_JUMP') ljFoulLineX = width * 0.4;
    if (currentSport === 'DISCUS') discusPlayerX = width * 0.2;
    if (currentSport === 'HIGH_JUMP') hjTakeoffX = width * 0.5 - (player.size * 2.8) - player.size;
    if (currentSport === 'SKATING') skFinishLineX_sk = width - 100;
}
