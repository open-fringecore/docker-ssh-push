import { join } from 'path';
import { homedir } from 'os';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

export const SHELL_METACHARACTERS = /([!$`&*()|[\]{};<>?])/g;

export const DOCKER_SSH_PUSH_HOMEDIR = join(homedir(), 'docker-ssh-push');
export const CONTAINER_ID_STORE_PATH = join(
    DOCKER_SSH_PUSH_HOMEDIR,
    'containerId',
);
export function ensureHomeDir() {
    execSync(`mkdir -p ${DOCKER_SSH_PUSH_HOMEDIR}`);
}
export function writeContainerId(containerId: string) {
    writeFileSync(CONTAINER_ID_STORE_PATH, containerId);
}
export function readContainerId(): string {
    if (!existsSync(CONTAINER_ID_STORE_PATH)) {
        return '';
    }
    return readFileSync(CONTAINER_ID_STORE_PATH, 'utf-8').trim();
}

export function writeTunnelPid(pid: string | number) {
    writeFileSync(join(DOCKER_SSH_PUSH_HOMEDIR, 'tunnelPid'), `${pid}`.trim());
}

export function readTunnelPid(): string {
    if (!existsSync(join(DOCKER_SSH_PUSH_HOMEDIR, 'tunnelPid'))) {
        return '';
    }
    return readFileSync(
        join(DOCKER_SSH_PUSH_HOMEDIR, 'tunnelPid'),
        'utf-8',
    ).trim();
}
