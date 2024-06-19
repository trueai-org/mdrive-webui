import { Key } from "react";

export interface IDrive {
  id: string;
  name: string;
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  metadata: IDriveMetadata;
  mountConfig: IDriveMountConfig;
  jobs: IDriveJob[];

  isMount?: boolean;

  // 前台字段

  mountReadOnly?: boolean;
  mountDrive?: string;
  isRecycleBin?: string;
  mountPath?: string;
  mountOnStartup?: boolean;
  mountPoint?: string;
  rapidUpload?: boolean;

  expandedRowKeys?: Key[];
}

export interface ILocalStorageConfig {
  id: string;
  name: string;
  jobs: IDriveJob[];

  expandedRowKeys?: Key[];
}

export interface LocalStorageEditRequest{
  name: string;
}

export interface IDriveMountConfig {
  mountReadOnly?: boolean;
  mountDrive?: string;
  isRecycleBin?: string;
  mountPath?: string;
  mountOnStartup?: boolean;
  mountPoint?: string;
  rapidUpload?: boolean;
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
  checkAlgorithm: string;
  checkLevel: number;
  fileWatcher: boolean;
  order: number;
  isTemporary: boolean;
  isRecycleBin: boolean;
  uploadThread: number;
  downloadThread: number;
  metadata?: IJobMetadata;
  isEncrypt?: boolean;
  isEncryptName?: boolean;
  hashAlgorithm: string;
  encryptAlgorithm: string;
  encryptKey: string;
  compressAlgorithm: string;
  
  // 阿里云盘专属
  isMount?: boolean;
  mountConfig?: IDriveMountConfig;
  defaultDrive?: string;
  rapidUpload?: boolean;

  // 前台展示
  mountReadOnly?: boolean;
  mountOnStartup?: boolean;
  mountPoint?: string;

  // 是否为阿里云存储，否则为本地存储
  isAliyunDrive?: boolean;  
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
  localFileName?: string;

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

export interface DownloadManagerSetting {
  defaultDownload: string;
  maxParallelDownload: number;
  downloadSpeedLimit: number;
}

export enum DownloadStatus {
  Pending = 0,
  Downloading = 1,
  Paused = 2,
  Completed = 3,
  Failed = 4,
}

export interface DownloadTask {
  id: string;
  url: string;
  status: DownloadStatus;
  statusString: string;
  fileName: string;
  speedString: string;
  selected?: boolean;
  error?: string;
  isEncrypted: boolean;
  durationString: string;
  durationSeconds: number;

  isLocalFile?: boolean;
  totalBytes: number;
  downloadedBytes: number;
  filePath?: string;
}


/**
 * 本地存储文件基本信息
 */
export interface ILocalStorageFileInfo {
  /** 相对路径 key {xxx}/{xxx}.xx */
  key: string;
  /** 包含文件名的完整路径 */
  fullName: string;
  /** 文件/文件夹的父级文件夹完整路径 */
  parentFullName: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节数） */
  length: number;
  /** 获取或设置文件的创建时间 */
  creationTime: Date;
  /** 获取或设置上次写入文件的时间 */
  lastWriteTime: Date;
  /** 文件 Hash 值（本地文件 hash），说明：扫描本地文件时，不计算 Hash 值，只有在同步时才计算 */
  hash: string;
  /** 是否为文件 */
  isFile: boolean;
  /** 是否隐藏 */
  isHidden: boolean;
  /** 是否只读 */
  isReadOnly: boolean;
  /** 是否存在 */
  isExists: boolean;
}

/**
* 本地存储目标文件信息
*/
export interface ILocalStorageTargetFileInfo extends ILocalStorageFileInfo {
  /** 本地文件原始 Hash（未加密前） */
  localFileHash?: string;
  /** 本地文件原始名称（未加密前的），格式：1.txt */
  localFileName?: string;
  /** 本地文件的 Key */
  localFileKey?: string;
}
