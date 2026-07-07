---
name: Remote R2 GitHub Smoke mrai7rvl-6ab1b1
description: Verify xAPI Skill Marketplace real R2 storage and GitHub public repo publishing.
version: 0.1.0
---

# Remote R2 GitHub Smoke

Use this skill only for validating the xAPI Skill Marketplace release pipeline. It checks that an agent-readable skill package can be submitted, reviewed, stored in R2, published to the public skill repository, and then discovered from the marketplace.

## Workflow

1. Read the package manifest and confirm this is a smoke test skill.
2. Use xAPI marketplace APIs only when the operator asks for release-pipeline validation.
3. Report the submission id, review state, publish job state, public repo path, and installed marketplace count.

## Safety

This skill does not execute external writes, does not request wallet permissions, and does not handle personal data.
