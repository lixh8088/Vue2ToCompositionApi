import { getScriptAst } from '../../utils/scriptUtils'
const rules = [
  'beforeRouteEnter() {$_$1}',
  'async beforeRouteEnter() {$_$1}'
]
export default function (ast: any) {
  const scriptAst = getScriptAst(ast)
  rules.forEach(rule => {
    scriptAst
      .find('export default { }')
      .find(rule).each((item: any) => {
        const params = item.node.params.map((param: { name: any }) => param.name).join(', ')
        const content = rule.replace('()', `(${params})`).replace('$_$1', item.match[1][0].value)
        global.beforeRouteEnterContent = `
          export default {
            ${content}\n
          }\n
        `
      })
  })

  return getScriptAst(ast).root()
}