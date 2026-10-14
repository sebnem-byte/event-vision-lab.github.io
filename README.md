# Event Vision Lab

An open-source, interactive learning site for event camera fundamentals, data representations, perception, VIO and SLAM.

## Technology

Astro + Starlight docs, React-powered interactive event simulator, GitHub Pages deployment.

## Local development

```bash
npm install
npm run dev
```

Open the local URL shown by Astro, typically `http://localhost:4321/event-vision-lab.github.io/`.

Build for production with `npm run build`. To preview the production build use `npm run preview`.

## Publish to GitHub Pages

1. Create a **public** GitHub repository named `event-vision-lab.github.io`.
2. Upload or push this project's files to its `main` branch.
3. Go to **Settings → Pages → Build and deployment** and select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` builds and deploys the site on pushes to `main`.
5. Visit `https://sebnem-byte.github.io/event-vision-lab.github.io/` after deployment completes.

If your GitHub username or repo differs, change the corresponding values in `astro.config.mjs`, plus the two GitHub links in `src/pages/index.astro`. The example docs use `/event-vision-lab.github.io/` in internal links; update these when changing the repo name.

## Source and attribution

The scientific explanation follows [Gallego et al., *Event-Based Vision: A Survey*, IEEE TPAMI (2022)](https://doi.org/10.1109/TPAMI.2020.3008413). The simulated plot and website graphics are original work (not copied from the paper).

Dataset for exercises: [MVSEC](https://daniilidis-group.github.io/mvsec/). Datasets are not included in this repository.

## Structure

- `src/pages/index.astro`: homepage with responsive tutorials mega-menu.
- `src/components/EventSimulator.tsx`: interactive single-pixel event simulator.
- `src/content/docs/`: lessons and exercises.
- `src/styles/`: visual system.
- `.github/workflows/deploy.yml`: GitHub Pages CI/CD.

## Planned additions

Actual MVSEC notebook solutions, feature tracking, optical flow, event-based depth and VIO/SLAM.
