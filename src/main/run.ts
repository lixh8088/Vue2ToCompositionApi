/*
 * @Name:
 * @Description:
 * @Author: lixiaohan
 * @Date: 2024-08-08 14:43:28
 */
import $ from 'gogocode'
import fs from 'fs'
import rules from './rules/index'
import { readFile } from './utils/scriptUtils'
import * as vscode from 'vscode'

const transform = function (fileInfo: any, api: any, options: any) {
	const sourceCode = fileInfo.source;
	const $ = api.gogocode;
	const ast = $(sourceCode, { parseOptions: { language: 'vue' } });
	const outAst = rules.reduce((ast: any, rule: any) => rule(ast, api, options), ast);
	return outAst.generate();
}

 const run = (originPath: string) => new Promise((resolve, reject) => {
	const { filePath: inputPath, outputPath } = readFile(originPath) || {}
	if (!inputPath || !outputPath) {
		reject()
		return
	}
	fs.readFile(inputPath, (err: any, code: Buffer) => {
		if (err) {
			reject(err)
		}
		const outputCode = transform(
			{
				source: code.toString(),
				path: inputPath
			},
			{
				gogocode: $
			},
			{
				rootPath: __dirname,
				outFilePath: outputPath,
				outRootPath: __dirname,
			}
		);
		fs.writeFile(outputPath, outputCode, (err: any) => {
			if (err) {
				reject(err)
			}
			resolve(outputPath)
			vscode.window.showInformationMessage('The file was saved!');
		});
	});
})
export default run