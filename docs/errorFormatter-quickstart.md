/\*\*

- @file errorFormatter-quickstart.md
- @description Quickstart guide for the error formatter utility with module context and stack traces
- @path docs/errorFormatter-quickstart.md
  \*/

# Error Formatter Quickstart Guide

**Status**: ✅ Complete
**Path**: `docs/errorFormatter-quickstart.md`

This quickstart guide provides practical examples for using the error formatter utility. For detailed documentation, see the [Error Formatter Types](../src/utils/errorFormatter-types.ts) and [Specification](../specs/006-error-formatter/spec.md).

## Quick Navigation

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Including Stack Traces](#including-stack-traces)
- [Adding Caller Context](#adding-caller-context)
- [Custom Formatting Options](#custom-formatting-options)
- [Integration with Logger](#integration-with-logger)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [FAQs](#faqs)

## Installation

### Step 1: Import the Error Formatter

```javascript
// In any module file
import { formatError } from '../utils/errorFormatter.ts';

// The formatter is now available throughout your module
console.log(typeof formatError); // "function"
```

**That's it!** The error formatter automatically resolves module names and applies configuration from the centralized config system.

## Basic Usage

### Format an Error Object

```javascript
import { formatError } from '../utils/errorFormatter.ts';

try {
  throw new Error('Configuration file not found');
} catch (error) {
  const formatted = formatError(error);
  console.error(formatted);
  // Output: Over My Head: Configuration file not found
}
```

### Format a String Message

```javascript
import { formatError } from '../utils/errorFormatter.ts';

const message = 'Invalid user input provided';
const formatted = formatError(message);
console.error(formatted);
// Output: Over My Head: Invalid user input provided
```

### Handle Empty or Undefined Messages

```javascript
import { formatError } from '../utils/errorFormatter.ts';

const formatted = formatError(null);
console.error(formatted);
// Output: Over My Head: [No error message provided]
```

## Including Stack Traces

### Basic Stack Trace Inclusion

```javascript
import { formatError } from '../utils/errorFormatter.ts';

try {
  riskyOperation();
} catch (error) {
  const formatted = formatError(error, { includeStack: true });
  console.error(formatted);
  // Output includes full stack trace up to 20 lines
}
```

### Stack Trace with Long Traces

```javascript
import { formatError } from '../utils/errorFormatter.ts';

try {
  // Code that produces a very deep stack trace
  deepRecursiveFunction();
} catch (error) {
  const formatted = formatError(error, { includeStack: true });
  console.error(formatted);
  // Output: First 20 lines of stack trace + reference to temp log file
  // Example: "... [Full trace: /tmp/omh-error-12345.log]"
}
```

## Adding Caller Context

### Include Function/Method Name

```javascript
import { formatError } from '../utils/errorFormatter.ts';

function loadUserData(userId) {
  try {
    // ... validation logic
    if (!userId) {
      throw new Error('User ID is required');
    }
    // ... load logic
  } catch (error) {
    const formatted = formatError(error, {
      includeCaller: true,
      caller: 'loadUserData',
    });
    console.error(formatted);
    // Output: loadUserData: Over My Head: User ID is required
  }
}
```

### Caller with Stack Trace

```javascript
import { formatError } from '../utils/errorFormatter.ts';

function processPayment(amount) {
  try {
    validateAmount(amount);
    chargeCard(amount);
  } catch (error) {
    const formatted = formatError(error, {
      includeCaller: true,
      caller: 'processPayment',
      includeStack: true,
    });
    console.error(formatted);
    // Output: processPayment: Over My Head: Invalid payment amount || [stack trace]
  }
}
```

### Escape Template Placeholders in Caller Names

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// Braces in caller names are automatically escaped
const formatted = formatError('Error occurred', {
  includeCaller: true,
  caller: 'handle{{user}}Input', // Contains template-like syntax
});
console.error(formatted);
// Output: handle\{\{user\}\}Input: Over My Head: Error occurred
// Note: {{user}} becomes \{\{user\}\} to prevent template injection
```

## Custom Formatting Options

### All Options Combined

```javascript
import { formatError } from '../utils/errorFormatter.ts';

try {
  complexOperation();
} catch (error) {
  const formatted = formatError(error, {
    includeCaller: true,
    caller: 'complexOperation',
    includeStack: true,
  });
  console.error(formatted);
  // Output follows configured pattern: caller || module || error || stack
}
```

### Understanding the Pattern System

The formatter uses a configurable pattern from `config.constants.errors.pattern`:

```javascript
// Default pattern: "{{module}}{{caller}}{{error}}{{stack}}"
// With separator: " || "

// This produces: "ModuleName || CallerName || ErrorMessage || StackTrace"

// You can customize this in src/config/constants/errors.yaml
```

## Integration with Logger

### Pair with the Logger Utility

```javascript
import { formatError } from '../utils/errorFormatter.ts';
import { Logger } from '../utils/logger.ts';

const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
});

try {
  riskyOperation();
} catch (error) {
  const formatted = formatError(error, {
    includeCaller: true,
    caller: 'riskyOperation',
    includeStack: true,
  });
  logger.error(formatted);
  // Logger will emit: [OMH] ERROR | timestamp | formatted_error_message
}
```

### Consistent Error Reporting

```javascript
import { formatError } from '../utils/errorFormatter.ts';
import { Logger } from '../utils/logger.ts';

class DataService {
  constructor() {
    this.logger = new Logger({ moduleName: 'OMH', level: 'info' });
  }

  async saveData(data) {
    try {
      await this.validateData(data);
      await this.persistData(data);
    } catch (error) {
      const formatted = formatError(error, {
        includeCaller: true,
        caller: 'DataService.saveData',
      });
      this.logger.error(formatted);
      throw error; // Re-throw after logging
    }
  }
}
```

## Common Patterns

### Pattern 1: Error Boundary with Context

```javascript
import { formatError } from '../utils/errorFormatter.ts';

function withErrorBoundary(fn, context) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const formatted = formatError(error, {
        includeCaller: true,
        caller: context.caller || fn.name,
        includeStack: context.includeStack || false,
      });
      console.error(formatted);
      throw error;
    }
  };
}

