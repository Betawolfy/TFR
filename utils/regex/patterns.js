// patterns.js

const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9_]{3,16}$/,
    discordId: /^[0-9]{17,19}$/,
    hexColor: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/,
};

module.exports = patterns