// Game state variables
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

// DOM elements
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

// Initialize the game
function init() {
    // Initialize DOM elements
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
    
    console.log('Back button element:', backButton);
    
    // Add event listeners
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
    
    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', handleBackButton);
        console.log('Back button event listener added');
    } else {
        console.error('Back button not found in the DOM');
    }
    
    leaderboardTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            leaderboardTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayLeaderboard(button.dataset.tab);
        });
    });

    // Select 'easy' as default difficulty
    difficultyButtons[0].classList.add('selected');

    // Load leaderboard from localStorage
    displayLeaderboard('easy');

    // Check for saved game
    loadGameState();
    
    // Prevent accidental page refreshes or navigation
    window.addEventListener('beforeunload', function(event) {
        if (gameRunning) {
            // Save game state
            saveGameState();
            
            // Show confirmation dialog
            const message = 'You have a game in progress. Are you sure you want to leave?';
            event.returnValue = message;
            return message;
        }
    });
}

// Load game state from localStorage
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
        
        // Continue the saved game
        showGameScreen();
        renderGameBoard();
        updateScoreDisplay();
        updateEvolutionChains();
        startTimer();
    }
}

// Save game state to localStorage
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

// Clear saved game state
function clearSavedGameState() {
    localStorage.removeItem('webProgEvolutions');
}

// Start a new game
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

    // Get difficulty settings
    const difficultySettings = levels[selectedDifficulty];
    gameTime = difficultySettings.time * 60; // Convert minutes to seconds

    // Initialize game board
    const rows = difficultySettings.rows;
    const cols = difficultySettings.cols;
    initializeGameBoard(rows, cols);

    // Generate initial technologies
    const initialTechCount = Math.min(rows, cols);
    for (let i = 0; i < initialTechCount; i++) {
        placeRandomTechnology();
    }

    // Display game screen
    showGameScreen();

    // Start timer
    startTimer();

    // Update UI
    updateScoreDisplay();
    updateEvolutionChains();

    // Save initial state
    saveGameState();
}

// Show game screen
function showGameScreen() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Update player info
    displayNameElement.textContent = playerName;
    displayDifficultyElement.textContent = levels[selectedDifficulty].name;
    
    // Set game board grid
    const rows = levels[selectedDifficulty].rows;
    const cols = levels[selectedDifficulty].cols;
    gameBoardElement.style.setProperty('--rows', rows);
    gameBoardElement.style.setProperty('--cols', cols);
}

// Initialize game board
function initializeGameBoard(rows, cols) {
    gameBoard = [];
    for (let i = 0; i < rows * cols; i++) {
        gameBoard.push(null);
    }
    renderGameBoard();
}

// Render game board
function renderGameBoard() {
    gameBoardElement.innerHTML = '';
    
    gameBoard.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        
        // Add selected class if this is the selected cell
        if (selectedCellIndex === index) {
            cellElement.classList.add('selected');
        }
        
        if (cell) {
            // Add technology image
            const img = document.createElement('img');
            img.src = `starter_pack/assets/logos/${cell.img}`;
            img.alt = cell.name;
            cellElement.appendChild(img);
            
            // Add step indicator
            const stepIndicator = document.createElement('div');
            stepIndicator.classList.add('tech-step');
            stepIndicator.textContent = cell.step;
            cellElement.appendChild(stepIndicator);
            
            // Add special styling for level 6 technologies
            if (cell.step === 6) {
                cellElement.classList.add('max-level');
            }
        } else {
            cellElement.classList.add('empty');
        }
        
        // Cell click event
        cellElement.addEventListener('click', () => handleCellClick(index));
        
        // Tooltip hover
        cellElement.addEventListener('mouseenter', () => {
            if (cell) {
                startTooltipTimer(cell, cellElement);
            }
        });
        
        cellElement.addEventListener('mouseleave', () => {
            clearTimeout(tooltipTimer);
            techTooltip.classList.add('hidden');
        });
        
        gameBoardElement.appendChild(cellElement);
    });
}

