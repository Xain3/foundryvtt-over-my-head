# Error Formatter Contract

## Function: `formatError(errorOrMessage, options)`

- **Inputs**
  - `errorOrMessage`: `Error | string` – Error instance or string message. Strings are coerced to `Error` objects internally. Throws `TypeError` if the argument is missing or not coercible.
  - `options`: `FormatOptions` (see below). Optional; missing fields fall back to defaults.
- **Outputs**
  - Returns `string` – Formatted message that includes the module prefix, optional caller, error text, and optionally a stack summary.
- **Behavior**
  - Resolves module name via the config singleton; falls back to `"Unknown Module"` when unavailable.
  - Applies the configured pattern/template to determine component order and separators.
  - Includes caller context and stack traces only when requested, respecting stack truncation rules.
  - Truncates stacks to 20 lines, writes the full trace to a temp log file (`os.tmpdir()`), and appends `[Full trace: <path>]` when the stack is truncated.
- **Side effects**
  - No persistent or global state mutations.
  - Temporary log files record full stack traces for truncated outputs.

## Object: `FormatOptions`

- `includeStack` (`boolean`, default `false`) – Whether stack trace data is appended when `{{stack}}` is part of the pattern.
- `includeCaller` (`boolean`, default `false`) – Whether caller context is injected when `caller` is provided.
- `caller` (`string | undefined`) – Optional caller label. Braces (`{{ }}`) inside the value are escaped to avoid templating side effects.

## Template Contract

- Pattern strings support the placeholders `{{module}}`, `{{caller}}`, `{{error}}`, and `{{stack}}`.
- Separator strings (default `" || "`) are inserted between populated components when multiple placeholders are used.
- Omitting `{{stack}}` from the template means stack content is skipped even if `includeStack` is `true`.
- Inserted caller/context data is escaped to ensure literal rendering when values contain `{{…}}` sequences.
