import { useState } from "react";

import { ProLayout } from "@ant-design/pro-components";

import defaultProps from "./_defaultProps";

import "./App.css";

function App() {
  // const [count, setCount] = useState(0);
  const [pathname, setPathname] = useState("/list/sub-page/sub-sub-page1");

  return (
    <ProLayout
      title="MDrive"
      logo={<img src="/logo.png" style={{ width: 24, height: 24 }} />}
      {...defaultProps}
      location={{
        pathname,
      }}
      onMenuHeaderClick={(e) => console.log("e", e)}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            setPathname(item.path || "/welcome");
          }}
        >
          {dom}
        </a>
      )}
      layout="top"
    >
      这是内容区域
      {/* <PageContainer
        extra={[
          <Button key="3">操作</Button>,
          <Button key="2">操作</Button>,
          <Button key="1" type="primary">
            主操作
          </Button>,
        ]}
        footer={[
          <Button key="3">重置</Button>,
          <Button key="2" type="primary">
            提交
          </Button>,
        ]}
      >
        <ProCard
          style={{
            height: "200vh",
            minHeight: 800,
          }}
        >
          <div />
        </ProCard>
      </PageContainer> */}
    </ProLayout>

    // <div className="m-auto max-w-[800px] h-screen shadow">
    //   <ProCard split="vertical">
    //     <ProCard className="h-screen" title="Logo" colSpan={6}>
    //       左侧内容
    //     </ProCard>
    //     <ProCard title="内容">
    //       <div>右侧内容</div>
    //     </ProCard>
    //   </ProCard>
    // </div>
    // <ProLayout
    //   title="MDrive"
    //   logo={false}
    //   ErrorBoundary={false}
    //   menuDataRender={() => [
    //     {
    //       path: "/welcome",
    //       name: "欢迎",
    //     },
    //     {
    //       path: "/admin",
    //       name: "管理",
    //       children: [
    //         {
    //           name: "申请单列表",
    //           path: "/admin/process",
    //         },
    //         {
    //           name: "申请单详情",
    //           path: "/admin/process/detail/:id",
    //           hideInMenu: true,
    //         },
    //         {
    //           name: "编辑申请单",
    //           path: "/admin/process/edit/:id",
    //           hideInMenu: true,
    //         },
    //         {
    //           name: "添加申请单",
    //           path: "/admin/process/add",
    //           hideInMenu: true,
    //         },
    //       ],
    //     },
    //   ]}
    // >

    //   <PageContainer
    //     className="w-full"
    //     content="欢迎使用"
    //     breadcrumbRender={false}
    //   >
    //     <div>Hello World</div>

    //     <div>
    //       <a href="https://vitejs.dev" target="_blank">
    //         <img src={viteLogo} className="logo" alt="Vite logo" />
    //       </a>
    //       <a href="https://react.dev" target="_blank">
    //         <img src={reactLogo} className="logo react" alt="React logo" />
    //       </a>
    //     </div>

    //     <div style={{ padding: "0 24px" }}>
    //       <h1 className="text-red-400">antd version: {version}</h1>
    //       <Space>
    //         <DatePicker />
    //         <Button type="primary">Primary Button</Button>
    //       </Space>
    //     </div>

    //     <div className="card">
    //       <button onClick={() => setCount((count) => count + 1)}>
    //         count is {count}
    //       </button>
    //       <p>
    //         Edit <code>src/App.tsx</code> and save to test HMR
    //       </p>
    //     </div>
    //     <p className="read-the-docs">
    //       Click on the Vite and React logos to learn more
    //     </p>
    //   </PageContainer>
    // </ProLayout>
  );
}

export default App;
