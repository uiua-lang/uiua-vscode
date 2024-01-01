import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext) {
	var path = vscode.workspace.getConfiguration('uiua').get<string>('executablePath') || 'uiua';
	let serverOptions: ServerOptions = {
		command: path,
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
