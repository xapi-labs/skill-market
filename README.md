# xAPI Skill Market

Canonical public repository for reviewed xAPI agent skills.

Each published skill lives in one immutable slug directory:

```text
skills/<slug>/
  SKILL.md
  agents/
  references/
  scripts/
  eval-viewer/
  tests/
  assets/
```

`SKILL.md` is required and is the canonical source. Put marketplace metadata,
xAPI dependencies, permission hints, and examples in its frontmatter under
`metadata.xapi`. `xapi.skill.json` is accepted only as a legacy fallback.

Install pattern:

```bash
npx skills add xapi-labs/skill-market --skill <slug>
```

Publishing is performed by the xAPI Skill Marketplace review pipeline. Direct manual changes under `skills/` should pass the repository validator:

```bash
node scripts/validate-skill-market.mjs
```

After adding or updating a skill manually, regenerate the complete repository
index before validating:

```bash
node scripts/generate-registry.mjs
```

See [SPEC.md](./SPEC.md) for the package and repository contract.
