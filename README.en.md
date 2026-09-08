# guk-lab-docs

[한국어](README.md) · [English](README.en.md)

This repository collects patterns that kept reappearing while I built 15 toy projects.

Project-specific documents stay beside their code. A project's `README.md`, `CLAUDE.md`, and
`docs/` change with the implementation, so copying them here would create stale duplicates.
This repository keeps only the practices that proved useful across multiple projects.

## Document ownership

The deciding question is: **would this document become outdated when one repository changes?**
If yes, it belongs in that repository.

| Lifetime | Examples | Location |
|---|---|---|
| Changes with code | `ARCHITECTURE.md`, `API.md`, project `CLAUDE.md`, `plans/` | The project repository; this hub links to it |
| Reusable across projects | Verification gates, headless harnesses, reusable rules and skills | This repository |
| One-time and complete | Finished plans, brainstorms, `TODO_NEXT.md` | The project's `docs/archive/` |

## Contents

### Playbooks

| Document | Purpose |
|---|---|
| [measure-first](playbooks/measure-first.md) | Measure before changing code and preserve the measured result in the commit |
| [headless-harness](playbooks/headless-harness.md) | Verify game simulations independently from their renderers |
| [verification-gate](playbooks/verification-gate.md) | Baseline existing debt and fail only when it grows |
| [cross-session-collab](playbooks/cross-session-collab.md) | Coordinate two agent sessions working in one repository |
| [publishing](playbooks/publishing.md) | Check assets, repository size, and secrets before publishing |
| [fe-radio](playbooks/fe-radio.md) | Arrange shared methods as the C → RADIO → V frontend design sequence |
| [branching](playbooks/branching.md) | Enforce main/develop branch rules and task-branch prefixes |
| [tooling-baseline](playbooks/tooling-baseline.md) | Share ESLint and Prettier defaults while paying down existing debt gradually |
| [web-optimization](playbooks/web-optimization.md) | Optimize images, fonts, and code while preserving pixel-art PNGs |
| [ci-security](playbooks/ci-security.md) | Keep CI green and connect security checks to protected branches |
| [frontend-patterns](playbooks/frontend-patterns.md) | Reuse component, hook, and state-management patterns |
| [derived-docs](playbooks/derived-docs.md) | Generate status documents from append-only events instead of editing tables by hand |
| [context-budget](playbooks/context-budget.md) | Limit the documentation an agent reads before starting a task |
| [ui-verification](playbooks/ui-verification.md) | Verify write paths and failure states that a static screen cannot explain |
| [modul-design-system](playbooks/modul-design-system.md) | Consume MODUL components, tokens, motion presets, and overrides safely |

### Reusable assets

| Document | Purpose |
|---|---|
| [harness/README](harness/README.md) | Catalog of reusable project rules, skills, and commands |

### Human-oriented guides

| Document | Purpose |
|---|---|
| [humans/](humans/README.md) | A short tour, decision log, and getting-started guide |

### Project maps

| Document | Purpose |
|---|---|
| [projects](projects.md) | Local projects and public repositories, including names and publication status |
| [repo-names](repo-names.md) | GitHub repository naming and license decisions |
| `clone-all.sh` | Clone 12 public code repositories into the ignored `workspace/` directory |

## Repository rules

- Claims need evidence. Measurements include the date they were taken.
- Stale material is removed instead of accumulating indefinitely.
- Project documents are linked by path rather than copied.
- Korean prose follows [STYLE.md](STYLE.md): respectful and concrete without sounding formal for its own sake.

## License

The writing in this repository uses **CC BY-NC 4.0**. You may share and adapt it with
attribution for non-commercial use. See [LICENSE](LICENSE) for the full terms.

Linked project repositories follow their own licenses. Check each repository before reusing
its code or assets; `pig-ma` and `modul` are reusable libraries, while other projects may use
more restrictive terms.
