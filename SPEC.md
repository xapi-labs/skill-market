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
      xapi.skill.json        # legacy fallback only
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
- `metadata.xapi` in `SKILL.md` is the canonical xAPI extension metadata.
- `xapi.skill.json` is a legacy fallback. If present, `slug` must match the directory name.
- Script files are allowed only under `scripts/` and `eval-viewer/`.
- Scripts are treated as review-only bundled resources. The marketplace does not execute user scripts in the MVP.
- Hidden files, path traversal, symlinks, binary executables, and obvious secrets are rejected.

## Recommended Skill Package

```text
skills/twitter-research/
  SKILL.md
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
slug: twitter-research
version: 1.0.0
metadata:
  xapi:
    categories: [social, research]
    tags: [twitter, x]
    dependencies:
      - service: twitter
        endpoint: get /graphql/UserTweets
        required: true
        purpose: Read public timeline data for research and digest generation.
    permissions:
      externalWrites: false
      spendsCredits: true
      personalData: false
---
```

The description should tell an agent when to use the skill. It should not be a marketing tagline.

## `metadata.xapi`

`metadata.xapi` contains only information used by xAPI dependency discovery,
marketplace display, and review risk hints. Dependencies use the public service
host slug and, when supplied, the exact endpoint key shown by xAPI.

## Registry

`registry.json` is a generated index used by humans and tooling. The backend remains the source of marketplace truth, but the repository registry makes the public repo self-describing.

The validator requires a one-to-one mapping between registry entries and skill
directories. Run `node scripts/generate-registry.mjs` after any manual change.

## CI

Every push and pull request runs:

```bash
node scripts/validate-skill-market.mjs
```

The validator is dependency-free so the public repo can validate quickly in GitHub Actions.
