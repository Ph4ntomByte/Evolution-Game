let playerName = '';
let selectedDifficulty = 'easy';
let gameBoard = [];
let gameRunning = false;
let gameTime = 0;
let gameTimer = null;
let gameScore = 0;
let evolutionScores = {};
let selectedCellIndex = null;
let tooltipTimer = null;

let startScreen;
let gameScreen;
let gameOverPopup;
let playerNameInput;
let difficultyButtons;
let playButton;
let gameBoardElement;
let drawButton;
let displayNameElement;
let displayDifficultyElement;
let timeRemainingElement;
let currentScoreElement;
let finalScoreElement;
let returnButton;
let restartButton;
let evolutionChainsElement;
let leaderboardTabButtons;
let leaderboardContentElement;
let techTooltip;
let tooltipTitle;
let tooltipDescription;
let tooltipEvolutionImg;
let backButton;

function init() {
    startScreen = document.getElementById('start-screen');
    gameScreen = document.getElementById('game-screen');
    gameOverPopup = document.getElementById('game-over');
    playerNameInput = document.getElementById('player-name');
    difficultyButtons = document.querySelectorAll('.difficulty-btn');
    playButton = document.getElementById('play-btn');
    gameBoardElement = document.getElementById('game-board');
    drawButton = document.getElementById('draw-btn');
    displayNameElement = document.getElementById('display-name');
    displayDifficultyElement = document.getElementById('display-difficulty');
    timeRemainingElement = document.getElementById('time-remaining');
    currentScoreElement = document.getElementById('current-score');
    finalScoreElement = document.getElementById('final-score');
    returnButton = document.getElementById('return-btn');
    restartButton = document.getElementById('restart-btn');
    evolutionChainsElement = document.getElementById('evolution-chains');
    leaderboardTabButtons = document.querySelectorAll('.leaderboard-tab');
    leaderboardContentElement = document.getElementById('leaderboard-content');
    techTooltip = document.getElementById('tech-tooltip');
    tooltipTitle = document.getElementById('tooltip-title');
    tooltipDescription = document.getElementById('tooltip-description');
    tooltipEvolutionImg = document.getElementById('tooltip-evolution-img');
    backButton = document.getElementById('back-btn');

    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedDifficulty = button.dataset.difficulty;
        });
    });

    playButton.addEventListener('click', startGame);
    drawButton.addEventListener('click', generateRandomTechnology);
    returnButton.addEventListener('click', returnToStart);
    restartButton.addEventListener('click', restartGame);

    if (backButton) {
        backButton.addEventListener('click', handleBackButton);
    }

    leaderboardTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            leaderboardTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayLeaderboard(button.dataset.tab);
        });
    });

    difficultyButtons[0].classList.add('selected');
    displayLeaderboard('easy');
    loadGameState();

    window.addEventListener('beforeunload', function(event) {
        if (gameRunning) {
            saveGameState();
            const message = 'You have a game in progress. Are you sure you want to leave?';
            event.returnValue = message;
            return message;
        }
    });
}

function loadGameState() {
    const savedState = localStorage.getItem('webProgEvolutions');
    if (savedState) {
        const state = JSON.parse(savedState);
        playerName = state.playerName;
        selectedDifficulty = state.selectedDifficulty;
        gameBoard = state.gameBoard;
        gameTime = state.gameTime;
        gameScore = state.gameScore;
        evolutionScores = state.evolutionScores;
        showGameScreen();
        renderGameBoard();
        updateScoreDisplay();
        updateEvolutionChains();
        startTimer();
    }
}

function saveGameState() {
    if (!gameRunning) return;
    const state = {
        playerName,
        selectedDifficulty,
        gameBoard,
        gameTime,
        gameScore,
        evolutionScores
    };
    localStorage.setItem('webProgEvolutions', JSON.stringify(state));
}

function clearSavedGameState() {
    localStorage.removeItem('webProgEvolutions');
}

