// isDiscordIDValid.js

// Check if a Discord ID is valid
function isDiscordIDValid(id) {
    return /^[0-9]{17,19}$/.test(id);
}

module.exports = isDiscordIDValid;