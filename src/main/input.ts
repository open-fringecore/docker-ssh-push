import * as core from '@actions/core';
import { join } from 'path';
import { chmodSync, writeFileSync } from 'fs';

import type { TunnelOptions } from '../common/tunnel';
import type { RemoteRunOptions } from './remote-run';
import { DOCKER_SSH_PUSH_HOMEDIR } from '../common/utils';

function writeSSHPrivateKey(sshPrivateKeyChunks: string[]): string {
    const sshPrivateKeyPath = join(DOCKER_SSH_PUSH_HOMEDIR, 'ssssh-key');
    const sshPrivateKey = `${sshPrivateKeyChunks.join('\n')}\n`;
    writeFileSync(sshPrivateKeyPath, sshPrivateKey);
    chmodSync(sshPrivateKeyPath, 0o600);
    return sshPrivateKeyPath;
}

function writeSSHKnownHosts(
    ...publicKeys: { host: string; key: string }[]
): string {
    const sshKnownHostsPath = join(DOCKER_SSH_PUSH_HOMEDIR, 'known_hosts');
    const knownHosts = publicKeys
        .map(({ host, key }) => `${host} ${key}\n`)
        .join('');
    writeFileSync(sshKnownHostsPath, knownHosts);
    chmodSync(sshKnownHostsPath, 0o600);
    return sshKnownHostsPath;
}

export function getInputs(): TunnelOptions &
    RemoteRunOptions & { images: string[] } {
    const inputs: TunnelOptions & RemoteRunOptions & { images: string[] } = {
        sshPort: core.getInput('ssh-port') || undefined,
        sshHost: core.getInput('ssh-host', { required: true }),
        sshUser: core.getInput('ssh-user', { required: true }),
        sshConfigPath: core.getInput('ssh-config-path') || undefined,
        sshSkipHostKeyVerification:
            core.getBooleanInput('ssh-skip-host-key-verification') || false,
        localBinding: core.getInput('local-binding', { required: true }),
        remoteBinding: core.getInput('remote-binding', { required: true }),
        images: core.getMultilineInput('images', { required: true }),
    };
    const sshRemotePublicKey = core.getInput('ssh-remote-public-key');
    const sshPrivateKey = core.getMultilineInput('ssh-private-key');
    if (sshPrivateKey.length > 0) {
        inputs.sshPrivateKeyPath = writeSSHPrivateKey(sshPrivateKey);
    }
    if (sshRemotePublicKey) {
        inputs.sshKnownHostsPath = writeSSHKnownHosts({
            host: inputs.sshHost,
            key: sshRemotePublicKey,
        });
    }
    return inputs;
}