function startGame() {
    if (!playerNameInput.value.trim()) {
        alert('Please enter your name!');
        return;
    }

    playerName = playerNameInput.value.trim();
    gameRunning = true;
    gameScore = 0;
    evolutionScores = {};
    selectedCellIndex = null;
    const difficultySettings = levels[selectedDifficulty];
    gameTime = difficultySettings.time * 60;
    const rows = difficultySettings.rows;
    const cols = difficultySettings.cols;
    initializeGameBoard(rows, cols);
    const initialTechCount = Math.min(rows, cols);
    for (let i = 0; i < initialTechCount; i++) {
        placeRandomTechnology();
    }
    showGameScreen();
    startTimer();
    updateScoreDisplay();
    updateEvolutionChains();
    saveGameState();
}

function showGameScreen() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    displayNameElement.textContent = playerName;
    displayDifficultyElement.textContent = levels[selectedDifficulty].name;
    const rows = levels[selectedDifficulty].rows;
    const cols = levels[selectedDifficulty].cols;
    gameBoardElement.style.setProperty('--rows', rows);
    gameBoardElement.style.setProperty('--cols', cols);
}

function initializeGameBoard(rows, cols) {
    gameBoard = [];
    for (let i = 0; i < rows * cols; i++) {
        gameBoard.push(null);
    }
    renderGameBoard();
}

function renderGameBoard() {
    gameBoardElement.innerHTML = '';
    gameBoard.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        if (selectedCellIndex === index) {
            cellElement.classList.add('selected');
        }
        if (cell) {
            const img = document.createElement('img');
            img.src = `starter_pack/assets/logos/${cell.img}`;
            img.alt = cell.name;
            cellElement.appendChild(img);
            const stepIndicator = document.createElement('div');
            stepIndicator.classList.add('tech-step');
            stepIndicator.textContent = cell.step;
            cellElement.appendChild(stepIndicator);
            if (cell.step === 6) {
                cellElement.classList.add('max-level');
            }
        } else {
            cellElement.classList.add('empty');
        }
        cellElement.addEventListener('click', () => handleCellClick(index));
        cellElement.addEventListener('mouseenter', () => {
            if (cell) startTooltipTimer(cell, cellElement);
        });
        cellElement.addEventListener('mouseleave', () => {
            clearTimeout(tooltipTimer);
            techTooltip.classList.add('hidden');
        });
        gameBoardElement.appendChild(cellElement);
    });
}

function handleCellClick(index) {
    if (!gameRunning) return;
    const cell = gameBoard[index];
    if (cell) {
        if (cell.step === 6) {
            const evolutionChain = findEvolutionChain(cell);
            if (evolutionChain) {
                gameBoard[index].isCompleting = true;
                const cells = document.querySelectorAll('.cell');
                cells[index].classList.add('completed');
                setTimeout(() => {
                    if (gameBoard[index] && gameBoard[index].isCompleting) {
                        addEvolutionScore(evolutionChain);
                        gameBoard[index] = null;
                        renderGameBoard();
                        saveGameState();
                    }
                }, 1000);
            }
            return;
        }
        if (selectedCellIndex !== null) {
            const selectedCell = gameBoard[selectedCellIndex];
            if (selectedCell && selectedCell.name === cell.name && selectedCell.step === cell.step && selectedCellIndex !== index) {
                mergetechnologies(selectedCellIndex, index);
            } else if (selectedCellIndex === index) {
                document.querySelectorAll('.cell')[selectedCellIndex].classList.remove('selected');
                selectedCellIndex = null;
            } else {
                document.querySelectorAll('.cell')[selectedCellIndex].classList.remove('selected');
                selectedCellIndex = index;
                document.querySelectorAll('.cell')[index].classList.add('selected');
            }
        } else {
            selectedCellIndex = index;
            document.querySelectorAll('.cell')[index].classList.add('selected');
        }
    } else {
        generateTechnology(index);
    }
}

