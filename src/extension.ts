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

	context.subscriptions.push(disposable);
}

export function deactivate() { }
