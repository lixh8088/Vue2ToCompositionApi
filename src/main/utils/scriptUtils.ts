/*
 * @Name:
 * @Description:
 * @Author: lixiaohan
 * @Date: 2024-08-08 14:29:08
 */
import fs from 'fs'
import * as vscode from 'vscode'
// 获取script节点
export function getScriptAst(ast: any) {
  return ast && ast.parseOptions && ast.parseOptions.language === 'vue'
        ? ast.find('<script></script>')
        : ast;
}
export function getTemplateAst(ast: any) {
  return ast && ast.parseOptions && ast.parseOptions.language === 'vue'
        ? ast.find('<template></template>')
        : ast;
}

export function readFile(filePath: string) {
  const stats = fs.lstatSync(filePath)
  if (+stats.isFile()) {
    const outputPath = setOutputFilePath(filePath)
    if (outputPath === filePath) {
      vscode.window.showErrorMessage('已转换文件不可再次转换！')
      return
    }
    return {filePath, outputPath}
  } else if (+stats.isDirectory()){
    fs.readdir(filePath, (_err: any, data: any) => {
      data.forEach((file: any) => {
        readFile(`${filePath}/${file}`)
      })
    })
  }
}

export function setOutputFilePath(filePath: string) {
  const fileInfoArr = filePath.split('/')
  const baseFilePath = fileInfoArr.slice(0, -1).join('/')
  const fileNameInfo = fileInfoArr.slice(-1).join('')
  const fileName = fileNameInfo.split('.')[0]
  const fileType = fileNameInfo.split('.')[1]
  if (fileName.indexOf('_transform') > -1) return filePath
  return `${baseFilePath}/${fileName}_transform.${fileType}`
}