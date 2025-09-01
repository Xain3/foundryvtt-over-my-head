<!-- markdownlint-disable MD024 -->
# Placeable Helpers Module

## Overview

The Placeable Helpers module provides a focused toolkit for reading, checking, and updating Foundry VTT placeables. It is organized into small, testable classes:

- Position computation and spatial relationships are handled in a dedicated `PositionChecker`.
- Placeable-specific data access (center, bounds, elevation, selection) is handled by `PlaceableGetter`.
- Orchestrated, high-level checks (e.g., "is A under B?") are provided by `PlaceableChecker`.
- Simple state operations (e.g., set current placeable) are handled by `PlaceableSetter`.

All helpers are designed to work with the project-wide configuration system and to be safe for use in unit tests (graceful fallbacks, small surface area).

## Architecture

### Class Structure

- `PlaceableGetter`: Retrieves placeable data (center, rectangle bounds, elevation, selection)
- `PositionChecker`: Pure geometry checks between centers and rectangles with elevation rules
- `PlaceableChecker`: Combines `PlaceableGetter` + `PositionChecker` to answer domain questions
- `PlaceableSetter`: Minimal state utility to set the current placeable

### Workflow

1. `PlaceableGetter` extracts a position for each side based on a requested use (center or rectangle)
2. `PlaceableChecker` delegates to `PositionChecker.check(...)` with the proper use keys and elevations
3. `PositionChecker` evaluates the spatial relation (under/over) using exclusive boundaries and elevation rules

## Classes Documentation

### 1. PlaceableGetter

A small utility for retrieving common data from placeables.

#### Features

- `getCenter(placeable)`: returns `{ x, y }`
- `getRectBounds(placeable)`: returns `{ TopRight: {x,y}, BottomLeft: {x,y} }`
  - Uses Foundry's `placeable.bounds` when available; otherwise derives from width/height
-- `getElevation(placeable)`: supports `document.elevation`, `placeable.elevation`, defaults to `0`
- `getCorner(corner, placeable)`: returns a specific corner coordinate; warns on invalid input
- `getAllPlaceables(type, updateProperty, returnValue)`: reads from `canvas[type].placeables`
- `getSelectedPlaceables(placeables)`: filters by `controlled`
- `getPosition(placeable, manager, use)`: selects center or rectangle via the provided manager

#### Usage

```javascript
import PlaceableGetter from './placeableGetter.js';

const getter = new PlaceableGetter(config, context, utils);
const center = getter.getCenter(token);
const rect = getter.getRectBounds(template);
const elevation = getter.getElevation(token);
```

### 2. PositionChecker

Pure geometry checks for centers and rectangles with elevation comparisons. Exclusivity rules apply: boundaries are strict — touching an edge or a corner is NOT considered inside/overlapping.

#### Key Concepts

- Uses generated method keys based on position uses: `center-rectangle`, `rectangle-rectangle`, etc.
- Elevation rule: `UNDER` means targetElevation < referenceElevation; any non-`UNDER` is treated as `OVER` (targetElevation > referenceElevation)
- Boundaries are strict: comparisons use `<` and `>` not `<=`/`>=`

#### Methods

- `check(targetPos, targetEl, refPos, refEl, targetUse, refUse, checkType)`
- `elevationCheck(targetElevation, referenceElevation, checkType)`
- `isCenterRelativeToRect(center, targetEl, rect, refEl, checkType)`
- `isRectRelativeToCenter(rect, targetEl, center, refEl, checkType)`
- `isRectRelativeToRect(rectA, elA, rectB, elB, checkType)`
- `isCenterRelativeToCenter(centerA, elA, centerB, elB, checkType)`

#### Configuration

`PositionChecker` reads overrides from `config.constants.positionChecker` (when provided):

```yaml
positionChecker:
  checkTypes:
    UNDER: "under"   # or "below"
    OVER: "over"     # or "above"
  positionUses:
    CENTER: "center"
    RECTANGLE: "rectangle"
  methodKeys:
    CENTER_RECTANGLE: "center-rectangle"
    RECTANGLE_CENTER: "rectangle-center"
    RECTANGLE_RECTANGLE: "rectangle-rectangle"
    CENTER_CENTER: "center-center"
```

If absent, sensible inlined fallbacks are used inside `positionChecker.js`.

#### Usage

```javascript
import PositionChecker from './positionChecker.js';

const pc = new PositionChecker(config, context, utils);
const center = { x: 5, y: 5 };
const rect = { BottomLeft: { x: 0, y: 0 }, TopRight: { x: 10, y: 10 } };

// Center inside rect, and target is UNDER the reference elevation
const inside = pc.isCenterRelativeToRect(center, 1, rect, 2, pc.CHECK_TYPES.UNDER);
```

