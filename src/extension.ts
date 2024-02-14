import { execSync } from 'child_process';
import * as vscode from 'vscode';
import { Command, LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';
import { chmodSync, copyFileSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {
	// Determine Uiua interpreter path
	var path = vscode.workspace.getConfiguration('uiua').get<string>('executablePath');
	path = path || (process.platform === 'win32'
		? execSync('where uiua')
		: execSync('which uiua')).toString().trim();
	// Copy the interpreter to the extension's folder
	var extensionPath = context.extensionPath;
	var copyPath = extensionPath + '/uiua' + (process.platform === 'win32' ? '.exe' : '');
	copyFileSync(path, copyPath);
	if (process.platform !== 'win32') {
		chmodSync(copyPath, 0o755);
	}

	// Start the language server
	let serverOptions: ServerOptions = {
		command: copyPath,
		args: ['lsp'],
		options: {}
	};
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ language: 'uiua' }]
	};

	let client = new LanguageClient(
		'Uiua',
		'Uiua Language Server',
		serverOptions,
		clientOptions,
		true,
	);
	let disposable = client.start();

    vscode.window.onDidChangeActiveNotebookEditor(async editor => {
        // Undocumented: editor is defined when activating a notebook and undefined if switching away
        if (editor?.notebook.notebookType === undefined) return;
        // only prompt if the notebook is using the uiua language
        if (editor?.notebook.metadata?.custom?.metadata?.language_info?.name?.toLowerCase()!=="uiua") return;
            
        const currentSetting = vscode.workspace.getConfiguration().get('notebook.formatOnCellExecution');
        
        if (!currentSetting) {
            // Show a prompt to the user with a button to enable the setting
            const selection = await vscode.window.showInformationMessage(
                'The "notebook.formatOnCellExecution" setting is disabled, but it is highly recommended for Uiua. Would you like to enable it?',
                'Workspace: Enable', 'User: Enable'
            );
            
            let configuration_target:vscode.ConfigurationTarget;
            let accepted_message:string;
            
            if (selection === 'User: Enable') {
                configuration_target = vscode.ConfigurationTarget.Global;
                accepted_message = 'The "notebook.formatOnCellExecution" setting has been enabled for all notebooks.'
            }else if (selection === 'Workspace: Enable') {
                configuration_target = vscode.ConfigurationTarget.Workspace;
                accepted_message = 'the "notebook.formatOnCellExecution" setting has been enabled for all notebooks in this workspace.'
            }else{
                return; // User cancelled the prompt or the selection was invalid.
            }

            await vscode.workspace.getConfiguration().update('notebook.formatOnCellExecution', true, configuration_target);
            let open_settings = await vscode.window.showInformationMessage(
                accepted_message
                +'\nTo disable it please open Settings and search for formatOnCellExecution',
                "Open Settings"
            )
            
            if (open_settings === "Open Settings") {
                vscode.commands.executeCommand('workbench.action.openSettings', 'notebook.formatOnCellExecution');
            }
        }
    });

	context.subscriptions.push(disposable);
}

export function deactivate() { }
