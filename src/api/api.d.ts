import { Key } from "react";

export interface IDrive {
  id: string;
  name: string;
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  metadata: IDriveMetadata;
  jobs: IDriveJob[];

  // 前台字段
  expandedRowKeys?: Key[];
}

export interface IDriveJob {
  id: string;
  name: string;
  description: string;
  state: JobState;
  mode: number;
  schedules: string[];
  filters: string[];
  sources: string[];
  target: string;
  restore: string;
  rapidUpload: boolean;
  defaultDrive: string;
  checkAlgorithm: string;
  checkLevel: number;
  fileWatcher: boolean;
  order: number;
  isTemporary: boolean;
  isRecycleBin: boolean;
  uploadThread: number;
  downloadThread: number;
  metadata: IJobMetadata;
}

export interface IJobMetadata {
  fileCount: number;
  folderCount: number;
  totalSize: number;
}

export interface IDriveMetadata {
  usedSize: number;
  totalSize: number;
  identity: string;
  level: string;
  expire: Date;
}

export interface IDriveFile {

  drive_id: string;
  file_id: string;
  parent_file_id: string;
  name: string;
  file_name: null;
  size: number;
  file_extension: string;
  content_hash: string;
  content_hash_name: string;
  category: string;
  type: string;
  isFile: boolean;
  isFolder: boolean;
  url: string;
  created_at: Date;
  updated_at: Date;
  mime_type: string;
  status: string;

  // 路径 key
  key?: string;
  downLoading?: boolean;
}

export interface IDriveDownloadFile {
  url: string;
  expiration: string;
  method: string;
}