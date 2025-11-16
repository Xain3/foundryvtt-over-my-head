# Quickstart: Error Formatter Utility

1. **Import the formatter** (the precise path may be `src/utils/errorFormatter.mts` once implemented). The formatter exposes a single `formatError(errorOrMessage, options)` helper.
2. **Call it with a simple error** to verify the module prefix is added:

   ```javascript
   import { formatError } from '#/utils/errorFormatter.mts';

   const output = formatError(new Error('Configuration failed'));
   console.log(output);
   // Default pattern + separator:
   // "Over My Head - Vision with Fade || Configuration failed"
   ```

3. **Enable optional contexts** by passing options:

   ```javascript
   const verbose = formatError(new Error('Loader issue'), {
     includeCaller: true,
     caller: 'loadConfig',
     includeStack: true,
   });
   ```

   When `includeStack` is `true`, the stack prints up to 20 lines (configurable via `maxStackLines`) and adds `[Full trace: /tmp/omh-error-XXX.log]` if truncated, persisting the complete trace under the configured `tempLogFilePrefix` in `os.tmpdir()`.

4. **Customize the pattern** via configuration (e.g., `config.constants.errorFormatter.pattern`). The template accepts `{{module}}`, `{{caller}}`, `{{error}}`, and `{{stack}}` placeholders, and the formatter joins populated segments with the configured separator.

5. **Handle missing config** by relying on the documented defaults: pattern `"{{module}}{{caller}}{{error}}{{stack}}"`, separator `" || "`, and module `"Unknown Module"`. The formatter never throws just because the config singleton is unavailable.

6. **Expect runtime validation**: passing `null`, `undefined`, or non-string/non-Error values raises `TypeError`, preventing silent failures.
