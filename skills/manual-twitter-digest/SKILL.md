---
name: manual-twitter-digest
description: Build a concise digest from a public X/Twitter profile through xAPI. Use this skill when a user asks for a recent public activity summary.
version: 0.1.0
license: MIT
metadata:
  xapi:
    categories:
      - social
      - research
    tags:
      - twitter
      - digest
      - manual-test
    dependencies:
      - service: twitter
        endpoint: get /graphql/UserByScreenName
        required: true
        purpose: Resolve the requested public X/Twitter handle to a stable profile identifier.
      - service: twitter
        endpoint: get /graphql/UserTweets
        required: true
        purpose: Read recent public posts from the resolved profile for digest generation.
    permissions:
      externalWrites: false
      spendsCredits: true
      personalData: false
    examples:
      - title: Ten-post digest
        prompt: Summarize the latest 10 public posts from @openai and group the main themes.
      - title: Weekly profile brief
        prompt: Review @elonmusk's recent public activity and produce a short factual brief.
slug: manual-twitter-digest
---

# Manual Twitter Digest

Use this skill when a user asks for a factual summary of a public X/Twitter profile's recent activity through xAPI.

## Workflow

1. Extract the public screen name and remove a leading `@`.
2. Resolve the profile with `get /graphql/UserByScreenName`.
3. Read recent public posts with `get /graphql/UserTweets`.
4. Group recurring themes and select representative posts.
5. Return a concise digest with dates and source links when available.

## Boundaries

- Read public profile and post data only.
- Do not access direct messages, protected accounts, or private information.
- Do not post, like, follow, or perform any external write.
- Ask the user before making additional paid calls beyond the initial profile and timeline requests.

## Failure Handling

- On `404`, explain that the public profile could not be resolved.
- On `402`, stop and explain that xAPI balance is insufficient.
- On `429`, stop or back off once; do not retry in a loop.
- If no recent posts are returned, report that clearly instead of inventing a digest.

See `references/usage.md` for parameters and the expected output shape.
