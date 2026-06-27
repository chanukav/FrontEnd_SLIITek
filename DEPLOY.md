# Deployment Guide: Frontend

This guide outlines the step-by-step procedure for deploying the **SLIITek Frontend** (Vite + Nginx) to AWS EC2 using a Jenkins CI/CD pipeline.

---

## 📋 Prerequisites & Infrastructure Setup

Ensure the following infrastructure is configured prior to deploying the frontend:

### 1. AWS Services
- **IAM User/Role**: Create an AWS IAM user with programmatic access that has permission to read/write to Amazon ECR (e.g. `AmazonEC2ContainerRegistryPowerUser` policy).
- **ECR Repository**: Create a private ECR repository named `sliitek-frontend`. Note down its URL (typically `<AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/sliitek-frontend`).
- **EC2 Instance**:
  - Launch a `t2.micro` or `t3.micro` instance running **Ubuntu 22.04 LTS** (fits under AWS Free Tier).
  - Configure the **Security Group**:
    - Port `22` (SSH): Restricted to your Jenkins server IP.
    - Port `80` (HTTP): Open to `0.0.0.0/0` (public access).

### 2. Jenkins Server Setup
- Jenkins running with AWS CLI and Docker CLI installed on the build runner.
- AWS Credentials & SSH Agent plugins installed.

---

## 🛠️ Step 1: EC2 Host Setup

If this EC2 host has not been configured yet:

1. **Install Docker and Docker Compose** on the Ubuntu EC2 instance. (Refer to the Backend Deployment Guide for step-by-step instructions).
2. **Install AWS CLI** to handle AWS ECR registry log-in and image pulling.
3. Ensure the backend stack is deployed and the docker-compose orchestrator is initialized at `/home/ubuntu/docker-compose.yml` (configured with the `sliitek_net` bridge network).

---

## ⚙️ Step 2: Jenkins Server Configuration

The CI/CD build process runs on your Jenkins server to offload the frontend Vite build (`npm run build`) and Docker image creation.

### 1. Configure Jenkins Credentials
Navigate to **Manage Jenkins** > **Credentials** > **System** > **Global credentials** and add:

1. **AWS Credentials**:
   - Kind: `AWS Credentials`
   - ID: `aws-credentials-id` (Matches the value in `Jenkinsfile`)
   - Access Key ID: `YOUR_AWS_ACCESS_KEY_ID`
   - Secret Access Key: `YOUR_AWS_SECRET_ACCESS_KEY`

2. **EC2 SSH Private Key**:
   - Kind: `SSH Username with private key`
   - ID: `ec2-ssh-key-id` (Matches the value in `Jenkinsfile`)
   - Username: `ubuntu`
   - Private Key: Click `Enter directly` and paste the contents of your EC2 `.pem` private key file.

### 2. Update Pipeline Environment Variables
Ensure the following variables in the [Jenkinsfile](file:///d:/SLIITek/FrontEnd_SLIITek/Jenkinsfile) environment block match your setup:
```groovy
environment {
    AWS_ACCOUNT_ID     = '123456789012'       // Your AWS Account ID
    AWS_DEFAULT_REGION = 'us-east-1'           // Your target AWS ECR region
    ECR_REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
    ECR_REPOSITORY     = 'sliitek-frontend'    // Matches your AWS ECR repo name
    IMAGE_TAG          = 'latest'
    EC2_HOST           = '54.xxx.xxx.xxx'      // Your EC2 public IP or DNS
    EC2_USER           = 'ubuntu'
}
```

---

## 🚀 Step 3: Run the Jenkins Pipeline

1. Create a **Pipeline** job in Jenkins pointing to the frontend Git repository.
2. Trigger the build manually or configure a webhook.
3. The pipeline will:
   - Pull the latest frontend code.
   - Run `npm install` and linter validation (`npm run lint`).
   - Build a multi-stage Docker image:
     - **Stage 1 (Build)**: Compiles the Vite frontend React bundle (`npm run build`) into `dist/`.
     - **Stage 2 (Production)**: Copies the built files into an `nginx:alpine` image and copies `nginx.conf`.
   - Log into ECR and push the frontend image.
   - SSH into the EC2 host, authenticate with AWS ECR, and execute:
     ```bash
     docker compose -f /home/ubuntu/docker-compose.yml pull frontend
     docker compose -f /home/ubuntu/docker-compose.yml up -d frontend
     docker image prune -f
     ```

---

## 🔗 How it Works: Reverse Proxying & CORS

The frontend uses Nginx (`nginx.conf`) to serve static assets and handle routing for single-page applications (React Router fallback). It also serves as a reverse proxy:

- Requests to `/` serve the React application.
- Requests to `/api/*` are dynamically proxied to `http://backend:5000` via the internal Docker container network (`sliitek_net`).
- Requests to `/uploads/*` are proxied to `http://backend:5000/uploads/*` (if local storage fallback is used instead of Azure).

This architecture eliminates the need to configure CORS on the backend for the EC2 IP and simplifies client configuration since `VITE_API_URL` defaults to relative path `/api` in production.

---

## 🛠️ Step 4: Verification & Troubleshooting

### 1. Check Container Status
Verify both containers are running and healthy on the EC2 host:
```bash
docker ps
```
The frontend should be running and mapping port `80` on the host to port `80` in the container.

### 2. Verify Nginx Logs
If the frontend is not loading or failing to request backend data, check the Nginx logs inside the frontend container:
```bash
docker logs -f sliitek_frontend
```

### 3. Check App Access
Open your web browser and navigate to:
```
http://<EC2-PUBLIC-IP>
```
Test registering/logging in to ensure Nginx is correctly proxying requests to the backend container.

---

## ⚡ Manual Deployment Fallback

If you need to deploy the frontend manually without Jenkins:

1. SSH into the EC2 host.
2. Authenticate with AWS ECR manually:
   ```bash
   aws ecr get-login-password --region <AWS_DEFAULT_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_DEFAULT_REGION>.amazonaws.com
   ```
3. Pull the updated frontend image:
   ```bash
   docker compose -f /home/ubuntu/docker-compose.yml pull frontend
   ```
4. Restart the service:
   ```bash
   docker compose -f /home/ubuntu/docker-compose.yml up -d frontend
   ```
