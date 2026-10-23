# Event Vision Lab · Restoration + visual expansion

This corrects two issues: the old patch replaced the interactive demo, and its image paths ignored the GitHub Pages repository base path.

## Upload these exact files (preserve directories)
- src/content/docs/fundamentals/how-event-cameras-work.mdx
- src/content/docs/fundamentals/mathematical-model.mdx
- src/components/EventLearningPanels.astro
- public/figures/from-light-to-asynchronous-events.png
- public/figures/how-event-cameras-work-infographic.png

**Do not remove** src/components/InteractiveEventExplainer.tsx: the new page imports and renders it with `client:load`.

**Delete the old** src/content/docs/fundamentals/mathematical-model.md if it exists alongside mathematical-model.mdx, to avoid duplicate Starlight routes.

GitHub Pages for this repository is https://sebnem-byte.github.io/event-vision-lab.github.io/ . The illustrated panel on How Event Cameras Work constructs image URLs using import.meta.env.BASE_URL, so images resolve correctly. The mathematical-model.mdx illustrations use the explicit repository base path.

Do not change astro.config.mjs, package.json, or .github/workflows/deploy.yml.

## Notes
- The large illustrated PNGs are visual references at their native resolution and may show imperfect fine text. The added HTML/CSS layout, headings, explanations and diagrams are actual page elements with crisp text.
- The animation continues to use the existing React component.
- GitHub Actions production build has not been run in this sandbox; verify the deployment result.
