// logCreator.js

const fs = require('fs');
const path = require('path');

class LogCreator {
    constructor() {
        // Chemins des fichiers de logs
        this.commandLogsPath = path.join(__dirname, '../../../logs/commands.json');
        this.errorLogsPath = path.join(__dirname, '../../../logs/errors.json');
        
        // Initialisation des fichiers de logs
        this.initLogFiles();
    }

    initLogFiles() {
        const defaultStructure = {
            logs: [],
            totalCommands: 0,
            lastUpdated: new Date().toISOString()
        };

        [this.commandLogsPath, this.errorLogsPath].forEach(logPath => {
            if (!fs.existsSync(path.dirname(logPath))) {
                fs.mkdirSync(path.dirname(logPath), { recursive: true });
            }
            if (!fs.existsSync(logPath)) {
                fs.writeFileSync(logPath, JSON.stringify(defaultStructure, null, 2));
            }
        });
    }

    logCommand(interaction, args = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            command: interaction.commandName,
            user: {
                id: interaction.user.id,
                tag: interaction.user.tag
            },
            guild: {
                id: interaction.guild?.id,
                name: interaction.guild?.name
            },
            channel: {
                id: interaction.channel.id,
                name: interaction.channel.name,
                type: interaction.channel.type
            },
            args: args,
            executionTime: Date.now() - interaction.createdTimestamp + 'ms',
            clientLatency: interaction.client.ws.ping + 'ms'
        };

        this.appendToLog(this.commandLogsPath, logEntry);
        return logEntry;
    }

    logError(error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context: context
        };

        this.appendToLog(this.errorLogsPath, errorEntry);
        return errorEntry;
    }

        appendToLog(logPath, entry) {
        try {
            // Lire le fichier existant ou créer une nouvelle structure
            let currentLogs;
            try {
                currentLogs = JSON.parse(fs.readFileSync(logPath));
            } catch {
                currentLogs = {
                    logs: [],
                    totalCommands: 0,
                    lastUpdated: new Date().toISOString()
                };
            }
    
            // Ajouter le nouveau log au début du tableau
            currentLogs.logs.unshift(entry);
            currentLogs.totalCommands++;
            currentLogs.lastUpdated = new Date().toISOString();
                
            // Garder uniquement les 1000 derniers logs
            if (currentLogs.logs.length > 1000) {
                currentLogs.logs = currentLogs.logs.slice(0, 1000);
            }
                
            // Écrire dans le fichier avec le bon formatage
            fs.writeFileSync(
                logPath, 
                JSON.stringify(currentLogs, null, 2),
                { encoding: 'utf8' }
            );
        } catch (error) {
            console.error(`Erreur lors de l'écriture du log: ${error.message}`);
        }
    }

    getRecentLogs(count = 10, type = 'commands') {
        const logPath = type === 'commands' ? this.commandLogsPath : this.errorLogsPath;
        try {
            const logs = JSON.parse(fs.readFileSync(logPath));
            return logs.logs.slice(0, count);
        } catch (error) {
            console.error(`Erreur lors de la lecture des logs: ${error.message}`);
            return [];
        }
    }

    clearLogs(type = 'commands') {
        const logPath = type === 'commands' ? this.commandLogsPath : this.errorLogsPath;
        const defaultStructure = {
            logs: [],
            totalCommands: 0,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            fs.writeFileSync(logPath, JSON.stringify(defaultStructure, null, 2));
            return true;
        } catch (error) {
            console.error(`Erreur lors du nettoyage des logs: ${error.message}`);
            return false;
        }
    }
}

module.exports = LogCreator;