# Math support setup

This project enables LaTeX math through remark-math + rehype-katex.
The configuration lives in astro.config.mjs and the stylesheet in src/styles/docs.css.

To apply to an existing GitHub repository, replace astro.config.mjs, package.json and src/styles/docs.css with these files. All other content is retained.
Ensure previously renamed .mdx pages use only one file per route (.md or .mdx).
After committing, GitHub Actions will install dependencies and rebuild.

Note: A build was not run in the current environment because npm packages could not be fetched.
