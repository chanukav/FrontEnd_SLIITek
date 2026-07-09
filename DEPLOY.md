# Deployment Guide: Frontend

This guide outlines the step-by-step procedure for deploying the **SLIITek Frontend** (Vite + Nginx) to AWS EC2 using a Jenkins CI/CD pipeline.

---

## 📋 Prerequisites & Infrastructure Setup

Ensure the following infrastructure is configured prior to deploying the frontend:

### 1. AWS Services
- **IAM User/Role**: Create an AWS IAM user with programmatic access that has permission to read/write to Amazon ECR (e.g. `AmazonEC2ContainerRegistryPowerUser` policy).
- **ECR Repository**: Create a private ECR repository named `sliitek-frontend`. Note down its URL (typically `<AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/sliitek-frontend`).
- **EC2 Instance**:
  - Launch a `t2.micro` or `t3.micro` instance running **Ubuntu 22.04 LTS** (fits under AWS Free Tier).
  - Configure the **Security Group**:
    - Port `22` (SSH): Restricted to your Jenkins server IP.
    - Port `80` (HTTP): Open to `0.0.0.0/0` (public access).

### 2. Jenkins Server Setup
- Jenkins running with AWS CLI and Docker CLI installed on the build runner.
- AWS Credentials & Credentials Binding plugins installed.

---

## 🛠️ Step 1: EC2 Host Setup

If this EC2 host has not been configured yet:

1. **Install Docker and Docker Compose** on the Ubuntu EC2 instance. (Refer to the Backend Deployment Guide for step-by-step instructions).
2. **Install AWS CLI** to handle AWS ECR registry log-in and image pulling.
3. Ensure the backend stack is deployed and the docker-compose orchestrator is initialized at `/home/ubuntu/docker-compose.yml` (configured with the `sliitek_net` bridge network).

---

## ⚙️ Step 2: Jenkins Server Configuration

The CI/CD build process runs on your Jenkins server to offload the frontend Vite build (`npm run build`) and Docker image creation.

> [!IMPORTANT]
> **Windows Agent Compatibility:** Because the Jenkins agent is running on a **Windows** host, the pipeline is written using native Windows batch (`bat`) commands instead of standard POSIX shell (`sh`) commands.

### 1. Configure System Environment Path in Jenkins
To ensure Jenkins can find your Git Bash shell utilities (like `ssh` and `scp`) when running batch commands:
1. Go to the Jenkins Dashboard.
2. Click **Manage Jenkins** > **System**.
3. Scroll to **Global properties** -> check **Environment variables**.
4. Click **Add** to configure:
   - **Name:** `PATH+GIT_BIN`
   - **Value:** `C:\Program Files\Git\bin`
5. Click **Add** to configure:
   - **Name:** `PATH+GIT_USR_BIN`
   - **Value:** `C:\Program Files\Git\usr\bin`
6. Click **Save**.

### 2. Configure Credentials in Jenkins
Navigate to **Manage Jenkins** > **Credentials** > **System** > **Global credentials** and add:

1. **AWS Account ID**:
   - Kind: `Secret text`
   - ID: `AWS_ACCOUNT_ID` (Matches the credentials reference in `Jenkinsfile`)
   - Secret: `YOUR_12_DIGIT_AWS_ACCOUNT_ID`

2. **AWS CLI Programmatic Credentials**:
   - Kind: `AWS Credentials`
   - ID: `aws-credentials-id` (Matches the value in `Jenkinsfile`)
   - Access Key ID & Secret Access Key: `YOUR_AWS_ACCESS_KEYS`

3. **EC2 SSH Private Key**:
   - Kind: `SSH Username with private key`
   - ID: `ec2-ssh-key-id` (Matches the value in `Jenkinsfile`)
   - Username: `ubuntu`
   - Private Key: Click `Enter directly` and paste the contents of your EC2 `.pem` private key file.

### 3. Configure Jenkins Global Environment Variables
To keep your pipeline code clean and generic:
1. Under **Global properties** -> **Environment variables** (configured in the System dashboard), add:
   - **Name:** `EC2_HOST_IP`
   - **Value:** Your EC2 Instance's public IP address (e.g., `65.2.179.56`).

