import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConfigProvider } from "antd";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
    // theme={{
    //   token: {
    //     // Seed Token，影响范围大
    //     colorPrimary: "#00b96b",
    //     borderRadius: 2,

    //     // 派生变量，影响范围小
    //     colorBgContainer: "#f6ffed",
    //   },
    // }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
