import * as vscode from 'vscode';
import { ProfileManager } from './ProfileManager';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;
    
    constructor(private profileManager: ProfileManager) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'proxy-switch.switchOrDisableProfile';
        this.statusBarItem.show();
        this.statusBarItem.accessibilityInformation = { label: 'Proxy Switch Status' };
    }

    updateStatus(): void {
        const config = vscode.workspace.getConfiguration('http');
        const proxy = config.get<string>('proxy') || '';
        
        if (proxy === '') {
            this.statusBarItem.text = '$(plug) Proxy: Off';
            this.statusBarItem.tooltip = 'Click to configure proxy';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        } else {
            this.statusBarItem.text = `$(plug) ${proxy}`;
            this.statusBarItem.tooltip = 'Click to change proxy settings';
            this.statusBarItem.backgroundColor = undefined;
        }
    }

    // async handleClick(): Promise<void> {
    //     const profiles = this.profileManager.getProfileNames();
    //     const options = [
    //         ...profiles,
    //         'Disable Proxy']

    //     const selected = await vscode.window.showQuickPick(options, {
    //         placeHolder: 'Select a proxy profile or disable'
    //     });
        
    //     if (selected) {
    //         if (selected === 'Disable Proxy') {
    
    //         await this.profileManager.disableProxy();
    //         } else {
    //             await this.profileManager.applyProfile(selected);
    //         }
    //         this.updateStatus();
    //     }
    // }
}