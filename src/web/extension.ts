// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const shellQuote = require('shell-quote').parse;

let outputChannel: vscode.OutputChannel;

function LOG(text: string) {
	outputChannel.appendLine(text);
	// console.error(text);
	// vscode.window.showInformationMessage('coder-helper: ' + text);
}

function addEditorSelectionCommand(context: vscode.ExtensionContext, command: string, callback: (text: string) => Promise<string>) {
	addEditorCommand(context, command, async function (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
		var text = textEditor.document.getText(textEditor.selection);
		text = await callback(text);
		textEditor.edit(builder => {
			builder.replace(textEditor.selection, text);
		});
	});
}

function addEditorCommand(context: vscode.ExtensionContext, command: string, callback: (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void, thisArg?: any) {
	let disposable = vscode.commands.registerTextEditorCommand(command, async function (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
		try {
			callback(textEditor, edit, args);
		} catch (exp) {
			LOG(">>>" + exp + " >>>" + textEditor + ">>>" + edit + " >>>" + args);
			vscode.window.showErrorMessage(command + ":" + exp);
		}
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('Congratulations, your extension "coder-helper" is now active!');
	outputChannel = vscode.window.createOutputChannel("coder-helper");
	LOG("coder-helper is activated");
	function escape(text: string) {
		let temp = JSON.stringify([text]);
		return temp.substring(1, temp.length - 1);
	}

	function unescape(text: string) {
		if (text.startsWith("'") && text.endsWith("'")) {
			let sub_text = text.substring(1, text.length - 1);
			sub_text = sub_text.replace(/\\'/g, "'");
			let result = JSON.stringify(JSON.parse(sub_text));
			return result;
		} else if (text.startsWith('"') && text.endsWith('"')) {
			return JSON.parse(`[${text}]`)[0];
		}
	}

	addEditorSelectionCommand(context, "coder-helper.codeEscape", async (text: string) => {
		return escape(text);
	});

	addEditorSelectionCommand(context, "coder-helper.codeUnescape", async (text: string) => {
		return unescape(text);
	});

	addEditorSelectionCommand(context, "coder-helper.urlQuerySplite", async (text: string) => {
		return text.split("&").join("\n&");
	});

	addEditorSelectionCommand(context, "coder-helper.urlQueryMerge", async (text: string) => {
		return text.split(RegExp(/\s*\n\s*&/)).join("&");
	});

	addEditorSelectionCommand(context, "coder-helper.unicodeUnescape", async (text: string) => {
		return text.replace(/\\[uU][\dA-Fa-f]{4}/gi, function (match) {
			return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
		});
	});

	addEditorSelectionCommand(context, "coder-helper.curlCommandSplite", async function (text: string) {
		let choise = await vscode.window.showQuickPick(["普通", "普通+cookies", "普通+data(&)+cookies"]);
		let cookiesSplite = false;
		let dataSplite = false;
		if (choise === "普通+cookies") {
			cookiesSplite = true;
		} else if (choise === "普通+data(&)+cookies") {
			cookiesSplite = true;
			dataSplite = true;
		}
		// 解析命令
		const tokens = shellQuote(text);
		var lines = [];
		let skip = false;
		for (let i = 0; i < tokens.length; i++) {
			if (skip) {
				skip = false;
				continue;
			}
			let value = tokens[i].trim();
			if (value.startsWith('-') && i + 1 < tokens.length) {
				let nextData = escape(tokens[i + 1].trim());
				LOG("value=" + value + " next=" + nextData);
				let isAppend = false;
				skip = true;
				if (cookiesSplite && value === "-H") {
					let first = nextData.indexOf(":");
					let headerName = nextData.substring(0, first);
					let headerValues = nextData.substring(first + 1).trim();
					let realHeaderName = headerName.substring(1);
					if (realHeaderName === "Cookie") {
						isAppend = true;
						lines.push("-H " + headerName + ": \\\n" + headerValues.split("; ").join("; \\\n"));
					}
				}
				if (dataSplite && value === "--data") {
					isAppend = true;
					lines.push(value + " \\\n" + nextData.split("&").join(" \\\n"));
				}
				if (!isAppend) {
					lines.push(value + " " + nextData);
				}
			} else {
				lines.push(value);
			}
		}

		return lines.filter(value => {
			if (value.trim().length > 0) {
				return value;
			} else {
				return null;
			}
		}).join(" \\\n");

	});
	LOG("Code Helper Load.");
}

// This method is called when your extension is deactivated
export function deactivate() {

}
