# API Contract: String Formatter

**Module**: `src/utils/static/stringFormatter.ts`
**Priority**: P1 (MVP - Zero Dependencies)
**Version**: 1.0.0

## Public API

### formatString()

Formats a string by prepending an optional prefix and/or appending an optional suffix.

**Signature**:

```typescript
function formatString(base: string, options?: FormatOptions): string;
```

**Type Definitions**:

```typescript
interface FormatOptions {
  prefix?: string;
  suffix?: string;
}
```

**Parameters**:

- `base` (string, required): The base string to format
- `options` (FormatOptions, optional): Formatting options
  - `options.prefix` (string, optional): String to prepend
  - `options.suffix` (string, optional): String to append

**Returns**: `string` - The formatted string

**Throws**: Never throws (pure function with no error cases)

---

## Usage Examples

### Example 1: Prefix Only

```typescript
import { formatString } from '#/utils/static/stringFormatter.ts';

const result = formatString('world', { prefix: 'hello-' });
console.log(result);
// Output: "hello-world"
```

**Contract**: FR-002 - System MUST support `prefix` option that prepends a string to the base

---

### Example 2: Suffix Only

```typescript
import { formatString } from '#/utils/stringFormatter.ts';

const result = formatString('world', { suffix: '-!' });
console.log(result);
// Output: "world-!"
```

**Contract**: FR-003 - System MUST support `suffix` option that appends a string to the base

---

### Example 3: Both Prefix and Suffix

```typescript
import { formatString } from '#/utils/stringFormatter.ts';

const result = formatString('world', { prefix: 'hello-', suffix: '-!' });
console.log(result);
// Output: "hello-world-!"
```

**Contract**: FR-004 - System MUST support both `prefix` and `suffix` simultaneously, applying prefix first then suffix

---

### Example 4: No Options (Identity)

```typescript
import { formatString } from '#/utils/stringFormatter.ts';

const result = formatString('world');
console.log(result);
// Output: "world"
```

**Contract**: FR-005 - System MUST return the base string unchanged when no options are provided

---

### Example 5: Empty String Handling

```typescript
import { formatString } from '#/utils/stringFormatter.ts';

const result1 = formatString('', { prefix: 'hello-', suffix: '-!' });
console.log(result1);
// Output: "hello--!"

const result2 = formatString('');
console.log(result2);
// Output: ""
```

**Contract**: FR-006 - System MUST handle empty strings gracefully (return prefix + suffix concatenation)

---

## Functional Requirements Coverage

| Requirement                              | Status | Test Case                         |
| ---------------------------------------- | ------ | --------------------------------- |
| FR-001: Provide formatString function    | ✅     | API exists with correct signature |
| FR-002: Support prefix option            | ✅     | Example 1                         |
| FR-003: Support suffix option            | ✅     | Example 2                         |
| FR-004: Support both options             | ✅     | Example 3                         |
| FR-005: Return unchanged when no options | ✅     | Example 4                         |
| FR-006: Handle empty strings             | ✅     | Example 5                         |

---

## Edge Cases

### Undefined/Null Base String

```typescript
// TypeScript will catch this at compile time
formatString(undefined); // TS Error: Argument of type 'undefined' is not assignable to parameter of type 'string'
formatString(null); // TS Error: Argument of type 'null' is not assignable to parameter of type 'string'
```

**Behavior**: TypeScript prevents calling with non-string base

---

### Empty Prefix/Suffix

```typescript
const result = formatString('world', { prefix: '', suffix: '' });
// Output: "world"
```

**Behavior**: Empty strings are no-ops; result equals base string

---

### Only Prefix/Suffix Provided (No Base)

```typescript
const result = formatString('', { prefix: 'prefix-', suffix: '-suffix' });
// Output: "prefix--suffix"
```

**Behavior**: Valid usage; concatenates prefix and suffix around empty base

---

## Performance Contract

**Target**: <1ms per operation (SC-007)

**Benchmark**:

```typescript
const iterations = 1000;
const start = performance.now();

for (let i = 0; i < iterations; i++) {
  formatString('test', { prefix: 'pre-', suffix: '-post' });
}

const duration = performance.now() - start;
const avgTime = duration / iterations;
console.log(`Average time per operation: ${avgTime.toFixed(4)}ms`);
// Expected: ~0.001ms (1 microsecond) or less
```

**Complexity**:

- Time: O(n) where n = length(prefix) + length(base) + length(suffix)
- Space: O(n) for result string

---

## Type Safety

### Valid Usage (Type-Safe)

```typescript
formatString('base'); // ✅ Valid
formatString('base', {}); // ✅ Valid
formatString('base', { prefix: 'p' }); // ✅ Valid
formatString('base', { suffix: 's' }); // ✅ Valid
formatString('base', { prefix: 'p', suffix: 's' }); // ✅ Valid
```

### Invalid Usage (Caught by TypeScript)

```typescript
formatString(); // ❌ TS Error: Expected 1-2 arguments, but got 0
formatString(123); // ❌ TS Error: Argument of type 'number' is not assignable
formatString('base', { prefix: 123 }); // ❌ TS Error: Type 'number' is not assignable to type 'string'
formatString('base', { invalid: 'option' }); // ❌ TS Error: Object literal may only specify known properties
```

---

## Testing Requirements

**Unit Tests** (`tests/unit/stringFormatter.unit.test.mjs`):

Required test cases (from acceptance scenarios):

1. ✅ Prefix only: `formatString("world", { prefix: "hello-" })` → `"hello-world"`
2. ✅ Suffix only: `formatString("world", { suffix: "-!" })` → `"world-!"`
3. ✅ Both prefix and suffix: `formatString("world", { prefix: "hello-", suffix: "-!" })` → `"hello-world-!"`
4. ✅ No options: `formatString("world")` → `"world"`
5. ✅ Empty string with options: `formatString("", { prefix: "a", suffix: "b" })` → `"ab"`
6. ✅ Empty string without options: `formatString("")` → `""`
7. ✅ Empty prefix and suffix: `formatString("test", { prefix: "", suffix: "" })` → `"test"`

**Coverage Target**: 100% (pure function with no error paths)

---

## Dependencies

**External**: None
**Internal**: None

**Justification**: P1 is designed as a zero-dependency pure utility function.

---

## Migration & Compatibility

**Breaking Changes**: N/A (new feature)

**Backward Compatibility**: N/A (new feature)

**Future Extensions**:

- Could add optional `transform` function to modify base string before formatting
- Could add optional `repeat` count for prefix/suffix
- Could add validation options (e.g., `maxLength`)

All extensions would be backward-compatible (add optional parameters).

---

## Success Criteria Alignment

| Criterion                      | Status | Evidence                                      |
| ------------------------------ | ------ | --------------------------------------------- |
| SC-001: Independently testable | ✅     | Zero dependencies, pure function              |
| SC-002: ≥80% test coverage     | ✅     | Target 100% (simple pure function)            |
| SC-007: <1ms performance       | ✅     | String operations only, O(n) complexity       |
| SC-010: Style guide compliance | ✅     | Will have file header, JSDoc, type separation |

---

## File Locations

**Implementation**: `src/utils/static/stringFormatter.ts`
**Types**: `src/utils/static/stringFormatter-types.ts`
**Tests**: `tests/unit/stringFormatter.unit.test.mjs`

---

**Contract Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Ready for implementation
