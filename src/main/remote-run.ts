import { spawnSync } from 'child_process';
import { SHELL_METACHARACTERS } from '../common/utils';

export interface RemoteRunOptions {
    sshHost: string;
    sshUser: string;
    sshSkipHostKeyVerification: boolean;
    sshConfigPath?: string;
    sshPrivateKeyPath?: string;
    sshKnownHostsPath?: string;
    sshPort?: number | string;
}

export interface RemoteRunOutput {
    stdout: string;
    stderr: string;
    status: number;
}

function _remoteRunImpl(
    commandToRun: string,
    options: RemoteRunOptions,
): RemoteRunOutput | null {
    for (const [key, value] of Object.entries(options)) {
        if (SHELL_METACHARACTERS.test(`${value}`)) {
            throw Error(`Invalid value ${value} for ${key}`);
        }
    }
    const commands = [`${options.sshUser}@${options.sshHost}`];
    options.sshPrivateKeyPath && commands.push('-i', options.sshPrivateKeyPath);
    options.sshSkipHostKeyVerification &&
        commands.push('-o', 'StrictHostKeyChecking=no');
    options.sshKnownHostsPath &&
        commands.push('-o', `UserKnownHostsFile=${options.sshKnownHostsPath}`);
    options.sshConfigPath && commands.push('-F', options.sshConfigPath);
    options.sshPort && commands.push('-p', `${options.sshPort}`);
    commands.push(commandToRun);
    try {
        const { status, stderr, stdout } = spawnSync('ssh', commands);
        if (status === null) throw Error('null status');
        return {
            status: status ?? 1,
            stderr: stderr.toString(),
            stdout: stdout.toString(),
        };
    } catch (e) {
        return null;
    }
}

// DO NOT EXPOSE THIS FUNCTION TO USER
export function remoteRun(commandToRun: string, options: RemoteRunOptions) {
    const connectable = _remoteRunImpl('true', options);
    if (connectable?.status !== 0) {
        throw Error(
            `Cannot connect to ${options.sshHost}. ${connectable?.stderr}`.trim(),
        );
    }
    return _remoteRunImpl(commandToRun, options);
}

export function checkDockerExists(options: RemoteRunOptions) {
    const output = remoteRun('docker --version', options);
    return output?.status === 0;
}
