import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Change these values if using a different account or repository.
const username = process.env.GITHUB_USERNAME || 'sebnem-byte';
const repo = process.env.GITHUB_REPOSITORY_NAME || 'event-vision-lab.github.io';
export default defineConfig({
  site: `https://${username}.github.io`,
  base: `/${repo}`,
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [react(), starlight({
    title: 'Event Vision Lab',
    description: 'A hands-on guide to event cameras, perception and SLAM.',
    logo: { src: './src/assets/logo.svg' },
    social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${username}/${repo}` }],
    customCss: ['./src/styles/docs.css'],
    sidebar: [
      { label: 'Fundamentals', items: [
        { label: 'How Event Cameras Work', slug: 'fundamentals/how-event-cameras-work' },
        { label: 'Mathematical Model', slug: 'fundamentals/mathematical-model' },
      ]},
      { label: 'Data Processing', items: [
        { label: 'Understanding Event Data', slug: 'data-processing/event-data' },
        { label: 'Event Representations', slug: 'data-processing/event-representations' },
      ]},
      { label: 'Perception', items: [{ label: 'Overview', slug: 'perception/overview' }] },
      { label: 'VIO & SLAM', items: [{ label: 'Roadmap', slug: 'vio-slam/roadmap' }] },
    ],
  })],
});
