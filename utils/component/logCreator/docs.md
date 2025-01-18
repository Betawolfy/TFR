# LogCreator Documentation

## Description
LogCreator est un gestionnaire de logs pour les applications Discord.js permettant de tracer les commandes exécutées et les erreurs rencontrées.

## Installation
```bash
const LogCreator = require('./utils/component/logCreator/logCreator.js');
const logger = new LogCreator();
```

## Méthodes principales

### `logCommand(interaction, args)`
Enregistre l'exécution d'une commande Discord.
```javascript
// Exemple d'utilisation
logger.logCommand(interaction, { customArg: 'value' });
```

### `logError(error, context)`
Enregistre une erreur avec son contexte.
```javascript
// Exemple d'utilisation
try {
    // code...
} catch (error) {
    logger.logError(error, { context: 'Command execution' });
}
```

### `getRecentLogs(count, type)`
Récupère les logs récents.
- `count`: Nombre de logs à récupérer (défaut: 10)
- `type`: 'commands' ou 'errors' (défaut: 'commands')

### `clearLogs(type)`
Efface les logs du type spécifié.
- `type`: 'commands' ou 'errors' (défaut: 'commands')

## Structure des Logs

### Logs de commandes
```javascript
{
  "timestamp": "2025-01-15T10:00:00.000Z",
  "command": "commandName",
  "user": {
    "id": "userId",
    "tag": "user#0000"
  },
  "guild": {
    "id": "guildId",
    "name": "serverName"
  },
  "channel": {
    "id": "channelId",
    "name": "channelName",
    "type": "channelType"
  },
  "args": {},
  "executionTime": "100ms",
  "clientLatency": "50ms"
}
```

### Logs d'erreurs
```javascript
{
  "timestamp": "2025-01-15T10:00:00.000Z",
  "error": {
    "name": "ErrorName",
    "message": "Error message",
    "stack": "Error stack trace"
  },
  "context": {}
}
```

## Notes Techniques
- Les logs sont stockés au format JSON
- Limite de 1000 entrées par fichier
- Chemins par défaut :
  - Commandes : `/logs/commands.json`
  - Erreurs : `/logs/errors.json`
- Auto-création des dossiers et fichiers à l'initialisation