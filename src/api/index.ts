import axios from "axios";
import {
  IDrive,
  IDriveDownloadFile,
  IDriveFile,
  IDriveJob,
  IResult,
} from "./model";

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
 * 作业更新
 * @param data
 * @returns
 */
export const updateJob = async (data: IDriveJob) => {
  const response = await api.put<IResult>(`/api/drive/job`, data);
  return response.data;
};

/**
 * 作业添加
 * @param data
 * @returns
 */
export const addJob = async (driveId: string, data: IDriveJob) => {
  const response = await api.post<IResult>(`/api/drive/job/${driveId}`, data);
  return response.data;
};

/**
 * 作业更新状态
 * @param data
 * @returns
 */
export const updateJobState = async (jobId: string, state: any) => {
  const response = await api.put<IResult>(`/api/drive/job/${jobId}/${state}`);
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
