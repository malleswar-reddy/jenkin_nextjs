pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_QA', defaultValue: false, description: 'Deploy to QA after build')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'jenkin_nextjs', description: 'Base Docker image name')
    }

    environment {
        // Node path (adjust for your Jenkins agent)
        PATH = "/home/dell/.nvm/versions/node/v18.20.4/bin:${env.PATH}"
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    def branch = env.BRANCH_NAME
                    def baseImage = params.DOCKER_IMAGE_NAME ?: 'jenkin_nextjs'
                    def tag = branch ? branch : 'local'
                    env.IMAGE_TAG = "${baseImage}:${tag}"
                    echo "Computed IMAGE_TAG=${env.IMAGE_TAG}"
                }
            }
        }

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
                sh "docker build -t ${env.IMAGE_TAG} ."
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
                echo "Deploying QA using PM2 and image ${env.IMAGE_TAG}"
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
            echo "Branch: ${env.BRANCH_NAME}, Image: ${env.IMAGE_TAG}"
        }
    }
}