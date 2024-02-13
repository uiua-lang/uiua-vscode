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

	context.subscriptions.push(disposable);
}

export function deactivate() { }
