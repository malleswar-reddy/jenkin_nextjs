pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_QA', defaultValue: false, description: 'Deploy to QA after build')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'jenkin_nextjs', description: 'Base Docker image name')
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

        stage('Install (Node 20 via docker run)') {
            steps {
                sh "docker run --rm -v $WORKSPACE:/workspace -w /workspace node:20 sh -lc 'npm ci'"
            }
        }

        stage('Prisma Generate (Node 20 via docker run)') {
            steps {
                sh "docker run --rm -v $WORKSPACE:/workspace -w /workspace node:20 sh -lc 'npx prisma generate'"
            }
        }

        stage('Build Next (host, Node 20 via docker run)') {
            steps {
                sh "docker run --rm -v $WORKSPACE:/workspace -w /workspace node:20 sh -lc 'npm run build'"
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