// Usage
const safeLoadConfig = withErrorBoundary(loadConfig, {
  caller: 'ConfigLoader.load',
  includeStack: true,
});
```

### Pattern 2: Validation Error Formatting

```javascript
import { formatError } from '../utils/errorFormatter.ts';

function validateUser(user) {
  const errors = [];

  if (!user.name) {
    errors.push('Name is required');
  }
  if (!user.email) {
    errors.push('Email is required');
  }
  if (user.age < 18) {
    errors.push('Must be 18 or older');
  }

  if (errors.length > 0) {
    const message = `Validation failed: ${errors.join(', ')}`;
    throw new Error(message);
  }
}

try {
  validateUser(invalidUser);
} catch (error) {
  const formatted = formatError(error, {
    includeCaller: true,
    caller: 'validateUser',
  });
  console.error(formatted);
}
```

### Pattern 3: Async Error Handling

```javascript
import { formatError } from '../utils/errorFormatter.ts';

async function processBatch(items) {
  const results = [];

  for (const item of items) {
    try {
      const result = await processItem(item);
      results.push(result);
    } catch (error) {
      const formatted = formatError(error, {
        includeCaller: true,
        caller: `processBatch[${item.id}]`,
        includeStack: true,
      });
      console.error(formatted);
      // Continue processing other items
      results.push(null);
    }
  }

  return results;
}
```

### Pattern 4: Configuration Error Handling

```javascript
import { formatError } from '../utils/errorFormatter.ts';

function loadConfiguration() {
  try {
    const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

    // Validate required fields
    if (!config.apiKey) {
      throw new Error('API key is missing from configuration');
    }

    return config;
  } catch (error) {
    // Handle both file reading and JSON parsing errors
    const formatted = formatError(error, {
      includeCaller: true,
      caller: 'loadConfiguration',
      includeStack: true,
    });
    console.error(formatted);

    // Return default configuration
    return getDefaultConfig();
  }
}
```

## Error Handling

### Handling Formatter Errors

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// The formatter itself can throw TypeError for invalid inputs
try {
  const formatted = formatError(invalidInput);
  console.error(formatted);
} catch (formatterError) {
  // Handle formatter validation errors
  console.error('Error formatter failed:', formatterError.message);
  console.error('Original input:', invalidInput);
}
```

