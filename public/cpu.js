
const cpuButton = document.querySelector('.cpu-match');
document.addEventListener('DOMContentLoaded', () => {
    cpuButton.addEventListener('click', () => {
        if (gameState === 'normal') {
            showCpuDialog();
        } else if ( gameState === "CPUmatch") {
            CPUquitMatch();
            cpuButton.textContent = "CPU MATCH";
        }
    });
});

function CPUquitMatch() {
    soundManager.stop('Consecutive Battle');
    soundManager.stop('Lightning Brain');
    soundManager.stop('R.E.B.O.R.N');
    gameStarted = false;
    CPUresetGame();
    playerWins = 0;
    opponentWins = 0;
    playerIsLoser = false;
    gameState = 'normal';
}

let cpuLevelSelectValue;
let customSettingsValue;
let inputSpeedToCalc = 4;
let missRateToCalc = 2;
let missWaitTimeToCalc = 2;

function showCpuDialog() {
    const cpuDialog = document.createElement('div');
    cpuDialog.className = 'cpuDialogOverlay';
    cpuDialog.innerHTML = `
      <div id="cpuDialog">
        <h2>SELECT LEVEL</h2>
        <label for="cpuLevel">LEVEL:</label>
        <select id="cpuLevel">
          <option value="custom">Custom</option>
          ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${i === 4 ? 'selected' : ''}>${i + 1}</option>`).join('')}
        </select>
        
        <div id="customSettings" style="display: none;">
          <label for="inputSpeed">INPUT&nbspRATE : <span id="inputSpeedValue">50</span></label> 
          <input type="range" id="inputSpeed" min="1" max="20" value="5"><br>
          
          <label for="missRate">MISS&nbsp&nbsp&nbspRATE : <span id="missRateValue">10</span></label> 
          <input type="range" id="missRate" min="0" max="30" value="5"><br>

          <label for="missWaitTime">MISS&nbsp&nbsp&nbspWAIT : <span id="missWaitTimeValue">1</span></label>
          <input type="range" id="missWaitTime" min="0" max="10" value="1"><br>
        </div>
        
        <div class="dialog-buttons">
          <button id="startCpuButton" class="dialogButton">START</button>
          <button id="cancelCpuButton" class="dialogButton">CANCEL</button>
        </div>
      </div>
    `;
    document.body.appendChild(cpuDialog);

    const cpuLevelSelect = document.getElementById('cpuLevel');
    const customSettings = document.getElementById('customSettings');
    const inputSpeed = document.getElementById('inputSpeed');
    const missRate = document.getElementById('missRate');
    const missWaitTime = document.getElementById('missWaitTime');
    const inputSpeedValue = document.getElementById('inputSpeedValue');
    const missRateValue = document.getElementById('missRateValue');
    const missWaitTimeValue = document.getElementById('missWaitTimeValue');

    const predefinedLevels = [
        { speed: 1, miss: 1, missWait: 3 },
        { speed: 2, miss: 2, missWait: 3 },
        { speed: 3, miss: 2, missWait: 3 },
        { speed: 4, miss: 3, missWait: 3 },
        { speed: 4, miss: 2, missWait: 2 },
        { speed: 5, miss: 5, missWait: 3 },
        { speed: 5.5, miss: 4, missWait: 3 },
        { speed: 6, miss: 3, missWait: 2 },
        { speed: 7, miss: 3, missWait: 2 },
        { speed: 8, miss: 2, missWait: 2 }
    ];

    cpuLevelSelect.value = "5";

    inputSpeed.value = predefinedLevels[4].speed;
    inputSpeedToCalc = predefinedLevels[4].speed;
    missRate.value = predefinedLevels[4].miss;
    missRateToCalc = predefinedLevels[4].miss;
    missWaitTime.value = predefinedLevels[4].missWait;
    missWaitTimeToCalc = predefinedLevels[4].missWait;

    inputSpeedValue.textContent = predefinedLevels[4].speed;
    missRateValue.textContent = predefinedLevels[4].miss;
    missWaitTimeValue.textContent = predefinedLevels[4].missWait;

    cpuLevelSelect.addEventListener('change', () => {
        if (cpuLevelSelect.value === 'custom') {
            customSettings.style.display = 'block';
        } else {
            customSettings.style.display = 'none';
            const level = parseInt(cpuLevelSelect.value) - 1;

            inputSpeed.value = predefinedLevels[level].speed;
            inputSpeedToCalc = predefinedLevels[level].speed;

            missRate.value = predefinedLevels[level].miss;
            missRateToCalc = predefinedLevels[level].miss;

            missWaitTime.value = predefinedLevels[level].missWait;
            missWaitTimeToCalc = predefinedLevels[level].missWait;

            inputSpeedValue.textContent = predefinedLevels[level].speed;
            missRateValue.textContent = predefinedLevels[level].miss;
            missWaitTimeValue.textContent = predefinedLevels[level].missWait;
        }
    });

    // カスタム設定変更時も適応
    inputSpeed.addEventListener('input', () => {
        inputSpeedValue.textContent = inputSpeed.value;
        inputSpeedToCalc = parseInt(inputSpeed.value, 10);
    });

    missRate.addEventListener('input', () => {
        missRateValue.textContent = missRate.value;
        missRateToCalc = parseInt(missRate.value, 10);
    });

    missWaitTime.addEventListener('input', () => {
        missWaitTimeValue.textContent = missWaitTime.value;
        missWaitTimeToCalc = parseInt(missWaitTime.value, 10);
    }); 6

    // イベントリスナー追加 (showCpuDialog 内)
    missWaitTime.addEventListener('input', () => {
        missWaitTimeValue.textContent = missWaitTime.value;
        missWaitTimeToCalc = parseInt(missWaitTime.value, 10);
    });

    document.getElementById('startCpuButton').addEventListener('click', () => {
        if (gameState === 'normal') {
            cpuDialog.remove();
            CPUstartCountdown();
            cpuButton.textContent = "QUIT MATCH"
            // CPUstartGame();
        }
    });
    document.getElementById('cancelCpuButton').addEventListener('click', () => {
        gameState = "normal";
        cpuDialog.remove();
    });
}

function CPUstartGame() {
    gameState = "CPUmatch";
    CPUsetWordPool();
    CPUpushWordToField();
    CPUdrawInfo();
    playerInput = "";
    opponentInput = "";
    CPUdrawInputField(ctxPlayerInput, '', playerInputField);
    CPUdrawInputField(ctxOpponentInput, '', opponentInputField);
    CPUgameStep();
    CPUstartInput();
}

function CPUgameStep() {
    if (gameState !== "CPUmatch") return;
    CPUupdateFieldAfterReceiveOffset();
    CPUopponentUpdateFieldAfterReceiveOffset();
    CPUcheckAndRemoveWord();
    CPUdrawField(ctxPlayer, playerField, memorizeLastAttackValue);
    CPUdrawField(ctxOpponent, opponentField, opponentMemorizeLastAttackValue);
    gameStepInterval = Math.max(minInterval, gameStepInterval - 200);
    updateProgressBar(gameStepInterval);
    setTimeout(CPUgameStep, gameStepInterval);
}

// let toConnectChar = '';
let lastInputWordLength = 0;
let isWordDecided = false;

function getInputWord() {
    if (isWordDecided === true) return;

    if (opponentFieldWords.length < 10 && opponentReceiveValueToDisplay.length === 0) {
        while (opponentFieldWords.length < 10) {
            CPUopponentUpdateFieldAfterReceiveOffset();
        }
    } else if (opponentFieldWords.length + opponentReceiveValueToDisplay.length < 13) {
        CPUopponentUpdateFieldAfterReceiveOffset();
    }

    if (opponentFieldWords.length + opponentReceiveValueToDisplay.length > 20) {
        let wordLengths = opponentFieldWords.map(word => word.length).sort((a, b) => a - b);
        let longestContinuous = [];
        let currentSeq = [];
        for (let i = 0; i < wordLengths.length; i++) {
            if (i === 0 || wordLengths[i] === wordLengths[i - 1] + 1) {
                currentSeq.push(wordLengths[i]);
            } else {
                if (currentSeq.length > longestContinuous.length) {
                    longestContinuous = currentSeq;
                }
                currentSeq = [wordLengths[i]];
            }
        }
        if (currentSeq.length > longestContinuous.length) {
            longestContinuous = currentSeq;
        }
        if (longestContinuous.length > 0) {
            let minLength = Math.min(...longestContinuous);
            return opponentFieldWords.find(word => word.length === minLength);
        }
    }

    if (CPUchainBonus > 3 && opponentFieldWords.find(word => word[0] === CPUlastChar)) {
        let matchingWord = opponentFieldWords.find(word => word[0] === CPUlastChar);
        lastInputWordLength = matchingWord.length;
        return matchingWord;
    }

    if (opponentFieldWords.find(word => word.length === lastInputWordLength - 1)) {
        lastInputWordLength--;
        return opponentFieldWords.find(word => word.length === lastInputWordLength);
    } else if (opponentFieldWords.find(word => word.length === lastInputWordLength)) {
        return opponentFieldWords.find(word => word.length === lastInputWordLength);
    } else if (opponentFieldWords.find(word => word.length === lastInputWordLength + 1)) {
        lastInputWordLength++;
        return opponentFieldWords.find(word => word.length === lastInputWordLength);
    } else {
        let wordLengths = [...new Set(opponentFieldWords.map(word => word.length))].sort((a, b) => a - b);
        let longestContinuous = [];
        let currentSeq = [];
        for (let i = 0; i < wordLengths.length; i++) {
            if (i === 0 || wordLengths[i] === wordLengths[i - 1] + 1) {
                currentSeq.push(wordLengths[i]);
            } else {
                if (currentSeq.length > longestContinuous.length) {
                    longestContinuous = currentSeq;
                }
                currentSeq = [wordLengths[i]];
            }
        }
        if (currentSeq.length > longestContinuous.length) {
            longestContinuous = currentSeq;
        }
        if (longestContinuous.length > 0) {
            let maxLength = Math.max(...longestContinuous);
            let returnWord = opponentFieldWords.find(word => word.length === maxLength);
            lastInputWordLength = returnWord.length;
            return returnWord;
        }
    }
    console.log(opponentFieldWords);
}

let opponentWordToInput = '';
let decidedWordLength = 0

function CPUstartInput() {
    if (gameState !== "CPUmatch") return;
    let speed = 1000 / parseInt(inputSpeedToCalc, 10);
    function typeWord() {
        function typeCharacter() {
            if (gameState !== "CPUmatch") return;
            if (Math.random() * 100 < missRateToCalc) {
                if (CPUchainBonus === 3) {
                    CPUchainBonus = 2
                } else if (CPUchainBonus <= 2) {
                    CPUchainBonus = 0;
                } else {
                    CPUchainBonus = CPUchainBonus - 2;
                }
                CPUopponentUpdateChainInfoDisplay();
                CPUOpponentNerfAttackValue();
                if (currentMissTypeSoundState === 'VALID') {
                    soundManager.playSound('missType');
                }
                CPUtriggerMissColorFlash(opponentInputField);
                setTimeout(() => {
                    setTimeout(typeCharacter, speed);
                }, missWaitTimeToCalc * 1000);
                // console.log(missWaitTimeToCalc);
                // console.log(missRateToCalc);
                // console.log(inputSpeedToCalc);
            } else {
                if (!isWordDecided) {
                    opponentWordToInput = getInputWord();
                    isWordDecided = true;
                    decidedWordLength = opponentWordToInput.length;
                } else {
                    if (opponentWordToInput) {
                        opponentInput += opponentWordToInput[0];
                        opponentWordToInput = opponentWordToInput.slice(1);
                        if (opponentWordToInput.length === 0) {
                            isWordDecided = false;
                        }
                    }
                    opponentKeyValueToKPM++;
                    if (opponentInput.length > decidedWordLength) {
                        opponentInput = '';
                        isWordDecided = false;
                    }
                }
                // console.log(opponentWordToInput);
                CPUdrawInputField(ctxOpponentInput, opponentInput, opponentInputField);
                setTimeout(typeCharacter, speed);
            }
            CPUopponentcheckAndRemoveWord();
            CPUdrawField(ctxOpponent, opponentField, opponentMemorizeLastAttackValue);
        }
        typeCharacter();
    }
    typeWord();
}

function CPUstartCountdown() {
    gameState = 'countdown';
    CPUresetGame();
    let count = 3;
    const countInterval = setInterval(() => {
        if (count > 0) {
            showCountdown(count, 'playerChildEffectOverlay');
            showCountdown(count, 'opponentChildEffectOverlay');

            if (currentCountdownSoundState === 'VALID') {
                soundManager.playSound('countdown', { fade: 0.2, volume: 1 });
            }

        } else if (count === 0) {
            showCountdown('GO!!', 'playerChildEffectOverlay');
            showCountdown('GO!!', 'opponentChildEffectOverlay');

            if (currentCountdownSoundState === 'VALID') {
                soundManager.playSound('countdown', { rate: 2, volume: 1.5 });
            }
        } else {
            clearInterval(countInterval);
            gameState = 'playing';
            CPUstartGame();
            switch (currentBGMState) {
                case 'Consecutive Battle':
                    soundManager.playSound('Consecutive Battle', { volume: 0.6, loop: true });
                    break;
                case 'Lightning Brain':
                    soundManager.playSound('Lightning Brain', { volume: 0.6, loop: true });
                    break;
                case 'R.E.B.O.R.N':
                    soundManager.playSound('R.E.B.O.R.N', { volume: 0.6, loop: true });
                    break;
                case 'OFF':
                    break;
            }
        }
        count--;
    }, 1000);
}

function CPUsetWordPool() {
    if (wordPool.length === 0) {
        for (let x = 0; x < 5; x++) {
            wordPool.push(getRandomWordForField(playerUsedLengths));
        }
    } else {
        wordPool = [];
        for (let x = 0; x < 5; x++) {
            wordPool.push(getRandomWordForField(playerUsedLengths));
        }
    }
    if (opponentWordPool.length === 0) {
        for (let x = 0; x < 5; x++) {
            opponentWordPool.push(getRandomWordForField(opponentUsedLengths));
        }
    } else {
        opponentWordPool = [];
        for (let x = 0; x < 5; x++) {
            opponentWordPool.push(getRandomWordForField(opponentUsedLengths));
        }
    }
}

function CPUpushWordToField() {
    for (let x = 0; x < 9; x++) {
        playerFieldWords.push(getRandomWordForField(playerUsedLengths));
        opponentFieldWords.push(getRandomWordForField(opponentUsedLengths));
    }
}


function playerDrawInfo() {
    drawInfoInterval = setInterval(() => {
        totalTime++;
        const minutes = Math.floor(totalTime / 600); // 600 = 60秒 * 10
        const seconds = Math.floor((totalTime % 600) / 10); // 秒部分
        const tenths = totalTime % 10; // 小数点第1位部分

        timeText = `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;

        playerKPMValue = playerKeyValueToKPM / totalTime * 600;
        playerAPMValue = playerAtteckValueToAPM / totalTime * 600;
        playerWPMValue = playerWordValueToWPM / totalTime * 600;

        kpmText = `${playerKPMValue.toFixed(2)}/M`;
        apmText = `${playerAPMValue.toFixed(2)}/M`;
        wpmText = `${playerWPMValue.toFixed(2)}/M`;

        mainKPMText = kpmText.slice(0, -4);
        mainAPMText = apmText.slice(0, -4);
        mainWPMText = wpmText.slice(0, -4);
        mainTimeText = timeText.slice(0, -2);

        toSmallKPMChars = kpmText.slice(-4);
        toSmallAPMChars = apmText.slice(-4);
        toSmallWPMChars = wpmText.slice(-4);
        toSmallTimeText = timeText.slice(-2);

        kpmDiv.innerHTML = `${mainKPMText}<span class="smallText">${toSmallKPMChars}</span>`;
        apmDiv.innerHTML = `${mainAPMText}<span class="smallText">${toSmallAPMChars}</span>`;
        wpmDiv.innerHTML = `${mainWPMText}<span class="smallText">${toSmallWPMChars}</span>`;
        for (let timeDiv of timeDivs) {
            timeDiv.innerHTML = `${mainTimeText}<span class="smallText">${toSmallTimeText}</span>`;
        }
    }, 100);
}

