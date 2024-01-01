import axios from "axios";
import { IDrive, IDriveDownloadFile, IDriveFile } from "./api";

// 创建 axios 实例
const api = axios.create({});

/**
 * 获取云盘作业
 * @returns
 */
export const getDrives = async () => {
  const response = await api.get<IDrive[]>("/api/drive/drives");
  return response.data;
};

/**
 * 获取云盘文件
 * @param jobId
 * @param parentId
 * @returns
 */
export const getDriveFiles = async (jobId: string, parentId?: string) => {
  const response = await api.get<IDriveFile[]>(
    `/api/drive/files/${jobId}?parentId=${parentId || ""}`
  );
  return response.data;
};

/**
 * 下载文件
 * @param jobId
 * @param fileId
 * @returns
 */
export const getDownloadFile = async (jobId: string, fileId: string) => {
  const response = await api.get<IDriveDownloadFile>(
    `/api/drive/download/${jobId}/${fileId}`
  );
  return response.data;
};

/**
 * 文件详情
 * @param jobId
 * @param fileId
 * @returns
 */
export const getFile = async (jobId: string, fileId: string) => {
  const response = await api.get<IDriveFile>(
    `/api/drive/file/${jobId}/${fileId}`
  );
  return response.data;
};

/**
 * 作业状态
 */
export enum JobState {
  None = 0,
  Initializing = 1,
  Idle = 5,
  Starting = 6,
  Scanning = 7,
  BackingUp = 8,
  Restoring = 9,
  Verifying = 10,
  Queued = 11,
  Completed = 15,
  Paused = 16,
  Error = 17,
  Cancelling = 18,
  Cancelled = 19,
  Disabled = 100,
}
