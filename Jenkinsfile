pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_QA', defaultValue: false, description: 'Deploy to QA after build')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'jenkin_nextjs', description: 'Base Docker image name')
    }

    environment {
        // Remove hardcoded Node PATH; use Dockerized Node 20 for build stages
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    def rawBranch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ''
                    // Normalize: remove refs/* prefixes, trim whitespace, lowercase
                    def branch = rawBranch.replaceFirst(/^refs\/heads\//, '').trim().toLowerCase()
                    def baseImage = params.DOCKER_IMAGE_NAME ?: 'jenkin_nextjs'
                    def tag = branch ? branch : 'local'
                    env.IMAGE_TAG = "${baseImage}:${tag}"
                    echo "Branch detected: '${branch}' from raw '${rawBranch}'"
                    echo "Computed IMAGE_TAG=${env.IMAGE_TAG}"
                }
            }
        }

        stage('Install (Node 20)') {
            steps {
                script {
                    docker.image('node:20').inside {
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Prisma Generate (Node 20)') {
            steps {
                script {
                    docker.image('node:20').inside {
                        sh 'npx prisma generate'
                    }
                }
            }
        }

        stage('Build Next (host, Node 20)') {
            steps {
                script {
                    docker.image('node:20').inside {
                        // Build on host (container) to produce .next/standalone and .next/static
                        sh 'npm run build'
                    }
                }
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
            echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH}, Image: ${env.IMAGE_TAG}"
        }
    }
}