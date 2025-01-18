// isSomething.js

// isANumber.js
// returns true if value is a number
function isANumber(value) {
    return !isNaN(value) && isFinite(value);
}

// isAnArray.js
// returns true if value is an array
function isAnArray(value) {
    return Array.isArray(value);
}