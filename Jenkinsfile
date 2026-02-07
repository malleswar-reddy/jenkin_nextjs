pipeline {
    agent any

    parameters {
        booleanParam(name: 'DEPLOY_QA', defaultValue: false, description: 'Deploy to QA after build')
        booleanParam(name: 'DEPLOY_PROD', defaultValue: false, description: 'Deploy to Prod after build')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'jenkin_nextjs', description: 'Base Docker image name')
        string(name: 'DATABASE_URL', defaultValue: 'mysql://root:password@qa_db:3306/jenkin_nextjs', description: 'MySQL connection string for the app')
        password(name: 'JWT_SECRET', defaultValue: 'd77343a695f46af0bc61e5337c682f28c3a7d9267f44f9e4be6cde4ce319aa2e', description: 'JWT secret for the app')
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

        stage('QA DB Up') {
            when { expression { return params.DEPLOY_QA } }
            steps {
                sh 'docker compose up -d qa_db'
            }
        }

        stage('Wait for QA DB Health') {
            when { expression { return params.DEPLOY_QA } }
            steps {
                sh '''
CID=$(docker compose ps -q qa_db)
if [ -z "$CID" ]; then
  echo "qa_db container not found"; exit 1
fi
i=0
while [ $i -lt 30 ]; do
  ST=$(docker inspect --format={{.State.Health.Status}} "$CID" 2>/dev/null || echo "unknown")
  echo "DB health: $ST"
  if [ "$ST" = "healthy" ]; then
    exit 0
  fi
  sleep 5
  i=$((i+1))
done
echo "DB failed to become healthy"; exit 1
'''
            }
        }

        stage('Prisma Migrate Deploy (QA)') {
            when { expression { return params.DEPLOY_QA } }
            steps {
                // Use compose network and service hostname for DB connectivity
                sh "docker run --rm --network jenkin_nextjs_net -v $WORKSPACE:/workspace -w /workspace node:20 sh -lc 'DATABASE_URL=\"${params.DATABASE_URL}\" npx prisma migrate deploy'"
            }
        }

        stage('Deploy QA (Docker)') {
            when {
                allOf {
                    branch 'release'
                    expression { return params.DEPLOY_QA }
                }
            }
            steps {
                echo "Deploying QA using Docker image ${env.IMAGE_TAG}"
                sh "docker rm -f jenkin_nextjs_qa || true"
                sh "docker run -d --name jenkin_nextjs_qa --network jenkin_nextjs_net -e NODE_ENV=production -e DATABASE_URL='${params.DATABASE_URL}' -e JWT_SECRET='${params.JWT_SECRET}' -p 4000:3000 ${env.IMAGE_TAG}"
            }
        }

        stage('Prod DB Up') {
            when { expression { return params.DEPLOY_PROD } }
            steps {
                // Reuse qa_db for simplicity or define a separate prod_db in compose if needed
                sh 'docker compose up -d qa_db'
            }
        }
        stage('Wait for Prod DB Health') {
            when { expression { return params.DEPLOY_PROD } }
            steps {
                sh '''
CID=$(docker compose ps -q qa_db)
if [ -z "$CID" ]; then
  echo "qa_db container not found"; exit 1
fi
i=0
while [ $i -lt 30 ]; do
  ST=$(docker inspect --format={{.State.Health.Status}} "$CID" 2>/dev/null || echo "unknown")
  echo "DB health: $ST"
  if [ "$ST" = "healthy" ]; then
    exit 0
  fi
  sleep 5
  i=$((i+1))
done
echo "DB failed to become healthy"; exit 1
'''
            }
        }
        stage('Prisma Migrate Deploy (Prod)') {
            when { expression { return params.DEPLOY_PROD } }
            steps {
                sh "docker run --rm --network jenkin_nextjs_net -v $WORKSPACE:/workspace -w /workspace node:20 sh -lc 'DATABASE_URL=\"${params.DATABASE_URL}\" npx prisma migrate deploy'"
            }
        }
        stage('Deploy Prod (Docker)') {
            when {
                allOf {
                    branch 'release'
                    expression { return params.DEPLOY_PROD }
                }
            }
            steps {
                echo "Deploying Prod using Docker image ${env.IMAGE_TAG}"
                sh "docker rm -f jenkin_nextjs_prod || true"
                sh "docker run -d --name jenkin_nextjs_prod --network jenkin_nextjs_net -e NODE_ENV=production -e DATABASE_URL='${params.DATABASE_URL}' -e JWT_SECRET='${params.JWT_SECRET}' -p 80:3000 ${env.IMAGE_TAG}"
            }
        }
    }

    post {
        always {
            echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH}, Image: ${env.IMAGE_TAG}"
        }
    }
}