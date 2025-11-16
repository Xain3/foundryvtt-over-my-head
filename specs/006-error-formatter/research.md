# Research Findings

## Decision: Truncate stack traces to 20 lines and write the full trace to a temp log

**Rationale:** Keeping console output concise maintains performance and readability; capping at 20 lines honors the spec while still capturing detail. Writing the complete trace to a temp file preserves diagnostic data if deeper investigation is needed.

**Alternatives considered:** Logging everything inline (rejected because it floods console and risks hitting Foundry rate limits); asynchronous streaming to external service (rejected due to increased dependency and config complexity).

## Decision: Escape `{{…}}` sequences in caller names

**Rationale:** Caller context should be treated as a literal string so that display names containing templating syntax cannot influence the pattern engine; escaping ensures the formatter remains predictable even if caller names include braces.

**Alternatives considered:** Rejecting caller names with braces (rejected as overly strict) or treating them as placeholders (rejected due to potential collision with pattern options).

## Decision: Reuse the config singleton with documented fallback values

**Rationale:** The unified config service keeps runtime values consistent module-wide, while the documented fallback pattern (`"{{module}}{{caller}}{{error}}{{stack}}"`, separator `" || "`, module name `"Unknown Module"`) ensures the formatter works even if config initialization fails.

**Alternatives considered:** Building a separate formatter-specific config (rejected to avoid duplication) or crashing on missing config (rejected to keep error reporting resilient).
