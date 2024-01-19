import axios from "axios";
import {
  IDrive,
  IDriveDownloadFile,
  IDriveFile,
  IDriveJob,
  IResult,
  ITreeNode,
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
 * 获取云盘所有作业
 * @returns
 */
export const getJobs = async () => {
  const response = await api.get<IResult<IDriveJob[]>>("/api/drive/jobs");
  return response.data;
};

/**
 * 设置挂载点
 * @param jobId
 * @param mountPoint
 * @returns
 */
export const updateSetMount = async (jobId: string) => {
  const response = await api.post<IResult>(`/api/drive/job/mount/${jobId}`);
  return response.data;
};

/**
 * 取消挂载点
 * @param jobId
 * @param mountPoint
 * @returns
 */
export const updateSetUnmount = async (jobId: string) => {
  const response = await api.post<IResult>(`/api/drive/job/unmount/${jobId}`);
  return response.data;
};



/**
 * 云盘挂载
 * @param jobId
 * @param mountPoint
 * @returns
 */
export const updateSetDriveMount = async (driveId: string) => {
  const response = await api.post<IResult>(`/api/drive/mount/${driveId}`);
  return response.data;
};

/**
 * 云盘取消挂载
 * @param jobId
 * @param mountPoint
 * @returns
 */
export const updateSetDriveUnmount = async (driveId: string) => {
  const response = await api.post<IResult>(`/api/drive/unmount/${driveId}`);
  return response.data;
};

/**
 * 获取磁盘挂载点
 * @returns
 */
export const getPoints = async () => {
  const response = await api.get<IResult<string[]>>("/api/drive/points");
  return response.data;
};

/**
 * 常用表达式
 * @returns
 */
export const getCronTags = async () => {
  const response = await api.get<string[]>("/api/drive/crons");
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

/**
 * 云盘更新
 * @param driveId
 * @returns
 */
export const updateDrive = async (driveId: string, data: any) => {
  const response = await api.put<IResult>(`/api/drive/${driveId}`, data);
  return response.data;
};

/**
 * 云盘添加
 * @param token
 * @returns
 */
export const addDrive = async (data: any) => {
  const response = await api.post<IResult>(`/api/drive`, data);
  return response.data;
};

/**
 * 云盘删除
 * @param driveId
 * @returns
 */
export const deleteDrive = async (driveId: string) => {
  const response = await api.delete<IResult>(`/api/drive/${driveId}`);
  return response.data;
};

/**
 * 本地路径列表
 * @param driveId
 * @returns
 */
export const getPaths = async (path: string = "") => {
  const response = await api.post<IResult<ITreeNode[]>>(`/api/drive/paths`, {
    path: path,
  });
  return response.data;
};
