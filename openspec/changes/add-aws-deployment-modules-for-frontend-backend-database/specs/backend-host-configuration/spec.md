## ADDED Requirements

### Requirement: Host Package Installation
The host configuration tool SHALL bootstrap the backend EC2 server instance with all base requirements for running Spring Boot.

#### Scenario: Verify base packages installed
- **WHEN** the host configuration playbook is run
- **THEN** it MUST install Java OpenJDK and Nginx on the target virtual machine

### Requirement: Reverse Proxy Configuration
The server configuration SHALL set up Nginx as a reverse proxy for the Spring Boot application.

#### Scenario: Verify nginx configuration
- **WHEN** requests arrive on ports 80/443
- **THEN** Nginx MUST dynamically resolve the server name using the domain variable and proxy requests to the local port where Spring Boot runs (defaulting to 8080)

### Requirement: Certificate Setup and Renewal
The host configuration tools SHALL generate and automate renewal of Let's Encrypt SSL/TLS certificates.

#### Scenario: Certbot SSL setup
- **WHEN** the SSL configuration tasks are executed
- **THEN** Certbot MUST generate valid SSL certificates for the configured domain and install cron/systemd timers for automatic certificate renewal

### Requirement: Systemd Daemon Management
The server configuration SHALL run the Spring Boot application jar file as a background daemon managed by systemd.

#### Scenario: Verify systemd service running
- **WHEN** the systemd service starts
- **THEN** it MUST run the Spring Boot jar with appropriate memory options and enable automatic restart on failure
