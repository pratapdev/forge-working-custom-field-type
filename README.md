# Custom Field: Multi-level Cascade (Forge)

This Forge app provides a Jira custom field with 3-level cascading dropdowns (Category → Subcategory → Item) using Custom UI (React).

## Prerequisites
- Node 18+
- Forge CLI (`npm i -g @forge/cli`)
- Logged in: `forge login`

## Setup
1. Update `manifest.yml` `app.id` with your app id (or let `forge register` create one).
2. Install deps:
   ```bash
   npm install
   ```
3. Build Custom UI:
   ```bash
   npm run build
   ```

## Deploy & Install
```bash
forge register
forge deploy
forge install
```

## Files
- `manifest.yml`: Defines `jira:customFieldType` module, edit/view/validation resolvers and UI resource.
- `src/index.ts`: Resolvers for edit/view/validate/save/clear and `getData`.
- `src/data.ts`: Static cascading data.
- `static/src/*`: Custom UI React code bundled with esbuild to `static/dist`.

## Notes
- The field stores values per issue using Forge storage.
- Validation enforces Subcategory when Category is set, and Item when Subcategory is set.
- Use `npm run watch` during development with `forge tunnel` if desired (ensure the resource path matches built output).
