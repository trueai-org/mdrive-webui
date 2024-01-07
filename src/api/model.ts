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
  restore?: string;
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
  metadata?: IJobMetadata;
}

export interface IJobMetadata {
  fileCount: number;
  folderCount: number;
  totalSize: number;
  message?: string;
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

export interface IResult<T = any> {
  code: number;
  message?: string;
  data?: T;
  success?: boolean;
  timestamp?: string;
}

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
  Deleted = 101,
  Continue = 102,
}

/**
 * 类似于 ExtJS treenode 的类，用于 JSON 导出
 */
export interface ITreeNode {
  /**
   * 节点显示的文本
   */
  text: string;

  /**
   * 节点的 ID
   */
  id: string;

  /**
   * 应用于节点的类
   */
  cls: string;

  /**
   * 应用于图标的类
   */
  iconCls: string;

  /**
   * 如果元素应该被选中则为 true
   */
  check: boolean;

  /**
   * 如果元素是叶节点则为 true
   */
  leaf: boolean;

  /**
   * 获取或设置当前路径，如果该项是一个符号路径
   */
  resolvedpath: string;

  /**
   * 如果元素被隐藏则为 true
   */
  hidden: boolean;

  /**
   * 如果元素是一个符号链接则为 true
   */
  symlink: boolean;
}
