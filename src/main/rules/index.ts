/*
 * @Name:
 * @Description: 动态导入所有规则
 * @Author: lixiaohan
 * @Date: 2024-08-08 14:29:08
 */

const modulesFiles = require.context('./modules', true, /\.ts$/)
const modules: Function[] = []
modulesFiles.keys().reduce((module: any, modulePath) => {
  const value = modulesFiles(modulePath)
  modules.push(value.default)
  return modules
}, {})

export default modules