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
	// // 初始化弹出一个弹窗
	// vscode.window.showInformationMessage('Hello World from Vue3ToCompositionApi!');
	// // 注册一个命令
	// const disposable = vscode.commands.registerCommand('vue3tocompositionapi.helloWorld', () => {
	// 	// 弹出一个右下角弹窗
	// 	vscode.window.showInformationMessage('Hello World from Vue3ToCompositionApi!');
	// });
	// 放入上下文才能生效
	// context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand('vue3tocompositionapi.transform', (uri) => {
			vscode.window.showInformationMessage('start transform code!!');
			run(path.resolve(__dirname, uri.fsPath), vscode)
		})
	);
}

export function deactivate() {}
