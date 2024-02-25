import { execSync } from 'child_process';
import * as vscode from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';
import { LanguageClient, ServerOptions } from 'vscode-languageclient/node';
import { chmodSync, copyFileSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {
	// Determine Uiua interpreter path
	var path = vscode.workspace.getConfiguration('uiua').get<string>('executablePath');
	path = path || (process.platform === 'win32'
		? execSync('where uiua')
		: execSync('which uiua')).toString().trim();
	// Copy the interpreter to the extension's folder
	var extensionPath = context.extensionPath;
	var runPath = extensionPath + '/uiua' + (process.platform === 'win32' ? '.exe' : '');
	try {
		copyFileSync(path, runPath);
		if (process.platform !== 'win32') {
			chmodSync(runPath, 0o755);
		}
	} catch (e) {
		console.error('Failed to copy Uiua interpreter to extension folder: ', e);
		runPath = path;
	}

	// Start the language server
	let serverOptions: ServerOptions = {
		command: runPath,
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
	client.start();

	context.subscriptions.push(
		vscode.commands.registerCommand('uiua.run', async () => {
			const document = vscode.window.activeTextEditor?.document;
			document && await document.save().then(() => {
				const relativeFile = document.uri.fsPath;

				let process = new vscode.ProcessExecution(runPath, ["run", relativeFile]);

				const task = new vscode.Task({ type: "process" }, vscode.TaskScope.Workspace, "Uiua", "Uiua", process);
				// https://github.com/microsoft/vscode/issues/157756
				task.definition.command = "Uiua";

				vscode.tasks.executeTask(task);
			});
		})
	);
}

export function deactivate() { }
