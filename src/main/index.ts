import * as core from '@actions/core';
import { checkDockerExists } from './remote-run';
import { getInputs } from './input';
import { createReverseTunnel } from '../common/tunnel';
import { pushImages } from './pusher';

const inputs = getInputs();

function ensureRemoteDockerExists() {
    if (!checkDockerExists(inputs)) {
        throw Error('Docker is not installed on remote machine');
    }
}

function run() {
    ensureRemoteDockerExists();
    createReverseTunnel(inputs);
    pushImages(inputs);
}

try {
    run();
} catch (error: any) {
    const errorMessage = error.message || error;
    core.setFailed(`Action failed with error: ${error}`);
}