function mergetechnologies(index1, index2) {
    const cell = gameBoard[index1];
    const evolutionChain = findEvolutionChain(cell);
    if (!evolutionChain) return;
    const nextStep = evolutionChain.steps.find(step => step.step === cell.step + 1);
    if (!nextStep) return;
    gameBoard[index2] = nextStep;
    gameBoard[index1] = null;
    selectedCellIndex = null;
    const newTech = getRandomLevel1Technology();
    if (newTech) {
        gameBoard[index1] = newTech;
    }
    const cells = document.querySelectorAll('.cell');
    cells[index2].classList.add('merge');
    setTimeout(() => {
        cells[index2].classList.remove('merge');
        if (nextStep.step === 6) {
            cells[index2].classList.add('max-level');
        }
    }, 700);
    renderGameBoard();
    saveGameState();
}

function generateTechnology(index) {
    if (gameBoard[index] !== null) return;
    const technology = getRandomLevel1Technology();
    if (technology) {
        gameBoard[index] = technology;
        renderGameBoard();
        saveGameState();
    }
}

function generateRandomTechnology() {
    placeRandomTechnology();
    renderGameBoard();
    saveGameState();
}

function placeRandomTechnology() {
    const emptyCells = gameBoard.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    if (emptyCells.length === 0) return false;
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const technology = getRandomLevel1Technology();
    if (technology) {
        gameBoard[randomIndex] = technology;
        return true;
    }
    return false;
}

function getRandomLevel1Technology() {
    const availableEvolutions = evolutions.filter(evolution => {
        switch (selectedDifficulty) {
            case 'easy':
                return evolution.difficulty === 'easy';
            case 'medium':
                return evolution.difficulty === 'easy' || evolution.difficulty === 'medium';
            case 'hard':
                return true;
        }
    });
    let weightedEvolutions = [];
    if (selectedDifficulty === 'medium') {
        availableEvolutions.forEach(evolution => {
            if (evolution.difficulty === 'easy') {
                for (let i = 0; i < 7; i++) weightedEvolutions.push(evolution);
            } else {
                for (let i = 0; i < 3; i++) weightedEvolutions.push(evolution);
            }
        });
    } else if (selectedDifficulty === 'hard') {
        availableEvolutions.forEach(evolution => {
            if (evolution.difficulty === 'easy') {
                for (let i = 0; i < 5; i++) weightedEvolutions.push(evolution);
            } else if (evolution.difficulty === 'medium') {
                for (let i = 0; i < 3; i++) weightedEvolutions.push(evolution);
            } else {
                for (let i = 0; i < 2; i++) weightedEvolutions.push(evolution);
            }
        });
    } else {
        weightedEvolutions = availableEvolutions;
    }
    if (weightedEvolutions.length === 0) return null;
    const randomEvolution = weightedEvolutions[Math.floor(Math.random() * weightedEvolutions.length)];
    return randomEvolution.steps[0];
}

function findEvolutionChain(tech) {
    return evolutions.find(evolution => 
        evolution.steps.some(step => step.name === tech.name && step.step === tech.step)
    );
}
function addEvolutionScore(evolutionChain) {
    const points = levels[selectedDifficulty].points;
    gameScore += points;
    evolutionScores[evolutionChain.name] = (evolutionScores[evolutionChain.name] || 0) + points;
    updateScoreDisplay();
    updateEvolutionChains();
    currentScoreElement.classList.add('pulse');
    setTimeout(() => {
        currentScoreElement.classList.remove('pulse');
    }, 500);
    showCompletionMessage(evolutionChain.name);
}

function showCompletionMessage(chainName) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('completion-message');
    messageElement.innerHTML = `
        <div class="completion-header">
            <span class="completion-chain">${chainName}</span> Evolution Completed!
        </div>
        <div class="completion-points">
            +${levels[selectedDifficulty].points} Points
        </div>
    `;
    document.body.appendChild(messageElement);

    try {
        const completionSound = new Audio('data:audio/mp3;base64,SUQzBAAAA...');
        completionSound.play();
    } catch (e) {}

    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);

    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, 3000);
}

function updateScoreDisplay() {
    currentScoreElement.textContent = gameScore;
}

