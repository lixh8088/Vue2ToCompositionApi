/*
 * @Name:
 * @Description:
 * @Author: lixiaohan
 * @Date: 2024-08-08 14:29:08
 */
 import Vue2ToCompositionApi from '../../Vue2ToCompositionApi'
 import { getScriptAst } from '../../utils/scriptUtils'
export default function (ast: any) {
  const scriptAst = getScriptAst(ast)
  // 处理import语句
  const importContent: {[key: string]: any} = {}
  const importRules = [
    `import $_$ from '$_$2'`,
    `import { $_$1 } from '$_$2'`
  ]
  importRules.forEach(rule => {
    scriptAst
    .find(rule)
    .each((item: { match: any[][]; remove: () => void }) => {
      const name: string = item.match[2][0].value
      const content = item.match[0] ? item.match[0][0].value : Array.from(new Set(item.match[1].map(item => item.value)))
      importContent[name] = {
        content
      }
      item.remove()
    })
  })


  // 处理组件引入
  scriptAst
  .find('components: {}')
  .find('$_$: $_$1')
  .each((item: any) => {
    if (item.value.value.type === 'Identifier') {
      const name = item.match[0][0].value
      Object.assign({ type: 'defineComponent' }, importContent[name] || {})
      item.remove()
    }
  })

  // 处理export default内语句，去除vuex语句
  const exportDefaultStr = scriptAst.find('export default {}')
  .replace('...mapState()', '')
  .replace('...mapGetters()', '')
  .replace('...mapMutations()', '')
  .replace('...mapActions()', '')
  .generate()

  return getScriptAst(ast)
  .replace('export default {}', Vue2ToCompositionApi(exportDefaultStr, importContent))
  .root()
}