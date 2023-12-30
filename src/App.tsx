import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Button, Space, DatePicker, version } from "antd";

import {
  PageContainer,
  ProBreadcrumb,
  ProLayout,
} from "@ant-design/pro-components";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <ProLayout
      location={{
        pathname: "/admin/process/edit/123",
      }}
      layout="mix"
      ErrorBoundary={false}
      headerContentRender={() => <ProBreadcrumb />}
      breadcrumbRender={(routers = []) => [
        {
          path: "/",
          title: "主页",
        },
        {
          path: "/",
          title: "测试页",
        },
        ...routers,
      ]}
      menuDataRender={() => [
        {
          path: "/welcome",
          name: "欢迎",
        },
        {
          path: "/admin",
          name: "管理",
          children: [
            {
              name: "申请单列表",
              path: "/admin/process",
            },
            {
              name: "申请单详情",
              path: "/admin/process/detail/:id",
              hideInMenu: true,
            },
            {
              name: "编辑申请单",
              path: "/admin/process/edit/:id",
              hideInMenu: true,
            },
            {
              name: "添加申请单",
              path: "/admin/process/add",
              hideInMenu: true,
            },
          ],
        },
      ]}
    >
      {/* <Content /> */}
      <PageContainer
        className="w-full"
        content="欢迎使用"
        breadcrumbRender={false}
      >
        <div>Hello World</div>

        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>

        <div style={{ padding: "0 24px" }}>
          <h1 className="text-red-400">antd version: {version}</h1>
          <Space>
            <DatePicker />
            <Button type="primary">Primary Button</Button>
          </Space>
        </div>

        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </PageContainer>
    </ProLayout>
  );
}

export default App;
