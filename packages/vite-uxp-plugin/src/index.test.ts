import { describe, expect, it } from 'vitest';
import type { UxpManifest } from './manifest-type';
import { uxp } from './index';

describe('vite-uxp-plugin manifest generation', () => {
    it('emits manifest.json with the provided manifest object', () => {
        const manifest: UxpManifest = {
            id: 'com.example.plugin',
            name: 'Example Plugin',
            version: '1.0.0',
            main: 'index.html',
            manifestVersion: 6,
            host: [
                {
                    app: 'PHSP',
                    minVersion: '26.0.0',
                },
            ],
            entrypoints: [
                {
                    type: 'panel',
                    id: 'panel',
                    label: { default: 'Panel' },
                },
            ],
        };

        const plugin = uxp(manifest);
        plugin.config?.({ build: {}, optimizeDeps: {} }, { command: 'build', mode: 'production' });

        const emitted: Array<{ type: string; fileName: string; source: string; }> = [];
        const bundleContext = {
            emitFile: (file: { type: string; fileName?: string; source?: string; }) => {
                if (file.type === 'asset' && file.fileName === 'manifest.json') {
                    emitted.push({
                        type: file.type,
                        fileName: file.fileName ?? 'manifest.json',
                        source: String(file.source ?? ''),
                    });
                }
            },
        } as any;

        plugin.generateBundle.call(bundleContext);

        expect(emitted).toHaveLength(1);
        expect(emitted[0]?.fileName).toBe('manifest.json');
        expect(JSON.parse(emitted[0]!.source)).toMatchObject({
            id: 'com.example.plugin',
            name: 'Example Plugin',
            main: 'index.html',
            manifestVersion: 6,
            host: {
                app: 'PHSP',
                minVersion: '26.0.0',
            },
            entrypoints: [
                {
                    type: 'panel',
                    id: 'panel',
                    label: { default: 'Panel' },
                },
            ],
        });
    });

    it('uses an array for multiple hosts', () => {
        const manifest: UxpManifest = {
            id: 'com.example.plugin',
            name: 'Example Plugin',
            version: '1.0.0',
            main: 'index.html',
            manifestVersion: 6,
            host: [
                {
                    app: 'PHSP',
                    minVersion: '26.0.0',
                },
                {
                    app: 'BRIDGE',
                    minVersion: '1.0.0',
                },
            ],
            entrypoints: [
                {
                    type: 'panel',
                    id: 'panel',
                    label: { default: 'Panel' },
                },
            ],
        };

        const plugin = uxp(manifest);
        plugin.config?.({ build: {}, optimizeDeps: {} }, { command: 'build', mode: 'production' });

        const emitted: Array<{ type: string; fileName: string; source: string; }> = [];
        const bundleContext = {
            emitFile: (file: { type: string; fileName?: string; source?: string; }) => {
                if (file.type === 'asset' && file.fileName === 'manifest.json') {
                    emitted.push({
                        type: file.type,
                        fileName: file.fileName ?? 'manifest.json',
                        source: String(file.source ?? ''),
                    });
                }
            },
        } as any;

        plugin.generateBundle.call(bundleContext);

        expect(emitted).toHaveLength(1);
        expect(emitted[0]?.fileName).toBe('manifest.json');
        expect(JSON.parse(emitted[0]!.source)).toMatchObject({
            id: 'com.example.plugin',
            name: 'Example Plugin',
            main: 'index.html',
            manifestVersion: 6,
            host: [{
                app: 'PHSP',
                minVersion: '26.0.0',
            }
                , {
                app: 'BRIDGE',
                minVersion: '1.0.0',
            }],
            entrypoints: [
                {
                    type: 'panel',
                    id: 'panel',
                    label: { default: 'Panel' },
                },
            ],
        });
    });

    it('adds localhost websocket permission in development mode', () => {
        const manifest: UxpManifest = {
            id: 'com.example.plugin',
            name: 'Example Plugin',
            version: '1.0.0',
            main: 'index.html',
            manifestVersion: 6,
            host: [
                {
                    app: 'PHSP',
                    minVersion: '26.0.0',
                },
            ],
            entrypoints: [],
            requiredPermissions: {
                network: {
                    domains: ['https://example.com'],
                },
            },
        };

        const plugin = uxp(manifest, { hotReloadPort: 4321 });

        const configResult = plugin.config?.({ build: {}, optimizeDeps: {} }, { command: 'build', mode: 'development' });
        expect(configResult).toBeTruthy();

        const emitted: Array<{ source: string; }> = [];
        const bundleContext = {
            emitFile: (file: { type: string; fileName?: string; source?: string; }) => {
                if (file.type === 'asset' && file.fileName === 'manifest.json') {
                    emitted.push({ source: String(file.source ?? '') });
                }
            },
        } as any;

        plugin.generateBundle.call(bundleContext);

        const data = JSON.parse(emitted[0]!.source);
        expect(data.requiredPermissions.network.domains).toContain('ws://localhost:4321');
        expect(data.requiredPermissions.network.domains).toContain('https://example.com');
    });
});
