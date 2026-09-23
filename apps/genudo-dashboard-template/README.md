# GenuDo Live Dashboard Template (Zero-Credit Lovable Hosting)

This is a standalone, production-ready Vite + React + Tailwind + Recharts dashboard template that connects directly to GenuDo's remote Streamable HTTP MCP server at `https://api.genudo.ai/mcp`.

## How It Works (Zero Lovable Credits)

1. **Local / GitHub Codebase:** This repository houses 100% of the code. All edits are made by Claude / Codex on your local machine or in GitHub.
2. **Lovable as Free Host:** Lovable links to this GitHub repository.
3. **Auto-Deployment:** When code is pushed to `main`, Lovable automatically builds and deploys to `https://<project-id>.lovable.app`.
4. **Zero Lovable Credits:** Pushing git commits to a linked repository consumes **zero** Lovable AI credits!

## Setup Steps

1. Create a GitHub repository (e.g. `genudo-dashboard`) and push this template to it:
   ```bash
   git init
   git add .
   git commit -m "Initial GenuDo live dashboard"
   git branch -M main
   git remote add origin https://github.com/<your-username>/genudo-dashboard.git
   git push -u origin main
   ```
2. Open Lovable (`https://lovable.dev`):
   - Create a project (or open an existing one).
   - Click the **GitHub** button in the top right.
   - Click **Connect to GitHub** and select your `genudo-dashboard` repository.
3. Lovable will automatically deploy your live dashboard to `https://<your-project>.lovable.app`.
4. On your first visit, paste your GenuDo Full Access Token (`https://api.genudo.ai/docs/guide/authentication`) to load your live metrics!
