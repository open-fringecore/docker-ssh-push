import * as core from '@actions/core';
import { join } from 'path';
import { startRegistry } from '../common/registry';
import {
    DOCKER_SSH_PUSH_HOMEDIR,
    ensureHomeDir,
    writeContainerId,
} from '../common/utils';

const inputs = {
    localBinding: core.getInput('local-binding', { required: true }),
};

function runStartRegistry() {
    const containerId = startRegistry({
        image: 'registry:2.8.3',
        ports: [`${inputs.localBinding}:5000`],
        envs: ['REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY=/data'],
        volumes: [`${join(DOCKER_SSH_PUSH_HOMEDIR, 'data')}:/data`],
        name: 'registry',
    });
    if (!containerId) throw Error('Failed to start registry container');
    writeContainerId(containerId);
    core.info(`Registry containerID: ${containerId}`);
}

function run() {
    ensureHomeDir();
    runStartRegistry();
}

try {
    run();
} catch (error: any) {
    const errorMessage = error.message || error;
    core.setFailed(`Action failed with error: ${error}`);
}
