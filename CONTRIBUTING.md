# Contribute to EML AdminTool

First of all, thank you for your interest in contributing to EML AdminTool ❤️!

This project aims to provide a reliable, secure and maintainable administration panel for Minecraft Launchers built with EML Lib. Contributions are welcome, but must follow the guidelines below to ensure consistency and stability.

## Before you start

Please make sure to:

- Read the README.md.
- Check existing issues and pull requests.
- Join the Discord server if you need clarification.

If you plan to implement a significant feature, open an issue first to discuss it

## Branching Strategy

This repository follows a structured workflow:

| Branch Name | Purpose                                                  |
| ----------- | -------------------------------------------------------- |
| `main`      | Currently published version (production-ready)           |
| `dev`       | Next version under preparation                           |
| `feature/*` | Feature-specific branches (recommended for contributors) |
| `fix/*`     | Bug fix branches (recommended for contributors)          |

> [!NOTE]
> To submit a translation, please open an issue using the "Language" template instead of a pull request.

### Do not:

- Open pull requests directly to `main`.
- Create version-numbered branches (e.g., `v1.0.0`).
- Use non-descriptive branch names (e.g., `update`, `bugfix`).

### Do:

- Create a branch from `dev` for your feature or bug fix.
- Name your branch according to the type of contribution (e.g., `feature/new-dashboard`, `fix/login-issue`).
- Open a pull request to `dev` when your work is ready for review.

## Development setup

### Requirements

- Node.js (LTS version recommended)
- Docker Engine and Docker Compose (you can use Docker Desktop)
- Git

### Installation

```bash
git clone https://github.com/Electron-Minecraft-Launcher/EML-AdminTool.git
cd EML-AdminTool
npm install
```

### Running the development environment

```bash
npm run docker
```

You can access the application at [http://localhost:5173](http://localhost:5173) and pgAdmin at [http://localhost:5050](http://localhost:5050) (email: `admintool@eml.com`, password: `eml`).

## Code guidelines

### General principles

- Write clean, readable and maintainable code.
- Keep logic modular and reusable.
- Avoid using unnecessary dependencies.
- Respect the project's coding style and conventions.

### TypeScript

- Use strict typing and avoid using `any` where possible.
- Use interfaces and types to define expected shapes of data.
- Prefer explicit return types for exported functions and constants.
- Use `async/await` for asynchronous operations and handle errors properly.

### Svelte / SvelteKit

- Keep UI components clean and small.
- Move business logic to server routes or services.
- Validate user input both on the client and server sides (with `zod`).

### Prisma and files

We use prisma db push instead of strict migration histories. You must use the Expansion-Contraction pattern for schema changes:

- Never delete or rename existing columns directly.
- Only add new columns with default values or nullable.
- Migrate data via `scripts/migrations/[migration-name].ts`.

### Public API

- Ensure backward compatibility when modifying API endpoints for EML Lib.

## Pull request guidelines

Before submitting a PR:

- Ensure the project builds.
- Ensure Docker environment runs correctly.
- Test your changes manually.
- Keep PRs focused (one feature or fix per PR).

PR description must include:

- What was changed.
- Why it was changed.
- Whether it affects database or API behavior.
- Screenshots if UI is modified.

## Translations

Translation files are located in `src/lib/locales/`.

To contribute a translation:

- Create a new language file.
- Ensure keys match existing locale structure.
- Submit via issue using the "Language" template.

Translations must be validated before merging.

## Security

If you discover a security vulnerability:

- Do **NOT** open a public issue.
- Contact the maintainers via Discord (@goldfrite) or email ([goldfrite@gmail.com](mailto:goldfrite@gmail.com)) with details.

## Versioning

This project follows Semantic Versioning. Version numbers are in the format `x.y.z` where:

| Type          | Description               |
| ------------- | ------------------------- |
| `PATCH` (`z`) | Bug fixes                 |
| `MINOR` (`y`) | New non-breaking features |
| `MAJOR` (`x`) | Breaking changes          |

Version tags are created only when merging to main.

## License

This project is licensed under `GNU AGPLv3`.

By contributing, you agree that your code will be distributed under this license.
