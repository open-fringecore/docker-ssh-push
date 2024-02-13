import * as core from '@actions/core';
import { stopRegistry } from '../common/registry';
import { DOCKER_SSH_PUSH_HOMEDIR, readContainerId } from '../common/utils';
import { execSync } from 'child_process';
import { destroyReverseTunnel } from '../common/tunnel';
import { existsSync } from 'fs';

function stopRunningRegistry() {
    const containerId = readContainerId();
    if (!containerId) {
        core.warning(
            'No running registry container found. This should not happen',
        );
    } else {
        stopRegistry(containerId);
        core.info(`Stopped running registry container: ${containerId}`);
    }
}

function destroyHomeDir() {
    existsSync(DOCKER_SSH_PUSH_HOMEDIR) &&
        execSync(`sudo rm -rf ${DOCKER_SSH_PUSH_HOMEDIR}`);
}

function run() {
    destroyReverseTunnel();
    stopRunningRegistry();
    destroyHomeDir();
}

try {
    run();
} catch (error: any) {
    const errorMessage = error.message || error;
    core.setFailed(`Action failed with error: ${error}`);
}
