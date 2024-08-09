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

const transform = function (fileInfo: any, api: any, options: any) {
	const sourceCode = fileInfo.source;
	const $ = api.gogocode;
	const ast = $(sourceCode, { parseOptions: { language: 'vue' } });
	console.log(4444, rules)
	const outAst = rules.reduce((ast: any, rule: any) => rule(ast, api, options), ast);
	console.log(666, outAst)
	return outAst.generate();
}

export default (originPath: string, vscode: any) => {
	const { filePath: inputPath, outputPath } = readFile(originPath) || {}
	console.log(inputPath, outputPath)
	if (!inputPath || !outputPath) return
	console.log(2222, inputPath, outputPath)
	fs.readFile(inputPath, (err: any, code: Buffer) => {
		if (err) {
			console.log(err)
			throw err;
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
		console.log(1111, outputPath, outputCode)
		fs.writeFile(outputPath, outputCode, (err: any) => {
			if (err) {
				throw err;
			}
			vscode.window.showInformationMessage('The file was saved!');
		});
	});
}