### 3. PlaceableChecker

High-level checks that combine `PlaceableGetter` and `PositionChecker`.

#### Features

- `checkPosition(...)`: direct pass-through to `PositionChecker.check`
- `isUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse, checkType)`
- `isOver(target, reference, targetManager, referenceManager, targetUse, referenceUse)`
- `isSelected(placeable)`: checks `controlled`
- `getDebugMode()`: resolves debug mode from instance flag → config → context

#### Usage

```javascript
import PlaceableGetter from './placeableGetter.js';
import PlaceableChecker from './placeableChecker.js';
import { CHECK_TYPES, POSITION_USES } from './config.js';

const getter = new PlaceableGetter(config, context, utils);
const checker = new PlaceableChecker(config, context, utils, getter);

// Example: Is token A under template B?
const result = checker.isUnder(
  tokenA,
  templateB,
  getter,        // target manager
  getter,        // reference manager
  POSITION_USES.CENTER,
  POSITION_USES.RECTANGLE,
  CHECK_TYPES.UNDER
);
```

### 4. PlaceableSetter

Minimal state utility to set and get the current placeable.

#### Features

- `setCurrentPlaceable(placeable, returnValue = true)`: sets `this.current`

#### Usage

```javascript
import PlaceableSetter from './placeableSetter.js';

const setter = new PlaceableSetter(config, context, utils);
setter.setCurrentPlaceable(token);
```

## Configuration

Placeable helpers read constants via `src/handlers/placeableHelpers/config.js`, which bridges to the main configuration system (`config.js → constants.js → constants.yaml`). This avoids magic strings and centralizes configuration.

```javascript
import { CHECK_TYPES, POSITION_USES, METHOD_KEYS } from './config.js';
```

- `CHECK_TYPES`: `{ UNDER, OVER }`
- `POSITION_USES`: `{ CENTER, RECTANGLE }`
- `METHOD_KEYS`: `{ CENTER_RECTANGLE, RECTANGLE_CENTER, RECTANGLE_RECTANGLE, CENTER_CENTER }`

`PositionChecker` also supports overrides under `config.constants.positionChecker` (see above). When overrides are absent, the in-file fallbacks are used.

## Error Handling

- All helpers log warnings for invalid inputs (e.g., malformed rectangles or missing coordinates)
- `PlaceableGetter.getCorner` warns for invalid or missing `corner`
- `PositionChecker` uses strict validation and early returns with warning logs

## Testing

Comprehensive unit tests exist for all classes in this folder.

```bash
# Run all placeableHelpers tests
npm test -- --testPathPattern=placeableHelpers

# Run individual files
npm test -- src/handlers/placeableHelpers/positionChecker.unit.test.js
npm test -- src/handlers/placeableHelpers/placeableChecker.unit.test.js
npm test -- src/handlers/placeableHelpers/placeableGetter.unit.test.js
npm test -- src/handlers/placeableHelpers/placeableSetter.unit.test.js
```

## Benefits

1. **Separation of Concerns**: Clear boundaries between geometry, data access, orchestration, and state
2. **Deterministic Geometry**: Exclusive boundary checks avoid edge/corner ambiguity
3. **Config-Driven**: Constants flow through the main config system with overrides supported
4. **Foundry-Friendly**: Uses Foundry APIs (`canvas`, `bounds`, `controlled`, `document.elevation`) when present
5. **Testable**: Small classes with simple method contracts and robust unit test coverage

## Integration Example

```javascript
import PlaceableGetter from './placeableGetter.js';
import PlaceableChecker from './placeableChecker.js';
import { CHECK_TYPES, POSITION_USES } from './config.js';

const getter = new PlaceableGetter(config, utils, context);
const checker = new PlaceableChecker(config, context, utils, getter);

const token = /* a Token */
const template = /* a MeasuredTemplate */

const tokenCenter = getter.getCenter(token);
const templateRect = getter.getRectBounds(template);

const isInsideAndUnder = checker.checkPosition(
  tokenCenter,
  getter.getElevation(token),
  templateRect,
  getter.getElevation(template),
  POSITION_USES.CENTER,
  POSITION_USES.RECTANGLE,
  CHECK_TYPES.UNDER
);
```

## Notes

- Geometry boundaries are exclusive by design: touching an edge/corner is not considered inside/overlapping
- `PlaceableGetter` depends on Foundry globals like `canvas`; when unavailable (e.g., in tests), mock accordingly
- Elevation comparisons are strict (`<` for UNDER, `>` for OVER); equal elevations return false for both checks
