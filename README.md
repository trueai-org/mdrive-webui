# MDrive Web UI

这是 [MDrive](https://github.com/trueai-org/MDriveSync) 的 Web UI 项目。

## 开发

如果你需要本地开发，本项目使用 `React + Vite + Antd + TypeScript + TailwindCSS` 构建前端项目，启动到连接本地运行的服务器。
默认使用本地代理：http://localhost:8080，如需修改可修改 `vite.config.ts`。

> 本地开发

+ 1.首先启动开发服务器，`MDriveSync.Client.API` 默认端口 `8080`，可通过 `appsettings.json` 修改默认端口。
+ 2.然后启动本项目。

```bash
# 安装依赖并启动
yarn
yarn dev
# 构建
yarn build
# 预览
yarn preview

# 或
npm i
npm run dev
# 构建
npm run build
# 预览
npm run preview
```

> 发布到服务器

构建完成后，将本项目构建的内容 `dist` 复制到 `MDriveSync.Client.API` 项目的 `wwwroot` 目录下即可。

## 框架

```bash
# 创建 vite + react
# https://cn.vitejs.dev/guide/
yarn create vite
√ Project name: ... mdrive
√ Select a framework: » React
√ Select a variant: » TypeScript

# 添加 antd
# https://ant.design/docs/react/introduce-cn
yarn add antd

# 添加 tailwindcss
# https://tailwindcss.com/docs/guides/vite
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 添加 antd 组件
yarn add @ant-design/pro-components

# 添加 vite proxy
用于本地开发的代理，http://localhost:8080

# 添加时间格式化
yarn add date-fns

# 配置别名
yarn add @types/node -D

# 配置 jsonp
yarn add fetch-jsonp

# 配置 swr/react-query
yarn add @tanstack/react-query

# 待定
# 1. 添加 eslint
# 2. 添加 prettier
# 3. 添加 commitlint
# 4. 添加 stylelint
# 5. 添加 husky
# 6. 添加 lint-staged
# 8. 添加 vitest
# 9. 添加 react-router
# 10. 添加 react-query
# 11. 添加 react-query-devtools
# 12. 添加 分包 js
# 13. 添加 pinia / recoil
# 14. 添加 react-i18next
# 15. 添加 electron
# 16. 添加 electron-builder
# 17. 添加 electron-devtools
# 18. 添加 axios
# 20. 添加 mock
# 21. 添加 less scss
# 22. 添加 svgr
# 23. 添加 react-refresh
# 24. 添加 react-app-rewired
# 25. 添加 react-app-rewired-plugin-tailwindcss
# 26. 配置 HtmlPlugin 替换标题
# 27. 配置 HtmlPlugin 添加 favicon
# 28. 配置 Copyright
# 29. 配置 alias
```