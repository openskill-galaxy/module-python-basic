# module-python-basic · Python 编程入门

OpenSkill Galaxy Python 编程入门模块：面向零基础学习者、大学课程学习者和编程入门者的 Python 基础语法、题库、案例训练与小项目实战模块。

## 访问地址

https://openskill-galaxy.github.io/module-python-basic/

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

## 技术栈

Vite + React + TypeScript + Tailwind CSS + React Router + Zustand + Fuse.js + 静态 JSON + GitHub Actions Pages。无后端、无数据库、不调用 AI API。

## 本地开发

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 数据校验

```bash
node scripts/validate-data.mjs                    # 模块内置校验
# 或使用公共工具
node ../openskill-galaxy-tools/scripts/src/validate-module.mjs .
```

## 数据规模

- courses: 12+
- lessons: 160+
- knowledge-points: 700+
- questions: 2500+
- exams: 80+
- cases: 180+
- routes: 25+
- tags: 300+
- glossary: 300+
- faqs: 180+

## 部署

推送到 `main` 分支即触发 `.github/workflows/deploy.yml` 自动部署到 GitHub Pages。

## 许可

MIT
