// ===========================================================================
// JENKINSFILE — CI/CD PIPELINE DEFINITION
// ===========================================================================
//
// 🎓 WHAT IS A JENKINSFILE?
// A Jenkinsfile defines your CI/CD pipeline AS CODE (instead of clicking 
// through the Jenkins UI). It lives in your repo, so your pipeline is:
//   - Version controlled (you can see who changed what)
//   - Reviewable (via pull requests)
//   - Reproducible (same pipeline on every branch)
//
// 🎓 DECLARATIVE vs SCRIPTED PIPELINE:
// There are two Jenkinsfile styles:
//   - Declarative (what we use): Structured, easier to read, opinionated
//   - Scripted: Full Groovy programming, more flexible but harder to read
// Declarative is recommended for most projects.
//
// 🎓 WHAT IS A "STAGE"?
// A stage is a logical phase of your pipeline (Checkout, Build, Test, Deploy).
// Jenkins shows each stage as a visual block in the UI, so you can see
// where your pipeline is and where it failed.
//
// 🎓 HOW DOES JENKINS TRIGGER THIS?
// Option 1: GitHub webhook → Jenkins (auto-trigger on every push)
// Option 2: Poll SCM (Jenkins checks GitHub every N minutes)
// Option 3: Manual trigger (click "Build Now" in Jenkins UI)
//
// ===========================================================================
// PREREQUISITES — Set these up in Jenkins BEFORE running this pipeline:
//
// 1. CREDENTIALS (Manage Jenkins → Credentials → Global):
//    - "dockerhub-creds"    : Username/Password (caliber001 / your Docker Hub password)
//    - "brainbrush-mongo"   : Secret text (your MongoDB Atlas connection string)
//    - "brainbrush-redis"   : Secret text (your Redis Cloud connection string)
//    - "brainbrush-google-id"     : Secret text (Google OAuth Client ID)
//    - "brainbrush-google-secret" : Secret text (Google OAuth Client Secret)
//    - "brainbrush-jwt"     : Secret text (your JWT secret)
//    - "brainbrush-ssh-key" : SSH Username with private key (for EC2 access)
//
// 2. PLUGINS (Manage Jenkins → Plugins):
//    - Docker Pipeline
//    - SSH Agent
//    - AnsiColor (for colored output)
//
// 3. TOOLS installed on Jenkins server:
//    - Docker
//    - Terraform
//    - Ansible
// ===========================================================================

