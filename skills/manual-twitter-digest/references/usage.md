# Usage Reference

## Inputs

- `handle`: Required public X/Twitter screen name without the leading `@`.
- `postLimit`: Optional number of recent posts, default 10 and maximum 50.
- `language`: Optional output language requested by the user.

## Expected Output

1. Public profile identity and bio summary.
2. Three to five recurring themes.
3. Up to three representative public posts with dates.
4. A short limitations note when data is incomplete.

## Cost Control

The baseline workflow should use one profile lookup and one timeline request. Ask before making extra requests that consume additional xAPI credits.

