Tailwind setup

This project includes a Tailwind CSS setup for the Blazor client.

Quick start:
1. Install Node.js (18+ recommended).
2. In the `Vuur.Client` folder run:
   - `npm install`
   - `npm run build:css` to generate `wwwroot/app.css` once
   - or `npm run watch:css` during development to rebuild on changes

Files added:
- `package.json` - npm scripts and devDependencies
- `tailwind.config.cjs` - Tailwind config (scans `.razor`, `.html`, `.cshtml`, `.css`, `.js`)
- `postcss.config.cjs` - PostCSS config with Tailwind + Autoprefixer
- `src/input.css` - Tailwind input directives

Notes:
- The build script writes to `wwwroot/app.css`, which is already referenced by `Components/App.razor`.
- If you use CI, add `npm ci` and `npm run build:css` to the pipeline before publishing.
