/**
 * Number Guessing Game - JavaScript Logic
 * 
 * This game generates a random number between 1 and 99, and the player
 * has 5 attempts to guess it correctly. The game provides feedback after
 * each guess (too high, too low, or correct).
 */

// ========================================
// DOM ELEMENT REFERENCES
// ========================================
// These constants store references to HTML elements that we'll interact with

const guessInput = document.getElementById('guess');  // Input field where user types their guess
const submitButton = document.getElementById('submit');  // Button to submit the guess
const resetButton = document.getElementById('reset');  // Button to restart the game
const messages = document.getElementsByClassName('message');  // Collection of all message elements
const tooHighMessage = document.getElementById('too-high');  // Message displayed when guess is too high
const tooLowMessage = document.getElementById('too-low');  // Message displayed when guess is too low
const maxGuessesMessage = document.getElementById('max-guesses');  // Message displayed when out of guesses
const numberOfGuessesMessage = document.getElementById('number-of-guesses');  // Message showing guess count
const correctMessage = document.getElementById('correct');  // Message displayed when guess is correct

// ========================================
// GAME STATE VARIABLES
// ========================================

let targetNumber;  // The random number the player needs to guess
let attempts = 0;  // Counter for how many guesses have been made
const maxNumberOfAttempts = 5;  // Maximum number of guesses allowed (constant, never changes)

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Returns a random integer from min (inclusive) to max (exclusive)
 * 
 * @param {number} min - The minimum value (inclusive)
 * @param {number} max - The maximum value (exclusive)
 * @returns {number} A random integer between min and max-1
 * 
 * Example:
 *   getRandomNumber(1, 50) -> might return 32
 *   getRandomNumber(1, 50) -> might return 11
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Hides all message elements by setting their display style to 'none'
 * This is used to clear all previous messages before showing new ones
 */
function hideAllMessages() {
  // BUG FIX #1: Changed <= to < to prevent accessing an element beyond array bounds
  // The original code used <=, which would try to access messages[messages.length]
  // This would cause an error because array indices go from 0 to length-1
  for (let elementIndex = 0; elementIndex < messages.length; elementIndex++) {
    messages[elementIndex].style.display = 'none';
  }
}

// ========================================
// GAME LOGIC FUNCTIONS
// ========================================

/**
 * Checks the player's guess against the target number
 * Provides feedback and updates the game state accordingly
 * This function is called when the submit button is clicked
 */
function checkGuess() {
  // Get the numeric value from the input field
  const guess = parseInt(guessInput.value, 10);
  
  // Increment the attempts counter
  attempts = attempts + 1;

  // Clear any previous messages before showing new ones
  hideAllMessages();

  // Check if the guess is correct
  if (guess === targetNumber) {
    // Display the number of guesses made
    numberOfGuessesMessage.style.display = '';
    numberOfGuessesMessage.innerHTML = `You made ${attempts} guesses`;

    // Display the success message
    correctMessage.style.display = '';

    // Disable further guessing since the game is won
    submitButton.disabled = true;
    guessInput.disabled = true;
  }

  // If the guess is incorrect, provide feedback
  if (guess !== targetNumber) {
    // BUG FIX #2: Changed the else block to show tooHighMessage instead of tooLowMessage
    // The original code showed tooLowMessage for both cases, which was incorrect
    if (guess < targetNumber) {
      tooLowMessage.style.display = '';  // Show "too low" message
    } else {
      tooHighMessage.style.display = '';  // Show "too high" message (FIXED)
    }

    // Calculate and display remaining attempts
    const remainingAttempts = maxNumberOfAttempts - attempts;

    numberOfGuessesMessage.style.display = '';
    numberOfGuessesMessage.innerHTML = `You guessed ${guess}. <br> ${remainingAttempts} guesses remaining`;
  }

  // BUG FIX #3: Changed ==== to === for proper equality comparison
  // JavaScript doesn't have a ==== operator; the correct strict equality operator is ===
  // Check if all attempts have been used
  if (attempts === maxNumberOfAttempts) {
    // BUG FIX #4: Added display of maxGuessesMessage when out of guesses
    // The original code disabled inputs but never showed the "max guesses" message
    maxGuessesMessage.style.display = '';
    
    // Disable further guessing since all attempts are used
    submitButton.disabled = true;
    guessInput.disabled = true;
  }

  // Clear the input field for the next guess
  guessInput.value = '';

  // Show the reset button so the player can start a new game
  resetButton.style.display = '';
}

/**
 * Sets up a new game by resetting all game state and UI elements
 * This function is called when the page loads and when the reset button is clicked
 */
// BUG FIX #5: Fixed typo - changed "funtion" to "function"
function setup() {
  // Generate a new random target number between 1 and 99 (inclusive)
  targetNumber = getRandomNumber(1, 100);
  console.log(`target number: ${targetNumber}`);  // Log for debugging purposes

  // BUG FIX #6: Changed assignment to 0 instead of resetting to 0
  // The original code set maxNumberOfAttempts = 0, which is wrong
  // We need to reset attempts (the counter), not maxNumberOfAttempts (the constant limit)
  attempts = 0;  // Reset the attempts counter to 0

  // BUG FIX #7: Fixed typo - changed "disabeld" to "disabled"
  // Enable the input field and submit button for a new game
  submitButton.disabled = false;
  guessInput.disabled = false;

  // Hide all messages to start with a clean slate
  hideAllMessages();
  
  // Hide the reset button at the start of a new game
  resetButton.style.display = 'none';
}

// ========================================
// EVENT LISTENERS
// ========================================

// Attach the checkGuess function to the submit button's click event
submitButton.addEventListener('click', checkGuess);

// Attach the setup function to the reset button's click event
resetButton.addEventListener('click', setup);

// ========================================
// GAME INITIALIZATION
// ========================================

// BUG FIX #8: This setup() call initializes the game when the page loads
// The original code had this, but the setup function had multiple bugs that prevented
// proper initialization (see bugs #5, #6, #7 above)
setup();  // Start the game when the page loads
