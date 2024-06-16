// 本地存储相关接口

import axios from "axios";
import {
  IDriveJob,
  ILocalStorageConfig,
  IResult,
  LocalStorageEditRequest,
} from "./model";

// 创建 axios 实例
const api = axios.create({});

/**
 * 获取所有工作组配置
 * @returns 工作组配置数组
 */
export const getStorages = async (): Promise<
  IResult<ILocalStorageConfig[]>
> => {
  const response = await api.get<IResult<ILocalStorageConfig[]>>(
    "/api/local/storages"
  );
  return response.data;
};

/**
 * 获取所有工作组的作业
 * @returns 工作组作业数组
 */
export const getLocalJobs = async (): Promise<IResult<IDriveJob[]>> => {
  const response = await api.get<IResult<IDriveJob[]>>("/api/local/jobs");
  return response.data;
};

/**
 * 添加工作组
 * @param cfg 工作组配置
 * @returns 结果
 */
export const addStorage = async (
  cfg: LocalStorageEditRequest
): Promise<IResult> => {
  const response = await api.post<IResult>("/api/local", cfg);
  return response.data;
};

/**
 * 编辑工作组
 * @param storageId 工作组 ID
 * @param cfg 工作组配置
 * @returns 结果
 */
export const editStorage = async (
  storageId: string,
  cfg: LocalStorageEditRequest
): Promise<IResult> => {
  const response = await api.put<IResult>(`/api/local/${storageId}`, cfg);
  return response.data;
};

/**
 * 删除工作组
 * @param storageId 工作组 ID
 * @returns 结果
 */
export const deleteStorage = async (storageId: string): Promise<IResult> => {
  const response = await api.delete<IResult>(`/api/local/${storageId}`);
  return response.data;
};

/**
 * 更新作业配置
 * @param cfg 作业配置
 * @returns 结果
 */
export const updateJob = async (cfg: IDriveJob): Promise<IResult> => {
  const response = await api.put<IResult>("/api/local/job", cfg);
  return response.data;
};

/**
 * 添加作业
 * @param storageId 工作组 ID
 * @param cfg 作业配置
 * @returns 结果
 */
export const addJob = async (
  storageId: string,
  cfg: IDriveJob
): Promise<IResult> => {
  const response = await api.post<IResult>(`/api/local/job/${storageId}`, cfg);
  return response.data;
};

/**
 * 修改作业状态
 * @param jobId 作业 ID
 * @param state 新状态
 * @returns 结果
 */
export const changeLocalJobState = async (
  jobId: string,
  state: any
): Promise<IResult> => {
  const response = await api.put<IResult>(`/api/local/job/${jobId}/${state}`);
  return response.data;
};
