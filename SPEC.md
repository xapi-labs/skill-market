# Skill Repository Spec

This repository stores public, reviewed xAPI agent skills. The backend publishes approved submissions into `skills/<slug>/`.

## Repository Layout

```text
.
  README.md
  SPEC.md
  registry.json
  schemas/
    registry.schema.json
    xapi.skill.schema.json
  scripts/
    validate-skill-market.mjs
  skills/
    <slug>/
      SKILL.md
      xapi.skill.json
      agents/
      references/
      scripts/
      eval-viewer/
      tests/
      assets/
```

## Skill Directory Rules

- Directory name is the canonical slug and must match `^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$`.
- A skill must be published at `skills/<slug>/`.
- `SKILL.md` is required and must start with YAML frontmatter.
- `SKILL.md` frontmatter must include `name` and `description`.
- `SKILL.md` frontmatter may include `slug`, but it must match the directory name.
- `xapi.skill.json` is optional. If present, `slug` must match the directory name.
- Script files are allowed only under `scripts/` and `eval-viewer/`.
- Scripts are treated as review-only bundled resources. The marketplace does not execute user scripts in the MVP.
- Hidden files, path traversal, symlinks, binary executables, and obvious secrets are rejected.

## Recommended Skill Package

```text
skills/twitter-research/
  SKILL.md
  xapi.skill.json
  references/
    api-contract.md
  agents/
    reviewer.md
  scripts/
    package_skill.py
  tests/
    examples.json
  assets/
    cover.png
```

## `SKILL.md` Frontmatter

```markdown
---
name: Twitter Research
description: Research public Twitter/X users, tweets, timelines, and related web context through xAPI.
version: 1.0.0
---
```

The description should tell an agent when to use the skill. It should not be a marketing tagline.

## `xapi.skill.json`

`xapi.skill.json` extends the standard skill package with marketplace metadata, dependencies, and review hints. See [schemas/xapi.skill.schema.json](./schemas/xapi.skill.schema.json).

Minimal example:

```json
{
  "schemaVersion": "2026-07-01",
  "slug": "twitter-research",
  "version": "1.0.0",
  "categories": ["social", "research"],
  "tags": ["twitter", "x"],
  "supportedAgents": ["codex", "claude-code", "universal"],
  "riskLevel": "low",
  "xapiDependencies": [
    {
      "type": "action",
      "id": "twitter.user_by_screen_name",
      "required": true,
      "purpose": "Resolve a public Twitter/X profile"
    }
  ],
  "permissions": {
    "network": ["xapi.to"],
    "writesExternalState": false,
    "mayChargeUserBalance": false,
    "handlesPersonalData": false
  }
}
```

## Registry

`registry.json` is a generated index used by humans and tooling. The backend remains the source of marketplace truth, but the repository registry makes the public repo self-describing.

The validator checks that registry entries point to existing skill directories.

## CI

Every push and pull request runs:

```bash
node scripts/validate-skill-market.mjs
```

The validator is dependency-free so the public repo can validate quickly in GitHub Actions.
