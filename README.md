# Jeevan Rakth

Lifeline Innovators' full-stack initiative that connects urgent blood requirements with available donors in real time. The app streamlines discovery, verification, and communication so hospitals and community responders can coordinate faster during critical scenarios.

## Folder Structure

```
jeevan-rakth/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

- `public/` static assets used across the UI, including the app screenshot.
- `src/app/` Next.js App Router entry point with global styles, layout shell, and root page.
- `src/components/` shared UI primitives and composite widgets (currently staged for upcoming sprint work).
- `src/lib/` utilities for API access, data adapters, and configuration helpers.
- Config files at the project root ensure linting, TypeScript, and Next.js runtime settings stay consistent for everyone on the team.

## Setup Instructions

1. Install dependencies: `cd jeevan-rakth && npm install`
2. Start the development server: `npm run dev`
3. Open the app at `http://localhost:3000`
4. Run the linter before committing: `npm run lint`

## Reflection

We adopted the Next.js App Router layout to keep routing, layouts, and data-fetching logic co-located. Shared UI and utility logic live in `components` and `lib`, letting parallel squads extend the design system or connect to additional services without touching core pages. Centralized configuration files keep build tooling aligned, which de-risks onboarding. As future sprints introduce donor dashboards, hospital triage views, and integrations with Azure/AWS services, this separation lets each slice scale independently while preserving consistent UX and deployment workflows.


## **Tooling Setup & Changes**

- **Summary**: Added strict TypeScript, ESLint + Prettier, and Husky + lint-staged pre-commit hooks to enforce formatting and linting before commits.
- **Why**: Catch type and style issues early, keep a consistent code style, and prevent broken commits.

- **Files changed or added**:
	- `jeevan-rakth/tsconfig.json` — enabled strict TypeScript options (`strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`, `skipLibCheck`).
	- `jeevan-rakth/package.json` — added `prepare` script for Husky and `lint-staged` config; devDependencies updated.
	- `jeevan-rakth/package-lock.json` — updated by npm installs.
	- `jeevan-rakth/.eslintrc.json` — new ESLint configuration (extends Next.js + Prettier rules).
	- `jeevan-rakth/.prettierrc` — new Prettier configuration.
	- `jeevan-rakth/.husky/` — Husky hooks directory with `pre-commit` hook calling `npx lint-staged`.
	- `jeevan-rakth/src/app/globals.css`, `jeevan-rakth/src/app/layout.tsx`, `jeevan-rakth/src/app/page.tsx` — formatted by Prettier.

## **Reproduce / Install Steps**

Run these commands from the `jeevan-rakth` folder (Windows `cmd.exe`):

```
cd F:\jeevanrakth\S86-1225-Lifeline-Innovators-Full-Stack-With-NextjsAnd-AWS-Azure-Jeevan-Rakth\jeevan-rakth
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Add or update these files with the following contents (examples shown earlier in this repository):

- `tsconfig.json`: ensure strict compiler options are enabled (see project `tsconfig.json`).
- `.eslintrc.json`: extends `next/core-web-vitals` and `plugin:prettier/recommended` with custom rules.
- `.prettierrc`: formatting rules (`singleQuote: false`, `semi: true`, `tabWidth: 2`, `trailingComma: "es5"`).
- `package.json`: include `"prepare": "husky install"` and a `lint-staged` block:

```
"lint-staged": {
	"*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"]
}
```

## **Verification / Common Commands**

Run these to verify everything is healthy:

```
npx prettier --check src/
npm run lint
npx tsc --noEmit
npm run build
git status
```

If everything is green, commit the changes (Husky will run the pre-commit hook automatically):

```
git add .
git commit -m "chore: add ESLint/Prettier/Husky and enable strict TypeScript"
```

If lint-staged fixes issues automatically, they will be re-added to the commit. If non-fixable errors exist, fix and re-run the commit.


## preview Screenshot
![alt text](image.png)