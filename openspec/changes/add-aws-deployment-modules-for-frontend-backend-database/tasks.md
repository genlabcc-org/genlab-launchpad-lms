## 1. Terraform Infrastructure Code Setup

- [x] 1.1 Create `deployments/terraform/modules/database/main.tf` and supporting module files (RDS)
- [x] 1.2 Create `deployments/terraform/modules/backend/main.tf` and supporting module files (EC2 & Route 53)
- [x] 1.3 Create `deployments/terraform/modules/frontend/main.tf` and supporting module files (S3 & CloudFront)
- [x] 1.4 Establish environment folder structures under `deployments/terraform/environments/dev/` and `deployments/terraform/environments/prod/` composing the modules
- [x] 1.5 Create the AppRegistry application and propagate `awsApplication` tag mapping to all sub-modules
- [x] 1.6 Declare root variables for domain name and zone parameters, utilizing data resources for dynamic hosted zone lookups

## 2. Ansible Host Configuration Setup

- [x] 2.1 Create the role directories under `deployments/ansible/roles/` (common, nginx, certbot, spring-boot)
- [x] 2.2 Define Java installer tasks in `deployments/ansible/roles/common/tasks/main.yml`
- [x] 2.3 Define reverse-proxy logic in `deployments/ansible/roles/nginx/tasks/main.yml` and template files
- [x] 2.4 Define certbot automation in `deployments/ansible/roles/certbot/tasks/main.yml`
- [x] 2.5 Define service definitions and copy workflows in `deployments/ansible/roles/spring-boot/tasks/main.yml`
- [x] 2.6 Create main orchestration playbook `deployments/ansible/site.yml`

## 3. GitHub Actions Pipeline Configuration

- [x] 3.1 Create `.github/workflows/infra-deploy.yml` with separate stages for Terraform, Maven build, and Ansible playbooks
- [x] 3.2 Add path-filtering options to limit execution to relevant folder updates
- [x] 3.3 Configure the deployment workflow to support dev/prod targets and the Supabase project/branch deployment mode toggle
- [x] 3.4 Configure automated and manual infrastructure destruction triggers in the deployment workflow to cut costs
