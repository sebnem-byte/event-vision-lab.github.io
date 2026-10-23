# Event Vision Lab — Single-section update

This patch intentionally changes only the interactive block in **How Event Cameras Work**.

1. Upload `src/components/CircuitMathExplainer.tsx` into the same path in your GitHub repository.
2. Open `src/content/docs/fundamentals/how-event-cameras-work.mdx` in GitHub.
3. Replace the existing import for the old interactive component (`EventSimulator` or `InteractiveEventExplainer`) with:

   `import CircuitMathExplainer from '../../../components/CircuitMathExplainer';`

4. In Section 2, replace **only** the existing component line (`<EventSimulator client:load />` or `<InteractiveEventExplainer client:load />`) with:

   `<CircuitMathExplainer client:load />`

5. Replace the short descriptive sentence **immediately after** the old component (if present) with:

   `Explore the synchronized scene, analog signal chain and mathematical model. Click a pixel in the left panel, select electronic stages in the center, and compare accumulated events against five-bin voxel representations on the right. The retinal analogy describes functional inspiration—not a biological circuit implementation.`

6. Commit changes. Leave `astro.config.mjs`, `package.json`, `.github/workflows/deploy.yml` and every other page unchanged.

This simulator is synthetic and idealised. It does not claim real sensor measurements. The log-intensity trajectory, event triggering, reference update, frame, and event bins all derive from the same modeled scene. The mathematical text is expressed using HTML rather than LaTeX inside JSX, so no additional MDX math configuration is necessary.

Reference: Gallego et al., *Event-Based Vision: A Survey*, IEEE TPAMI 44(1):154–180, 2022. https://doi.org/10.1109/TPAMI.2020.3008413
