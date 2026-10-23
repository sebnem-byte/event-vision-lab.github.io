# Install — Mathematical Model page only

Copy the included `src/content/docs/fundamentals/mathematical-model.md` to your repository. Delete the old `src/content/docs/fundamentals/mathematical-model.mdx` file to prevent duplicate routes. Copy all SVGs from `public/figures/` to the matching folder. Do not modify the existing React explainer, other tutorials, `astro.config.mjs`, `package.json`, or GitHub Actions workflow.

The content uses `\[...\]` LaTeX delimiters; if your installed Starlight/remark-math setup is configured for `$...$` / `$$...$$` only, replace the `\[`/`\]` delimiters with `$$` on their own lines and `\(`/`\)` with `$`. The page is Markdown, not MDX, to avoid JSX brace parsing.

Images are genuine vector SVGs, not scaled screenshots. Optional original preview PNG infographics are deliberately excluded because their embedded tiny text is rasterized.

This is a targeted replacement of the mathematical-model page; it does not change the working site layout. Test build with `npm run build`.
