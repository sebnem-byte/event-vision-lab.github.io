# Event Vision Lab page-layout patch

This patch gives you exactly the two high-resolution page visuals you liked, plus ready-to-paste page code.

## Files included

- `public/figures/from-light-to-asynchronous-events.png`
- `public/figures/how-event-cameras-work-infographic.png`
- `src/content/docs/fundamentals/mathematical-model.mdx`
- `src/content/docs/fundamentals/how-event-cameras-work.mdx`

## What to do

1. Upload the two PNG files into `public/figures/`.
2. Replace the content of:
   - `src/content/docs/fundamentals/mathematical-model.mdx`
   - `src/content/docs/fundamentals/how-event-cameras-work.mdx`
3. If you already have a `mathematical-model.md`, either delete it or rename it so it does not conflict with `mathematical-model.mdx`.
4. Commit and let GitHub Actions rebuild the site.

## Note

This patch does **not** use the SVG redesign. It uses the exact high-resolution PNG layouts you approved and wraps them with long English explanatory content.
