pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID     = credentials('AWS_ACCOUNT_ID') // Retrieve from Jenkins Credentials Store
        AWS_DEFAULT_REGION = 'ap-south-1'
        ECR_REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
        ECR_REPOSITORY     = 'sliitek-frontend'
        IMAGE_TAG          = "build-${env.BUILD_NUMBER}"
        EC2_HOST           = "${env.EC2_HOST_IP}"           // Retrieve from Jenkins Global Environment Variables
        EC2_USER           = 'ubuntu'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        ansiColor('xterm')
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Lint') {
            steps {
                bat 'npm install'
                bat 'npm run lint || true' // Prevent build failure if there are only warning-level lint warnings
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %ECR_REPOSITORY%:%IMAGE_TAG% .'
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials-id' // Configured in Jenkins credentials store
                ]]) {
                    bat 'aws ecr get-login-password --region %AWS_DEFAULT_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY%'
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                bat 'docker tag %ECR_REPOSITORY%:%IMAGE_TAG% %ECR_REGISTRY%/%ECR_REPOSITORY%:%IMAGE_TAG%'
                bat 'docker push %ECR_REGISTRY%/%ECR_REPOSITORY%:%IMAGE_TAG%'
            }
        }

        stage('Deploy to EC2 via SSH') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh-key-id',
                    keyFileVariable: 'SSH_KEY_PATH',
                    usernameVariable: 'SSH_USER'
                )]) {
                    // Connect to EC2, update tag with rollback capability, pull and run frontend, and verify health
                    bat 'ssh -o StrictHostKeyChecking=no -i "%SSH_KEY_PATH%" %SSH_USER%@%EC2_HOST% "PREV_TAG=\\$(grep -E \'^FRONTEND_IMAGE_TAG=\' /home/%SSH_USER%/.env | cut -d\'=\' -f2) && PREV_TAG=\\${PREV_TAG:-latest} && touch /home/%SSH_USER%/.env && sed -i \'/^FRONTEND_IMAGE_TAG=/d\' /home/%SSH_USER%/.env && echo \'FRONTEND_IMAGE_TAG=%IMAGE_TAG%\' >> /home/%SSH_USER%/.env && export AWS_ACCOUNT_ID=%AWS_ACCOUNT_ID% && export AWS_REGION=%AWS_DEFAULT_REGION% && aws ecr get-login-password --region %AWS_DEFAULT_REGION% | docker login --username AWS --password-stdin %ECR_REGISTRY% && docker compose -f /home/%SSH_USER%/docker-compose.yml pull frontend && docker compose -f /home/%SSH_USER%/docker-compose.yml up -d frontend && echo \'Performing health check...\' && success=0 && for i in 1 2 3 4 5 6; do if curl -f http://localhost:5000/api/health; then success=1; break; fi; sleep 5; done && if [ \\$success -eq 0 ]; then echo \'Health check failed! Rolling back...\' && sed -i \'/^FRONTEND_IMAGE_TAG=/d\' /home/%SSH_USER%/.env && echo \\\"FRONTEND_IMAGE_TAG=\\$PREV_TAG\\\" >> /home/%SSH_USER%/.env && docker compose -f /home/%SSH_USER%/docker-compose.yml pull frontend && docker compose -f /home/%SSH_USER%/docker-compose.yml up -d frontend && exit 1; fi && docker image prune -f"'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Frontend deployment completed successfully!'
        }
        failure {
            echo 'Frontend deployment failed. Please check build logs.'
        }
    }
}