// Handle cell click
function handleCellClick(index) {
    if (!gameRunning) return;
    
    const cell = gameBoard[index];
    
    if (cell) {
        // Check if this is step 6 (final evolution)
        if (cell.step === 6) {
            // Add points for completed evolution
            const evolutionChain = findEvolutionChain(cell);
            if (evolutionChain) {
                // Mark the tech as about to be completed
                gameBoard[index].isCompleting = true;
                
                // Highlight the cell to show completion
                const cells = document.querySelectorAll('.cell');
                cells[index].classList.add('completed');
                
                // Add the score after a short delay to show the completion
                setTimeout(() => {
                    if (gameBoard[index] && gameBoard[index].isCompleting) {
                        addEvolutionScore(evolutionChain);
                        gameBoard[index] = null; // Remove the cell
                        renderGameBoard();
                        saveGameState();
                    }
                }, 1000);
            }
            return;
        }
        
        // Check if we have a selected cell already
        if (selectedCellIndex !== null) {
            const selectedCell = gameBoard[selectedCellIndex];
            
            // Check if same technology and step
            if (selectedCell && selectedCell.name === cell.name && selectedCell.step === cell.step && selectedCellIndex !== index) {
                // Merge to create next step
                mergetechnologies(selectedCellIndex, index);
            } else if (selectedCellIndex === index) {
                // Deselect if clicking on the same cell
                document.querySelectorAll('.cell')[selectedCellIndex].classList.remove('selected');
                selectedCellIndex = null;
            } else {
                // Deselect previous cell and select this one
                document.querySelectorAll('.cell')[selectedCellIndex].classList.remove('selected');
                selectedCellIndex = index;
                document.querySelectorAll('.cell')[index].classList.add('selected');
            }
        } else {
            // Select this cell
            selectedCellIndex = index;
            document.querySelectorAll('.cell')[index].classList.add('selected');
        }
    } else {
        // Empty cell - generate a random technology
        generateTechnology(index);
    }
}

// Merge technologies
function mergetechnologies(index1, index2) {
    const cell = gameBoard[index1];
    
    // Find the next step in the evolution
    const evolutionChain = findEvolutionChain(cell);
    if (!evolutionChain) return;
    
    const nextStep = evolutionChain.steps.find(step => step.step === cell.step + 1);
    if (!nextStep) return;
    
    // Place the next step at index2
    gameBoard[index2] = nextStep;
    
    // Clear the first cell and deselect
    gameBoard[index1] = null;
    selectedCellIndex = null;
    
    // Place a new random level 1 technology at index1
    const newTech = getRandomLevel1Technology();
    if (newTech) {
        gameBoard[index1] = newTech;
    }
    
    // Animate the merge
    const cells = document.querySelectorAll('.cell');
    cells[index2].classList.add('merge');
    setTimeout(() => {
        cells[index2].classList.remove('merge');
        
        // If this is the final evolution step, highlight it
        if (nextStep.step === 6) {
            cells[index2].classList.add('max-level');
        }
    }, 700);
    
    // Update the board
    renderGameBoard();
    saveGameState();
}

// Generate random technology at specific index
function generateTechnology(index) {
    if (gameBoard[index] !== null) return;
    
    const technology = getRandomLevel1Technology();
    if (technology) {
        gameBoard[index] = technology;
        renderGameBoard();
        saveGameState();
    }
}

// Generate random technology at random empty spot
function generateRandomTechnology() {
    placeRandomTechnology();
    renderGameBoard();
    saveGameState();
}

// Place a random technology in an empty cell
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

