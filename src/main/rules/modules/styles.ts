
import $ from 'gogocode'
export default function (ast: any) {
  try {
    ast.node.styles[0].attrs.lang = 'scss'
    // console.log(ast.node.styles[0])
    // let content = $(ast.node.styles[0].content)
    // console.log(3333, content, typeof content)
    // content.replace('/deep/', ':deep(')
    // console.log(111, content)
    // ast.node.styles[0].content = content
  } catch (error) {
    console.log(error)
  }

  return ast.root()
}