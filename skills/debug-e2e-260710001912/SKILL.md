---
name: Debug E2E Skill
slug: debug-e2e-260710001912
version: "0.1.0"
description: End-to-end skill marketplace validation package for xAPI publish flow.
metadata:
  xapi:
    categories:
      - developer
      - testing
    tags:
      - e2e
      - publish
    dependencies:
      - service: twitter
        endpoint: resolve-profile
        required: true
        purpose: Resolve public Twitter/X profiles during agent workflows.
---

# Debug E2E Skill

Use this skill to verify the xAPI Skill Marketplace submission, review, publish progress, GitHub push, and marketplace listing flow.

## Workflow

1. Confirm the user request.
2. Use xAPI endpoint dependencies when external data is needed.
3. Summarize the result with source context.

## Safety

This package is intentionally small and read-only. It performs no shell execution and stores no secrets.