// let CPUdrawInfoInterval;
let opponentKeyValueToKPM = 0;
let opponentAtteckValueToAPM = 0;
let opponentWordValueToWPM = 0;
let opponentKPMValue = 0;
let opponentAPMValue = 0;
let opponentWPMValue = 0;

function CPUdrawInfo() {
    drawInfoInterval = setInterval(() => {
        totalTime++;
        const minutes = Math.floor(totalTime / 600); // 600 = 60秒 * 10
        const seconds = Math.floor((totalTime % 600) / 10); // 秒部分
        const tenths = totalTime % 10; // 小数点第1位部分

        timeText = `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;

        playerKPMValue = playerKeyValueToKPM / totalTime * 600;
        playerAPMValue = playerAtteckValueToAPM / totalTime * 600;
        playerWPMValue = playerWordValueToWPM / totalTime * 600;

        opponentKPMValue = opponentKeyValueToKPM / totalTime * 600;
        opponentAPMValue = opponentAtteckValueToAPM / totalTime * 600;
        opponentWPMValue = opponentWordValueToWPM / totalTime * 600;

        playerKpmText = `${playerKPMValue.toFixed(2)}/M`;
        playerApmText = `${playerAPMValue.toFixed(2)}/M`;
        playerWpmText = `${playerWPMValue.toFixed(2)}/M`;

        opponentKpmText = `${opponentKPMValue.toFixed(2)}/M`;
        opponentApmText = `${opponentAPMValue.toFixed(2)}/M`;
        opponentWpmText = `${opponentWPMValue.toFixed(2)}/M`;

        mainKPMText = playerKpmText.slice(0, -4);
        mainAPMText = playerApmText.slice(0, -4);
        mainWPMText = playerWpmText.slice(0, -4);
        mainTimeText = timeText.slice(0, -2);

        opponentMainKPMText = opponentKpmText.slice(0, -4);
        opponentMainAPMText = opponentApmText.slice(0, -4);
        opponentMainWPMText = opponentWpmText.slice(0, -4);

        toSmallKPMChars = playerKpmText.slice(-4);
        toSmallAPMChars = playerApmText.slice(-4);
        toSmallWPMChars = playerWpmText.slice(-4);
        toSmallTimeText = timeText.slice(-2);

        opponentToSmallKPMChars = opponentKpmText.slice(-4);
        opponentToSmallAPMChars = opponentApmText.slice(-4);
        opponentToSmallWPMChars = opponentWpmText.slice(-4);

        kpmDiv.innerHTML = `${mainKPMText}<span class="smallText">${toSmallKPMChars}</span>`;
        apmDiv.innerHTML = `${mainAPMText}<span class="smallText">${toSmallAPMChars}</span>`;
        wpmDiv.innerHTML = `${mainWPMText}<span class="smallText">${toSmallWPMChars}</span>`;

        opponentKpmDiv.innerHTML = `${opponentMainKPMText}<span class="smallText">${opponentToSmallKPMChars}</span>`;
        opponentApmDiv.innerHTML = `${opponentMainAPMText}<span class="smallText">${opponentToSmallAPMChars}</span>`;
        opponentWpmDiv.innerHTML = `${opponentMainWPMText}<span class="smallText">${opponentToSmallWPMChars}</span>`;

        for (let timeDiv of timeDivs) {
            timeDiv.innerHTML = `${mainTimeText}<span class="smallText">${toSmallTimeText}</span>`;
        }
    }, 100);
}

function CPUstopDrawInfo() {
    if (CPUdrawInfoInterval) {
        clearInterval(CPUdrawInfoInterval);
        CPUdrawInfoInterval = null;
    }
}

function CPUdrawInputField(ctx, inputText, inputField) {
    const textY = CELL_SIZE;
    ctx.clearRect(0, 0, inputField.getBoundingClientRect().width, inputField.getBoundingClientRect().height);
    ctx.fillStyle = '#fff';
    ctx.font = `${CELL_SIZE * 1}px "${currentfontState}", "せのびゴシック", serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(inputText, inputField.getBoundingClientRect().width / 2, textY);
}

function CPUopponentUpdateFieldAfterReceiveOffset() {
    if (opponentReceiveValueToOffset.length === 0) {
        CPUopponentMoveWordToField();
    }
    const soundCount = opponentReceiveValueToOffset.length;
    const delayBetweenSounds = 70;
    if (currentAttackSoundState === 'VALID') {
        for (let i = 0; i < soundCount; i++) {
            setTimeout(() => {
                soundManager.playSound('receiveAttack', { volume: 0.5 });
            }, i * delayBetweenSounds);
        }
    }
    for (let x = 0; x < opponentReceiveValueToOffset.length; x++) {
        let addFieldWord = getRandomWordForAttack(opponentReceiveValueToOffset[x]);
        opponentFieldWords.push(addFieldWord);
    }
    opponentAttackValueToOffset = 0;
    opponentReceiveValueToOffset = [];
    CPUopponentCalcReceiveOffsetToDisplay();
    CPUdrawStatusField(ctxPlayerStatus, true);
    opponentFieldWords.sort((a, b) => b.length - a.length);
    clearField(opponentField);

    let row = FIELD_HEIGHT - 1; // 下から配置
    for (const word of opponentFieldWords) {
        let col = 0; // 左端から配置
        for (const char of word) {
            if (col >= FIELD_WIDTH) {
                row--; // 次の行に移動
                col = 0;
            }
            if (row === 0) {
                opponentField[row][col] = { word: char, isHighlighted: false };
                col++;
            } else if (row < 0) {
                if (gameState === 'ended') return;
                CPUdrawField(ctxOpponent, opponentField, opponentMemorizeLastAttackValue);
                CPUopponentHandleGameOver(true);
                return;

            } else {
                opponentField[row][col] = { word: char, isHighlighted: false };
                col++;
            }
        }
        row--;
    }
    CPUopponentUpdateNextDisplay(opponentWordPool);
    CPUhighlightMatchingCells(opponentField);
}

function CPUopponentMoveWordToField() {
    let toPutFieldWord = opponentWordPool.shift();
    opponentFieldWords.push(toPutFieldWord);
    opponentWordPool.push(getRandomWordForField(opponentUsedLengths));
    opponentFieldWords.sort((a, b) => b.length - a.length);
}

function CPUdrawStatusField(ctx, isPlayer = true) {
    ctx.fillStyle = "#13172c";
    ctx.fillRect(0, 0, CELL_SIZE / 2, CELL_SIZE * FIELD_HEIGHT);

    const displayValues = isPlayer ? playerReceiveValueToDisplay : opponentReceiveValueToDisplay;
    const fieldWords = isPlayer ? playerFieldWords : opponentFieldWords;
    const state = isPlayer ? warningState.player : warningState.opponent;

    const isOverflowing = displayValues.length + fieldWords.length > FIELD_HEIGHT;

    if (isOverflowing && !state.interval) {

        if (currentWarningSoundState === 'VALID') {
            soundManager.playSound('warning', { volume: 0.8, loop: true });
        }

        state.interval = setInterval(() => {
            state.isVisible = !state.isVisible;
            drawWarningOverlay(isPlayer);
        }, 500);
    } else if (!isOverflowing && state.interval) {
        soundManager.stop('warning');
        clearInterval(state.interval);
        state.interval = null;
        state.isVisible = false;
        drawWarningOverlay(isPlayer);
    }
    if (displayValues.length > 0) {
        const startY = CELL_SIZE * (FIELD_HEIGHT - displayValues.length);

        for (let i = 0; i < displayValues.length; i++) {
            const cellY = startY + (i * CELL_SIZE);

            ctx.fillStyle = "rgb(135, 0, 0)";
            ctx.fillRect(0, cellY, CELL_SIZE / 2, CELL_SIZE);

            ctx.fillStyle = "white";
            ctx.font = `${CELL_SIZE * 0.5}px 'kirin'`;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.letterSpacing = "0.05em"

            const textX = CELL_SIZE / 4;
            const textY = cellY + (CELL_SIZE / 1.9);

            ctx.fillText(displayValues[i], textX, textY);
        }
    }
}

function CPUdrawField(ctx, field, receivedLastWordLength) {
    ctx.clearRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);
    ctx.fillStyle = "rgba(5, 7, 19, 0.7)";
    ctx.fillRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);
    if (receivedLastWordLength !== 0) {
        for (let y = 0; y < FIELD_HEIGHT; y++) {
            let hasContent = false;
            for (let x = 0; x < FIELD_WIDTH; x++) {
                if (field[y][x] && field[y][x].word) {
                    hasContent = true;
                    break;
                }
            }

            if (!hasContent) {
                continue;
            }

            // 行の文字を1つの単語として結合
            let rowWord = '';
            for (let x = 0; x < FIELD_WIDTH; x++) {
                if (field[y][x] && field[y][x].word) {
                    rowWord += field[y][x].word;
                }
            }

            if (rowWord.length > 0) {

                const position = y * CELL_SIZE;
                const width = FIELD_WIDTH * CELL_SIZE;
                const height = CELL_SIZE;

                const hasLongerWord = (receivedLastWordLength === 10 && rowWord.length === 9) ||
                    (receivedLastWordLength === 2 && rowWord.length === 3) ||
                    (rowWord.length === receivedLastWordLength + 1);

                const hasShorterWord = receivedLastWordLength !== 2 &&
                    rowWord.length === receivedLastWordLength - 1;

                if (rowWord.length === receivedLastWordLength) {
                    ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
                    ctx.fillRect(0, position, width, height);
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, position, width, height);

                } else if (hasLongerWord) {
                    // drawHorizontalGradient(ctx, y, 'SHORTER_WORD');
                    ctx.fillStyle = `rgba(255, 0, 255, 0.2)`;
                    ctx.fillRect(0, position, width, height);
                    ctx.strokeStyle = `rgba(255, 0, 255, 0.5)`;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, position, width, height);

                } else if (hasShorterWord) {
                    // drawHorizontalGradient(ctx, y, 'SHORTER_WORD');
                    ctx.fillStyle = `rgba(0, 255, 255, 0.2)`;
                    ctx.fillRect(0, position, width, height);
                    ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, position, width, height);
                }
            }
        }
    }

    for (let y = 0; y < FIELD_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
            const cell = field[y][x];
            if (cell) {
                const gradient = ctx.createRadialGradient(
                    x * CELL_SIZE + CELL_SIZE / 2,
                    y * CELL_SIZE + CELL_SIZE / 2,
                    CELL_SIZE * 3,
                    x * CELL_SIZE + CELL_SIZE / 2,
                    y * CELL_SIZE + CELL_SIZE / 2,
                    0
                );

                if (cell.isHighlighted) {
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
                }

                ctx.fillStyle = gradient;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.font = `${CELL_SIZE * 0.7}px "${currentfontState}", "せのびゴシック", serif`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.lineWidth = 0.5;

                const centerX = x * CELL_SIZE + CELL_SIZE / 2;
                const centerY = y * CELL_SIZE + CELL_SIZE / 2;

                if (cell.isHighlighted) {
                    // ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    // ctx.strokeText(cell.word, centerX, centerY);
                    // ctx.fillStyle = 'white';
                    ctx.fillStyle = 'rgb(0, 0, 0)';
                    ctx.fillText(cell.word, centerX, centerY);
                } else {
                    // すべての文字に黒い縁取りを追加
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.lineWidth = 2; // 縁取りの太さ
                    ctx.strokeText(cell.word, centerX, centerY);
                    ctx.fillStyle = 'white';
                    ctx.fillText(cell.word, centerX, centerY);
                }
            }
        }
    }
    drawGrid(ctx);
}

