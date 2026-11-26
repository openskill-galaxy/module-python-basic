# Python 基础 · OpenSkill Galaxy

OpenSkill Galaxy Python 编程入门模块：面向零基础学习者、大学课程学习者和编程入门者的 Python 基础语法、题库、案例训练与小项目实战模块。

[开始学习](https://openskill-galaxy.github.io/module-python-basic/) · [学习路线](https://openskill-galaxy.github.io/module-python-basic/?page=%2Froutes) · [题库练习](https://openskill-galaxy.github.io/module-python-basic/?page=%2Fquestions) · [案例训练](https://openskill-galaxy.github.io/module-python-basic/?page=%2Fcases) · [返回主站](https://openskill-galaxy.github.io/)

本模块当前公开 **4 门课、8 节讲义、26 道练习题、3 套试卷和 1 个案例**。打开课程页可进入本章练习。题库记录最近作答结果，并在到期时给出复习入口。案例可保留草稿、导出作品和收回他人评语。

## 内容范围

- Python 环境与解释器、变量与数据类型
- 数字、字符串、列表、元组、字典、集合
- 条件判断、循环、range 与迭代
- 函数、参数、作用域、模块与包
- 文件读写、异常处理
- 面向对象基础、类与对象、继承与多态
- 常用标准库（datetime、random、pathlib、json、csv、re）
- pip、虚拟环境、调试、PEP8
- 小项目实战：计算器、通讯录、待办清单、成绩管理、文件整理、JSON/CSV 转换、命令行工具
- 后续学习路线

## 浏览器编程练习

七节讲义各有一道可编辑的 Python 实作，覆盖平均值与空输入、标签去重、闭包状态、迭代分批、数据类分组、TOML 项目配置和 JSON 订单汇总。共 22 组公开样例。每道题通过公开样例后，还可用一组新输入检验同一程序。支持查看预期和实际输出、按失败样例排错，以及使用自己的输入。浏览器会保留草稿和这份代码的通过记录。并发讲义中的本机线程、多进程和异步示例可在自己的 Python 环境实践。

首次运行会从本站下载约 12 MiB 的环境。运行成功后，在浏览器保留缓存的情况下可离线重做。

解释器使用 Pyodide 0.25.0（CPython 3.11.3）。运行代码时会新建独立的沙箱和工作线程，支持手动停止，执行限时 5 秒。练习使用内置标准库，未提供额外的第三方包。[Pyodide 0.25.0 发行版本与源代码](https://github.com/pyodide/pyodide/releases/tag/0.25.0) · [CPython 3.11.3 源代码](https://github.com/python/cpython/tree/v3.11.3)

## 本地开发

使用 Node.js 22。课程、讲义和题库位于 [public/data](public/data/)，编辑后先校验再构建。

```bash
npm ci
npm run dev
node scripts/validate-data.mjs
npm run build
npm run preview
```

`main` 分支更新后由 GitHub Actions 发布到 GitHub Pages。[模块维护说明](https://github.com/openskill-galaxy/openskill-galaxy-tools/blob/main/MODULE_WORKFLOW.md) · [发布核验](https://github.com/openskill-galaxy/openskill-galaxy-tools/blob/main/GITHUB_PAGES_DEPLOY_GUIDE.md)

[MIT 许可](https://opensource.org/license/mit)。解释器另附 [Pyodide 许可](public/python-runtime/0.25.0/LICENSE-PYODIDE) 和 [CPython 许可](public/python-runtime/0.25.0/LICENSE-CPYTHON)。
