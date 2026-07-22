# Contributing

Thank you for your interest in contributing to the eGovERA Upscale Frontend.

## How to contribute

1. Open an issue on the project's Code.Europa page to describe the bug or feature you want to work on.
2. Fork the repository and create a branch from `main`.
3. Make your changes, ensuring the project still builds (`yarn build`).
4. Submit a merge request referencing the issue.

## Setting up the development environment

See the [Local setup](README.md#local-setup) section in the README for full
prerequisites and step-by-step instructions.

```bash
yarn install
npm run dev      # dev server at http://localhost:4200 with API proxy
npm test         # run unit tests via Karma
```

## Code style

- **Angular 19** / **TypeScript**: follow standard Angular style guidelines.
- Keep `components`, `services`, and `modules` in their respective feature folders.
- Do not introduce `console.log` statements in committed code.
- All new code must compile cleanly with no TypeScript errors (`yarn build`).

## Reporting security issues

Please do **not** open a public issue for security vulnerabilities, follow the
process in [SECURITY.md](SECURITY.md).

## Code of Conduct

By contributing you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