function CPUupdateNextDisplay(words) {
    const combinedWords = [...playerFieldWords, ...wordPool];
    const matchingChars = getMatchingStartAndEndLetters(combinedWords).map(normalizeHiragana);
    // キャッシュを更新：前回のmatchingCharsを保持する
    matchingChars.forEach((char) => {
        if (!charColorMap.has(char)) {
            // 未使用の色を選択
            const availableColors = colors.filter((color) => !usedColors.has(color));
            const baseColor = availableColors[0] || colors[0];
            const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            const [r, g, b] = rgbaMatch.slice(1).map(Number);
            const borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 1)`;

            charColorMap.set(char, { baseColor, borderColor });
            usedColors.add(baseColor); // 新しく使用した色を追跡
        }
    });
    const existingKeys = new Set(matchingChars);
    for (const [key, { baseColor }] of charColorMap.entries()) {
        if (!existingKeys.has(key)) {
            // 使っていた色を解放
            usedColors.delete(baseColor);
            // charColorMap から削除
            charColorMap.delete(key);
        }
    }
    // 5つのNextを表示
    for (let i = 1; i <= 5; i++) {
        const nextElement = document.getElementById(`playerNext${i}`);
        const word = words[i - 1];
        if (!word) continue;

        const styledWord = generateStyledCharacters(word, matchingChars, lastChar);
        nextElement.innerHTML = styledWord;
    }
}

function CPUhighlightMatchingCells(field) {
    let isPlayer = true;
    let colorMap = new Map();
    if (field === opponentField) {
        isPlayer = false;
        colorMap = CPUcharColorMap;
    } else {
        colorMap = charColorMap;
    }
    const overlayDiv = isPlayer ? playerOverlayElement : opponentOverlayElement;

    removeAuraEffectFromOverlay(overlayDiv);

    // ハイライト情報を保持する配列
    const highlightData = [];
    // 各行を上から順にチェック
    for (let y = 0; y < FIELD_HEIGHT; y++) {
        // まず先頭(x=0)をチェック
        if (!field[y][0] || !field[y][0].word) {
            continue;
        }

        // 先頭の文字のチェック
        const startChar = field[y][0].word[0];
        if (isPlayer && startChar === lastChar) {
            // 先頭文字が一致かつ lastChar と同じ場合
            // 先頭文字が一致かつ lastChar と同じ場合
            const colorObj = { baseColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(255, 255, 255)' }; // 白色を指定
            applyAuraEffectToCell(y, 0, colorObj, overlayDiv);
            highlightData.push({ x: 0, y, colorObj });
        }
        else if (colorMap.has(startChar)) {
            // 最初の文字が一致（lastChar のチェックはなし）
            const colorObj = colorMap.get(startChar);
            applyAuraEffectToCell(y, 0, colorObj, overlayDiv);
            highlightData.push({ x: 0, y, colorObj });
        }

        // その行の最後尾を探してチェック
        for (let x = FIELD_WIDTH - 1; x > 0; x--) {
            if (field[y][x] && field[y][x].word) {
                const endChar = normalizeHiragana(field[y][x].word[field[y][x].word.length - 1]);
                if (colorMap.has(endChar)) {
                    // 最後の文字が一致
                    const colorObj = colorMap.get(endChar);
                    applyAuraEffectToCell(y, x, colorObj, overlayDiv);
                    highlightData.push({ x, y, colorObj });
                }
                break;  // 最後尾が見つかったらその行の探索終了
            }
        }
    }
}

function CPUopponentcheckAndRemoveWord() {
    if (opponentInput.length !== 0) {
        // 入力文字の先頭から続く日本語部分を抽出して、フィールド内の単語と一致しているか確認
        const wordIndex = opponentFieldWords.findIndex((word) => word === extractLeadingJapanese(opponentInput));
        if (wordIndex !== -1) {
            // 一致する単語を取得
            const matchedWord = opponentFieldWords[wordIndex];
            // const wordLength = matchedWord.length; // 単語の文字数を取得
            opponentFieldWords.splice(wordIndex, 1);

            // フィールドから単語を削除して再描画
            CPUremoveWordFromField(opponentField, matchedWord);

            CPUopponentCalcAttackValue(matchedWord);

            CPUupdateField(opponentField, opponentFieldWords);

            CPUupdateAllNextGradients(wordPool, false);

            CPUopponentUpdateNextDisplay(opponentWordPool);

            CPUhighlightMatchingCells(opponentField);

            return;
        }
        const highLightWordIndex = opponentFieldWords.findIndex((word) => word.startsWith(extractLeadingJapanese(opponentInput)));

        if (highLightWordIndex !== -1) {

            const matchedLength = extractLeadingJapanese(opponentInput).length;

            highlightMatchWords(opponentField, highLightWordIndex, matchedLength);

            return 0; // 一致しない場合は 0 を返す
        }

        resetHighlight(opponentField);

        if (CPUchainBonus === 3) {
            CPUchainBonus = 2
        } else if (CPUchainBonus <= 2) {
            CPUchainBonus = 0;
        } else {
            CPUchainBonus = CPUchainBonus - 2;
        }
        CPUopponentUpdateChainInfoDisplay();
        CPUOpponentNerfAttackValue();
        if (currentMissTypeSoundState === 'VALID') {
            soundManager.playSound('missType');
        }
        CPUtriggerMissColorFlash(opponentInputField);
    }
    return 0;
}

function CPUremoveWordFromField(field, word) {
    if (field === playerField) {
        playerWordValueToWPM++;
    } else {
        opponentWordValueToWPM++;
    }
    let remainingWord = word;
    for (let y = FIELD_HEIGHT - 1; y >= 0; y--) { // 下から上へスキャン
        for (let x = 0; x < FIELD_WIDTH; x++) { // 左から右へスキャン
            if (field[y][x] && field[y][x].word === remainingWord[0]) {
                field[y][x] = null; // セルを空にする
                remainingWord = remainingWord.slice(1); // 残りの文字列を更新
                if (remainingWord.length === 0) {
                    if (field === playerField) {
                        playerInput = "";
                    } else {
                        opponentInput = "";
                    }
                    resetHighlight(field);
                    return;
                }
            }
        }
    }
}

// 画面フィールドをクリア
function clearField(field) {
    for (let y = 0; y < FIELD_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
            field[y][x] = null;
        }
    }
}

function CPUupdateField(field, fieldWords) {
    clearField(field);
    let row = FIELD_HEIGHT - 1;
    for (const word of fieldWords) {
        let col = 0;
        for (const char of word) {
            if (col >= FIELD_WIDTH) {
                row--;
                col = 0;
            }
            field[row][col] = { word: char, isHighlighted: false };
            col++;
        }
        row--;
    }
}

function CPUupdateAllNextGradients(words, isPlayer = true) {
    const prefix = isPlayer ? 'player' : 'opponent';
    const gradientStyles = [];

    for (let i = 1; i <= 5; i++) {
        const word = words[i - 1];
        const gradientStyle = updateNextElementGradient(prefix, i, word?.length);
        gradientStyles.push(gradientStyle || '');
    }

    if (isPlayer) {
        playerGradientStyles = [...gradientStyles];
    } else {
        opponentGradientStyles = [...gradientStyles];
    }
    return gradientStyles;
}

const CPUcharColorMap = new Map();
const CPUusedColors = new Set([...CPUcharColorMap.values()].map((color) => color.baseColor));

function CPUopponentUpdateNextDisplay(words) {
    const combinedWords = [...opponentFieldWords, ...opponentWordPool];

    const matchingChars = getMatchingStartAndEndLetters(combinedWords).map(normalizeHiragana);

    // キャッシュを更新：前回のmatchingCharsを保持する
    matchingChars.forEach((char) => {
        if (!CPUcharColorMap.has(char)) {
            // 未使用の色を選択
            const availableColors = colors.filter((color) => !CPUusedColors.has(color));
            const baseColor = availableColors[0] || colors[0];
            const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            const [r, g, b] = rgbaMatch.slice(1).map(Number);
            const borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 1)`;

            CPUcharColorMap.set(char, { baseColor, borderColor });
            CPUusedColors.add(baseColor); // 新しく使用した色を追跡
        }
    });

    const existingKeys = new Set(matchingChars);

    for (const [key, { baseColor }] of CPUcharColorMap.entries()) {
        if (!existingKeys.has(key)) {
            // 使っていた色を解放
            CPUusedColors.delete(baseColor);
            // CPUcharColorMap から削除
            CPUcharColorMap.delete(key);
        }
    }

    for (let i = 1; i <= 5; i++) {
        const nextElement = document.getElementById(`opponentNext${i}`);
        const word = words[i - 1];
        if (!word) continue;

        const styledWord = CPUopponentGenerateStyledCharacters(word, matchingChars, lastChar);
        nextElement.innerHTML = styledWord;
    }
}


