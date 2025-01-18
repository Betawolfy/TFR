// isValidPermissionLevel.js

// utils/validation/isValidPermissionLevel.js

/**
 * Vérifie si le niveau de permission est valide
 * @param {string} level - Le niveau de permission à vérifier
 * @param {Object} config - La configuration contenant les rôles valides
 * @returns {boolean} - true si le niveau est valide, false sinon
 */
function isValidPermissionLevel(level, config) {
    // Vérification de base
    if (!level || typeof level !== 'string') {
        return false;
    }

    // Liste des niveaux de permission valides
    const validLevels = [
        'ADMIN',         // Accès complet
        'MODERATOR',     // Accès modération
        'HELPER',        // Accès support
        'MEMBER',        // Accès basique
        'GUEST'          // Accès limité
    ];

    // Vérification dans la config si fournie
    if (config && config.permissions) {
        // Vérification des rôles personnalisés
        if (config.permissions[level]) {
            return true;
        }

        // Vérification des rôles staff
        // if (config.permissions.staff && 
        //     config.permissions.staff.includes(level)) {
        //     return true;
        // }
    }

    // Vérification dans la liste des niveaux par défaut
    return validLevels.includes(level.toUpperCase());
}

/**
 * Convertit un niveau de permission en valeur numérique
 * @param {string} level - Le niveau de permission
 * @returns {number} - La valeur numérique du niveau (0-4)
 */
function permissionLevelToNumber(level) {
    const levels = {
        'ADMIN': 4,
        'MODERATOR': 3,
        'HELPER': 2,
        'MEMBER': 1,
        'GUEST': 0
    };
    return levels[level.toUpperCase()] || 0;
}

/**
 * Vérifie si un utilisateur a un niveau suffisant
 * @param {string} userLevel - Niveau de l'utilisateur
 * @param {string} requiredLevel - Niveau requis
 * @returns {boolean} - true si l'utilisateur a le niveau suffisant
 */
function hasPermissionLevel(userLevel, requiredLevel) {
    const userValue = permissionLevelToNumber(userLevel);
    const requiredValue = permissionLevelToNumber(requiredLevel);
    return userValue >= requiredValue;
}

function hasRolePermissionLevel(member, requiredLevel, config) {
    // Récupère les IDs des rôles de l'utilisateur
    const userRoles = member.roles.cache.map(role => role.id);
    
    // Récupère l'ID du rôle requis depuis la config
    const requiredRoleId = config.permissions.roles[requiredLevel];
    
    // Vérifie si l'utilisateur a le rôle requis
    return userRoles.includes(requiredRoleId);
}

function getHighestUserRole(member, config) {
    const userRoles = member.roles.cache.map(role => role.id);
    const levels = ['ADMIN', 'MODERATOR', 'HELPER', 'MEMBER', 'GUEST'];
    
    // Trouve le plus haut niveau de permission
    for (const level of levels) {
        const roleId = config.permissions.roles[level];
        if (userRoles.includes(roleId)) {
            return level;
        }
    }
    
    return 'GUEST'; // Niveau par défaut
}

module.exports = {
    isValidPermissionLevel,
    permissionLevelToNumber,
    hasPermissionLevel,
    hasRolePermissionLevel,
    getHighestUserRole
};