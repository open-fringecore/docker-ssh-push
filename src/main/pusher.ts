import * as core from '@actions/core';
import { execFileSync } from 'child_process';
import { randomBytes } from 'crypto';
import { RemoteRunOptions, remoteRun } from './remote-run';
import { TunnelOptions } from '../common/tunnel';
import { SHELL_METACHARACTERS } from '../common/utils';

export type PusherOptions = TunnelOptions &
    RemoteRunOptions & { images: string[] };

function checkImageExists(image: string): boolean {
    try {
        execFileSync('docker', ['image', 'inspect', image], {
            stdio: 'ignore',
        });
        return true;
    } catch (e) {
        return false;
    }
}

function remoteRunPrintResult(
    commandToRun: string,
    options: RemoteRunOptions,
): boolean {
    const res = remoteRun(commandToRun, options);
    core.info('status: ' + res?.status || 'null');
    core.info('stdout: ' + res?.stdout || '');
    core.info('stderr: ' + res?.stderr || '');
    if (res?.status !== 0) {
        throw Error(`Remote command failed. ${res?.stderr}`.trim());
    }
    return true;
}

function pushSingleImage(
    localBinding: string,
    remoteBinding: string,
    image: string,
    remoteRunOptions: RemoteRunOptions,
): boolean {
    if (SHELL_METACHARACTERS.test(image)) {
        core.warning(`Refusing to push insecure image name ${image}`);
        return false;
    }
    if (!checkImageExists(image)) {
        return false;
    }
    const randomTag = `x${randomBytes(8).toString('hex')}fc:latest`;
    execFileSync('docker', ['tag', image, `${localBinding}/${randomTag}`], {
        stdio: 'inherit',
    });
    execFileSync('docker', ['push', `${localBinding}/${randomTag}`], {
        stdio: 'inherit',
    });
    execFileSync('docker', ['rmi', `${localBinding}/${randomTag}`], {
        stdio: 'ignore',
    });
    remoteRunPrintResult(
        `docker pull ${remoteBinding}/${randomTag}`,
        remoteRunOptions,
    );
    remoteRunPrintResult(
        `docker tag ${remoteBinding}/${randomTag} ${image}`,
        remoteRunOptions,
    );
    remoteRunPrintResult(
        `docker rmi ${remoteBinding}/${randomTag}`,
        remoteRunOptions,
    );
    return true;
}

function pushSingleImageWithTry(
    localBinding: string,
    remoteBinding: string,
    image: string,
    remoteRunOptions: RemoteRunOptions,
): boolean {
    try {
        return pushSingleImage(
            localBinding,
            remoteBinding,
            image,
            remoteRunOptions,
        );
    } catch (e: any) {
        core.warning(`Failed to push image ${image}. ${e.message}`.trim());
        return false;
    }
}

export function pushImages(options: PusherOptions) {
    const succeededImages: string[] = [];
    const failedImages: string[] = [];
    options.images.forEach((image) => {
        const success = pushSingleImageWithTry(
            options.localBinding,
            options.remoteBinding,
            image,
            options,
        );
        if (success) {
            succeededImages.push(image);
        } else {
            failedImages.push(image);
        }
    });
    return { succeededImages, failedImages };
}
