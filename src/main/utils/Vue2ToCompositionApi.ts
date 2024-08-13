/*
* package: vue2-to-composition-api
* e-mail: diquick@qq.com
* author: wd3322
*/
import * as vscode from "vscode"
import { braceRegExp, parenthesisRegExp, mixinsRegExp } from '../const/regExp'
function beautifyContent(entryScriptContent: string) {

  return (function() {
    return entryScriptContent
      .match(braceRegExp)?.[0]
      .replace(mixinsRegExp, '')
  })()
}

// 转换生命周期函数
function setLifeHooks() {
  try {
    for (const hook in vmBody) {
      if (
        ['beforeCreate', 'created', 'beforeMount', 'mounted',
          'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
          'activated', 'deactivated', 'errorCaptured'].includes(hook) &&
        getPrototype(vmBody[hook]).indexOf('function') !== -1
      ) {
        vmContent.hooks[hook] = vmBody[hook]
      }
    }
  } catch (error) {
    console.log('setLifeHooks', error)
  }
}

function addImport(type: string, value: string) {
  try {
    if (['vue', 'vue-router', 'vuex'].includes(type)) {
      const importContent = vmContent.import[type]
      if (!importContent?.includes(value)) {
        importContent.push(value)
      }
    }
  } catch (error) {
    console.log('addImport', error)
  }
}

