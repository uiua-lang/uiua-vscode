import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';
import { homedir } from 'os';

export function activate(context: vscode.ExtensionContext) {
	let serverOptions: ServerOptions = {
		command: "uiua",
		args: ["lsp"],
		options: {}
	};
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'uiua' }]
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
