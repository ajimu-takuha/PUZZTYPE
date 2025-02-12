
window.addEventListener("keydown", (e) => {
    if (gameState !== 'CPUmatch') return;
    const key = e.key;
    if (selectedCategory === "hiragana") {
        let convertedInput = "";
        if (key.length === 1) {
            playerKeyValueToKPM++;
            playerInput += key;
            if (key !== ' ') {
                animateInputField();
                switch (currentTypeSoundState) {
                    case 'type1':
                        soundManager.playSound('type1');
                        break;
                    case 'type2':
                        soundManager.playSound('type2');
                        break;
                    case 'type3':
                        soundManager.playSound('type3');
                        break;
                    case 'type4':
                        soundManager.playSound('type4');
                        break;
                    case 'type5':
                        soundManager.playSound('type5');
                        break;
                    case 'type6':
                        soundManager.playSound('type6');
                        break;
                    case 'type7':
                        soundManager.playSound('type7');
                        break;
                    case 'type8':
                        soundManager.playSound('type8')
                        break;
                    case 'OFF':
                        break;
                }
            }
            if (key === ' ') {
                playerInput = playerInput.trim();
                convertedInput = wanakana.toHiragana(playerInput);
                if (playerField.filter(row => row.some(item => item !== null)).length >= 20) {
                    return;
                }
                if (currentAddWordSoundState === 'VALID') {
                    soundManager.playSound('addFieldWord', { volume: 1 });
                }
                CPUupdateFieldAfterReceiveOffset(playerField, playerFieldWords);
            } else if (key === "n") {
                convertedInput = wanakana.toHiragana(playerInput.slice(0, -1));
                if (playerInput.slice(-2) === "nn") {
                    playerInput = playerInput.slice(0, -2) + "n";
                } else {
                    convertedInput = convertedInput + "n";
                }
            } else if (key === "y") {
                convertedInput = wanakana.toHiragana(playerInput);
                if (playerInput.slice(-2) === "ny") {
                    convertedInput = convertedInput.slice(0, -2) + "ny";
                }
            } else if (key.match(/^[a-zA-Z-]$/)) {
                convertedInput = wanakana.toHiragana(playerInput);
            } else {
                if (currentDeleteSoundState === 'VALID') {
                    soundManager.playSound('deleteInput', { volume: 1 });
                }
                convertedInput = ""
                resetHighlight(playerField);
            }
        } else if (key === "Backspace") {
            if (currentDeleteSoundState === 'VALID') {
                soundManager.playSound('deleteInput', { volume: 1 });
            }
            convertedInput = playerInput.slice(0, -1); // バックスペースで最後の文字を削除
            if (convertedInput === "") {
                resetHighlight(playerField);
            }
        } else {
            if (currentDeleteSoundState === 'VALID') {
                soundManager.playSound('deleteInput', { volume: 1 });
            }
            convertedInput = ""
            resetHighlight(playerField);
        }
        playerInput = convertedInput;
    }
    CPUcheckAndRemoveWord();
    CPUdrawField(ctxPlayer, playerField, memorizeLastAttackValue);
    CPUdrawInputField(ctxPlayerInput, playerInput, playerInputField);
});

function CPUupdateFieldAfterReceiveOffset() {
    if (playerReceiveValueToOffset.length === 0) {
        CPUmoveWordToField();
    }
    const soundCount = playerReceiveValueToOffset.length;
    const delayBetweenSounds = 70;
    if (currentAttackSoundState === 'VALID') {
        for (let i = 0; i < soundCount; i++) {
            setTimeout(() => {
                soundManager.playSound('receiveAttack', { volume: 0.5 });
            }, i * delayBetweenSounds);
        }
    }
    for (let x = 0; x < playerReceiveValueToOffset.length; x++) {
        let addFieldWord = getRandomWordForAttack(playerReceiveValueToOffset[x]);
        playerFieldWords.push(addFieldWord);
    }
    playerAttackValueToOffset = 0;
    playerReceiveValueToOffset = [];
    calcReceiveOffsetToDisplay();
    CPUdrawStatusField(ctxPlayerStatus, true);
    playerFieldWords.sort((a, b) => b.length - a.length);
    clearField(playerField);

    let row = FIELD_HEIGHT - 1;
    for (const word of playerFieldWords) {
        let col = 0; // 左端から配置
        for (const char of word) {
            if (col >= FIELD_WIDTH) {
                row--; // 次の行に移動
                col = 0;
            }
            if (row === 0) {
                playerField[row][col] = { word: char, isHighlighted: false };
                col++;
            } else if (row < 0) {
                if (gameState === 'ended') return;
                CPUdrawField(ctxPlayer, playerField, memorizeLastAttackValue);
                CPUhandleGameOver(true);
                return;
            } else {
                playerField[row][col] = { word: char, isHighlighted: false };
                col++;
            }
        }
        row--;
    }
    CPUupdateNextDisplay(wordPool);
    CPUhighlightMatchingCells(playerField);
}

