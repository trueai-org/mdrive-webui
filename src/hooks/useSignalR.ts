import { useEffect, useRef, useCallback, useState } from "react";
import * as signalR from "@microsoft/signalr";

export interface JobStateUpdate {
  id: string;
  state: number;
  metadata?: {
    fileCount: number;
    folderCount: number;
    totalSize: number;
    message?: string;
  };
  isMount?: boolean;
}

/**
 * SignalR Hook - 用于实时接收作业状态更新
 * 替代原来每秒轮询 getJobs / getLocalJobs 的方式
 */

/**
 * 将后端推送的数据标准化为 JobStateUpdate
 */
function normalizeUpdate(raw: any): JobStateUpdate | null {
  if (!raw) return null;
  return {
    id: raw.id ?? "",
    state: raw.state ?? 0,
    metadata: raw.metadata
      ? {
          fileCount: raw.metadata.fileCount ?? 0,
          folderCount: raw.metadata.folderCount ?? 0,
          totalSize: raw.metadata.totalSize ?? 0,
          message: raw.metadata.message,
        }
      : undefined,
    isMount: raw.isMount,
  };
}

export function useSignalR(hubUrl: string = "/hubs/job") {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 存储回调函数引用，避免重复注册
  const onJobStateChangedRef = useRef<((data: JobStateUpdate) => void) | null>(null);
  const onLocalJobStateChangedRef = useRef<((data: JobStateUpdate) => void) | null>(null);

  // 启动连接
  const startConnection = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // 递增重连间隔：1s, 2s, 5s, 10s, 30s
          const delays = [1000, 2000, 5000, 10000, 30000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // 连接状态变化
    connection.onreconnecting(() => {
      console.log("[SignalR] 正在重新连接...");
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      console.log("[SignalR] 已重新连接");
      setIsConnected(true);
    });

    connection.onclose(() => {
      console.log("[SignalR] 连接已关闭");
      setIsConnected(false);
    });

    // 注册消息处理
    connection.on("JobStateChanged", (...args: any[]) => {
      console.log("[SignalR] 收到 JobStateChanged 原始数据:", JSON.stringify(args));
      const update = normalizeUpdate(args[0]);
      console.log("[SignalR] 解析后的作业状态:", update);
      if (update) {
        onJobStateChangedRef.current?.(update);
      }
    });

    connection.on("LocalJobStateChanged", (...args: any[]) => {
      console.log("[SignalR] 收到 LocalJobStateChanged 原始数据:", JSON.stringify(args));
      const update = normalizeUpdate(args[0]);
      if (update) {
        onLocalJobStateChangedRef.current?.(update);
      }
    });

    try {
      await connection.start();
      console.log("[SignalR] 已连接到", hubUrl);
      connectionRef.current = connection;
      setIsConnected(true);
    } catch (err) {
      console.error("[SignalR] 连接失败:", err);
      // 5秒后自动重试
      setTimeout(() => startConnection(), 5000);
    }
  }, [hubUrl]);

  // 停止连接
  const stopConnection = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // 注册云盘作业状态变化回调
  const onJobStateChanged = useCallback((callback: (data: JobStateUpdate) => void) => {
    onJobStateChangedRef.current = callback;
  }, []);

  // 注册本地存储作业状态变化回调
  const onLocalJobStateChanged = useCallback((callback: (data: JobStateUpdate) => void) => {
    onLocalJobStateChangedRef.current = callback;
  }, []);

  // 组件挂载时自动连接，卸载时断开
  useEffect(() => {
    startConnection();
    return () => {
      stopConnection();
    };
  }, [startConnection, stopConnection]);

  return {
    isConnected,
    onJobStateChanged,
    onLocalJobStateChanged,
    startConnection,
    stopConnection,
  };
}
