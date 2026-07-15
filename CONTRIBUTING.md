# Contributing to SLIITek Frontend

Thank you for your interest in contributing to the SLIITek Frontend! Please review and follow these guidelines to ensure a smooth development and PR review process.

## Code of Conduct

By participating in this project, you agree to treat all contributors with respect and professionalism.

## Getting Started

1. **Fork/Clone** the repository and create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file with `VITE_API_URL` pointing to your local running backend. **Never commit your `.env` file.**

## Development Standards

- **React Standards**: Follow React hooks rules, write modular, reusable components, and keep state management simple.
- **Styling**: Adhere to the established styling guidelines using Tailwind CSS.
- **Linting**: Run the linter locally before committing:
  ```bash
  npm run lint
  ```
- **Testing**:
  - Run component and unit tests via Vitest:
    ```bash
    npm run test
    ```
  - Run End-to-End browser tests via Playwright to ensure major user flows are intact:
    ```bash
    npm run test:e2e
    ```

## Commit Messages

Please write clear, meaningful commit messages following the Conventional Commits style:
- `feat: add reports moderation UI`
- `fix: correct avatar layout alignment on mobile`
- `docs: update deployment setup instructions`

## Pull Request Process

1. Push your branch to GitHub.
2. Submit a Pull Request (PR) targeting the `main` branch.
3. Fill out the PR template completely.
4. Ensure the Jenkins CI/CD pipeline tests and lint checks pass successfully.
5. Obtain review and approval from at least one repository administrator or project lead.