function CPUmoveWordToField() {
    let toPutFieldWord = wordPool.shift();
    playerFieldWords.push(toPutFieldWord);
    wordPool.push(getRandomWordForField(playerUsedLengths));
    playerFieldWords.sort((a, b) => b.length - a.length);
}

function CPUcheckAndRemoveWord() {
    if (playerInput.length !== 0) {
        const wordIndex = playerFieldWords.findIndex((word) => word === extractLeadingJapanese(playerInput));
        if (wordIndex !== -1) {
            const matchedWord = playerFieldWords[wordIndex];
            playerFieldWords.splice(wordIndex, 1);
            CPUremoveWordFromField(playerField, matchedWord);
            CPUcalcAttackValue(matchedWord);
            CPUupdateField(playerField, playerFieldWords);
            CPUupdateAllNextGradients(wordPool, true);
            CPUupdateNextDisplay(wordPool);
            CPUhighlightMatchingCells(playerField);
            return;
        }
        const highLightWordIndex = playerFieldWords.findIndex((word) => word.startsWith(extractLeadingJapanese(playerInput)));
        if (highLightWordIndex !== -1) {
            const matchedLength = extractLeadingJapanese(playerInput).length;
            highlightMatchWords(playerField, highLightWordIndex, matchedLength);
            return 0;
        }
        resetHighlight(playerField);
        if (playerInput.length !== 0) {
            if (chainBonus === 3) {
                chainBonus = 2
            } else if (chainBonus <= 2) {
                chainBonus = 0;
            } else {
                chainBonus = chainBonus - 2;
            }
            CPUupdateChainInfoDisplay();
            CPUnerfAttackValue();
            if (currentMissTypeSoundState === 'VALID') {
                soundManager.playSound('missType');
            }
            CPUtriggerMissColorFlash(playerInputField);
        }
        return 0;
    }
}

function CPUnerfAttackValue() {
    nerfValue = nerfValue + 1;
    CPUupdateNerfInfoDisplay();
}

function CPUcalcAttackValue(removeWord) {
    playerAttackValue = removeWord.length;
    memorizeLastAttackValue = removeWord.length;
    let firstChar = removeWord.charAt(0);
    if (lastChar === firstChar) {
        isWordChain = true;
    } else {
        isWordChain = false;
    }
    if (isWordChain) {
        CPUconnect();
    }
    else if (playerLastAttackValue - 1 === removeWord.length) {
        isSameChar = false;
        isUpChain = true;
        CPUupChainAttack();

    } else if (playerLastAttackValue + 1 === removeWord.length) {
        isSameChar = false;
        isDownChain = true;
        CPUdownChainAttack();

    } else if (playerLastAttackValue === removeWord.length) {
        isSameChar = true;
        isUpChain = false;
        isDownChain = false;
        CPUsameCharAttack();

    } else {
        let calculatedAttackVal = playerAttackValue - nerfValue;
        CPUcancelChain();
        CPUattack(playerAttackValue);
        if (calculatedAttackVal > 1) {
            CPUonAttackShake(calculatedAttackVal);
            CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
        }
    }
    playerLastAttackValue = memorizeLastAttackValue;
    lastChar = normalizeHiragana(removeWord.charAt(removeWord.length - 1));
}

