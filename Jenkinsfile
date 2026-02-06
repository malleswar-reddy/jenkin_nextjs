pipeline {
    agent any

      environment {
          // Add your NVM bin path to the environment
          PATH = "/home/dell/.nvm/versions/node/v18.20.4/bin:${env.PATH}"
      }

    stages {
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Deploy QA') {
            when { branch 'release' } // When you push to 'main'
            steps {
                echo "Deploying to QA on Port 4000"
                sh 'pm2 startOrReload ecosystem.config.js --only hello-qa'
            }
        }

        stage('Deploy Prod') {
            when { branch 'release' } // When you push to 'release'
            steps {
                echo "Deploying to Production on Port 80"
                // Note: Ensure your user has permission for Port 80
                sh 'pm2 startOrReload ecosystem.config.js --only hello-prod'
            }
        }
    }
}