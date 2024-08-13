/*
 * @Name:
 * @Description:
 * @Author: lixiaohan
 * @Date: 2024-08-05 19:30:59
 */
import * as vscode from 'vscode';
import path from 'path'
import fs from 'fs'
import run from './main/run'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('vue3tocompositionapi.transform', async(uri) => {
			try {
        const outputPath = await run(path.resolve(__dirname, uri.fsPath))
        vscode.commands.executeCommand('workbench.files.action.compareFileWith')
      } catch (error) {
      }
		})
	);
}

export function deactivate() {}
