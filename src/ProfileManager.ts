import * as vscode from 'vscode';

export interface ProxyProfile {
    name: string;
    url: string;
    strictSSL: boolean;
    credentials?: {
        username: string;
        passwordRef: string; // Reference to secret storage
    };
}

export class ProfileManager {
    private readonly configKey = 'proxySwitch.profiles';
    
    constructor(private readonly secrets: vscode.SecretStorage) {}

    async addNewProfile(): Promise<void> {
        const newProfile = await this.collectProfileDetails();
        if (newProfile) {
            await this.saveProfile(newProfile);
        }
    }

    private async collectProfileDetails(): Promise<ProxyProfile | undefined> {
        const name = await vscode.window.showInputBox({
            title: 'Profile Name',
            validateInput: async (value) => {
                if (!value) return 'Name is required';
                if (await this.validateUniqueName(value)) return null;
                return 'Profile name must be unique';
            }
        });
        if (!name) return undefined;

        const url = await vscode.window.showInputBox({
            title: 'Proxy URL',
            prompt: 'Enter full proxy URL (e.g., http://proxy.example.com:8080)',
            validateInput: value => {
                try {
                    new URL(value || '');
                    return null;
                } catch {
                    return 'Invalid URL format';
                }
            }
        });
        if (!url) return undefined;

        const strictSSL = await vscode.window.showQuickPick(['Yes', 'No'], {
            title: 'Enable Strict SSL?'
        }) === 'Yes';

        let credentials;
        const setCredentials = await vscode.window.showQuickPick(['Yes', 'No'], {
            title: 'Add credentials?'
        });
        if (setCredentials === 'Yes') {
            const username = await vscode.window.showInputBox({
                title: 'Username'
            });
            if (!username) return undefined;

            const password = await vscode.window.showInputBox({
                title: 'Password',
                password: true
            });
            if (!password) return undefined;

            const passwordRef = `${name}_${Date.now()}`;
            await this.secrets.store(passwordRef, password);
            credentials = { username, passwordRef };
        }

        return {
            name,
            url,
            strictSSL,
            credentials
        };
    }

    async switchProfile(): Promise<void> {
        const selected = await vscode.window.showQuickPick(
            this.getProfileNames(), 
            { placeHolder: 'Select proxy profile' }
        );
        if (selected) {
            await this.applyProfile(selected);
        }
    }

    async switchOrDisableProfile(): Promise<void> {
        const disableOption = 'Disable Proxy';
        const selected = await vscode.window.showQuickPick(
            [...this.getProfileNames(), disableOption], 
            { placeHolder: 'Select proxy profile or disable' }
        );
        if (selected ===  disableOption) {
            await this.disableProxy();
        } else if (selected) {
            await this.applyProfile(selected);
        }
    }

    async disableProxy(): Promise<void> {
        const config = vscode.workspace.getConfiguration('http');
        await config.update('proxy', '', true);
        await config.update('proxyStrictSSL', false, true);
    }

    public async applyProfile(profileName: string): Promise<void> {
        const profile = this.getProfiles().find(p => p.name === profileName);
        if (profile) {
            const config = vscode.workspace.getConfiguration('http');
            await config.update('proxy', profile.url, true);
            await config.update('proxyStrictSSL', profile.strictSSL, true);
        }
    }

    private parseProxyUrl(url: string): { protocol: string, host: string, port: number } {
        const parsed = new URL(url);
        return {
            protocol: parsed.protocol.replace(':', ''),
            host: parsed.hostname,
            port: parsed.port ? Number(parsed.port) : (parsed.protocol === 'https:' ? 443 : 80)
        };
    }

    private getProfiles(): ProxyProfile[] {
        return vscode.workspace.getConfiguration().get<ProxyProfile[]>(this.configKey) || [];
    }

    public getProfileNames(): string[] {
        return this.getProfiles().map(p => p.name);
    }

    private async validateUniqueName(name: string): Promise<boolean> {
        return !this.getProfiles().some(p => p.name === name);
    }

    private async saveProfile(profile: ProxyProfile): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        const profiles = this.getProfiles().filter(p => p.name !== profile.name);
        await config.update(this.configKey, [...profiles, profile], true);
    }

    public async deleteProfile(profileName: string): Promise<void> {
        const profiles = this.getProfiles();
        const profile = profiles.find(p => p.name === profileName);
        if (profile) {
            // Clean up credentials if they exist
            if (profile.credentials) {
                await this.secrets.delete(profile.credentials.passwordRef);
            }
            await vscode.workspace.getConfiguration().update(this.configKey, profiles.filter(p => p.name !== profileName), true);
        }
    }
}