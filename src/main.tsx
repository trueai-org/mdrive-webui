import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import { ConfigProvider, theme } from "antd";

import App from "./App.tsx";
import "./index.css";

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>

    {/* <ConfigProvider
    theme={{
      token: {
        // // Seed Token，影响范围大
        // colorPrimary: "#00b96b",
        // borderRadius: 2,

        // // 派生变量，影响范围小
        // colorBgContainer: "#f6ffed",
      },

      //  // 1. 单独使用暗色算法
      //  algorithm: theme.darkAlgorithm,
    }}
    >
      <App />
    </ConfigProvider> */}
  </React.StrictMode>
);
