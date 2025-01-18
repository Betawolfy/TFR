// randomNumber.js

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
    const number = Math.random() * (max - min) + min;
    return Number(number.toFixed(decimals));
}

module.exports = {
    getRandomInt,
    getRandomFloat
};