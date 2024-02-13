![GitHub License](https://img.shields.io/github/license/open-fringecore/docker-ssh-push)

# Docker SSH Push Action

This GitHub Action enables you to push a Docker image, built by GitHub Actions, to a remote server via SSH. It's designed to streamline the deployment process by automating the transfer of Docker images to your production or staging environments.

## Features

-   **Multiple Image Support**: Push one or multiple Docker images.
-   **Flexible SSH Configuration**: Use custom SSH keys, ports, and configurations to connect to your server.
-   **Small Transfer Footprint**: Only the image layers that are not already present on the remote server are transferred.

## Inputs

| Name                             | Description                                                                                            | Required |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | :------: |
| `images`                         | Docker image(s) to push, one image per line if multiple.                                               |   Yes    |
| `ssh-host`                       | The remote server's hostname or IP address.                                                            |   Yes    |
| `ssh-user`                       | The username of the remote user that will be used to log in.                                           |   Yes    |
| `ssh-private-key`                | Private key to use to connect to the remote server. Uses default SSH keys in `~/.ssh` if not provided. |    No    |
| `ssh-port`                       | SSH port for the remote machine.                                                                       |    No    |
| `ssh-config-path`                | SSH config file path to use to connect to the remote server.                                           |    No    |
| `ssh-remote-public-key`          | Remote server's public key for secure connection. Uses keys from `~/.ssh/known_hosts` if not provided. |    No    |
| `ssh-skip-host-key-verification` | If `true`, skips the host key verification (`StrictHostKeyChecking=no`). Not recommended.              |    No    |
| `local-binding`                  | Local `<host>:<port>` to use to host serve the image. Default: `127.0.0.1:31031`.                      |    No    |
| `remote-binding`                 | Remote `<host>:<port>` to use to host pull the image from. Default: `127.0.0.1:31031`.                 |    No    |

## Usage

To use the Docker SSH Push action in your workflow, add the following step:

```yaml
- name: Push Docker Image via SSH
  uses: open-fringecore/docker-ssh-push@v0.1-beta
  with:
      images: |
          your-docker-image:latest
          myself/another-docker-image:latest
      ssh-host: ${{ secrets.SSH_HOST }}
      ssh-user: ${{ secrets.SSH_USER }}
      ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      ssh-remote-public-key: ${{ secrets.SSH_REMOTE_PUBLIC_KEY }}
      # Optional inputs can be added as needed
```

## FAQ

### What is the format for the `ssh-reomte-public-key` input?
It can be same format as files at `/etc/ssh/ssh_host_*_key.pub` on the remote server.

For example:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOU8I9afZ8G5CYXXQxrsClkF8LRuvkA7DadQH2wjmp2D you@Server
```

### Which runner does this action support?
The action is tested on `ubuntu-*` runners and should work on other runners as well. If you encounter any issues, please open an issue on the GitHub repository.
