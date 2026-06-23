## Why

The repository currently lacks structured infrastructure-as-code (IaC) and automated deployment configurations. Introducing reusable Terraform modules, Ansible playbooks, and GitHub Actions workflows will enable automated, reliable, and repeatable multi-environment deployments for the React frontend, Spring Boot backend, and supporting database. Furthermore, isolation across `dev` and `prod` environments, coupled with flexible database routing (supporting static project-level and dynamic branch-level toggles for Supabase), is required to maintain agile testing cycles alongside stable production targets.

## What Changes

- Create reusable Terraform modules under `deployments/terraform/modules/` separating backend compute, database, and frontend CDN hosting.
- Set up root-module environment folder structure under `deployments/terraform/environments/` for environment composition, providing explicit directories for `dev` and `prod` contexts.
- Configure Supabase database parameters and migration scripts to toggle between static project-level instances and dynamic Git-ref branch-level databases.
- Integrate AWS `myApplication` (via Service Catalog AppRegistry and Resource Groups) to tag all resources for billing and monitoring aggregation.
- Develop Ansible playbooks and roles under `deployments/ansible/` to configure the backend EC2 server host (installing Java, setting up Nginx reverse proxy, Certbot SSL configuration, and systemd service management) with dev/prod configuration inputs.
- Create a `.github/workflows/infra-deploy.yml` pipeline that orchestrates backend artifact builds, Terraform provisioning, and Ansible deployment execution using dynamically resolved IP targets.
- Implement automated infrastructure teardown (`terraform destroy`) in GitHub Actions when non-prod Pull Requests are closed to eliminate idle resource costs.

## Capabilities

### New Capabilities
- `aws-infra-provisioning`: Reusable, modular Terraform definitions for AWS compute, database, and CDN/S3 static frontend hosting, supporting environment-specific deployments (`dev` and `prod`) unified under an AWS `myApplication` registry definition.
- `backend-host-configuration`: Ansible playbooks for environment bootstrapping, reverse proxy routing, SSL certificate management, and Spring Boot service configuration supporting environment toggling.
- `deployment-orchestration`: Path-aware CI/CD orchestration workflows coordinating the lifecycle from commit to production deploy, dynamically managing database toggles between project-level and branch-level environments.

### Modified Capabilities
<!-- None -->

## Impact

- Modifies directories: `deployments/terraform/`, `deployments/ansible/`, and `.github/workflows/`.
- Introduces provider dependencies (AWS provider for Terraform) and system dependencies on the target VM (OpenJDK, Nginx, Certbot).
- Generates unified tagging dashboards across all created AWS resources to aggregate AWS Cost Explorer and CloudWatch Metrics into the AWS Management Console's `myApplication` view.
- Requires securely configuring AWS credentials and deployment secrets (e.g., SSH keys, database credentials) in GitHub Actions settings (no secrets in git).