// 色付き文字を生成する関数
function CPUopponentGenerateStyledCharacters(word, matchingChars, lastChar) {
    return word.split("").map((char, index) => {
        // 正規化した文字を使用
        const normalizedChar = normalizeHiragana(char);

        let baseColor = "";
        let borderColor = "";

        // charColorMap に既存の色があればそれを使用
        if (CPUcharColorMap.has(normalizedChar)) {
            ({ baseColor, borderColor } = CPUcharColorMap.get(normalizedChar));
        } else {
            // 新しい色を計算し保存
            const colorIndex = matchingChars.indexOf(normalizedChar);
            if (colorIndex !== -1) {
                baseColor = colors[colorIndex % colors.length];
                const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                const [r, g, b] = rgbaMatch.slice(1).map(Number);
                borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 0.6)`;

                // CPUcharColorMap に保存
                CPUcharColorMap.set(normalizedChar, { baseColor, borderColor });
            }
        }

        // 先頭文字が一致かつ lastChar と同じ場合
        if (index === 0 && normalizedChar === lastChar) {
            return `
        <div class="aura-container" style="--aura-color: rgba(255, 255, 255, 0.3); --aura-border-color: rgba(255, 255, 255, 1);">
          <span class="character">${char}</span>
        </div>
      `;
        }
        // 最初の文字が一致（lastChar のチェックはなし）
        if (index === 0 && baseColor) {
            return `
        <div class="aura-container" style="--aura-color: ${baseColor}; --aura-border-color: ${borderColor}">
          <span class="character">${char}</span>
        </div>
      `;
        }

        // 最後の文字が一致
        if (index === word.length - 1 && baseColor) {
            return `
        <div class="aura-container" style="--aura-color: ${baseColor}; --aura-border-color: ${borderColor}">
          <span class="character">${char}</span>
        </div>
      `;
        }

        // マッチしない文字は通常表示
        return `<span class="character">${char}</span>`;
    }).join("");
}

function CPUopponentUpdateChainInfoDisplay() {
    if (chainBonus !== 0) {
        animateAttackInfo(opponentChainBonus, `Chain: ${chainBonus}`, false);
    } else {
        // フェードアウトアニメーションを適用
        opponentChainBonus.classList.remove('animate');
        opponentChainBonus.classList.add('fade-out');

        // アニメーション終了後に空文字列を設定
        setTimeout(() => {
            opponentChainBonus.textContent = '';
            opponentChainBonus.classList.remove('fade-out');
        }, 500);
    }
}

function CPUOpponentNerfAttackValue() {
    CPUnerfValue = CPUnerfValue + 1;
    CPUopponentUpdateNerfInfoDisplay();
}

function CPUopponentUpdateNerfInfoDisplay() {
    if (CPUnerfValue !== 0) {
        animateAttackInfo(opponentNerfValue, `Nerf: ${CPUnerfValue}`, false);
    } else {
        // フェードアウトアニメーションを適用
        opponentNerfValue.classList.remove('animate');
        opponentNerfValue.classList.add('fade-out');

        // アニメーション終了後に空文字列を設定
        setTimeout(() => {
            opponentNerfValue.textContent = '';
            opponentNerfValue.classList.remove('fade-out');
        }, 500);
    }
}

function CPUtriggerMissColorFlash(element) {
    element.classList.add('playerMissEffect');
    setTimeout(() => element.classList.remove('playerMissEffect'), 300);
}


let opponentMemorizeLastAttackValue = 0;
function CPUopponentCalcAttackValue(removeWord) {
    opponentAttackValue = removeWord.length;
    opponentMemorizeLastAttackValue = opponentAttackValue;

    let firstChar = removeWord.charAt(0);

    // 特定の条件: 前回の最後の文字と今回の最初の文字が一致する場合
    if (CPUlastChar === firstChar) {
        CPUisWordChain = true;
    } else {
        CPUisWordChain = false;
    }
    if (CPUisWordChain) {
        CPUopponentConnect();
    }
    else if (opponentLastAttackValue - 1 == removeWord.length) {
        CPUisSameChar = false;
        CPUisUpChain = true;
        CPUopponentUpChainAttack();
    } else if (opponentLastAttackValue + 1 == removeWord.length) {
        CPUisSameChar = false;
        isDownChain = true;
        CPUopponentDownChainAttack();
    } else if (opponentLastAttackValue == removeWord.length) {
        CPUisSameChar = true;
        CPUopponentSameCharAttack();
    } else {
        let calculatedAttackVal = opponentAttackValue - CPUnerfValue;
        CPUopponentCancelChain();
        CPUopponentAttack(opponentAttackValue);
        if (calculatedAttackVal > 0 && calculatedAttackVal !== 1) {
            CPUopponentOnAttackShake(calculatedAttackVal);
            CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
        }
    }
    opponentLastAttackValue = opponentMemorizeLastAttackValue;
    CPUlastChar = normalizeHiragana(removeWord.charAt(removeWord.length - 1));
}

function CPUopponentCancelChain() {
    CPUisUpChain = false;
    CPUisDownChain = false;
    CPUisSameChar = false;
    CPUchainBonus = 0;
    CPUopponentUpdateChainInfoDisplay();
}

function CPUopponentUpdateChainInfoDisplay() {
    if (CPUchainBonus !== 0) {
        animateAttackInfo(opponentChainBonus, `Chain: ${CPUchainBonus}`, false);
    } else {
        opponentChainBonus.classList.remove('animate');
        opponentChainBonus.classList.add('fade-out');

        setTimeout(() => {
            opponentChainBonus.textContent = '';
            opponentChainBonus.classList.remove('fade-out');
        }, 500);
    }
}

function CPUopponentConnect() {
    let calculatedAttackVal = opponentAttackValue;
    if (CPUnerfValue !== 0) {
        calculatedAttackVal = opponentAttackValue - CPUnerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    CPUisUpChain = false;
    CPUisDownChain = false;
    CPUopponentAttack(opponentAttackValue);

    if (CPUchainBonus !== 0) {
        if (CPUchainBonus > 10) {
            let toCalcChainBonusAttack = CPUchainBonus;
            while (toCalcChainBonusAttack > 10) {
                CPUopponentAttack(10);
                toCalcChainBonusAttack -= 10;
            }
            CPUopponentAttack(toCalcChainBonusAttack);
        } else if (CPUchainBonus > 1) {
            CPUopponentAttack(CPUchainBonus);
        }
    }
    calculatedAttackVal = calculatedAttackVal + CPUchainBonus;
    if (CPUchainBonus % 10 === 1) {
        calculatedAttackVal -= 1;
    }
    if (calculatedAttackVal > 1) {
        CPUopponentOnAttackShake(calculatedAttackVal);
        CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
    }
}

function CPUopponentUpChainAttack() {
    let calculatedAttackVal = opponentAttackValue;
    if (CPUnerfValue !== 0) {
        calculatedAttackVal = opponentAttackValue - CPUnerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    if (CPUisDownChain === true) {
        CPUisDownChain = false;
        CPUchainBonus = 2;
        CPUopponentAttack(opponentAttackValue);
        CPUopponentAttack(CPUchainBonus);
        calculatedAttackVal = calculatedAttackVal + CPUchainBonus;
        CPUopponentOnAttackShake(calculatedAttackVal);
        CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
        return;
    }
    if (CPUchainBonus === 0) {
        CPUchainBonus = 2;
        CPUopponentAttack(opponentAttackValue);
        CPUopponentAttack(CPUchainBonus);
    } else {
        CPUchainBonus = CPUchainBonus + 2;
        if (CPUchainBonus > 10) {
            CPUopponentAttack(opponentAttackValue);
            let toCalcCPUChainBonusAttack = CPUchainBonus;
            while (toCalcCPUChainBonusAttack > 10) {
                CPUopponentAttack(10);
                toCalcCPUChainBonusAttack -= 10;
            }
            if (toCalcCPUChainBonusAttack > 1) {
                CPUopponentAttack(toCalcCPUChainBonusAttack);
            }
        } else {
            CPUopponentAttack(opponentAttackValue);
            CPUopponentAttack(CPUchainBonus);
        }
    }
    calculatedAttackVal = calculatedAttackVal + CPUchainBonus;
    if (CPUchainBonus % 10 === 1) {
        calculatedAttackVal -= 1;
    }
    CPUopponentOnAttackShake(calculatedAttackVal);
    CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
}


function CPUopponentDownChainAttack() {
    let calculatedAttackVal = opponentAttackValue;
    if (CPUnerfValue !== 0) {
        calculatedAttackVal = opponentAttackValue - CPUnerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    if (CPUisUpChain === true) {
        CPUisUpChain = false;
        CPUchainBonus = 2;
        CPUopponentAttack(opponentAttackValue);
        CPUopponentAttack(CPUchainBonus);
        calculatedAttackVal = calculatedAttackVal + CPUchainBonus;
        CPUopponentOnAttackShake(calculatedAttackVal);
        CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
        return;
    }
    if (CPUchainBonus === 0) {
        CPUchainBonus = 2;
        CPUopponentAttack(opponentAttackValue);
        CPUopponentAttack(CPUchainBonus);
    } else {
        CPUchainBonus++;
        if (CPUchainBonus > 10) {
            CPUopponentAttack(opponentAttackValue);
            let toCalcCPUchainBonusAttack = CPUchainBonus;
            while (toCalcCPUchainBonusAttack > 10) {
                CPUopponentAttack(10);
                toCalcCPUchainBonusAttack -= 10;
            }
            if (toCalcCPUchainBonusAttack > 1) {
                CPUopponentAttack(toCalcCPUchainBonusAttack);
            }
        } else {
            CPUopponentAttack(opponentAttackValue);
            CPUopponentAttack(CPUchainBonus);
        }
    }
    calculatedAttackVal = calculatedAttackVal + CPUchainBonus;
    if (CPUchainBonus % 10 === 1) {
        calculatedAttackVal -= 1;
    }
    CPUopponentOnAttackShake(calculatedAttackVal);
    CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
}


function CPUopponentSameCharAttack() {
    let calculatedAttackVal = opponentAttackValue;
    if (CPUnerfValue !== 0) {
        calculatedAttackVal = opponentAttackValue - CPUnerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    calculatedAttackVal = calculatedAttackVal + opponentAttackValue + CPUchainBonus * 2;
    opponentAttackValue = opponentAttackValue * 2 + CPUchainBonus * 2
    CPUchainBonus = 0;
    if (opponentAttackValue > 10) {
        while (opponentAttackValue > 10) {
            CPUopponentAttack(10);
            opponentAttackValue -= 10;
        }
        if (opponentAttackValue === 10) {
            const array = [2, 3, 4, 5, 6, 7, 8];
            const randomValue = array[Math.floor(Math.random() * array.length)];
            CPUopponentAttack(randomValue);
            CPUopponentAttack(10 - randomValue);
        } else if (opponentAttackValue > 1) {
            CPUopponentAttack(opponentAttackValue);
        }
    } else {
        CPUopponentAttack(opponentAttackValue);
    }
    CPUopponentOnAttackShake(calculatedAttackVal);
    CPUdisplayAttackValue(opponentEffectOverlay, calculatedAttackVal);
}


function CPUopponentOnAttackShake(attackValue) {
    const shakeDistance = Math.min(MAX_SHAKE_DISTANCE, Math.max(MIN_SHAKE_DISTANCE, attackValue));
    const shakeScale = shakeDistance / 200;

    opponentGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
    opponentGameArea.style.setProperty('--shake-scale', `${shakeScale}`);
    opponentGameArea.classList.add('shake-vertical');
    setTimeout(() => opponentGameArea.classList.remove('shake-vertical'), 300);

    playerGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
    playerGameArea.classList.add('shake-horizontal');
    setTimeout(() => playerGameArea.classList.remove('shake-horizontal'), 300);
}

function CPUdisplayAttackValue(element, number) {
    if (typeof number !== 'number') {
        return;
    }
    if (currentAttackSoundState === 'VALID') {
        if (number <= 10) {
            soundManager.playSound('attackWeak', { volume: 0.5 });
        } else if (number <= 15) {
            soundManager.playSound('attackNormal', { volume: 1 });
        } else if (number <= 20) {
            soundManager.playSound('attackStrong', { volume: 0.8 });
        } else {
            soundManager.playSound('attackOP', { fadeOut: 0.5, volume: 0.8 });
        }
    }
    const containerRect = element.getBoundingClientRect();
    // フォントサイズの計算: CELL_SIZE * 2 + number
    const fontSize = (CELL_SIZE * 1.5) + number * 1.5;
    // 数値表示用の要素を作成
    const numberElement = document.createElement('span');
    numberElement.textContent = number;
    numberElement.className = 'displayAttackValue';
    numberElement.style.fontSize = `${fontSize}px`;
    // 色を設定 (numberの値によって変化)
    if (number < 10) {
        numberElement.style.color = 'rgba(0, 0, 0, 0.9)';
    } else if (number < 20) {
        numberElement.style.color = 'rgba(255, 125, 0, 0.9)';
    } else {
        numberElement.style.color = 'rgba(255, 0, 0, 0.9)';
    }
    // 固定位置の計算（上から25%、左から75%）
    const posX = containerRect.width * 0.75;
    const posY = containerRect.height * 0.25;

    // ランダムな角度を生成（135度から45度の間）
    const randomAngle = 45 + Math.random() * (-90);

    // ランダムな移動量を生成
    const randomTranslateX = Math.random() * 100 - 100; // -10px ～ 10px
    const randomTranslateY = Math.random() * 100 - 100; // -10px ～ 10px

    // 位置とアングルを設定
    numberElement.style.left = `${posX}px`;
    numberElement.style.top = `${posY}px`;
    numberElement.style.transform = `translate(-50%, -50%) rotate(${randomAngle}deg)`;

    // DOMに追加
    element.appendChild(numberElement);

    // アニメーションの適用
    requestAnimationFrame(() => {
        numberElement.style.transform += ` translate(${randomTranslateX}px, ${randomTranslateY}px) scale(1.2)`;
        numberElement.classList.add('fade-out');

        // アニメーション完了後に要素を削除
        setTimeout(() => {
            numberElement.remove();
        }, 1500);
    });
}


// 既存のattack関数を修正
function CPUopponentAttack(attackValue) {
    if (attackValue <= 1 || attackValue >= 11) return;
    if (gameState === "CPUmatch") {
        if (CPUnerfValue !== 0) {
            let nerfAttackValue = attackValue - CPUnerfValue;
            CPUnerfValue = 0;
            if (nerfAttackValue < 2) {
                CPUopponentUpdateNerfInfoDisplay();
                CPUopponentUpdateAttackInfoDisplay();
                return;
            } else {
                opponentAttackValueToOffset = nerfAttackValue;
                opponentAtteckValueToAPM += nerfAttackValue;
                CPUopponentCalcReceiveOffsetToDisplay();
                attackValue = CPUopponentCalcReceiveOffset();
                opponentAttackValueToOffset = 0;
                if (opponentReceiveValueToOffset.length === 0) {
                    if (attackValue > 1) {
                        isAttackShake = true;
                        playerReceiveValueToOffset.push(attackValue);
                        playerReceiveValueToDisplay = [...playerReceiveValueToOffset];
                        playerReceiveValueToDisplay.sort((a, b) => a - b);
                        CPUdrawStatusField(ctxPlayerStatus, true);
                    }
                } else {
                    isAttackShake = false;
                }
                CPUopponentUpdateAttackInfoDisplay();
            }
            CPUopponentUpdateNerfInfoDisplay()
        } else {
            opponentAttackValueToOffset = attackValue;
            opponentAtteckValueToAPM += attackValue;
            CPUopponentCalcReceiveOffsetToDisplay();
            attackValue = CPUopponentCalcReceiveOffset();
            opponentAttackValueToOffset = 0;
            isAttackShake = false;
            if (opponentReceiveValueToOffset.length === 0) {
                if (attackValue > 1) {
                    isAttackShake = true;
                    playerReceiveValueToOffset.push(attackValue);
                    playerReceiveValueToDisplay = [...playerReceiveValueToOffset];
                    playerReceiveValueToDisplay.sort((a, b) => a - b);
                    CPUdrawStatusField(ctxPlayerStatus, true);
                    // console.log(opponentAttackValueToOffset);
                    // console.log(playerReceiveValueToDisplay);
                }
            }
            CPUopponentUpdateAttackInfoDisplay();
        }
        CPUdrawStatusField(ctxOpponentStatus, false);
        CPUdrawStatusField(ctxPlayerStatus, true);
    }
}

function CPUopponentUpdateAttackInfoDisplay() {
    let attackType = 'Attack';
    let colorClass = 'attack-normal';
    if (CPUisWordChain) {
        attackType = 'Connect!';
        colorClass = 'attack-connect';
    } else if (CPUisUpChain) {
        attackType = 'UpChain';
        colorClass = 'attack-upchain';
    } else if (CPUisDownChain) {
        attackType = 'DownChain';
        colorClass = 'attack-downchain';
    } else if (CPUisSameChar) {
        attackType = 'DoubleAttack';
        colorClass = 'attack-double';
    }
    animateAttackInfo(opponentAttackKind, attackType, colorClass);
    CPUopponentUpdateChainInfoDisplay();
}


function CPUopponentCalcReceiveOffsetToDisplay() {

    opponentAttackValueToDisplay = opponentAttackValueToOffset;
    opponentReceiveValueToDisplay = [...opponentReceiveValueToOffset];

    if (opponentReceiveValueToDisplay.includes(opponentAttackValueToDisplay)) {
        opponentReceiveValueToDisplay.splice(opponentReceiveValueToDisplay.indexOf(opponentAttackValueToDisplay), 1);
        opponentAttackValueToDisplay = 0;
    }

    if (opponentAttackValueToDisplay === 0) return 0;

    while (opponentAttackValueToDisplay > 0 && opponentReceiveValueToDisplay.length > 0) {

        let maxIndex = opponentReceiveValueToDisplay.indexOf(Math.max(...opponentReceiveValueToDisplay));
        let maxValue = opponentReceiveValueToDisplay[maxIndex];

        if (opponentAttackValueToDisplay >= maxValue) {
            opponentAttackValueToDisplay -= maxValue;
            opponentReceiveValueToDisplay.splice(maxIndex, 1);
        } else {
            opponentReceiveValueToDisplay[maxIndex] -= opponentAttackValueToDisplay;
            opponentAttackValueToDisplay = 0;
            if (opponentReceiveValueToDisplay[maxIndex] < 2) {
                opponentReceiveValueToDisplay.splice(maxIndex, 1);
            }
        }
    }
    opponentReceiveValueToDisplay.sort((a, b) => a - b);
}


function CPUopponentCalcReceiveOffset() {
    if (opponentReceiveValueToOffset.length === 0) {
        return opponentAttackValueToOffset;
    };

    if (opponentReceiveValueToOffset.includes(opponentAttackValueToOffset)) {
        opponentReceiveValueToOffset.splice(opponentReceiveValueToOffset.indexOf(opponentAttackValueToOffset), 1);
        opponentAttackValueToOffset = 0;
    }
    if (opponentAttackValueToOffset === 0) return 0;

    while (opponentAttackValueToOffset > 0 && opponentReceiveValueToOffset.length > 0) {

        let maxIndex = opponentReceiveValueToOffset.indexOf(Math.max(...opponentReceiveValueToOffset));
        let maxValue = opponentReceiveValueToOffset[maxIndex];

        if (opponentAttackValueToOffset >= maxValue) {
            opponentAttackValueToOffset -= maxValue;
            opponentReceiveValueToOffset.splice(maxIndex, 1);
        } else {
            opponentReceiveValueToOffset[maxIndex] -= opponentAttackValueToOffset;
            opponentAttackValueToOffset = 0;
            if (opponentReceiveValueToOffset[maxIndex] < 2) {
                opponentReceiveValueToOffset.splice(maxIndex, 1);
            }
        }
    }
    return opponentAttackValueToOffset > 1 ? opponentAttackValueToOffset : 0;

}

function CPUopponentHandleGameOver() {
    stopDrawInfo();
    clearProgressBar();
    switch (currentBGMState) {
        case 'Consecutive Battle':
            soundManager.stop('Consecutive Battle');
            break;
        case 'Lightning Brain':
            soundManager.stop('Lightning Brain');
            break;
        case 'R.E.B.O.R.N':
            soundManager.stop('R.E.B.O.R.N');
            break;
        case 'OFF':
            break;
    }
    soundManager.stop('warning');
    if (gameState === 'ended') return;
    gameState = 'ended';
    isGameOver = true;
    playerWins++;
    playerIsLoser = false;
    if (playerWins === 2 || opponentWins === 2) {
        drawGameOverUI(playerWins === 2 ? 'Win' : 'Lose');
        setTimeout(() => {
            resetGameAnimation();
            setTimeout(() => {
                playerWins = 0;
                opponentWins = 0;
                playerIsLoser = false;
                CPUshowRetryDialog();
            }, 5000);
        }, 1500);
    } else {
        drawGameOverUI('Win');
        setTimeout(() => {
            resetGameAnimation();
            setTimeout(() => {
                CPUstartCountdown();
            }, 4000);
        }, 1500);
    }
}

function CPUshowRetryDialog() {
    if (retryDialog) return;
    retryDialog = document.createElement('div');
    retryDialog.innerHTML = `
      <div class="retryDialog dialog-content">
        <h2>もう一度プレイしますか？</h2>
        <div class="dialog-buttons">
          <button id="yesButton" class="retryDialogButton dialogButton" onclick="CPUhandleRetryResponse(true)">
            Yes
          </button>
          <button id="noButton" class="retryDialogButton dialogButton" onclick="CPUhandleRetryResponse(false)">
            No
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(retryDialog);
    const dialogButton = document.querySelectorAll('.retryDialogButton');
    dialogButton.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (currentButtonSoundState === 'VALID') {
                soundManager.playSound('buttonHover', { volume: 0.8 });
            }
        });
        button.addEventListener('click', () => {
            if (currentButtonSoundState === 'VALID') {
                soundManager.playSound('buttonClick', { volume: 0.5 });
            }
        });

    });
}

function CPUhandleRetryResponse(response) {
    document.body.removeChild(retryDialog);
    retryDialog = null;
    if (!response) {
        gameState = 'normal';
    } else {
        CPUstartCountdown();
    }
}
