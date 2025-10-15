# Before & After Code Comparison

This document shows side-by-side comparisons of the broken code and the fixed code for each bug.

---

## Bug 1: Array Loop Bounds

### ❌ BEFORE (Broken)
```javascript
function hideAllMessages() {
  for (let elementIndex = 0; elementIndex <= messages.length; elementIndex++) {
    messages[elementIndex].style.display = 'none';
  }
}
```

**Error:** `Uncaught TypeError: Cannot read property 'style' of undefined`

### ✅ AFTER (Fixed)
```javascript
function hideAllMessages() {
  // Changed <= to < to prevent accessing an element beyond array bounds
  for (let elementIndex = 0; elementIndex < messages.length; elementIndex++) {
    messages[elementIndex].style.display = 'none';
  }
}
```

---

## Bug 2: Wrong Message Display

### ❌ BEFORE (Broken)
```javascript
if (guess !== targetNumber) {
  if (guess < targetNumber) {
    tooLowMessage.style.display = '';
  } else {
    tooLowMessage.style.display = '';  // BUG: Shows wrong message!
  }
  // ...
}
```

### ✅ AFTER (Fixed)
```javascript
if (guess !== targetNumber) {
  if (guess < targetNumber) {
    tooLowMessage.style.display = '';
  } else {
    tooHighMessage.style.display = '';  // FIXED: Shows correct message
  }
  // ...
}
```

---

## Bug 3: Invalid Equality Operator

### ❌ BEFORE (Broken)
```javascript
if (attempts ==== maxNumberOfAttempts) {
  submitButton.disabled = true;
  guessInput.disabled = true;
}
```

**Error:** `Uncaught SyntaxError: Unexpected token '='`

### ✅ AFTER (Fixed)
```javascript
// Changed ==== to === for proper equality comparison
if (attempts === maxNumberOfAttempts) {
  submitButton.disabled = true;
  guessInput.disabled = true;
}
```

---

## Bug 4: Missing Max Guesses Message

### ❌ BEFORE (Broken)
```javascript
if (attempts === maxNumberOfAttempts) {
  // BUG: Message never displayed!
  submitButton.disabled = true;
  guessInput.disabled = true;
}
```

### ✅ AFTER (Fixed)
```javascript
if (attempts === maxNumberOfAttempts) {
  maxGuessesMessage.style.display = '';  // ADDED: Display the message
  submitButton.disabled = true;
  guessInput.disabled = true;
}
```

---

## Bug 5: Function Declaration Typo

### ❌ BEFORE (Broken)
```javascript
funtion setup() {  // BUG: "funtion" is not a valid keyword
  targetNumber = getRandomNumber(1, 100);
  console.log(`target number: ${targetNumber}`);
  // ...
}
```

**Error:** `Uncaught SyntaxError: Unexpected identifier`

### ✅ AFTER (Fixed)
```javascript
function setup() {  // FIXED: Corrected spelling
  targetNumber = getRandomNumber(1, 100);
  console.log(`target number: ${targetNumber}`);
  // ...
}
```

---

## Bug 6: Wrong Variable Reset

### ❌ BEFORE (Broken)
```javascript
function setup() {
  targetNumber = getRandomNumber(1, 100);
  
  // BUG: Resetting the constant instead of the counter!
  maxNumberOfAttempts = 0;
  
  submitButton.disabled = false;
  guessInput.disabled = false;
  // ...
}
```

**Result:** After first game, player has 0 attempts allowed

### ✅ AFTER (Fixed)
```javascript
function setup() {
  targetNumber = getRandomNumber(1, 100);
  
  // FIXED: Reset the counter, not the constant
  attempts = 0;
  
  submitButton.disabled = false;
  guessInput.disabled = false;
  // ...
}
```

---

## Bug 7: Property Name Typo