// Get a random level 1 technology based on difficulty
function getRandomLevel1Technology() {
    // Filter evolutions by difficulty
    const availableEvolutions = evolutions.filter(evolution => {
        switch (selectedDifficulty) {
            case 'easy':
                return evolution.difficulty === 'easy';
            case 'medium':
                return evolution.difficulty === 'easy' || evolution.difficulty === 'medium';
            case 'hard':
                return true; // All difficulties available
        }
    });
    
    // Weight by difficulty
    let weightedEvolutions = [];
    
    if (selectedDifficulty === 'medium') {
        // 70% easy, 30% medium
        availableEvolutions.forEach(evolution => {
            if (evolution.difficulty === 'easy') {
                for (let i = 0; i < 7; i++) weightedEvolutions.push(evolution);
            } else {
                for (let i = 0; i < 3; i++) weightedEvolutions.push(evolution);
            }
        });
    } else if (selectedDifficulty === 'hard') {
        // 50% easy, 30% medium, 20% hard
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
    
    // Select a random evolution
    const randomEvolution = weightedEvolutions[Math.floor(Math.random() * weightedEvolutions.length)];
    
    // Return the first step
    return randomEvolution.steps[0];
}

// Find evolution chain for a technology
function findEvolutionChain(tech) {
    return evolutions.find(evolution => 
        evolution.steps.some(step => step.name === tech.name && step.step === tech.step)
    );
}

// Add score for completing an evolution chain
function addEvolutionScore(evolutionChain) {
    const points = levels[selectedDifficulty].points;
    gameScore += points;
    
    // Update evolution scores
    evolutionScores[evolutionChain.name] = (evolutionScores[evolutionChain.name] || 0) + points;
    
    // Update displays
    updateScoreDisplay();
    updateEvolutionChains();
    
    // Animate score
    currentScoreElement.classList.add('pulse');
    setTimeout(() => {
        currentScoreElement.classList.remove('pulse');
    }, 500);
    
    // Show completion message
    showCompletionMessage(evolutionChain.name);
}

// Show a temporary completion message
function showCompletionMessage(chainName) {
    // Create message element
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
    
    // Play completion sound if supported
    try {
        const completionSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD09PT09PUxMTExMWFhYWFhYZmZmZmZmdHR0dHR0goKCgoKCkJCQkJCQnp6enp6epKSkpKSksbGxsbGxvr6+vr6+zMzMzMzM2tra2tra6Ojo6Ojo9PT09PT0//8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQBHgAAACcBg2qEEQQEBJ4NAH+UWZbQYFCkdAAYb5OVlRZm5OmYJYb0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEludHJvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExhdmY1OC4yOS4xMDAAAAAAAAAAAAAAAAD/+1DEAAAAJZGK0MAAngWqHYRwwgAMIrABXEsMNww3hA1Lxk/KAkpGIABDyUi5y//48WD98/5w+NPf3/z8oAAAAA9BUV3/9vqEumhhGGEIAgA+D4Pg+D4PhzfB8Hw7/B8H49g+D4fhvGn/w/GsD4PrB8H19YPGsH1/GsPrB/fz1jTDQTA0NMPTMlJaWlpAAAAAAAAAAAAAAAAAAAAPLm9pcWJtcm9wZ3N0VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LEjgJMjhw5HmMAInDDCKPMJABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
        completionSound.play();
    } catch (e) {
        // Ignore if audio can't be played
        console.log("Audio not supported");
    }
    
    // Animate and remove
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

// Update score display
function updateScoreDisplay() {
    currentScoreElement.textContent = gameScore;
}

// Update evolution chains display
function updateEvolutionChains() {
    evolutionChainsElement.innerHTML = '';
    
    // Filter evolutions by difficulty
    const availableEvolutions = evolutions.filter(evolution => {
        switch (selectedDifficulty) {
            case 'easy':
                return evolution.difficulty === 'easy';
            case 'medium':
                return evolution.difficulty === 'easy' || evolution.difficulty === 'medium';
            case 'hard':
                return true; // All difficulties available
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

// Start tooltip timer
function startTooltipTimer(cell, cellElement) {
    clearTimeout(tooltipTimer);
    
    tooltipTimer = setTimeout(() => {
        const evolutionChain = findEvolutionChain(cell);
        if (!evolutionChain) return;
        
        // Position tooltip
        const rect = cellElement.getBoundingClientRect();
        const tooltipHeight = 300; // Estimated height
        
        let top = rect.top + window.scrollY;
        if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - 20;
        }
        
        techTooltip.style.top = `${top}px`;
        techTooltip.style.left = `${rect.right + window.scrollX + 10}px`;
        
        // Set tooltip content
        tooltipTitle.textContent = cell.name;
        tooltipDescription.textContent = cell.description;
        tooltipEvolutionImg.src = `starter_pack/assets/evolutions/${evolutionChain.tooltip}`;
        tooltipEvolutionImg.alt = evolutionChain.name;
        
        // Show tooltip
        techTooltip.classList.remove('hidden');
    }, 3000); // 3 seconds hover
}

// Start game timer
function startTimer() {
    // Clear any existing timer
    if (gameTimer) clearInterval(gameTimer);
    
    // Update timer display
    updateTimerDisplay();
    
    // Start interval
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

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timeRemainingElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// End the game
function endGame() {
    gameRunning = false;
    clearInterval(gameTimer);
    
    // Reset cell selection
    selectedCellIndex = null;
    
    // Update final score
    finalScoreElement.textContent = gameScore;
    
    // Show game over popup
    gameOverPopup.classList.remove('hidden');
    
    // Check for high score
    checkHighScore();
    
    // Clear saved game
    clearSavedGameState();
}

// Check if current score is a high score
function checkHighScore() {
    const leaderboard = getLeaderboard(selectedDifficulty);
    
    // Add current score
    leaderboard.push({
        name: playerName,
        score: gameScore
    });
    
    // Sort by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 5
    const newLeaderboard = leaderboard.slice(0, 5);
    
    // Save back to localStorage
    saveLeaderboard(selectedDifficulty, newLeaderboard);
    
    // Update display
    displayLeaderboard(selectedDifficulty);
}

// Get leaderboard for a difficulty
function getLeaderboard(difficulty) {
    const leaderboardKey = `webProgEvolutions_${difficulty}`;
    const storedLeaderboard = localStorage.getItem(leaderboardKey);
    
    return storedLeaderboard ? JSON.parse(storedLeaderboard) : [];
}

// Save leaderboard for a difficulty
function saveLeaderboard(difficulty, leaderboard) {
    const leaderboardKey = `webProgEvolutions_${difficulty}`;
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
}

// Display leaderboard for a difficulty
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

// Return to start screen
function returnToStart() {
    console.log('Returning to start screen');
    
    // Stop the game
    gameRunning = false;
    
    // Remove any active timers
    if (gameTimer) {
        console.log('Clearing game timer');
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    // Hide game screen and show start screen
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    
    // Hide any tooltips
    document.getElementById('tech-tooltip').classList.add('hidden');
    
    return false; // Prevent default action if used in onclick
}

// Make returnToStart globally accessible
window.returnToStart = returnToStart;

// Restart game with same settings
function restartGame() {
    // If a game is already running, confirm restart
    if (gameRunning && !gameOverPopup.classList.contains('hidden')) {
        const confirmRestart = confirm('Are you sure you want to restart the game? Your current progress will be lost.');
        if (!confirmRestart) {
            return;
        }
    }
    
    gameOverPopup.classList.add('hidden');
    startGame();
}

// Handle back button click
function handleBackButton() {
    console.log('Back button clicked');
    
    if (gameRunning) {
        const confirmExit = confirm('Are you sure you want to exit the game? Your progress will be saved.');
        if (confirmExit) {
            // Save game state
            saveGameState();
            
            // Return to start screen
            returnToStart();
        }
    } else {
        returnToStart();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', init);

// Ensure back button works by adding direct listener after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back-btn');
    if (backButton) {
        backButton.addEventListener('click', function() {
            console.log('Back button clicked directly');
            returnToStart();
        });
    }
}); 