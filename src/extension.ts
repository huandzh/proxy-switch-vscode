import * as vscode from 'vscode';
import { ProfileManager } from './ProfileManager';
import { StatusBar } from './StatusBar';

export function activate(context: vscode.ExtensionContext) {
    const profileManager = new ProfileManager(context.secrets);
    const statusBar = new StatusBar(profileManager);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('proxy-switch.addProfile', async () => {
            await profileManager.addNewProfile();
            statusBar.updateStatus();
        }),
        
        vscode.commands.registerCommand('proxy-switch.switchProfile', async () => {
            await profileManager.switchProfile();
            statusBar.updateStatus();
        }),
        
        vscode.commands.registerCommand('proxy-switch.switchOrDisableProfile', async () => {
            await profileManager.switchOrDisableProfile();
            statusBar.updateStatus();
        }),
        
        vscode.commands.registerCommand('proxy-switch.disableProxy', async () => {
            await profileManager.disableProxy();
            statusBar.updateStatus();
        }),

        vscode.commands.registerCommand('proxy-switch.removeProfile', async () => {
            const selected = await vscode.window.showQuickPick(
                profileManager.getProfileNames(),
                { placeHolder: 'Select profile to remove' }
            );
            if (selected) await profileManager.deleteProfile(selected);
            statusBar.updateStatus();
        })
    );

    // Initial status update
    statusBar.updateStatus();
}