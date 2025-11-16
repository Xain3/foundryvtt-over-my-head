# Data Model

## Entity: ErrorContext

- **module** (`string`) – Resolved module name from the config singleton; falls back to `"Unknown Module"` when resolution fails. Required.
- **caller** (`string | undefined`) – Optional label provided by the caller. Escaped for literal braces before interpolation.
- **message** (`string`) – Coerced error message (`Error` message or string input); defaults to `"[No error message provided]"` when empty.
- **stack** (`string | undefined`) – Stack trace captured from the `Error` object; may be truncated to 20 lines before formatting.
- **pattern** (`string`) – The template string guiding output ordering, derived from settings or defaults.

**Relationships:** The formatter composes `ErrorContext` with `FormatOptions` and `ErrorPattern` to generate the final string.

**Validation:** `module` and `message` must be non-empty strings; `stack` is optional but trimmed and sanitized.

**State transitions:** Raw error inputs are normalized into `ErrorContext` by (1) coercing strings to `Error`, (2) capturing caller/stack, (3) truncating stacks as needed, and (4) applying fallback module/pattern values when config is unavailable.

## Entity: FormatOptions

- **includeStack** (`boolean`) – Controls whether stack traces appear in output (default `false` unless pattern or caller requires it).
- **includeCaller** (`boolean`) – Controls whether caller context is inserted; also guards `caller` field.
- **caller** (`string | undefined`) – Optional caller label, honored when `includeCaller` is `true`.

**Validation:** Flags must be booleans; `caller` is only used when `includeCaller` is `true` and otherwise ignored.

## Entity: ErrorPattern

- **template** (`string`) – Placeholder-driven pattern (default `"{{module}}{{caller}}{{error}}{{stack}}"`).
- **separator** (`string`) – Text inserted between populated components (default `" || "`).
- **componentOrder** (`string[]`) – Derived order of placeholders after parsing the template.

**Validation:** The template must contain at least one of `{{module}}` or `{{error}}` to ensure meaningful output; separator is required when multiple components appear consecutively.

**Lifecycle:** Pattern parsing occurs once per formatter invocation, feeding the builder that concatenates sanitized components with separators. The presence of `{{stack}}` enables stack inclusion regardless of the `includeStack` flag, following the spec decision that the pattern overrides options if it omits a placeholder.