### Graceful Degradation

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// If config is unavailable, formatter uses fallback defaults
function safeFormatError(error, options = {}) {
  try {
    return formatError(error, options);
  } catch (formatterError) {
    // Fallback to basic formatting
    const message = error?.message || error?.toString() || 'Unknown error';
    return `[OMH] ${message}`;
  }
}
```

### Type Validation

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// Ensure input is valid before formatting
function safeErrorFormat(input, options = {}) {
  if (input === null || input === undefined) {
    return formatError('[No error provided]', options);
  }

  if (
    typeof input === 'object' &&
    !input.message &&
    !(input instanceof Error)
  ) {
    return formatError(JSON.stringify(input), options);
  }

  return formatError(input, options);
}
```

## FAQs

### Q: How does the formatter resolve the module name?

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// The formatter automatically uses config.constants.moduleManagement.shortName
// This comes from the centralized config system

const formatted = formatError('Test error');
// Uses the configured module name (e.g., "Over My Head")
```

### Q: Can I customize the error pattern?

```javascript
// Yes! Edit src/config/constants/errors.yaml

// Default pattern:
pattern: '{{module}}{{caller}}{{error}}{{stack}}';
separator: ' || ';

// Custom pattern (reorder components):
pattern: '{{error}}{{module}}{{caller}}{{stack}}';
separator: ' | ';

// Omit stack traces entirely:
pattern: '{{module}}{{caller}}{{error}}';
separator: ' - ';
```

### Q: What happens if the config system fails?

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// Fallback defaults are hardcoded:
const FALLBACK_MODULE = 'Unknown Module';
const FALLBACK_PATTERN = '{{module}}{{caller}}{{error}}{{stack}}';
const FALLBACK_SEPARATOR = ' || ';

// The formatter continues working even if config is unavailable
```

### Q: How do stack traces work with temp files?

```javascript
import { formatError } from '../utils/errorFormatter.ts';

// When stack traces exceed 20 lines:
const formatted = formatError(error, { includeStack: true });

// Output includes:
// - First 20 lines of stack trace
// - Reference: "[Full trace: /tmp/omh-error-12345.log]"
// - Full trace written to temporary file in os.tmpdir()
```

### Q: What's the performance impact?

```javascript
// Formatting is typically < 1ms for basic errors
// Stack trace processing adds minimal overhead
// Temp file writing only occurs for traces > 20 lines
// Use includeStack: false for high-frequency logging
```

### Q: Can I use this in browser code?

```javascript
// Yes! The formatter works in both Node.js and browser environments
// It automatically adapts to available APIs (fs for temp files, etc.)
// Browser usage is identical to Node.js
```

## Next Steps

1. **Import the formatter** in your error handling code with `import { formatError } from './utils/errorFormatter.ts';`
2. **Format errors** with `formatError(error)` for basic usage
3. **Add context** with `formatError(error, { includeCaller: true, caller: 'functionName' })`
4. **Include stack traces** when debugging with `formatError(error, { includeStack: true })`
5. **Integrate with logger** for consistent error reporting across your module

## Related Documentation

- [Error Formatter Types](../src/utils/errorFormatter-types.ts) - Complete type definitions
- [Specification](../specs/006-error-formatter/spec.md) - Detailed requirements and user stories
- [Logger Reference](../docs/logger-reference.md) - Integration with logging system
- [Config Constants](../src/config/constants/errors.yaml) - Error formatting configuration

---

**Status**: Complete ✅
**Last Updated**: November 16, 2025
**Module Version**: 12.1.0</content>
<parameter name="filePath">/workspaces/foundryvtt-over-my-head/docs/errorFormatter-quickstart.md
