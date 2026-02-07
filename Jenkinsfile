pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_QA', defaultValue: false, description: 'Deploy to QA after build')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'jenkin_nextjs', description: 'Base Docker image name')
    }

    environment {
        // Node path (adjust for your Jenkins agent)
        PATH = "/home/dell/.nvm/versions/node/v18.20.4/bin:${env.PATH}"
        BRANCH_NAME = env.BRANCH_NAME
        IMAGE_TAG = "${params.DOCKER_IMAGE_NAME}:${env.BRANCH_NAME ?: 'local'}"
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Prisma Generate') {
            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Build Next (host)') {
            steps {
                // Build on host to produce .next/standalone and .next/static
                sh 'npm run build'
            }
        }

        stage('Docker Build (runtime-only)') {
            steps {
                sh "docker build -t ${IMAGE_TAG} ."
            }
        }

        stage('Deploy QA (PM2)') {
            when {
                allOf {
                    branch 'release'
                    expression { return params.DEPLOY_QA }
                }
            }
            steps {
                echo "Deploying QA using PM2 and image ${IMAGE_TAG}"
                // Keep existing PM2 flow; alternatively, run container with docker
                sh 'pm2 startOrReload ecosystem.config.js --only hello-qa'
            }
        }

        stage('Deploy Prod (PM2)') {
            when { branch 'release' }
            steps {
                echo "Deploying to Production on Port 80"
                sh 'pm2 startOrReload ecosystem.config.js --only hello-prod'
            }
        }
    }

    post {
        always {
            echo "Branch: ${env.BRANCH_NAME}, Image: ${IMAGE_TAG}"
        }
    }
}