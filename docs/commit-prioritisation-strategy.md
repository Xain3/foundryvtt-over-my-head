# Commit Prioritisation & DRY Strategy

## Generalised Prescriptions

### 1. Commit foundational, shared APIs first

Always land small, focused commits that add or change helpers, types, or interfaces before committing consumers.

- **Actionable steps:**
  - Identify the minimal set of shared modules, helpers, or types that many later changes will import/use.
  - Commit those files first with a single, self-checking test or a dry-run example.
  - Keep helper commits small and well-documented so later commits can depend on them without rebasing.
- **Why:** Downstream feature commits are smaller and less likely to break because the shared contract is already in place.

### 2. Group by dependency direction: providers → consumers

Order commits so provider modules (helpers, infrastructure, schema) come before consumer code (patches, features, UIs).

- **Actionable steps:**
  - Draw a quick dependency graph: which files are imported by others? Commit topologically.
  - For changes where you must touch both provider and consumer, split into two commits: first provider update (backward compatible if possible), then consumer that uses the new API.
  - If provider change is breaking, include a migration stub or a feature flag so consumers can be updated in a follow-up commit.
- **Why:** Ensures each commit compiles/runs.

### 3. Keep commits single-purpose and idempotent

Each commit should do one logical thing (add helper, add patch, change compose) and leave the repository in a working state.

- **Actionable steps:**
  - Use small, targeted diffs (git add -p) and write a short commit message describing scope and verification steps.
  - Avoid mixing code and formatting/whitespace or unrelated refactors in the same commit.
  - If a change must span multiple files, include tests or smoke scripts in the same commit that prove the change works end-to-end.
- **Why:** Easier code review, bisecting, and reverts.

### 4. Verify per-commit with minimal checks

A commit should include one or two concrete verification steps that can prove the change is not broken (unit test, small smoke-run, linter, config validation).

- **Actionable steps:**
  - Define a short verify checklist and include it in the commit message footer or PR description (e.g., "Verify: `node script --dry-run`, `docker compose config`").
  - Add smoke scripts when touching infra (like `dev-smoke-install.mjs`) and run them in dry-run mode before committing.
- **Why:** Reviewers and CI can quickly confirm commits are safe.

---

## Bite-sized Version (One Sentence per Rule)

1. Commit helpers and shared APIs before any code that uses them.
2. Always land provider modules before consumer code (dependency order).
3. Make each commit single-purpose and keep the repo working after every commit.
4. Include a minimal verification step (test, lint, dry-run) for every commit.