function updateEvolutionChains() {
    evolutionChainsElement.innerHTML = '';
    const availableEvolutions = evolutions.filter(evolution => {
        switch (selectedDifficulty) {
            case 'easy':
                return evolution.difficulty === 'easy';
            case 'medium':
                return evolution.difficulty === 'easy' || evolution.difficulty === 'medium';
            case 'hard':
                return true;
        }
    });

    availableEvolutions.forEach(evolution => {
        const score = evolutionScores[evolution.name] || 0;
        const completed = score > 0;
        const chainElement = document.createElement('div');
        chainElement.classList.add('evolution-chain');
        if (completed) chainElement.classList.add('completed');
        chainElement.innerHTML = `
            <div class="chain-name">${evolution.name}</div>
            <div class="chain-score">${score}</div>
        `;
        evolutionChainsElement.appendChild(chainElement);
    });
}

function startTooltipTimer(cell, cellElement) {
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => {
        const evolutionChain = findEvolutionChain(cell);
        if (!evolutionChain) return;
        const rect = cellElement.getBoundingClientRect();
        const tooltipHeight = 300;
        let top = rect.top + window.scrollY;
        if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - 20;
        }
        techTooltip.style.top = `${top}px`;
        techTooltip.style.left = `${rect.right + window.scrollX + 10}px`;
        tooltipTitle.textContent = cell.name;
        tooltipDescription.textContent = cell.description;
        tooltipEvolutionImg.src = `starter_pack/assets/evolutions/${evolutionChain.tooltip}`;
        tooltipEvolutionImg.alt = evolutionChain.name;
        techTooltip.classList.remove('hidden');
    }, 3000);
}

function startTimer() {
    if (gameTimer) clearInterval(gameTimer);
    updateTimerDisplay();
    gameTimer = setInterval(() => {
        gameTime--;
        if (gameTime <= 0) {
            endGame();
        } else {
            updateTimerDisplay();
            saveGameState();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timeRemainingElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    gameRunning = false;
    clearInterval(gameTimer);
    selectedCellIndex = null;
    finalScoreElement.textContent = gameScore;
    gameOverPopup.classList.remove('hidden');
    checkHighScore();
    clearSavedGameState();
}

function checkHighScore() {
    const leaderboard = getLeaderboard(selectedDifficulty);
    leaderboard.push({ name: playerName, score: gameScore });
    leaderboard.sort((a, b) => b.score - a.score);
    const newLeaderboard = leaderboard.slice(0, 5);
    saveLeaderboard(selectedDifficulty, newLeaderboard);
    displayLeaderboard(selectedDifficulty);
}

function getLeaderboard(difficulty) {
    const leaderboardKey = `webProgEvolutions_${difficulty}`;
    const storedLeaderboard = localStorage.getItem(leaderboardKey);
    return storedLeaderboard ? JSON.parse(storedLeaderboard) : [];
}

function saveLeaderboard(difficulty, leaderboard) {
    const leaderboardKey = `webProgEvolutions_${difficulty}`;
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
}

function displayLeaderboard(difficulty) {
    const leaderboard = getLeaderboard(difficulty);
    leaderboardContentElement.innerHTML = '';
    if (leaderboard.length === 0) {
        leaderboardContentElement.innerHTML = '<p>No scores yet!</p>';
        return;
    }
    leaderboard.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('leaderboard-entry');
        entryElement.innerHTML = `
            <div class="leaderboard-name">${index + 1}. ${entry.name}</div>
            <div class="leaderboard-score">${entry.score}</div>
        `;
        leaderboardContentElement.appendChild(entryElement);
    });
}

function returnToStart() {
    gameRunning = false;
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('tech-tooltip').classList.add('hidden');
    return false;
}

window.returnToStart = returnToStart;

function restartGame() {
    if (gameRunning && !gameOverPopup.classList.contains('hidden')) {
        const confirmRestart = confirm('Are you sure you want to restart the game? Your current progress will be lost.');
        if (!confirmRestart) return;
    }
    gameOverPopup.classList.add('hidden');
    startGame();
}

function handleBackButton() {
    if (gameRunning) {
        const confirmExit = confirm('Are you sure you want to exit the game? Your progress will be saved.');
        if (confirmExit) {
            saveGameState();
            returnToStart();
        }
    } else {
        returnToStart();
    }
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back-btn');
    if (backButton) {
        backButton.addEventListener('click', function() {
            returnToStart();
        });
    }
});
