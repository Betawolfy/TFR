# SuperBoolean Documentation

## Description

SuperBoolean
 is a utility class that encapsulates a boolean value with chainable methods for logical operations.

## Installation

The class is available in the `utils/component/superBoolean` directory.

```javascript
const SuperBoolean = require('./utils/component/superBoolean/superBoolean.js');
```

## Constructor
```javascript
const bool = new SuperBoolean(value);
```
- value: Value that will be converted to a boolean (`!!value`)

## Methods

### Logical operations
| Method | Description | Exemple |
|--------|-------------|---------|
| and(other)| AND logique | `bool.and(true)` |
| or(other)| OR logique | `bool.or(false)` |
| not()| NO logique | `bool.not()` |
| is(other) | strict equality | `bool.is(true)` |
| isnt(other)| strict inequality | `bool.isnt(false)` |

### Getters
| Méthode | Description |
|---------|-------------|
| getValue()| returns the boolean value |
| PleaseJustGiveMeTheValue()| getValue() Alias |
| toString()| returns the boolean value as a string |

## Example
```javascript
const bool = new SuperBoolean(true)
    .and(true)    // true
    .or(false)    // true
    .not()        // false
    .is(false)    // true
    .isnt(true);  // true

console.log(bool.getValue()); // true
```

## Note
all methods return `this`, allowing method chaining.