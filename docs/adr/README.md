# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for significant architectural decisions made in the FoundryVTT Over My Head module.

ADRs document the context, decision rationale, consequences, and alternatives for important technical choices. They serve as a historical record of how and why the system was designed.

## Accepted Decisions

### [ADR-0001: Flexible Flag Management System with Environment Variables](0001-flexible-flag-management-system.md)

**Status**: ✅ Accepted (Implemented)

**Summary**: Implemented a hierarchical environment variable-based flag management system that allows debug and development flags to be controlled dynamically at multiple levels without requiring code changes.

**Key Features**:

- Environment variables as highest-priority flag source
- Three naming patterns for flexibility (full ID, short name, simple)
- Automatic type parsing (boolean, numeric, JSON)
- 100% backward compatible

**Related Documentation**:

- [Flag Management User Guide](../FLAG_MANAGEMENT.md) - Complete usage guide and examples
- [CI/CD Examples](../examples/ci-debug-example.yml) - GitHub Actions workflow examples
- [Local Development Examples](../examples/local-dev-example.sh) - Shell script examples

---

## How to Use ADRs

1. **For Understanding Decisions**: Read the relevant ADR to understand why a technical decision was made
2. **For Documentation**: Reference ADRs when discussing architectural changes
3. **For Consistency**: Use ADRs as a guide when making similar decisions

## Creating New ADRs

When making a significant architectural decision, create a new ADR by:

1. Creating a file: `000N-decision-title.md` (incrementing the number)
2. Using the MADR (Markdown Architecture Decision Records) template
3. Including: Status, Context, Decision, Consequences, and Alternatives Considered sections
4. Adding a reference to this README

Template sections:

- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Context**: Problem and constraints
- **Decision**: What was decided and why
- **Consequences**: Positive and negative outcomes
- **Alternatives Considered**: Other options explored
