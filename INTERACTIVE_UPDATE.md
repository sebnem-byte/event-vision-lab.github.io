# Interactive event-camera update

This version adds `src/components/InteractiveEventExplainer.tsx` and updates the homepage and Fundamentals lesson to use it.

## Deploy
Upload these three files to the **same paths** in your GitHub repository:
- `src/components/InteractiveEventExplainer.tsx` (new)
- `src/pages/index.astro` (replace)
- `src/content/docs/fundamentals/how-event-cameras-work.mdx` (replace)

Keep your **already working** `.github/workflows/deploy.yml`, `astro.config.mjs`, and other files. Do not upload the ZIP as a file inside GitHub.

The idealized scene uses a 72 x 42 synthetic pixel array, samples every 2 ms, generates pixelwise logarithmic threshold-crossing events, and supports ON/OFF accumulation, five temporal bins, a last-event time surface, selection of a pixel, and playback. It does not claim to be real MVSEC data.