### 4. Update Pipeline Environment Variables
Ensure the following variables in the [Jenkinsfile](file:///d:/SLIITek/FrontEnd_SLIITek/Jenkinsfile) environment block match your setup (secrets and IPs are dynamically fetched at runtime to prevent code hardening):
```groovy
environment {
    AWS_ACCOUNT_ID     = credentials('AWS_ACCOUNT_ID') // Retrieve from Jenkins Credentials Store
    AWS_DEFAULT_REGION = 'ap-south-1'                  // Target AWS ECR region
    ECR_REPOSITORY     = 'sliitek-frontend'            // Matches AWS ECR repo name
    IMAGE_TAG          = "build-\${env.BUILD_NUMBER}"
    EC2_HOST           = "\${env.EC2_HOST_IP}"           // Retrieve from Jenkins Global Environment Variables
    EC2_USER           = 'ubuntu'
}
```

> [!NOTE]
> **SSH Agent Plugin Bypass:** The Jenkins `sshagent` plugin has a known Windows compatibility bug that throws parsing errors during environment setup. The pipeline is securely configured to use `withCredentials` and `sshUserPrivateKey` to load the private key into a secure temporary file (`SSH_KEY_PATH`) and pass it to SSH/SCP directly using the `-i` parameter.

---

## 🚀 Step 3: Configure Triggers & Run the Jenkins Pipeline

The pipeline is configured with a `triggers` block to support automated error checking on code pushes. 

### 1. Configure Automatic Push Triggers (Webhooks)
To have Jenkins automatically trigger builds when you push commits to GitHub:
1. **In Jenkins**:
   - Go to your Pipeline job configuration.
   - Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
2. **In GitHub**:
   - Go to your repository settings page.
   - Click **Webhooks** > **Add webhook**.
   - Set **Payload URL** to `http://<your-jenkins-server-url>/github-webhook/` (ensure the trailing slash is included).
   - Set **Content type** to `application/json`.
   - Choose **Just the push event** and click **Add webhook**.

> [!TIP]
> To skip pipeline triggers for documentation-only pushes (e.g., `.md` files), configure **"Polling ignores commits in certain paths"** under **Additional Behaviours** in the Jenkins job's Git SCM section, with the excluded pattern `.*\.md`.

### 2. Multi-Branch Pipeline & Validation Behavior
To protect the production environment, the pipeline behaves differently based on the branch being built:
- **All Branches**: Upon push, the pipeline will run full validation tests (`npm install`, `npm run lint`, `npm test`, and `npm run build` compilation) to check whether there are any errors. If any step fails, the build fails and you are immediately notified.
- **`main` Branch Only**: If the branch is `main`, the pipeline proceeds to build the Docker image, push it to AWS ECR, and deploy it to the EC2 host. For other branches, these deployment steps are skipped.

### 3. Pipeline Execution Flow
When a build is triggered, the pipeline:
- Pulls the latest code.
- Runs full validation (`npm install`, `npm run lint`, `npm test`, and `npm run build`).
- (If branch is `main`) Builds a multi-stage Docker image:
     - **Stage 1 (Build)**: Compiles the Vite frontend React bundle (`npm run build`) into `dist/`.
     - **Stage 2 (Production)**: Copies the built files into an `nginx:alpine` image and copies `nginx.conf`.
   - Log into ECR and push the frontend image.
   - SSH into the EC2 host, authenticate with AWS ECR, and execute:
     ```bash
     docker compose -f /home/ubuntu/docker-compose.yml pull frontend
     docker compose -f /home/ubuntu/docker-compose.yml up -d --no-deps frontend
     docker image prune -f
     ```

---

## 🔗 How it Works: Reverse Proxying & CORS

The frontend uses Nginx (`nginx.conf`) to serve static assets and handle routing for single-page applications (React Router fallback). It also serves as a reverse proxy:

- Requests to `/` serve the React application.
- Requests to `/api/*` are dynamically proxied to `backend_servers` (which load-balances requests between `backend_a:5000` and `backend_b:5000` in the internal Docker network `sliitek_net`).
- Requests to `/uploads/*` are proxied to `backend_servers/uploads/*` (if local storage fallback is used instead of Azure).

This architecture eliminates the need to configure CORS on the backend for the EC2 IP and simplifies client configuration since `VITE_API_URL` defaults to the relative path `/api` in production.

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
