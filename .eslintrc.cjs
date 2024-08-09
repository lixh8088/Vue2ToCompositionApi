/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  env: {
    // 允许使用window
    browser: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // 注意要加上这一句，开启 prettier 自动修复的功能
    'prettier/prettier': 'error',
    // array 某些方法必须写return
    'array-callback-return': ['error', { allowImplicit: true }],
    // 箭头函数省略return
    'arrow-body-style': 'off',
    'no-await-in-loop': 'error',
    // 多个三元运算符加（）
    'no-constant-binary-expression': 'error',
    // constructor不需要return
    'no-constructor-return': 'error',
    // 原始数据类型不需要使用new关键字
    'no-new-native-nonconstructor': 'error',
    // promise 必须执行后return
    'no-promise-executor-return': 'error',
    // 不能自己===自己
    'no-self-compare': 'error',
    // 使用${}时必须首尾使用``
    'no-template-curly-in-string': 'error',
    // 循环中break, return or a throw 正确使用
    'no-unreachable-loop': 'error',
    // 在class内部定义的变量必须使用
    'no-unused-private-class-members': 'error',
    // 必须先定义在使用
    'no-use-before-define': 'error',
    // await 拿到值之后再更新
    'require-atomic-updates': 'off',
    'accessor-pairs': ['error', { getWithoutSet: true, setWithoutGet: true }],
    // 在当前作用域下使用var
    'block-scoped-var': 'error',
    // 圈复杂度最大不超过10
    complexity: ['error', { 'max': 20 }],
    // 一致的return
    'consistent-return': 'error',
    // switch case 必须有default
    'default-case': 'error',
    // switch case default 必须在末尾
    'default-case-last': 'error',
    // 必须 ===
    eqeqeq: ['error', 'always'],
    // 不允许使用foo["bar"];
    'dot-notation': 'error',
    // 不能重复给一个变量赋值相同的函数
    'func-name-matching': ['error', 'never'],
    // 函数必须命名
    'func-names': ['error', 'never'],
    // 声明函数不能使用function
    'func-style': ['error', 'expression'],
    // get set必须写在一起
    'grouped-accessor-pairs': 'error',
    // for in 循环 必须使用Object.prototype.hasOwnProperty.call
    'guard-for-in': 'error',
    // 变量名最少2个字母
    'id-length': 'error',
    // 初始化变量时必须使用
    'init-declarations': ['error', 'always'],
    // 循环最大深度
    'max-depth': ['error', 4],
    // callback最大深度
    'max-nested-callbacks': ['error', 3],
    // 形参个数最多3个
    'max-params': ['error', 5],
    // 一个函数最多语句不超过50行
    'max-statements': ['error', 50],
    // 不允许使用alert
    'no-alert': 'error',
    // array只允许接收一个值
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['warn', 'error'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-else-return': 'error',
    // 不允许有空函数
    'no-empty-function': 'error',
    // 不允许有空的static
    'no-empty-static-block': 'error',
    // 不允许有eval
    'no-eval': 'error',
    // 不能重新定义原型方法
    'no-extend-native': 'error',
    // 不能使用多余的!
    'no-extra-boolean-cast': 'error',
    // settimeout必须用函数
    'no-implied-eval': 'error',
    // 注释&代码不能在一行
    'no-inline-comments': 'error',
    // 不允许空的作用域
    'no-lone-blocks': 'error',
    // 不允许单独使用if
    'no-lonely-if': 'error',
    // 不能合并声明变量
    'no-multi-assign': 'error',
    // if else不能有重复的代码
    'no-negated-condition': 'error',
    // 三元表达式只能有一层
    'no-nested-ternary': 'error',
    // return 的内容不能是赋值语句
    'no-return-assign': 'error',
    // 必须throwError
    'no-throw-literal': 'error',
    // 三元表达式不能用于控制返回true或者false
    'no-unneeded-ternary': 'error',
    // 重复的key
    'no-useless-computed-key': 'error',
    // +拼接使用不规范
    'no-useless-concat': 'error',
    // 重命名不能一致
    'no-useless-rename': 'error',
    // 不允许使用var
    'no-var': 'error',
    // array object 提前结构
    'prefer-destructuring': ['error', { object: true, array: false }],
    // ** 替换 Math.pow
    'prefer-exponentiation-operator': 'error',
    // reject 里面用error
    'prefer-promise-reject-errors': 'error',
    // 使用``拼接
    'prefer-template': 'error',
    // async await 一起用
    'require-await': 'error',
    // 数组不加空格
    'array-bracket-spacing': ['error', 'never'],
    // 箭头函数的括号形参大于>=2时使用
    'arrow-parens': ['error', 'as-needed'],
    // 箭头函数必须有空格
    'arrow-spacing': 'error',
    // 前后必须有空格
    'block-spacing': 'error',
    // 同一行
    'brace-style': 'error',
    // 对象最后一个属性不需要有,
    'comma-dangle': ['error', 'never'],
    // new对象必须加()
    'new-parens': 'error',
    // 同一行允许链式调用两层
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    // 没有多余的()
    'no-extra-parens': 'error',
    // 单引号
    'quotes': ['error', 'single'],
    // 不要分号
    semi: ['error', 'never'],
    // 空格处理
    'no-whitespace-before-property': 'error',
    // 去掉末尾的空格
    'no-trailing-spaces': 'error',
    // 控制没有多余的空格
    'no-multi-spaces': 'error',
    // 对象首尾有空格
    'object-curly-spacing': ['error', 'always', { 'objectsInObjects': true, 'arraysInObjects': true }],
    // {} 前有空格
    'space-before-blocks': 'error',
    // 方法前面不加空格
    'space-before-function-paren': ['error', 'never'],
    // 括号没有空格
    'space-in-parens': ['error', 'never'],
    // 运算符两边有空格
    'space-infix-ops': 'error',
    // 关键词后边有空格
    'space-unary-ops': 'error',
    // switch ： 后面有空格
    'switch-colon-spacing': 'error',
    // `` 无空格
    'template-curly-spacing': 'error',
    // 解构...后无空格
    'rest-spread-spacing': ['error', 'never'],
    // 方法执行后面无空格
    'func-call-spacing': ['error', 'never'],
    // :后面有空格
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
    // *放在方法前
    'generator-star-spacing': ['error', { 'before': true, 'after': false }],
    // 关键词前后加空格
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    // 逗号前面不加空格，逗号后面加空格
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    // 默认空两格
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    // 最多空两行
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 0 }],
    'vue/comment-directive': 'off',
    // 要求每一行标签的最大属性不超过3个
    'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    // vue文件不需要写name
    'vue/multi-word-component-names': 'off',
    // 没有使用的变量
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-useless-escape': 'off'
  }
}