function CPUconnect() {
    let calculatedAttackVal = playerAttackValue;
    if (nerfValue !== 0) {
        calculatedAttackVal = playerAttackValue - nerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    isUpChain = false;
    isDownChain = false;
    isSameChar = false;
    CPUattack(playerAttackValue);
    if (chainBonus !== 0) {
        if (chainBonus > 10) {
            let toCalcChainBonusAttack = chainBonus;
            while (toCalcChainBonusAttack > 10) {
                CPUattack(10); // 10を減らす
                toCalcChainBonusAttack -= 10;
            }
            CPUattack(toCalcChainBonusAttack);
        } else if (chainBonus > 1) {
            CPUattack(chainBonus);
        }
    }
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    if (chainBonus % 10 === 1) {
        calculatedAttackVal -= 1;
    }
    if (calculatedAttackVal > 1) {
        CPUonAttackShake(calculatedAttackVal);
        CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
    }
}

function CPUupChainAttack() {
    let calculatedAttackVal = playerAttackValue;
    if (nerfValue !== 0) {
        calculatedAttackVal = playerAttackValue - nerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    if (isDownChain === true) {
        isDownChain = false;
        chainBonus = 2;
        CPUattack(playerAttackValue);
        CPUattack(chainBonus);
        calculatedAttackVal = calculatedAttackVal + chainBonus;
        CPUonAttackShake(calculatedAttackVal);
        CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
        return;
    }
    if (chainBonus === 0) {
        chainBonus = 2;
        CPUattack(playerAttackValue);
        CPUattack(chainBonus);
    } else {
        chainBonus = chainBonus + 2;
        if (chainBonus > 10) {
            CPUattack(playerAttackValue);
            let toCalcChainBonusAttack = chainBonus;
            while (toCalcChainBonusAttack > 10) {
                CPUattack(10);
                toCalcChainBonusAttack -= 10;
            }
            if (toCalcChainBonusAttack > 1) {
                CPUattack(toCalcChainBonusAttack);
            }
        } else {
            CPUattack(playerAttackValue);
            CPUattack(chainBonus);
        }
    }
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    if (chainBonus % 10 === 1) {
        calculatedAttackVal -= 1;
    }
    CPUonAttackShake(calculatedAttackVal);
    CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
}


function CPUdownChainAttack() {
    let calculatedAttackVal = playerAttackValue;
    if (nerfValue !== 0) {
        calculatedAttackVal = playerAttackValue - nerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    if (isUpChain === true) {
        isUpChain = false;
        chainBonus = 2;
        CPUattack(playerAttackValue);
        CPUattack(chainBonus);
        calculatedAttackVal = calculatedAttackVal + chainBonus;
        CPUonAttackShake(calculatedAttackVal);
        CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
        return;
    }
    if (chainBonus === 0) {
        chainBonus = 2;
        CPUattack(playerAttackValue);
        CPUattack(chainBonus);
    } else {
        chainBonus++;
        if (chainBonus > 10) {
            CPUattack(playerAttackValue);
            let toCalcChainBonusAttack = chainBonus;
            while (toCalcChainBonusAttack > 10) {
                CPUattack(10);
                toCalcChainBonusAttack -= 10;
            }
            if (toCalcChainBonusAttack > 1) {
                CPUattack(toCalcChainBonusAttack);
            }
        } else {
            CPUattack(playerAttackValue);
            CPUattack(chainBonus);
        }
    }
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    if (chainBonus % 10 === 1) {
        calculatedAttackVal -= 1;
    }
    CPUonAttackShake(calculatedAttackVal);
    CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
}


function CPUsameCharAttack() {
    let calculatedAttackVal = playerAttackValue;
    if (nerfValue !== 0) {
        calculatedAttackVal = playerAttackValue - nerfValue;
        if (calculatedAttackVal < 2) {
            calculatedAttackVal = 0
        }
    }
    calculatedAttackVal = calculatedAttackVal + playerAttackValue + chainBonus * 2;
    playerAttackValue = playerAttackValue * 2 + chainBonus * 2
    chainBonus = 0;
    if (playerAttackValue > 10) {
        while (playerAttackValue > 10) {
            CPUattack(10);
            playerAttackValue -= 10;
        }
        if (playerAttackValue === 10) {
            const array = [2, 3, 4, 5, 6, 7, 8];
            const randomValue = array[Math.floor(Math.random() * array.length)];
            CPUattack(randomValue);
            CPUattack(10 - randomValue);
        } else if (playerAttackValue > 1) {
            CPUattack(playerAttackValue);
        }
    } else {
        CPUattack(playerAttackValue);
    }
    CPUonAttackShake(calculatedAttackVal);
    CPUdisplayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function CPUattack(attackValue) {
    if (attackValue <= 1 || attackValue >= 11) return;
    if (nerfValue !== 0) {
        let nerfAttackValue = attackValue - nerfValue;
        nerfValue = 0;
        if (nerfAttackValue < 2) {
            CPUupdateNerfInfoDisplay();
            CPUupdateAttackInfoDisplay();
            return;
        } else {
            playerAttackValueToOffset = nerfAttackValue;
            playerAtteckValueToAPM += nerfAttackValue;
            calcReceiveOffsetToDisplay();
            attackValue = calcReceiveOffset();
            playerAttackValueToOffset = 0;
            if (playerReceiveValueToOffset.length === 0) {
                if (attackValue > 1) {
                    isAttackShake = true;
                    opponentReceiveValueToOffset.push(attackValue);
                    opponentReceiveValueToOffset.sort((a, b) => a - b);
                    opponentReceiveValueToDisplay = [...opponentReceiveValueToOffset];
                }
            } else {
                isAttackShake = false;
            }
            CPUupdateAttackInfoDisplay();
        }
        CPUupdateNerfInfoDisplay();
    } else {

        // console.log(playerAttackValueToOffset);
        // console.log(playerReceiveValueToOffset);

        playerAttackValueToOffset = attackValue;
        playerAtteckValueToAPM += attackValue;
        calcReceiveOffsetToDisplay();
        attackValue = calcReceiveOffset();
        playerAttackValueToOffset = 0;
        isAttackShake = false;
        if (playerReceiveValueToOffset.length === 0) {
            if (attackValue > 1) {
                isAttackShake = true;
                opponentReceiveValueToOffset.push(attackValue);
                opponentReceiveValueToOffset.sort((a, b) => a - b);
                opponentReceiveValueToDisplay = [...opponentReceiveValueToOffset];
            }
        }
        CPUupdateAttackInfoDisplay();
    }
    CPUdrawStatusField(ctxOpponentStatus, false);
    CPUdrawStatusField(ctxPlayerStatus, true);
}

function CPUupdateNerfInfoDisplay() {
    if (nerfValue !== 0) {
        animateAttackInfo(playerNerfValue, `Nerf: ${nerfValue}`, false);
    } else {
        playerNerfValue.classList.remove('animate');
        playerNerfValue.classList.add('fade-out');
        setTimeout(() => {
            playerNerfValue.textContent = '';
            playerNerfValue.classList.remove('fade-out');
        }, 500);
    }
}

function CPUcancelChain() {
    isUpChain = false;
    isDownChain = false;
    isSameChar = false;
    chainBonus = 0;
    CPUupdateChainInfoDisplay();
}

function CPUupdateChainInfoDisplay() {
    if (chainBonus !== 0) {
        animateAttackInfo(playerChainBonus, `Chain: ${chainBonus}`, false);
    } else {
        playerChainBonus.classList.remove('animate');
        playerChainBonus.classList.add('fade-out');

        setTimeout(() => {
            playerChainBonus.textContent = '';
            playerChainBonus.classList.remove('fade-out');
        }, 500);
    }
}

function CPUonAttackShake(attackValue) {
    const shakeDistance = Math.min(MAX_SHAKE_DISTANCE, Math.max(MIN_SHAKE_DISTANCE, attackValue));
    const shakeScale = shakeDistance / 200;

    playerGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
    playerGameArea.style.setProperty('--shake-scale', `${shakeScale}`);
    playerGameArea.classList.add('shake-vertical');
    setTimeout(() => playerGameArea.classList.remove('shake-vertical'), 300);

    opponentGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
    opponentGameArea.classList.add('shake-horizontal');
    setTimeout(() => opponentGameArea.classList.remove('shake-horizontal'), 300);
}

function CPUupdateAttackInfoDisplay() {
    let attackType = 'Attack';
    let colorClass = 'attack-normal';
    if (isWordChain) {
        attackType = 'Connect!';
        colorClass = 'attack-connect';
    } else if (isUpChain) {
        attackType = 'UpChain';
        colorClass = 'attack-upchain';
    } else if (isDownChain) {
        attackType = 'DownChain';
        colorClass = 'attack-downchain';
    } else if (isSameChar) {
        attackType = 'DoubleAttack';
        colorClass = 'attack-double';
    }
    animateAttackInfo(playerAttackKind, attackType, colorClass);
    CPUupdateChainInfoDisplay();
}

function CPUupdateChainInfoDisplay() {
    if (chainBonus !== 0) {
        animateAttackInfo(playerChainBonus, `Chain: ${chainBonus}`, false);
    } else {
        playerChainBonus.classList.remove('animate');
        playerChainBonus.classList.add('fade-out');
        setTimeout(() => {
            playerChainBonus.textContent = '';
            playerChainBonus.classList.remove('fade-out');
        }, 500);
    }
}

function CPUhandleGameOver() {
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
    opponentWins++;
    playerIsLoser = true;
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
        drawGameOverUI('Lose');
        setTimeout(() => {
            resetGameAnimation();
            setTimeout(() => {
                CPUstartCountdown();
            }, 4000);
        }, 1500);
    }
}


function CPUresetGame() {
    soundManager.stop('warning');
    lastInputWordLength = 0;
    isWordDecided = false;
    lastInputWordLength = 0;
    isGameOver = false;
    gameStepInterval = 10000;

    // プレイヤーデータのリセット
    wordPool = [];
    playerField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
    playerFieldWords = [];
    playerInput = '';
    playerUsedLengths = [];
    playerAttackValue = 0;
    playerLastAttackValue = 0;
    playerAttackValueToOffset = 0;
    playerReceiveValueToOffset = [];
    playerAttackValueToDisplay = [];
    playerReceiveValueToDisplay = [];
    lastChar = "";
    isWordChain = false;
    nerfValue = 0;
    memorizeLastAttackValue = 0;

    opponentWordPool = [];
    opponentField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
    opponentFieldWords = [];
    opponentInput = '';
    opponentUsedLengths = [];
    opponentAttackValue = 0;
    opponentLastAttackValue = 0;
    opponentAttackValueToOffset = 0;
    opponentReceiveValueToOffset = [];
    opponentAttackValueToDisplay = [];
    opponentReceiveValueToDisplay = [];
    CPUlastChar = "";
    CPUisWordChain = false;
    CPUnerfValue = 0;
    opponentMemorizeLastAttackValue = 0;

    charColorMap.clear();
    usedColors.clear();

    CPUcharColorMap.clear();
    CPUusedColors.clear();

    CPUcancelChain();
    CPUopponentCancelChain();

    stopDrawInfo()

    clearProgressBar();

    // playerInfoをリセット
    playerKeyValueToKPM = 0;
    playerAtteckValueToAPM = 0;
    playerWordValueToWPM = 0;
    totalTime = 0;

    opponentKeyValueToKPM = 0;
    opponentAtteckValueToAPM = 0;
    opponentWordValueToWPM = 0;

    // 相手のデータもリセット
    opponentField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
    opponentFieldWords = [];
    opponentInput = '';

    // キャンバスをクリア
    clearField(playerField);
    clearField(opponentField);
    drawField(ctxPlayer, playerField, memorizeLastAttackValue);
    drawField(ctxOpponent, opponentField, 0);
    drawInputField(ctxPlayerInput, '', playerInputField);
    drawInputField(ctxOpponentInput, '', opponentInputField);
    drawStatusField(ctxPlayerStatus, true);
    cleanupWarningAnimations();
    removeAuraEffectFromOverlay(playerOverlayElement);
    removeAuraEffectFromOverlay(opponentOverlayElement);

}