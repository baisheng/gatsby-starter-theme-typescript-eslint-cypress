![image.png](https://upload-images.jianshu.io/upload_images/1511070-1c3390de2000aeba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 如何建立一个Gatsby 主题工作区，并使用TypeScript、ESLint和Cypress设置？

Gatsbyjs 团队推荐使用 yarn 和yarn workspace开发主题，这可能会让不熟悉工作区模式开发的人感觉陌生。如果你也是这样的感觉，或者以前从未听说过 Gatsby 主题，那我强烈建议你先访问 Gatbsyjs 的[官方文档](https://www.gatsbyjs.org/docs/themes/)。在了解之后，你可能会问自己如何建立一个Gatsby themes 工作区并整合 TypeScript甚至ESLint & Cypress——这篇文章将会向你讲解如何做到这一点!

在本教程的最后，我们将得到一个包含**ESLint linting + Cypress tests + TypeScript**的Yarn工作区，用于示例和主题。你可以用TypeScript编写你的主题，并在任何地方使用相同的ESLint配置。

## 基础设置

如上所述，在学习本教程之前，您应该对Gatsby主题的工作方式有一定的了解，并且可能已经使用过一点了。我假设您已经安装了运行工作区和Gatsby所需的所有依赖项(例如Yarn)。

 我们将使用“Gatsby主题工作区样板文件”作为起点。clone [这个示例工程](https://github.com/gatsbyjs/gatsbystar-them-workspace)，进入新创建的目录并运行`yarn`来安装依赖项。

**准备工作完成，让我们开始吧!**

## TypeScript
在编写本教程时，Gatsby并没有很好的与TypeScript集成，大多数人使用Gatsby -plugin-TypeScript，它在内部使用Babel。在本文中，您将只使用这个插件，如果您想添加类型检查，还需要加入 gatsby-plugin-typescript-checker。前一个插件允许你写。ts/tsx文件(但不适用于gatsby-config、gatsby-node等)。

在主题工程中安装 typescript plugin :

```shell
yarn workspace gatsby-theme-minimal add gatsby-plugin-typescript
```
在主题工程的配置文件 gatbsy-config.js 中添加配置信息：

**gatsby-theme-minimal/gatsby-config.js**

```javascript
module.exports = {
  plugins: [
    `gatsby-plugin-typescript`
  ]
}
```

此外，您还需要安装必要的 types。但是，与其在每个主题中安装它们，还不如在全局工作空间范围中安装它们。这样每个工作空间就都可以使用它们。

```javascript
yarn add -D -W @types/node @types/react @types/react-dom
```

`-D ` 标志用于将它们作为 **devDependencies** 安装，`-W ` 标志告诉 yarn 将它们安装在工作区根目录中。

接下来我们创建一个TypeScript文件到主题目录，在接下来的例子中使用。进入主题目录，并在components目录中创建一个新文件:

创建： **gatsby-theme-minimal/src/components/say-hello.tsx**

```
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Hello = ({ children }: Props) => {
  return (
    <div style={{ color: `red`, fontWeight: `bold` }}>
      SAY: {children}
    </div>
  )
}

export default Hello
```

编辑示例主题中的 index.js 文件，并使用刚刚新创建的组件:
更新：**example/src/pages/index.js**
```
import React from "react"
import Hello from "gatsby-theme-minimal/src/components/say-hello"

export default () => <div>Homepage in a user's site <Hello>Hello!</Hello></div>
```

**运行示例的开发服务，测试是否能正常工作。**

```shell
yarn workspace example develop
```

如果一切顺利，你会看到这样的文字：

Homepage in a user site
SAY: Hello!

很好，工程正常🎉

## 类型检查 (Type checking)
因为我们现在使用的是 typescript，而上面安装插件只解决了 Babel 编译文件的问题，所以还需要增加类型检查包：
`typescipt`、`tsconfig` 以及 npm 启动脚本。

```shell
yarn add -D -W typescript
```
在目录下的 tsconfig.json 中添加如下内容：

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "jsx": "react",
    "lib": ["dom", "es2015", "es2017"],
    "moduleResolution": "node",
    "strict": true,
    "noEmit": true, // Don't create files when running tsc
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["./gatsby-theme-minimal/src/**/*"]
}

````
最后，在根目录下的 package.json 中的 scripts 中添加 type-check

```json
{
  "scripts": {
    "type-check": "tsc"
  }
}
```
当我们需要执行类型检查时，只需要执行：

```
yarn type-check
```

## ESLint
我个人真的很喜欢使用ESLint和Prettier，但如果你不想用它，可以去跳过 Prettier 部分

我们使用 ESLint的TypeScript解析器和AirBnB + Prettier的预设。请安装以下软件包:

```shell
yarn add -D -W @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks prettier
```

在根目录中添加 `.eslintrc.js` 文件:
**.eslintrc.js**
```
module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint"
  ],
  plugins: ["@typescript-eslint", "prettier", "react-hooks"],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json'
  },
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  globals: {
    cy: true,
    Cypress: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        argsIgnorePattern: "res|next|stage|^err|on|config|e"
      }
    ],
    "arrow-body-style": [2, "as-needed"],
    "no-param-reassign": [
      2,
      {
        "props": false
      }
    ],
    "no-unused-expressions": [
      1,
      {
        "allowTaggedTemplates": true
      }
    ],
    "@typescript-eslint/prefer-interface": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "no-console": 0,
    "spaced-comment": 0,
    "no-use-before-define": 0,
    "linebreak-style": 0,
    "consistent-return": 0,
    "import": 0,
    "func-names": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "import/no-cycle": 0,
    "space-before-function-paren": 0,
    "import/extensions": 0,
    "react/jsx-one-expression-per-line": 0,
    "react/no-danger": 0,
    "react/display-name": 1,
    "react/react-in-jsx-scope": 0,
    "react/jsx-uses-react": 1,
    "react/forbid-prop-types": 0,
    "react/no-unescaped-entities": 0,
    "react/prop-types": 0,
    "react/jsx-filename-extension": [
      1,
      {
        "extensions": [".js", ".jsx", ".tsx"]
      }
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    quotes: [
      2,
      "backtick",
      {
        "avoidEscape": true
      }
    ],
    indent: ["error", 2, { SwitchCase: 1 }],
    "prettier/prettier": [
      "error",
      {
        trailingComma: "es5",
        semi: false,
        singleQuote: false,
        printWidth: 120
      }
    ],
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": [
      "warn",
      {
        "aspects": ["invalidHref"]
      }
    ]
  }
}
```

添加两个脚本命令
```json
{
  "scripts": {
    "lint": "eslint --ignore-path .gitignore . --ext ts --ext tsx --ext js --ext jsx",
    "lint:fix": "yarn lint --fix"
  }
}
```

lint命令将在除.gitignore中定义的文件之外的所有文件(以ts/tsx/js/jsx文件结尾)上运行`eslint`。`--fix`标志尝试自动修复错误。运行`yarn lint`时，你可能会得到一些 Prettier 提示的错误，就可以执行 `yarn lint:fix` 进行修复清理!

## Cypress
Cypress 是非常流行的端到端测试框架，也是可以在真实场景中测试主题很好用的工具，比如在示例中使用主题及其不同选项，或者将主题与其他主题一起使用。
现在我们开始设置:一个针对示例站点运行测试的Cypress测试套件。

首先，需要安装必要的软件包。除了显而易见的`cypress`之外，您还将安装[@test -library/cypress](https://testing-library.com/docs/cypress-testing-library/intro)和[gatsby-cypress(https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-cypress  t)。两者都扩展了Cypress命令，前者改进了选择 elemeten的过程，后者提供了一个有用的助手功能。

```shell
yarn add -D -W @testing-library/cypress @types/testing-library__cypress cross-env cypress gatsby-cypress start-server-and-test
```

包的 `start-server-and-test` 允许您首先运行Gatsby的开发服务器(或构建命令)，然后运行适合的Cypress命令。这是一个非常方便的小工具! `@test -library` 和`cypress` 都带有自己的TypeScript类型。在使用TypeScript编写Cypress测试时，了解这一点很重要。

```
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cross-env CYPRESS_baseUrl=http://localhost:9000 cypress run"
  }
}
```


运行`yarn cy:open` 初始 Cypress。它会自动向存储库添加文件，就像`cypress.json` 或cypress文件夹。在继续本教程之前，请退出应用程序。

请注意:在撰写本指南时，在运行Cypress open时，WSL (Windows 10上的Linux子系统)无法打开Cypress电子应用程序。您需要下载可执行文件并自己运行它。

删除cypress/integration的内容(它包含示例数据)并将其重命名为e2e。编辑 cypress.json 文件:

**cypress.json**

```
{
  "baseUrl": "http://localhost:8000",
  "integrationFolder": "cypress/e2e/build",
  "viewportHeight": 900,
  "viewportWidth": 1440
}
```

因为TypeScript将编译测试并将其输出到cypress/e2e/build中，所以您必须告诉cypress查看该文件夹。如果你不使用TypeScript，它将是cypress/e2e。

为了使用已安装的Cypress包(并添加一个自定义命令)，你必须编辑这两个文件:

**cypress/support/index.js**
```
// Import commands.js using ES2015 syntax:
import "@testing-library/cypress/add-commands"
import "gatsby-cypress/commands"
import "./commands"
```
**cypress/support/commands.js**
```
Cypress.Commands.add(`assertRoute`, route => {
  cy.url().should(`equal`, `${window.location.origin}${route}`)
})
```

assertRoute命令让您检查当前的URL。

最后但并非最不重要的是，需要测试的项目(示例)必须做好准备。要启用Gatsby测试实用程序并最终启用Gatsby -cypress，必须使用环境变量运行Gatsby CLI命令。在示例中添加cross-env(确保跨平台兼容性):

```
yarn workspace example add -D cross-env
```
修改 example 工程下的 package.json

**example/package.json**
```
{
  "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build",
    "serve": "gatsby serve",
    "develop:cypress": "cross-env CYPRESS_SUPPORT=y yarn develop",
    "build:cypress": "cross-env CYPRESS_SUPPORT=y yarn build"
  }
}
```

使用Cypress和TypeScript
完成了基本设置之后，现在可以在编写测试之前进行最后的步骤了!请继续:)
在 `cypress` 目录里面创建一个 `tsonfig.json` 文件

**tsconfig.json**
```
{
  "compilerOptions": {
    "baseUrl": "../node_modules",
    "outDir": "e2e/build",
    "strict": true,
    "sourceMap": false,
    "target": "es5",
    "lib": ["es2015", "es2017", "dom"],
    "types": ["cypress", "@testing-library/cypress/typings"]
  },
  "include": ["e2e/*.ts", "support/*.ts"]
}
```
稍后运行tsc脚本时，将使用这个tsconfig，而不是根目中的那个。

您添加的自定义命令和来自gatsby-cypress的命令还没有键入TypeScript——让我们改变一下吧!创建一个新的文件 `cypress/support`:

**cypress/support/index.d.ts**
```
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Assert the current URL
     * @param route
     * @example cy.assertRoute('/page-2')
     */
    assertRoute(route: string): Chainable<any>

    /**
     * Waits for Gatsby to finish the route change, in order to ensure event handlers are properly setup
     */
    waitForRouteChange(): Chainable<any>
  }
}
```
您已经可以添加一个小的测试文件:
**cypress/e2e/smoke.ts**
```
/// <reference types="../support/index" />
/// <reference types="cypress" />
/// <reference types="@types/testing-library__cypress" />

describe(`app`, () => {
  it(`should work`, () => {
    cy.visit(`/`)
      .waitForRouteChange()
      .assertRoute(`/`)
  })
})
```

/// 意味着这个文件应该引用这些 places/packages 中的TypeScript类型。另外:尝试悬停在waitForRouteChange或assertRoute函数上。您的IDE应该显示类型和描述。这就是您在上一步中添加的内容。这不是很酷吗?😎

添加包 `concurrently` 支持同时并发运行多个命令
```
yarn add -D -W concurrently
```

编辑根包。json添加了cypress/e2e内部文件的TypeScript编译，以及用于运行测试的最终脚本:
```
{
  "name": "gatsby-starter-theme-workspace",
  "private": true,
  "version": "0.0.1",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "tsc:compile": "tsc --project cypress/tsconfig.json",
    "tsc:compile:watch": "tsc --watch --project cypress/tsconfig.json",
    "example:cy:dev": "yarn workspace example develop:cypress",
    "example:cy:build": "yarn workspace example build:cypress",
    "example:serve": "yarn workspace example serve",
    "ssat:example:dev": "start-server-and-test example:cy:dev http://localhost:8000 cy:open",
    "ssat:example:serve": "start-server-and-test example:serve http://localhost:9000 cy:run",
    "e2e:dev": "concurrently --kill-others 'yarn tsc:compile:watch' 'yarn ssat:example:dev'",
    "e2e:ci": "yarn tsc:compile && yarn example:cy:build && yarn ssat:example:serve"
  }
}
```

内容看起来很多，但并不难理解，以下是一些解释:

- TypeScript 应采用`cypress/tsconfig.json`  并使用cypress/e2e中编译文件。`--watch` 标记允许在保存文件时自动重新编译。
- start-server-and-test 是启用服务器脚本，然后是指定监听的URL，最后是测试启动。
- CI是应用于构建和服务，所以示例站点不以开发模式运行。

## 编写测试
好经过一系列的配置工作，终于可以编写测试了!

编写：**cypress/e2e/home.ts**
```
/// <reference types="../support/index" />
/// <reference types="cypress" />
/// <reference types="@types/testing-library__cypress" />
// import { render, cleanup } from 'react-testing-library'
describe(`example`, () => {
  it(`contains keyword`, () => {
    cy.visit(`/`)
    cy.findByText(/say: hello!/i).should('exist')
  })
})

```
运行`yarn e2e:dev`,在 Cypress electron app 中 点击`home.js`应用, 我们将看到如下结果 🎉
![image.png](https://upload-images.jianshu.io/upload_images/1511070-eaa3bbd6bfb11c35.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 接下来可以做什么
到这里，我们已经完成了本指南👍🏻，接下来我有一些想法分享，可以在这个项目中发挥出更多想像，让它帮我们做更多的事情。

正如开始提到的，您可以在这个[源码库](https://github.com/baisheng/gatsby-starter-theme-typescript-eslint-cypress)中下载以上所有的代码，你也可以将其用作模板。

一些想法:

- 在CI提供程序(例如CircleCI)上运行linting和测试
- 根据喜好修改ESLint配置
- 添加Cypress测试来测试主题选项
- 添加husky + lint-stage在提交文件之前运行linter
- 添加更多的主题(+ example) =>创建一个单一的主题。

谢谢阅读，我希望这篇文章对您有所帮助，接下来我会持续写一系列关于 Gatsby 主题相关的实践请多多关注。如果您有问题，请留言。
