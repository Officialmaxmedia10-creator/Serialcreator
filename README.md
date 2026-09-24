# Story Hub

A mobile-friendly vanilla HTML/CSS/JavaScript story-sharing website.

## Files
- index.html — public Story Hub
- admin.html — admin dashboard
- style.css — responsive UI
- script.js — user signup/login, stories and reader
- admin.js — demo admin controls

## GitHub Pages
1. Create a public GitHub repository named `story-hub`.
2. Upload all files to the repository root.
3. Open Settings > Pages.
4. Choose Deploy from a branch.
5. Select `main` and `/(root)`, then Save.
6. Your site will be available at `https://YOUR-USERNAME.github.io/story-hub/`.

## Demo admin
Email: admin@storyhub.local
Password: admin123

IMPORTANT: This demo stores data in browser localStorage. It is NOT a real shared online database and the demo admin credentials are visible in JavaScript. Before using this as a real public service, connect Supabase Auth + database/RLS and remove the hardcoded admin credentials.
