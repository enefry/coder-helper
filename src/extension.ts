// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { renameSync } from 'fs';
import { stringify } from 'querystring';
import { TextDecoder } from 'util';
import * as vscode from 'vscode';


function addEditorSelectionCommand(context: vscode.ExtensionContext, command: string, callback: (text: string) => Promise<string>) {
	addEditorCommand(context, command, async function (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) {
		var text = textEditor.document.getText(textEditor.selection);
		text = await callback(text);
		textEditor.edit(builder => {
			builder.replace(textEditor.selection, text);
		});
	});
}

function addEditorCommand(context: vscode.ExtensionContext,command:string,callback: (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void, thisArg?: any) {
	let disposable = vscode.commands.registerTextEditorCommand(command, async function(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[])  {
		try {
			 callback(textEditor,edit,args);
		} catch (exp) {
			console.log(">>>" + exp + " >>>" + textEditor + ">>>" + edit + " >>>" + args);
			vscode.window.showErrorMessage(command + ":" + exp);
		}
	});
	context.subscriptions.push(disposable);
}
export function activate(context: vscode.ExtensionContext) {

	addEditorSelectionCommand(context, "coder-helper.codeEscape", async (text: string) => {
		let temp = JSON.stringify([text]);
		return temp.substr(1, temp.length - 2);
	});
	addEditorSelectionCommand(context, "coder-helper.codeUnescape", async (text: string) => {
		return JSON.parse("[" + text + "]")[0];
	});

	addEditorSelectionCommand(context, "coder-helper.urlQuerySplite", async (text: string) => {
		return text.split("&").join("\n&");
	});

	addEditorSelectionCommand(context, "coder-helper.urlQueryMerge", async (text:string) => {
		return text.split(RegExp(/\s*\n\s*&/)).join("&");
	});

	addEditorSelectionCommand(context, "coder-helper.unicodeUnescape", async (text:string) => {
		return text.replace(/\\[uU][\dA-Fa-f]{4}/gi, function(match) {
			return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
		});
	});

	addEditorSelectionCommand(context, "coder-helper.curlCommandSplite", async function(text: string) {
		let choise = await vscode.window.showQuickPick(["普通", "普通+cookies", "普通+data(&)+cookies"]);
		let cookiesSplite = false;
		let dataSplite = false;
		if (choise === "普通+cookies") {
			cookiesSplite = true;
		} else if (choise === "普通+data(&)+cookies") {
			cookiesSplite = true;
			dataSplite = true;
		}


		let exp = /(?:(?:[-\w]*\s+)|(?:'[^']*'\s+)|(?:"[^"]*"\s+))|((?:[-\w]*)|(?:'[^']*')|(?:"[^"]*"))$/g;
		let groups = text.match(exp);
		var lines = [];
		if (groups !== null) {
			// console.log(groups.join("\n"))
			for (let idx = 0; idx < groups.length; idx++){
				let value = groups[idx].trim();
				if (value.startsWith("-") && idx + 1 < groups.length) {
					let nextData = groups[idx + 1].trim();
					// console.log("value=" + value + " next=" + nextData)
					let skip = false;
					if (cookiesSplite && value === "-H") {
						let first = nextData.indexOf(":");
						let headerName = nextData.substring(0, first);
						let headerValues = nextData.substr(first+1).trim();
						let realHeaderName = headerName.substr(1);
						if (realHeaderName === "Cookie"){
							skip = true;
							lines.push("-H " + headerName +": \\\n"+ headerValues.split("; ").join("; \\\n"));
						}
					} else if (dataSplite && value === "--data") {
						lines.push("--data " + nextData.split("&").join("&\\\n"));
						skip = true;
					}
					if(!skip){
						lines.push(value + " " + nextData);
					}
					idx ++;
				} else {
					lines.push(value);
				}
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
	console.log("Code Helper Load.");
}

// this method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {

}
