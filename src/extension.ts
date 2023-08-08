import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';
import { homedir } from 'os';

export function activate(context: vscode.ExtensionContext) {
	let serverOptions: ServerOptions = {
		command: homedir() + "/repos/uiua/target/debug/uiua.exe",
		args: ["lsp"],
		options: {}
	};
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'uiua' }]
	};

	let disposable = new LanguageClient(
		'UiuaLS',
		'Uiua Language Server',
		serverOptions,
		clientOptions,
	).start();

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
