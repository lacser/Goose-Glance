# Goose Glance <img src="./public/icons/icon128.png" alt="LOGO" width="30"> </br>Job details at a glance

Translation: [简体中文](README.zh-CN.md)

![Welcome Image](./components/pages/public/WelcomeImage.webp)

## Quick Start
Give it a try quickly? [![在 Chrome Web Store 中查看](https://img.shields.io/badge/Chrome%20Web%20Store-View-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/goose-glance-for-waterloo/hblfffccmiegiahkolkendnfkaegogjg)

### What is Goose Glance
Goose Glance is a Chrome browser extension powered by LLM (Large Language Model) designed for Waterloo Works. It automatically extracts job posting content from Waterloo Works pages and leverages AI capabilities to summarize key information including job responsibilities, required qualifications, work term duration, and location. This information is then seamlessly injected into the job posting page, enabling quick review and efficient filtering of opportunities.

## Privacy
Not everyone is interested in reading every line of code to understand where does their data go. [Here](https://mango-ground-0bd6b9d0f.1.azurestaticapps.net/) is a quick summary of what data does Goose Glance use.

Please do note Goose Glance is open source under the MIT License and is provided as‑is, without warranties or conditions of any kind.

## DEV Notes

### Tech Stack of Goose Glance

- TypeScript
- React
- Redux
- Vite
- WebLLM
- Tailwind CSS
- Indexed DB
- Fluent UI components

### Dev and build

The extension consists of three parts: 

1. Popup window for extension configurations. See under `components/popup` folder.
2. Content injected into the Waterloo Works page. See under `components/content` folder.
3. Pages in new tabs for new install initialization and configuration. See under `components/pages` folder.

Running `yarn build` executes `scripts/build.js`, which builds both parts separately, copies the contents of the `public` folder, and produces a `dist` directory. For development and testing, load the `dist` folder in the browser as an unpacked extension.

Running `yarn watch` executes `scripts/watch.js`, this simply runs `scripts/build.js` automatically whenever it detects a file change. This provides convenience for development process.
