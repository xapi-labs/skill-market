---
name: Skill Market Hardened E2E
description: Validate real R2 storage, GitHub commit checks, marketplace listing, and deduplicated installs.
version: 0.1.0
slug: e2e-hardening-2607100727
metadata:
  xapi:
    categories:
      - developer
      - testing
    tags:
      - e2e
      - r2
      - github
      - ci
---

# Remote R2 GitHub Smoke

Use this skill only for validating the xAPI Skill Marketplace release pipeline. It checks that an agent-readable skill package can be submitted, reviewed, stored in R2, published to the public skill repository, and then discovered from the marketplace.

## Workflow

1. Read the package manifest and confirm this is a smoke test skill.
2. Use xAPI marketplace APIs only when the operator asks for release-pipeline validation.
3. Report the submission id, review state, publish job state, public repo path, and installed marketplace count.

## Safety

This skill does not execute external writes, does not request wallet permissions, and does not handle personal data.
