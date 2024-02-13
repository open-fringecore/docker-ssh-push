import * as core from '@actions/core';
import { execFileSync } from 'child_process';
import { SHELL_METACHARACTERS, readTunnelPid, writeTunnelPid } from './utils';

export interface TunnelOptions {
    localBinding: string;
    remoteBinding: string;
    sshHost: string;
    sshUser: string;
    sshPrivateKeyPath?: string;
    sshConfigPath?: string;
    sshKnownHostsPath?: string;
    sshSkipHostKeyVerification?: boolean;
    sshPort?: number | string;
}

export function createReverseTunnel(options: TunnelOptions) {
    for (const [key, value] of Object.entries(options)) {
        if (SHELL_METACHARACTERS.test(`${value}`)) {
            throw Error(`Invalid value ${value} for ${key}`);
        }
    }
    const commands = [
        '-o',
        'ServerAliveInterval=17',
        '-N',
        '-f',
        '-R',
        `${options.remoteBinding}:${options.localBinding}`,
        `${options.sshUser}@${options.sshHost}`,
    ];
    const pgrepFindCommand = ['-f', `ssh ${commands.join(' ')}`];
    options.sshPrivateKeyPath && commands.push('-i', options.sshPrivateKeyPath);
    options.sshSkipHostKeyVerification &&
        commands.push('-o', 'StrictHostKeyChecking=no');
    options.sshKnownHostsPath &&
        commands.push('-o', `UserKnownHostsFile=${options.sshKnownHostsPath}`);
    options.sshConfigPath && commands.push('-F', options.sshConfigPath);
    options.sshPort && commands.push('-p', `${options.sshPort}`);
    execFileSync('ssh', commands);
    const pid = execFileSync('pgrep', pgrepFindCommand)
        .toString('utf-8')
        .trim();
    core.info(`Reverse tunnel created with pid ${pid}`);
    writeTunnelPid(pid);
}

export function destroyReverseTunnel() {
    const pid = readTunnelPid();
    if (pid === '') {
        core.info('No reverse tunnel found');
        return;
    }
    execFileSync('kill', ['-9', pid]);
    core.info(`Reverse tunnel destroyed with pid ${pid}`);
}
