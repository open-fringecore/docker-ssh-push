import { execFileSync } from 'child_process';

export interface RegistryStartOptions {
    image: string;
    ports?: string[];
    envs?: string[];
    volumes?: string[];
    name?: string;
    autoRemove?: boolean;
}

const defaultStartOptions: Partial<RegistryStartOptions> = {
    name: 'registry',
    autoRemove: true,
};

export function startRegistry(options: RegistryStartOptions): string | null {
    const options_ = { ...defaultStartOptions, ...options };
    const commands = ['run', '-d'];
    options_.autoRemove && commands.push('--rm');
    options_.envs?.forEach((v: string) => commands.push('-e', v));
    options_.ports?.forEach((v: string) => commands.push('-p', v));
    options_.volumes?.forEach((v: string) => commands.push('-v', v));
    options_.name && commands.push('--name', options_.name);
    commands.push(options_.image);
    try {
        return execFileSync('docker', commands, {
            stdio: 'pipe',
        }).toString('utf-8');
    } catch (e) {
        return null;
    }
}

export function stopRegistry(containerId: string) {
    execFileSync('docker', ['stop', containerId]);
}