function replaceValue(value: string, dataKeyToUseData = false) {
  let result = ''
  try {
    
    const thisKeyRegExp = /this(\.{1})([$a-zA-Z0-9_]+)/g
    const refKeyRegExp = /\$REFS_KEY(\.|\?\.)([$a-zA-Z0-9_]+)/g
    result = value
      .replace(thisKeyRegExp, function(
        str,
        separator,
        key,
        index,
        content
      ) {
        // props key
        if (vmKeys.props.includes(key)) {
          return 'props.' + key
        }
        // computed key
        else if (vmKeys.computed.includes(key)) {
          return key + '.value'
        }
        // methods key
        else if (vmKeys.methods.includes(key)) {
          return key
        }
        // data key
        else if (vmKeys.data.includes(key) && !dataKeyToUseData) {
          if (typeof vmContent.data[key] === 'object') {
            return key
          } else {
            return key + '.value'
          }
        }
        // useData key
        else if (vmKeys.data.includes(key) && dataKeyToUseData) {
          addUse(Type.data)
          return 'useData().' + key
        }
        // attrs key
        else if (key === '$attrs') {
          addImport('vue', 'useAttrs')
          addUse(Type.attrs)
          return key.substring(1)
        }
        // slots key
        else if (key === '$slots') {
          addImport('vue', 'useSlots')
          addUse(Type.slots)
          return key.substring(1)
        }
        // router key
        else if (key === '$router') {
          addImport('vue-router', 'useRouter')
          addUse(Type.router)
          return key.substring(1)
        }
        // route key
        else if (key === '$route') {
          addImport('vue-router', 'useRoute')
          addUse(Type.route)
          return key.substring(1)
        }
        // store key
        else if (key === '$store') {
          addImport('vuex', 'useStore')
          addUse(Type.store)
          return key.substring(1)
        }
        // nextTick key
        else if (key === '$nextTick') {
          addImport('vue', 'nextTick')
          return key.substring(1)
        }
        // set key
        else if (key === '$set') {
          addImport('vue', 'set')
          return key.substring(1)
        }
        // delete key
        else if (key === '$delete') {
          addImport('vue', 'del')
          return key.substring(1)
        }
        // emit key
        else if (key === '$emit') {
          const nameRegExp = /^\([\'\"\`](update:){0,1}([$a-zA-Z0-9_-]+)[\'\"\`]/
          const name = content.substring(index + str.length).match(nameRegExp)?.[2] || ''
          if (name) {
            !vmContent.emits.includes(name) && vmContent.emits.push(name)
          }
          return name
            ? key.substring(1)
            : `/* Warn: Cannot find emit name */ $vm.$emit`
        }
        // refs key
        else if (key === '$refs') {
          const nameRegExp = /(^\.|^\?\.)([$a-zA-Z0-9_]+)/
          const name = content.substring(index + str.length).match(nameRegExp)?.[2] || ''
          if (name) {
            !vmContent.refs.includes(name) && vmContent.refs.push(name)
          }
          return name
            ? '$REFS_KEY'
            : `/* Warn: Cannot find refs name */ $vm.$refs`
        }
        // other key
        else if (
          ['$data', '$props', '$el', '$options', '$parent', '$root', '$children', '$isServer',
            '$listeners', '$watch', '$on', '$once', '$off', '$mount', '$forceUpdate', '$destroy'].includes(key)
        ) {
          return '/* Warn: Unknown source: ${key} */$vm.' + key
        }
        // unknown key
        else if (key) {
          return `/* Warn: Unknown source: ${key} */$vm.${key}`
        }
        // nonexistent key
        else {
          return `/* Warn: Unknown source: ${key} */ $vm${separator}`
        }
      })
      .replace(refKeyRegExp, function(
        str,
        separator,
        name
      ) {
        // reset refs key
        return name + '.value'
      })
  } catch (error) {
    console.log('replaceValue', error)
  }
  return result
}

function replaceKey(key: string, dataKeyToUseData = false){
  let result = ''
  try {
    // props key
    if (vmKeys.props.includes(key)) {
      result = 'props.' + key
    }
    // computed key
    else if (vmKeys.computed.includes(key)) {
      result = key + '.value'
    }
    // methods key
    else if (vmKeys.methods.includes(key)) {
      result = key
    }
    // data key
    else if (vmKeys.data.includes(key) && !dataKeyToUseData) {
      if (typeof vmContent.data[key] === 'object') {
        result = key
      } else {
        result = key + '.value'
      }
    }
    // useData key
    else if (vmKeys.data.includes(key) && dataKeyToUseData) {
      addUse(Type.data)
      result = 'useData().' + key
    }
    // unknown key
    else if (key) {
      result = `/* Warn: Unknown source: ${key} */ $vm.${key}`
    }
  } catch (error) {
    console.log('replaceKey', error)
  }
  
  return result
}
function getContentStr(
  value: any,
  replaceDataKeyToUseData = false,
  resultCallbackContent: any = {}
) {
  let result = ''
  try {
    // string prototype
    if (getPrototype(value) === 'string') {
      result = `\'${value}\'`
      if (resultCallbackContent.string) {
        result = resultCallbackContent.string({ value, result })
      }
    }
    // object prototype
    else if (getPrototype(value) === 'object') {
      const values = []
      for (const prop in value) {
        const content = getContentStr(value[prop], replaceDataKeyToUseData, resultCallbackContent)
        values.push(`${prop}: ${content}`)
      }
      result = values.length > 0 ? `{\n${values.join(',\n')}\n}` : '{}'
      if (resultCallbackContent.object) {
        result = resultCallbackContent.object({ value, values, result }) || result
      }
    }
    // array prototype
    else if (getPrototype(value) === 'array') {
      const values = []
      for (const item of value) {
        const content = getContentStr(item, replaceDataKeyToUseData, resultCallbackContent)
        values.push(content)
      }
      result = values.length > 0 ? `[${values.join(', ')}]` : '[]'
      if (resultCallbackContent.array) {
        result = resultCallbackContent.array({ value, values, result }) || result
      }
    }
    // function prototype
    else if (getPrototype(value).indexOf('function') !== -1) {
      let content = value.toString()
      // native code
      if (
        ['String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'Function', 'Symbol'].includes(value.name) &&
        content.match(braceRegExp)?.[0] === '{ [native code] }'
      ) {
        result = `${value.name}`
        if (resultCallbackContent.function) {
          result = resultCallbackContent.function({ type: 'native', value, content, result }) || result
        }
      }
      // custom code
      else {
        content = replaceValue(content, replaceDataKeyToUseData)
        const arg = content.match(parenthesisRegExp)?.[0] || '()'
        const body = content.substring(content.indexOf(arg) + arg.length).match(braceRegExp)?.[0] || '{}'
        result = value.constructor.name === 'AsyncFunction'
          ? `async ${arg} => ${body}`
          : `${arg} => ${body}`
        if (resultCallbackContent.function) {
          result = resultCallbackContent.function({ type: 'custom', value, content, arg, body, result }) || result
        }
      }
    }
    // other prototype
    else {
      result = `${value}`
      if (resultCallbackContent.other) {
        result = resultCallbackContent.other({ value, result }) || result
      }
    }
  } catch (error) {
    console.log('getContentStr', error)
  }
  
  return result
}

function getPrototype(value: string) {
  return Object.prototype.toString.call(value).replace(/^\[object (\S+)\]$/, '$1').toLowerCase()
}

enum Type {
  data='data',
  attrs='attrs',
  slots='slots',
  router='router',
  route='route',
  store='store'
}

function addUse(type: Type) {
  try {
    if (['data', 'vm', 'attrs', 'slots', 'router', 'route', 'store'].includes(type)) {
      const contentDist = {
        data: 'const useData = () => data',
        attrs: 'const attrs = useAttrs()',
        slots: 'const slots = useSlots()',
        router: 'const router = useRouter()',
        route: 'const route = useRoute()',
        store: 'const store = useStore()'
      }
      const useContent = contentDist[type]
      if (useContent) {
        vmContent.use[type] = useContent
      }
    }
  } catch (error) {
    console.log('addUse', error)
  }
}

// 转换其他属性
function setContentMethods() {
  const vmSetContentMethods: {[key: string]: any} = {
    props() {
      if (vmKeys.props.length > 0) {
        const propsContentStr = getContentStr(vmContent.props, false, {
          function: (params: { type: any; content: any; }) => {
            const { type, content } = params
            if (type === 'custom') {
              return content
            }
          }
        })
        if (propsContentStr) {
          vmOutput.props = `const props = defineProps(${propsContentStr})`
        }
      }
    },
    data() {
      if (vmKeys.data.length > 0) {
        const dataValues = []
        for ( const key in vmContent.data) {
          const value = vmContent.data[key]
          // 特殊场景处理
          switch(typeof value) {
            case 'string':
              dataValues.push(`const ${key} = ref('${value}')`)
              addImport('vue', 'ref')
              break;
              case 'boolean': case 'number':
                dataValues.push(`const ${key} = ref(${value})`)
                addImport('vue', 'ref')
                break;
              case 'object':
                if (Array.isArray(value)) {
                  dataValues.push(`const ${key} = reactive(${value.length ? value : '[]'})`)
                } else if (value === null) {
                  dataValues.push(`const ${key} = reactive(null)`)
                } else if (!Object.keys(value).length) {
                  dataValues.push(`const ${key} = reactive({})`)
                } else {
                  dataValues.push(`const ${key} = reactive(${JSON.stringify(value)})`)
                }
                addImport('vue', 'reactive')
                break;
              default:
                dataValues.push(`const ${key} = ref(${value})`)
                addImport('vue', 'ref')
                break;
          }
        }
        if (dataValues.length > 0) {
          vmOutput.data = dataValues.join('\n\n')
        }
      }
    },
    computed() {
      if (vmKeys.computed.length > 0) {
        const computedValues = []
        for (const prop in vmContent.computed) {
          const computedContent = vmContent.computed[prop]
          if (
            computedContent &&
            ['object', 'function', 'asyncfunction'].includes(getPrototype(computedContent))
          ) {
            const computedName = getPrototype(computedContent).indexOf('function') !== -1 ? computedContent.name : prop
            const computedFunctionStr = getContentStr(computedContent)
            if (computedName && computedFunctionStr) {
              computedValues.push(`const ${computedName} = computed(${computedFunctionStr})`)
            }
          }
        }
        if (computedValues.length > 0) {
          vmOutput.computed = computedValues.join('\n\n')
          addImport('vue', 'computed')
        }
      }
    },
    watch() {
      if (vmKeys.watch.length > 0) {
        const watchValues = []
        for (const prop in vmContent.watch) {
          const watchContent = vmContent.watch[prop]
          if (getPrototype(watchContent).indexOf('function') !== -1) {
            const watchName = replaceKey(watchContent.name)
            const watchFunctionStr = getContentStr(watchContent)
            if (watchName && watchFunctionStr) {
              watchValues.push(`watch(() => ${watchName}, ${watchFunctionStr})`)
            }
          } else if (
            watchContent &&
            getPrototype(watchContent) === 'object' &&
            getPrototype(watchContent.handler).indexOf('function') !== -1
          ) {
            const watchName = replaceKey(prop)
            const watchFunctionStr = getContentStr(watchContent.handler)
            const watchOptionsStr = getContentStr(watchContent, false, {
              object: (params: { value: any; values: any; }) => {
                const { value, values } = params
                if (value.handler) {
                  const index = values.findIndex((item: string) => /^handler\:/.test(item))
                  values.splice(index, 1)
                }
                return values.length > 0 ? `{\n${values.join(',\n')}\n}` : '{}'
              }
            })
            if (watchName && watchFunctionStr && watchOptionsStr) {
              watchValues.push(
                watchOptionsStr !== '{}'
                  ? `watch(() => ${watchName}, ${watchFunctionStr}, ${watchOptionsStr})`
                  : `watch(() => ${watchName}, ${watchFunctionStr})`
              )
            }
          }
        }
        if (watchValues.length > 0) {
          vmOutput.watch = watchValues.join('\n\n')
          addImport('vue', 'watch')
        }
      }
    },
    hooks() {
      if (vmKeys.hooks.length > 0) {
        const hookValues = []
        for (const prop in vmContent.hooks) {
          const hookContent = vmContent.hooks[prop]
          if (getPrototype(hookContent).indexOf('function') !== -1) {
            if (['beforeCreate', 'created'].includes(hookContent.name)) {
              const hookName = `on${hookContent.name.substring(0, 1).toUpperCase()}${hookContent.name.substring(1)}`
              const hookFunctionStr = getContentStr(hookContent, false, {
                function: (params: { type: any; value: any; arg: any; body: any; }) => {
                  const { type, value, arg, body } = params
                  if (type === 'custom') {
                    return value.constructor.name === 'AsyncFunction'
                      ? `const ${hookName} = async${arg} => ${body}\n${hookName}()`
                      : `const ${hookName} = ${arg} => ${body}\n${hookName}()`
                  }
                }
              })
              if (hookName && hookFunctionStr) {
                hookValues.push(hookFunctionStr)
              }
            } else if (
              ['beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
                'activated', 'deactivated', 'errorCaptured'].includes(hookContent.name)
            ) {
              const v3HooksNameDist: {[key: string]: any} = {
                beforeMount: 'onBeforeMount',
                mounted: 'onMounted',
                beforeUpdate: 'onBeforeUpdate',
                updated: 'onUpdated',
                beforeDestroy: 'onBeforeUnmount',
                destroyed: 'onUnmounted',
                activated: 'onActivated',
                deactivated: 'onDeactivated',
                errorCaptured: 'onErrorCaptured'
              }
              const hookName = v3HooksNameDist[hookContent.name]
              const hookFunctionStr = getContentStr(hookContent, false, {
                function: (params: { type: any; value: any; arg: any; body: any; }) => {
                  const { type, value, arg, body } = params
                  if (type === 'custom') {
                    return value.constructor.name === 'AsyncFunction'
                      ? `${hookName} (async ${arg} => ${body})`
                      : `${hookName} (${arg} => ${body})`
                  }
                }
              })
              if (hookName && hookFunctionStr) {
                hookValues.push(hookFunctionStr)
                addImport('vue', hookName)
              }
            }
          }
        }
        if (hookValues.length > 0) {
          vmOutput.hooks = hookValues.join('\n\n')
        }
      }
    },
    methods() {
      if (vmKeys.methods.length > 0) {
        const methodValues = []
        for (const prop in vmContent.methods) {
          const methodContent = vmContent.methods[prop]
          if (getPrototype(methodContent).indexOf('function') !== -1) {
            const methodName = methodContent.name
            const methodFunctionStr = getContentStr(methodContent, false, {
              function: (params: { type: any; value: any; arg: any; body: any; }) => {
                const { type, value, arg, body } = params
                if (type === 'custom') {
                  return value.constructor.name === 'AsyncFunction'
                    ? `const ${methodName} = async${arg} => ${body}`
                    : `const ${methodName} = ${arg} => ${body}`
                }
              }
            })
            if (methodName && methodFunctionStr) {
              methodValues.push(methodFunctionStr)
            }
          }
        }
        if (methodValues.length > 0) {
          vmOutput.methods = methodValues.join('\n\n')
        }
      }
    },
    filters() {
      if (vmKeys.filters.length > 0) {
        const filterValues = []
        for (const prop in vmContent.filters) {
          const filterContent = vmContent.filters[prop]
          if (getPrototype(filterContent).indexOf('function') !== -1) {
            const filterName = filterContent.name
            const filterFunctionStr = getContentStr(filterContent, false, {
              function: (params: { type: any; value: any; arg: any; body: any; }) => {
                const { type, value, arg, body } = params
                if (type === 'custom') {
                  return value.constructor.name === 'AsyncFunction'
                    ? `const ${filterName} = async${arg} => ${body}`
                    : `const ${filterName} = ${arg} => ${body}`
                }
              }
            })
            if (filterName && filterFunctionStr) {
              filterValues.push(filterFunctionStr)
            }
          }
        }
        if (filterValues.length > 0) {
          vmOutput.filters = filterValues.join('\n\n')
        }
      }
    },
    emits() {
      if (vmContent.emits.length > 0) {
        const emitValues = []
        for (const emit of vmContent.emits) {
          if (emit) {
            emitValues.push(`\'${emit}\'`)
          }
        }
        if (emitValues.length > 0) {
          vmOutput.emits = `const emit = defineEmits([${emitValues.join(', ')}])`
        }
      }
    },
    refs() {
      if (vmContent.refs.length > 0) {
        const refValues = []
        for (const ref of vmContent.refs) {
          if (ref) {
            refValues.push(`const ${ref} = ref(null)`)
          }
        }
        if (refValues.length > 0) {
          vmOutput.refs = refValues.join('\n')
          addImport('vue', 'ref')
        }
      }
    },
    use() {
      if (vmKeys.use().length > 0) {
        const useValues = []
        for (const prop in vmContent.use) {
          const useContent = vmContent.use[prop]
          if (useContent) {
            useValues.push(useContent)
          }
        }
        if (useValues.length > 0) {
          vmOutput.use = useValues.sort().join('\n')
        }
      }
    },
    components() {
      const componentsValue = []
      if (vmKeys.components.length > 0) {
        for (const prop in vmContent.components) {
          const componentContent = vmContent.components[prop]
          // 异步组件
          if (getPrototype(componentContent).indexOf('function') > -1) {
            componentsValue.push(`const ${prop} = defineAsyncComponent(${componentContent})`)
            addImport('vue', 'defineAsyncComponent')
          }
        }
      }
      Object.keys(importComponents).forEach(key => {
        if (['Vue'].includes(key)) return
        componentsValue.push(`const ${key} = defineComponent(() => import('${importComponents[key]}'))`)
        delete importComponents[key]
        addImport('vue', 'defineComponent')
      })

      if (componentsValue.length > 0) {
        vmOutput.components = componentsValue.join('\n\n')
      }
    },
    import() {
      const importValues = []
      // 处理原import
      Object.keys(originImportContent).forEach(key => {
        const content = originImportContent[key].content
        if (Array.isArray(content)) {
          // 去除vant无用引入
          const vantIgnoreAPI = [
            'showToast',
            'showNotify',
            'showLoadingToast',
            'closeToast',
            'showDialog',
            'showConfirmDialog',
            'allowMultipleToast'
          ]
          let contentStr = content.join(',')
          if(key === 'vant') {
            contentStr =  content.filter(val => vantIgnoreAPI.includes(val)).join(',')
          }
          contentStr && importValues.push(`import { ${contentStr} } from \'${key}\'`)
        } else {
          importValues.push(`import ${content}  from \'${key}\'`)
        }
        delete originImportContent[key]
      })
      if (vmKeys.import().length > 0) {
        for (const prop in vmContent.import) {
          const importContent = vmContent.import[prop]
          if (importContent.length > 0) {
            importValues.push(`import { ${importContent.sort().join(', ')} } from \'${prop}\'`)
          }
        }
      }
      if (importValues.length > 0) {
        vmOutput.import = importValues.join('\n')
      }
    },
    output() {
      const outputValues = []
      for (const prop in vmOutput) {
        const outputContent = vmOutput[prop]
        if (outputContent) {
          outputValues.push(outputContent)
        }
      }
      if (outputValues.length > 0) {
        global.outputScriptContent = outputValues.join('\n\n')
      }
    }
  }
  try {
    for (const prop  in vmSetContentMethods) {
      const vmSetContentMethod = vmSetContentMethods[prop]

      if (getPrototype(vmSetContentMethod).indexOf('function') !== -1) {
        vmSetContentMethod()
      }
    }
  } catch (error) {
    console.log('setContentMethods', error)
  }
}


global.vmBody = null
global.outputScriptContent = ''
export default function Vue2ToCompositionApi(entryScriptContent= '', { importContent = {}, importComponents = {} }) {
  global.originImportContent = importContent
  global.importComponents = importComponents
  if (getPrototype(entryScriptContent) !== 'string') {
    throw new Error(`Vue2ToCompositionApi ${entryScriptContent} is not a string`)
  }

  try {
    const modelScriptContent = beautifyContent(entryScriptContent)
    if (!modelScriptContent) {
      throw new Error(`Vue2ToCompositionApi entry script content not a valid content`)
    }
    eval(`vmBody = ${modelScriptContent}`)
    // vm content init
    global.vmContent = {
      props: getPrototype(vmBody.props) === 'object' ? vmBody.props : {},
      data: getPrototype(vmBody.data).indexOf('function') !== -1 ? vmBody.data() : {},
      dataOptions: getPrototype(vmBody.data).indexOf('function') !== -1 ? vmBody.data() : {},
      computed: getPrototype(vmBody.computed) === 'object' ? vmBody.computed : {},
      watch: getPrototype(vmBody.watch) === 'object' ? vmBody.watch : {},
      methods: getPrototype(vmBody.methods) === 'object' ? vmBody.methods : {},
      filters: getPrototype(vmBody.filters) === 'object' ? vmBody.filters : {},
      hooks: {},
      emits: [],
      refs: [],
      use: {},
      import: {
        vue: [],
        'vue-router': [],
        vuex: []
      },
      components: getPrototype(vmBody.components) === 'object' ? vmBody.components : {},
    }

    // 生命周期函数
    setLifeHooks()

    // vm keys init
    global.vmKeys = {
      props: Object.keys(vmContent.props),
      data: Object.keys(vmContent.dataOptions),
      computed: Object.keys(vmContent.computed),
      watch: Object.keys(vmContent.watch),
      methods: Object.keys(vmContent.methods),
      filters: Object.keys(vmContent.filters),
      hooks: Object.keys(vmContent.hooks),
      use: () => Object.keys(vmContent.use),
      import: () => Object.keys(vmContent.import),
      components: Object.keys(vmContent.components),
    }

    // vm output init
    global.vmOutput = {
      import: '',
      components: '',
      use: '',
      props: '',
      emits: '',
      refs: '',
      data: '',
      computed: '',
      watch: '',
      hooks: '',
      methods: '',
      filters: ''
    }

    setContentMethods()
    return outputScriptContent
  } catch (err) {
    console.log(888, err)
    vscode.window.showErrorMessage('Script转换失败：' + err)
  }
}
