# Web Prog Evolutions

## Declaration

I, David Smith, declare that this submission is my own work and follows the academic integrity policy. I have neither shared my solution nor copied from external sources.

## Game Description

Web Prog Evolutions is an educational puzzle game where players develop and merge different web technologies to explore the evolution of web programming. The game helps to visually and interactively understand the complex process of web technology evolution.

## Implementation Details

The game is implemented using vanilla JavaScript, HTML5, and CSS3, without any frameworks or libraries. The main game mechanics include:

- Three difficulty levels (Easy, Medium, Hard) with different board sizes
- Time-limited gameplay (10, 15, or 20 minutes)
- Random technology generation with weighted difficulty
- Merging identical technologies to create higher-level evolutions
- Evolution chain tracking and scoring
- Tooltips showing the full evolution chains
- Local storage for saving game state and leaderboards

## Self-Evaluation Checklist

### Minimum Requirements (8 points)
- [X] README.md – The game documentation is properly completed and included
- [X] Avoiding Disallowed Practices – The listed bad practices have not been used in implementation
- [X] Displaying the Game Board – When the game starts, the game screen appears, generating a board of selectable size (4x4, 6x6, 8x8)
- [X] Random Starting Technologies – At the start of the game, 4, 6, or 8 random level 1 technologies are placed on the board
- [X] Tooltip System – Hovering over an element for 3 seconds displays a tooltip with the evolution chain and description
- [X] Generating New Technologies – The player can generate new level 1 technologies on the board (by clicking on an empty cell or the "DRAW" button)
- [X] Merging Technologies – If two identical elements merge, a higher-level technology is created

### Core Tasks (12 points)
- [X] Start Screen – The player can enter their name and choose a difficulty level
- [X] Game UI – The player's name, score, and the level's time limit are displayed
- [X] Game UI – The selected difficulty level determines the time limit, board size, and available evolution elements
- [X] Scoring – Completing evolution chains adds points to the total score and the respective technology's score
- [X] Time Management – The time limit (10-15-20 minutes) decreases as the game progresses
- [X] Time Management – The game ends when the set time limit (10-15-20 minutes) runs out
- [X] Game Over Screen – A popup appears at the end of the game displaying the results
- [X] Leaderboard – The final score is compared to the top scores for the selected difficulty level
- [X] Polished Appearance – The game has a visually appropriate design (grid layout, tooltip animations, icons)

### Bonus Tasks (5 points)
- [X] Step Animations – Merging technologies includes an animated transition
- [X] Weighted Random Generation – New technology generation takes difficulty level into account
- [X] Save Feature – The game continuously saves its state to localStorage
- [X] Restart Option – The Game Over screen provides options to start a new game or restart with the same settings

## How to Play

1. Enter your name and select a difficulty level on the start screen
2. Click on empty cells or the "DRAW" button to generate level 1 technologies
3. Select and then merge identical technologies to create higher-level evolutions
4. Complete evolution chains by reaching level 6 to earn points
5. Try to collect as many points as possible before the time runs out

## Files Included
- index.html - Main HTML file
- styles.css - CSS styles for the game
- game.js - Game logic implementation
- starter_pack/ - Folder containing provided assets and evolution data 