# xAPI Skill Market

Canonical public repository for reviewed xAPI agent skills.

Each published skill lives in one immutable slug directory:

```text
skills/<slug>/
  SKILL.md
  xapi.skill.json
  agents/
  references/
  scripts/
  eval-viewer/
  tests/
  assets/
```

`SKILL.md` is required. `xapi.skill.json` is optional, but recommended for marketplace metadata, xAPI dependency declarations, permissions, examples, and risk review hints.

Install pattern:

```bash
npx skills add xapi-labs/skill-market --skill <slug>
```

Publishing is performed by the xAPI Skill Marketplace review pipeline. Direct manual changes under `skills/` should pass the repository validator:

```bash
node scripts/validate-skill-market.mjs
```

See [SPEC.md](./SPEC.md) for the package and repository contract.
