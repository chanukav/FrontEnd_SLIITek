# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## AWS Free Tier Deployment

The React application is containerized using a multi-stage Docker build:
1. **Build Stage**: Uses `node:20-alpine` to install dependencies and run the production build (`npm run build`).
2. **Runtime Stage**: Copies the static `/dist` bundle into an lightweight `nginx:alpine` container. Nginx serves the static files on port 80 and handles proxying for `/api/` endpoints to prevent CORS issues.

## Jenkins CI/CD Pipeline

A [Jenkinsfile](file:///d:/SLIITek/FrontEnd_SLIITek/Jenkinsfile) is provided in the repository root.

### Pipeline Actions:
1. Clones the frontend repository and runs linters.
2. Builds the Nginx/React Docker container.
3. Authenticates with AWS ECR and pushes the Docker image to your private ECR registry.
4. Uses SSH to command the AWS EC2 instance to pull the updated image and restart the `frontend` container in the background.

### Setup Instructions:
*   Configure the AWS and EC2 credentials in Jenkins with ID `aws-credentials-id` and `ec2-ssh-key-id`.
*   Ensure environment variables (`AWS_ACCOUNT_ID`, `EC2_HOST`, etc.) are configured in the `Jenkinsfile`.

