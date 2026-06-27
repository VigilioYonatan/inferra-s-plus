# Platform operations (self-hosted Linux only)
This repo deliberately does not provide AWS, Terraform, K8s, or host-root access from NestJS. Run the host checks and deploy scripts as an operator with least privilege.
- Harden SSH, firewall ports 80/443, reserve monitoring VPN, configure log rotation.
- Test backups to a physically separate host / filesystem and use restic encryption.
- Create dedicated OS user with Docker access strictly limited to trusted administrators. Docker group is equivalent to host root.