### ❌ BEFORE (Broken)
```javascript
function setup() {
  targetNumber = getRandomNumber(1, 100);
  attempts = 0;
  
  // BUG: "disabeld" is not a valid property
  submitButton.disabeld = false;
  guessInput.disabled = false;
  
  hideAllMessages();
  resetButton.style.display = 'none';
}
```

**Result:** Submit button stays disabled after reset

### ✅ AFTER (Fixed)
```javascript
function setup() {
  targetNumber = getRandomNumber(1, 100);
  attempts = 0;
  
  // FIXED: Corrected spelling to "disabled"
  submitButton.disabled = false;
  guessInput.disabled = false;
  
  hideAllMessages();
  resetButton.style.display = 'none';
}
```

---

## Bug 8: Complete setup() Function Comparison

### ❌ BEFORE (Broken - All 3 Bugs Combined)
```javascript
funtion setup() {                      // BUG #5: Typo in "function"
  targetNumber = getRandomNumber(1, 100);
  console.log(`target number: ${targetNumber}`);

  maxNumberOfAttempts = 0;             // BUG #6: Wrong variable reset

  submitButton.disabeld = false;       // BUG #7: Typo in "disabled"
  guessInput.disabled = false;

  hideAllMessages();
  resetButton.style.display = 'none';
}
```

### ✅ AFTER (Fixed - All Working)
```javascript
function setup() {                     // FIXED #5: Correct spelling
  targetNumber = getRandomNumber(1, 100);
  console.log(`target number: ${targetNumber}`);

  attempts = 0;                        // FIXED #6: Reset correct variable

  submitButton.disabled = false;       // FIXED #7: Correct property name
  guessInput.disabled = false;

  hideAllMessages();
  resetButton.style.display = 'none';
}
```

---

## Summary Table

| Bug # | Original Code | Fixed Code | Change Type |
|-------|--------------|------------|-------------|
| 1 | `i <= messages.length` | `i < messages.length` | Operator change |
| 2 | `tooLowMessage.style.display` | `tooHighMessage.style.display` | Variable change |
| 3 | `attempts ====` | `attempts ===` | Operator fix |
| 4 | *(missing line)* | `maxGuessesMessage.style.display = ''` | Added line |
| 5 | `funtion setup()` | `function setup()` | Spelling fix |
| 6 | `maxNumberOfAttempts = 0` | `attempts = 0` | Variable fix |
| 7 | `submitButton.disabeld` | `submitButton.disabled` | Property fix |
| 8 | *(compound)* | *(all fixed)* | Multiple fixes |

---

## Visual Bug Impact

### Before Fixes:
```
Game Start
    ↓
[❌ Console Errors]
[❌ Messages Visible]
[❌ Can't Play Game]
```

### After Fixes:
```
Game Start
    ↓
[✅ Clean Console]
[✅ Messages Hidden]
[✅ Ready to Play]
    ↓
Make Guesses
    ↓
[✅ Proper Feedback]
[✅ Correct Messages]
[✅ Win or Lose]
    ↓
Click Reset
    ↓
[✅ New Game Ready]
```

---

## Testing Evidence

Run these tests to verify all fixes:

1. **Open browser console** → Should see target number, no errors ✅
2. **Page load** → Messages hidden, reset button hidden ✅
3. **Guess low number** → "Too low" message displays ✅
4. **Guess high number** → "Too high" message displays ✅
5. **Guess correctly** → Success message, inputs disabled ✅
6. **Use all 5 attempts** → "Max guesses" message displays ✅
7. **Click reset** → New game starts correctly ✅
8. **Play again** → Everything works for second game ✅

---

## Key Lessons

1. **Typos are critical** - `funtion` and `disabeld` broke the game
2. **Operators matter** - `<=` vs `<`, `====` vs `===`
3. **Variable names matter** - `attempts` vs `maxNumberOfAttempts`
4. **Test all paths** - Both if and else branches
5. **User feedback** - Always show messages for actions
6. **Console is key** - Errors tell you exactly what's wrong

---

**All 8 bugs identified, fixed, and documented! ✅**
