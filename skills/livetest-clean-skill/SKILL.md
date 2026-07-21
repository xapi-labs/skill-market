---
name: livetest-clean-skill
description: 'Live E2E test: real GitHub publish path'
metadata:
  xapi:
    categories:
      - utils
    dependencies:
      - service: about-skill-demo
        endpoint: get-ip
        required: true
        purpose: demo endpoint — call via the xapi gateway
    permissions:
      externalWrites: false
      spendsCredits: false
      personalData: false
slug: livetest-clean-skill
version: 0.1.1
---

# Livetest Clean Skill

Fetches the caller public IP via the xapi demo gateway. No special permissions needed.

This is a throwaway test artifact from automated E2E testing of the xapi skill auto-review pipeline - safe to delete.