pipeline {
    // 🎓 "agent any" means this pipeline can run on any available Jenkins agent.
    // In a larger setup, you might specify: agent { label 'docker' }
    agent any

    // -----------------------------------------------------------------------
    // ENVIRONMENT VARIABLES — Available to ALL stages
    // -----------------------------------------------------------------------
    environment {
        DOCKER_HUB_USER   = "caliber001"
        BACKEND_IMAGE     = "caliber001/brainbrush-backend"
        FRONTEND_IMAGE    = "caliber001/brainbrush-frontend"
        DOCKER_CREDS      = "dockerhub-creds"       // Jenkins credential ID
        ANSIBLE_INVENTORY = "ansible/inventory.ini"
        IMAGE_TAG         = "${env.BUILD_NUMBER}"
        // 🎓 BUILD_NUMBER is a Jenkins built-in variable.
        // Each pipeline run increments it: 1, 2, 3...
        // We use it as the Docker image tag so each build is uniquely identified.
        // Image "caliber001/brainbrush-backend:14" = the 14th build.
    }

    // -----------------------------------------------------------------------
    // OPTIONS — Pipeline-wide settings
    // -----------------------------------------------------------------------
    options {
        timestamps()                    // Show timestamps in console output
        timeout(time: 30, unit: 'MINUTES')  // Kill pipeline if it takes > 30 min
        disableConcurrentBuilds()       // Don't run two builds simultaneously
        // 🎓 disableConcurrentBuilds prevents race conditions.
        // Imagine two deploys running at the same time — chaos!
    }

    // =======================================================================
    // STAGES — The main pipeline phases
    // =======================================================================
    stages {

        // -------------------------------------------------------------------
        // STAGE 1: CHECKOUT
        // -------------------------------------------------------------------
        stage('Checkout') {
            steps {
                checkout scm
                // 🎓 "checkout scm" pulls the latest code from the repository
                // that this Jenkinsfile belongs to. Jenkins already knows the
                // repo URL because you configured it when creating the pipeline job.
            }
        }

        // -------------------------------------------------------------------
        // STAGE 2: TERRAFORM — Provision Infrastructure
        // -------------------------------------------------------------------
        stage('Terraform Provision') {
            steps {
                dir('terraform') {
                    // 🎓 "dir('terraform')" changes into the terraform/ directory.
                    // All commands inside this block run from there.

                    sh '''
                        echo "🏗️  Initializing Terraform..."
                        terraform init

                        echo "📋 Planning infrastructure changes..."
                        terraform plan -out=tfplan

                        echo "🚀 Applying infrastructure..."
                        terraform apply -auto-approve tfplan

                        echo "⏳ Waiting 60s for EC2 instance to fully boot..."
                        sleep 60
                    '''
                    // 🎓 TERRAFORM COMMANDS EXPLAINED:
                    // terraform init      → Downloads provider plugins (one-time setup)
                    // terraform plan      → Shows what WOULD change (dry run)
                    //   -out=tfplan       → Saves the plan to a file
                    // terraform apply     → Actually creates/modifies resources
                    //   -auto-approve     → Skip the "yes/no" confirmation prompt
                    //   tfplan            → Apply the saved plan (not re-plan)
                    //
                    // 🎓 WHY SLEEP 60?
                    // Even after Terraform says "created", the EC2 instance needs
                    // time to boot up, start SSH, and be ready for Ansible.
                    // 60 seconds is a safe buffer. In production, you'd use a
                    // proper health check instead.

                    // Save the IP for later stages
                    script {
                        env.SERVER_IP = sh(
                            script: 'terraform output -raw instance_public_ip',
                            returnStdout: true
                        ).trim()
                    }
                    // 🎓 This captures the Terraform output (EC2 public IP) into
                    // a Jenkins environment variable that later stages can use.
                }
            }
        }

        // -------------------------------------------------------------------
        // STAGE 3: BUILD — Build Docker images
        // -------------------------------------------------------------------
        stage('Build Docker Images') {
            steps {
                echo "🐳 Building backend image: ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                // 🎓 We tag the image TWICE:
                //   1. :${IMAGE_TAG} (e.g., :14) — specific version, for rollbacks
                //   2. :latest — always points to the newest build
                // Double-tagging is a best practice so you can both:
                //   - Deploy a specific version: image:14
                //   - Always get the newest: image:latest

                echo "🐳 Building frontend image: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh """
                    docker build \
                        --build-arg VITE_BACKEND_URL=http://${SERVER_IP}:5000 \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                """
                // 🎓 WHY --build-arg?
                // The frontend's Dockerfile accepts VITE_BACKEND_URL as a build argument.
                // Vite bakes this URL into the JavaScript bundle at BUILD TIME.
                // We pass the actual server IP so the frontend knows where the backend is.
            }
        }

        // -------------------------------------------------------------------
        // STAGE 4: PUSH — Push images to Docker Hub
        // -------------------------------------------------------------------
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                    '''
                    // 🎓 withCredentials securely injects Docker Hub credentials.
                    // --password-stdin is safer than -p (which shows in process list).
                    // Jenkins masks these values in logs — you'll see **** instead.

                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        // -------------------------------------------------------------------
        // STAGE 5: DEPLOY — Use Ansible to deploy to EC2
        // -------------------------------------------------------------------
        stage('Deploy with Ansible') {
            steps {
                // Inject all application secrets from Jenkins credentials
                withCredentials([
                    string(credentialsId: 'brainbrush-mongo',         variable: 'MONGO_URI'),
                    string(credentialsId: 'brainbrush-redis',         variable: 'REDIS_URL'),
                    string(credentialsId: 'brainbrush-google-id',     variable: 'GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'brainbrush-google-secret', variable: 'GOOGLE_CLIENT_SECRET'),
                    string(credentialsId: 'brainbrush-jwt',           variable: 'JWT_SECRET')
                ]) {
                    // 🎓 withCredentials pulls secrets from Jenkins' encrypted store
                    // and makes them available as environment variables.
                    // These are NEVER printed to logs (Jenkins auto-masks them).

                    // Update Ansible inventory with the actual server IP
                    sh """
                        sed -i 's/<YOUR_EC2_PUBLIC_IP>/${SERVER_IP}/g' ${ANSIBLE_INVENTORY}
                    """
                    // 🎓 "sed" is a stream editor. This command replaces the placeholder
                    // in inventory.ini with the real EC2 IP from Terraform.

                    // First run: Provision the server (install Docker)
                    sh """
                        ansible-playbook -i ${ANSIBLE_INVENTORY} ansible/playbook.yml
                    """

                    // Second run: Deploy the application
                    sh """
                        ansible-playbook -i ${ANSIBLE_INVENTORY} ansible/deploy.yml \
                            --extra-vars "docker_image_tag=${IMAGE_TAG} \
                                          mongo_uri='${MONGO_URI}' \
                                          redis_url='${REDIS_URL}' \
                                          google_client_id='${GOOGLE_CLIENT_ID}' \
                                          google_client_secret='${GOOGLE_CLIENT_SECRET}' \
                                          jwt_secret='${JWT_SECRET}' \
                                          frontend_url='http://${SERVER_IP}'"
                    """
                    // 🎓 --extra-vars passes values from Jenkins → Ansible.
                    // Ansible then uses these in the Jinja2 templates (.env.j2).
                    // The full chain: Jenkins Credentials → env vars → Ansible vars → .env file
                }
            }
        }
    }

    // =======================================================================
    // POST — Actions that run AFTER the pipeline finishes
    // =======================================================================
    post {
        success {
            echo """
            ✅ ========================================
            ✅  DEPLOYMENT SUCCESSFUL!
            ✅ ========================================
            ✅  Frontend: http://${SERVER_IP}
            ✅  Backend:  http://${SERVER_IP}:5000
            ✅  Image Tag: ${IMAGE_TAG}
            ✅ ========================================
            """
        }
        failure {
            echo """
            ❌ ========================================
            ❌  DEPLOYMENT FAILED!
            ❌ ========================================
            ❌  Check the console output above for errors.
            ❌  Common issues:
            ❌    - Docker Hub credentials expired
            ❌    - EC2 instance not reachable (security group?)
            ❌    - Terraform state mismatch (run terraform plan manually)
            ❌ ========================================
            """
        }
        always {
            // Clean up Docker images from Jenkins server to save disk space
            sh 'docker system prune -f || true'
            // 🎓 "|| true" prevents this from failing the pipeline.
            // Post actions should never cause a failure.
        }
    }
}
