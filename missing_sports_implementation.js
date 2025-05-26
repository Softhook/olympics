// This file contains the implementations for the missing or broken sport functions
// These can be copied into the main sketch.js file

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
    runSpeed = max(0, runSpeed - 0.1); // Deceleration
    
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
        showInstructions("LONG JUMP:\n1. Press SPACE to start\n2. Alternate A/D to run\n3. Press SPACE at foul line to jump\n4. Time your power and angle", resetLongJump);
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
        ljRunSpeed = max(0, ljRunSpeed - 0.1); // Deceleration
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
        showInstructions(`HIGH JUMP (${hjBarHeight}cm):\n1. Press SPACE to start\n2. Alternate A/D to run\n3. Press SPACE at takeoff to jump\n4. Time power and angle`, resetHighJump);
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
        hjRunSpeed = max(0, hjRunSpeed - 0.1); // Deceleration
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
        showInstructions("SWIMMING:\n1. Press SPACE to start\n2. Alternate W/S keys to swim\n3. Manage stamina", resetSwimming);
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
        showInstructions("SPEED SKATING:\n1. Press SPACE to start charging\n2. Release SPACE to skate\n3. Press SPACE for speed boosts\n4. Manage effort", resetSkating);
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
        showInstructions("SHOOTING:\n1. Click to shoot\n2. Hit the targets\n3. Score as many points as possible in 30 seconds", resetShooting);
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
    
    // Update reticle position
    shReticleX = mouseX;
    shReticleY = mouseY;
    
    // Draw HUD
    fill(0, 0, 0, 80); rect(10, 10, 300, 30);
    fill(0, 0, 100); textSize(pixelUnit * 2);
    text(`Score: ${shScore} | Ammo: ${shAmmo} | Time: ${shTimeLeft.toFixed(1)}s`, 160, 25);
}
