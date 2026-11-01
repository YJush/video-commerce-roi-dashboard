# Screenshot Recreation Study

A frontend implementation study built from a screenshot reference with Lovable.

**Status: design experiment.** This is an exercise in translating a visual reference into a working interface, rather than a complete business application. The original reference and a measured visual comparison are not documented here yet, so no pixel-accuracy claim is made.

## Stack

React 19 · TypeScript · TanStack Start/Router · Vite · Tailwind CSS 4 · shadcn-style components

## Development

Install a Node.js version supported by the installed Vite release and npm:

```sh
git clone https://github.com/YJush/accurate-render-clone.git
cd accurate-render-clone
npm install
npm run dev
```

A Bun lockfile is also included. Use a consistent package manager when updating dependencies and do not treat an npm install as a frozen-lockfile installation.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the project |
| `npm run preview` | Preview the build |
| `npm run lint` | Run ESLint |
| `npm run format` | Apply Prettier formatting; modifies files |

## Project structure

`src/` contains the interface source, `public/` contains static assets, and `vite.config.ts` configures the build. `AGENTS.md` documents the Lovable connection and Git-history constraints.

## Validation still needed

Document the reference, the active route and your implementation decisions. Add screenshots at desktop and mobile widths, check keyboard navigation and contrast, and compare spacing, typography and responsive behavior against the reference. No automated test suite or measured visual regression result is currently included.

## Contribution and publication notes

This repository is connected to Lovable. New commits sync to the connected editor. Do not rewrite published Git history, force-push, or amend/rebase published commits.

Before public release, confirm rights to reproduce the screenshot and any logos, images or other assets. Review dependencies, source and history for sensitive material. Describe AI-assisted tooling honestly and distinguish original work from generated scaffolding.

## License

No project license is currently included. Dependency licenses and rights in the reference design remain separate.
