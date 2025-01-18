// randomColor.js

// Random color in hexadecimal format
function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Random color in RGB format
function getRandomRGB() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

// Random color in HSL format
// wtf is HSL? 
// https://www.w3schools.com/colors/colors_hsl.asp
function getRandomHSL() {
    return {
        h: Math.floor(Math.random() * 360),
        s: Math.floor(Math.random() * 100),
        l: Math.floor(Math.random() * 100)
    };
}

module.exports = {
    getRandomColor,
    getRandomRGB,
    getRandomHSL
};