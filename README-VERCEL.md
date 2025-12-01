Deployment notes for this folder (Node service)
------------------


This `frontend` folder is a Node/Express service (not a Create React App) — it is prepared to be built with TypeScript and run as a persistent Node process.

Recommended hosts:
- Docker-friendly hosts (Render, Fly, AWS ECS / Fargate) — use the provided `Dockerfile`.
- Railway / Render — they support classic Node processes and will run this service directly.

Notes about Vercel:
- Vercel is designed primarily for static sites and Serverless Functions (short-lived handlers). A long-running Express process is not a first-class fit for Vercel. If you still want Vercel to build the project, two important points were addressed in this repo:
  1) TypeScript is moved into `dependencies` so the TypeScript compiler is available during a production install (`npm ci`) in CI.
  2) The `build` script uses the compiler via Node (so the CLI invocation works even in environments where `.bin` shims aren't executable):

```json
"build": "node ./node_modules/typescript/lib/tsc.js -p tsconfig.json && node ./scripts/fix-extensions.cjs"
```

However, my strong recommendation: deploy this folder on a platform that supports a full Node process (Docker / Render / Railway) rather than Vercel.

- This repo's `frontend` contains `react-scripts` and TypeScript versions that can produce peer dependency conflicts. By default npm 7+ enforces peer deps which may stop `npm ci` and prevent `react-scripts` from being installed.
Quick fix for install problems (CI): Add a `.npmrc` or use `--legacy-peer-deps` during install.
- More robust fixes:
  - Align your TypeScript and react-scripts versions (e.g., use TypeScript 4 when using react-scripts@5) or upgrade the build toolchain.
  - Ensure the project layout matches the intended deployment: if you're deploying a React app, include `public/index.html` and a proper React entrypoint (`src/index.tsx`). If this folder is a server, change the Vercel Root and build/start commands accordingly.

Recommended deployment options for this folder:

- Docker (recommended for full Express process): there's a `Dockerfile` in this folder. Build and run the container, or deploy it to a Docker-friendly host.
- Railway / Render / Fly — these hosts support Node servers directly and are well-suited for this project.

If you still want to use Vercel, consider converting endpoints into serverless functions and using an appropriate Vercel configuration (advanced). Vercel will not host a long-running Express process by default.

To run locally:

```powershell
cd frontend
npm ci --legacy-peer-deps
npm run build
npm start
```

Or during development:

```powershell
npm run dev
```
