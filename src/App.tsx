import { useEffect, useRef, useState } from "react";
import React from "react";
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  Modal,
  Switch,
  Table,
  Tag,
  Tooltip,
  Tour,
  TourProps,
  message,
} from "antd";
import {
  ProCard,
  ProLayout,
  ProList,
  ProSettings,
} from "@ant-design/pro-components";
import {
  RollbackOutlined,
  ReloadOutlined,
  EditOutlined,
  HomeOutlined,
  FolderOutlined,
  FileZipTwoTone,
  AudioTwoTone,
  FileTextOutlined,
  VideoCameraTwoTone,
  FileImageTwoTone,
  FileOutlined,
  DownloadOutlined,
  LockTwoTone,
  DesktopOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { ColumnsType } from "antd/es/table";
import { MenuInfo } from "rc-menu/lib/interface";
import { Select } from "antd/lib";
import { useQuery } from "@tanstack/react-query";

import {
  addDownloadTask,
  addDownloadTasks,
  getDownloadFileV3,
  getDownloadSettings,
  getDriveFiles,
  getDrives,
  getFile,
  getJobs,
  updateJobState,
} from "./api";

import {
  IDrive,
  IDriveFile,
  IDriveJob,
  ILocalStorageConfig,
  JobState,
} from "./api/model";
import { formatFileSize, getJobStateTag } from "./utils";
import OAuthComponent from "./components/OAuthComponent";
import JobEditModal from "./components/JobEditModal";
import defaultProps from "./_defaultProps";

import "./App.css";

import DownloadManager from "./components/DownloadManager";
import { getStorages } from "./api/local";
import OAuthComponentLocal from "./components/OAuthComponentLocal";

// 下载状态类型
type DownloadingState = {
  [fileId: string]: boolean;
};

function App() {
  const [pathname, setPathname] = useState("/");
  // const [showAbout, setShowAbout] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  // 支持
  const [showSupport, setShowSupport] = useState(false);

  // const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [drives, setDrives] = useState<IDrive[]>();
  const [job, setJob] = useState<IDriveJob>();
  const [files, setFiles] = useState<IDriveFile[]>();
  const [currentFile, setCurrentFile] = useState<IDriveFile>();
  const [rootFileId, setRootFileId] = useState<string>();

  // 使用状态来追踪每个文件的下载状态
  const [downloading, setDownloading] = useState<DownloadingState>({});

  // 更新下载状态的函数
  const handleDownload = (fileId: string) => {
    if (!job) {
      return;
    }

    setDownloading((prev) => ({ ...prev, [fileId]: true }));
    getDownloadFileV3(job.id, fileId).then((c) => {
      // 下载完成后更新状态
      setDownloading((prev) => ({ ...prev, [fileId]: false }));
      if (c.data && c.data.url) {
        // 打开下载管理器弹窗
        // 弹窗中确认下载、取消按钮
        // url: string; downloadPath: string; fileName: string; fileId: string; jobId: string;
        // UI 设计请参考 FDM 下载管理器

        // 更新下载信息状态
        setDownloadInfo({
          url: c.data.url,
          downloadPath: c.data.downloadPath,
          fileName: c.data.fileName,
          fileId: c.data.fileId,
          jobId: c.data.jobId,
        });
        // 显示下载弹窗
        setDownloadModalVisible(true);
      }
    });
  };

  const addDownloadSelectedTasks = async () => {
    if (!job) {
      return;
    }

    getDownloadSettings().then((res) => {
      if (res.data) {
        // 更新下载信息状态
        setDownloadInfo({
          downloadPath: res.data.defaultDownload,
          fileIds: selectedRowKeys.map((x) => x.toString()),
          jobId: job.id,
        });

        // 显示下载弹窗
        setDownloadModalVisible(true);
      }
    });
  };

  // 弹窗显示状态及下载文件信息
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{
    downloadPath: string;
    jobId: string;
    url?: string;
    fileName?: string;
    fileId?: string;
    fileIds?: string[];
  }>({
    url: "",
    downloadPath: "",
    fileName: "",
    fileId: "",
    jobId: "",
  });

  const [downloadTaskLoading, setDownloadTaskLoading] = useState<boolean>();

  const addTask = async () => {
    try {
      setDownloadTaskLoading(true);

      if (downloadInfo && downloadInfo.fileId) {
        // 单文件下载
        addDownloadTask({
          url: downloadInfo.url,
          filePath: downloadInfo.downloadPath,
          fileName: downloadInfo.fileName,
          jobId: downloadInfo.jobId,
          fileId: downloadInfo.fileId,
        })
          .then(() => {
            // console.log("r", r);
            setDownloadTaskLoading(false);
            setDownloadModalVisible(false);
            message.success("下载任务创建成功!");
          })
          .finally(() => {
            setDownloadTaskLoading(false);
          });
      } else {
        // 批量下载
        addDownloadTasks({
          jobId: downloadInfo.jobId,
          fileIds: selectedRowKeys.map((x) => x.toString()),
          filePath: downloadInfo.downloadPath,
        })
          .then(() => {
            setDownloadTaskLoading(false);
            setDownloadModalVisible(false);
            message.success("批量下载任务创建成功!");

            // 清除全选
            setSelectedRowKeys([]);
          })
          .finally(() => {
            setDownloadTaskLoading(false);
          });
      }
    } catch (error) {
      message.error("下载任务创建失败，请检查日志!");
      setDownloadTaskLoading(false);
    }
  };

  // 渲染下载确认弹窗，使用 Tailwind CSS 进行样式设计
  const renderDownloadModal = () => (
    <Modal
      title={
        downloadInfo.fileIds && downloadInfo.fileIds.length > 0
          ? "批量下载文件"
          : "下载文件"
      }
      open={downloadModalVisible}
      onCancel={() => setDownloadModalVisible(false)}
      maskClosable={false}
      footer={[
        <Button key="back" onClick={() => setDownloadModalVisible(false)}>
          取消
        </Button>,
        <Button
          loading={downloadTaskLoading}
          key="submit"
          type="primary"
          onClick={() => addTask()}
        >
          确认下载
        </Button>,
      ]}
      width={800}
    >
      <div className="space-y-4 py-6 pr-6">
        {downloadInfo && downloadInfo.fileId && (
          <div className="flex items-center">
            <span className="text-gray-700 w-1/6 text-right mr-4">
              下载链接:
            </span>
            <Input className="flex-grow" value={downloadInfo.url} disabled />
          </div>
        )}

        <div className="flex items-center">
          <span className="text-gray-700 w-1/6 text-right mr-4">保存位置:</span>
          <Input
            className="flex-grow"
            value={downloadInfo.downloadPath}
            onChange={(e) =>
              setDownloadInfo({ ...downloadInfo, downloadPath: e.target.value })
            }
          />
        </div>

        {downloadInfo && downloadInfo.fileName && (
          <div className="flex items-center">
            <span className="text-gray-700 w-1/6 text-right mr-4">
              文件名称:
            </span>
            <Input
              className="flex-grow"
              value={downloadInfo.fileName}
              onChange={(e) =>
                setDownloadInfo({ ...downloadInfo, fileName: e.target.value })
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );

  const fixedColumns: ColumnsType<IDriveFile> = [
    {
      title: "名称",
      dataIndex: "name",
      fixed: "left",
      render: (_, r) => {
        // 如果是加密文件，增加追加显示锁图标
        const icon = job && job.isEncrypt && (
          <LockTwoTone twoToneColor="#eb2f96" style={{ marginRight: 4 }} />
        );

        if (r.category == "image") {
          return (
            <Tooltip placement="left" title={r.name}>
              <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
                {icon}
                <FileImageTwoTone />
                <span>{r.localFileName || r.name}</span>
              </div>
            </Tooltip>
          );
        } else if (r.category == "video") {
          return (
            <Tooltip placement="left" title={r.name}>
              <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
                {icon}
                <VideoCameraTwoTone />
                <span>{r.localFileName || r.name}</span>
              </div>
            </Tooltip>
          );
        } else if (r.category == "doc") {
          return (
            <Tooltip placement="left" title={r.name}>
              <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
                {icon}
                <FileTextOutlined />
                <span>{r.localFileName || r.name}</span>
              </div>
            </Tooltip>
          );
        } else if (r.category == "audio") {
          return (
            <Tooltip placement="left" title={r.name}>
              <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
                {icon}
                <AudioTwoTone />
                <span>{r.localFileName || r.name}</span>
              </div>
            </Tooltip>
          );
        } else if (r.category == "zip") {
          return (
            <Tooltip placement="left" title={r.name}>
              <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
                {icon}
                <FileZipTwoTone />
                <span>{r.localFileName || r.name}</span>
              </div>
            </Tooltip>
          );
        } else if (r.category == "app") {
          return (
            <Tooltip placement="left" title={r.name}>
              <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
                {icon}
                <FileOutlined />
                <span>{r.localFileName || r.name}</span>
              </div>
            </Tooltip>
          );
        } else if (r.isFolder) {
          return (
            <div
              onClick={() => {
                onSelectFolder(r);
              }}
              className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500"
            >
              {icon}
              <FolderOutlined />
              <span>{r.name}</span>
            </div>
          );
        }

        return (
          <Tooltip placement="left" title={r.name}>
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              {icon}
              <span>{r.localFileName || r.name}</span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "大小",
      dataIndex: "size",
      width: 120,
      fixed: "left",
      align: "right",
      render: (text) => <span>{text ? formatFileSize(text) : "-"}</span>,
    },
    {
      title: "修改时间",
      dataIndex: "updated_at",
      width: 160,
      align: "right",
      render: (text) => (text ? format(text, "yyyy-MM-dd hh:mm:ss") : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 80,
      align: "center",
      render: (_, r) => {
        if (r.isFile) {
          return (
            <Button
              type="primary"
              ghost
              size="small"
              icon={<DownloadOutlined />}
              loading={downloading[r.file_id] || false}
              disabled={downloading[r.file_id] || false}
              onClick={() => {
                handleDownload(r.file_id);

                // window.open(`/api/drive/download-v2/${job!.id}/${r.file_id}`);
                // return;

                // // r.downLoading = true;
                // getDownloadFile(job!.id, r.file_id).then((c) => {
                //   // r.downLoading = false;
                //   // window.open(c.url);

                //   const fileUrl = encodeURIComponent(c.url);
                //   const name = encodeURIComponent(r.name);
                //   window.open(
                //     `/api/drive/download?url=${fileUrl}&name=${name}`
                //   );

                //   // const link = document.createElement("a");
                //   // link.target = "_blank";
                //   // link.href = c.url;
                //   // link.download = r.name;
                //   // document.body.appendChild(link);
                //   // link.click();
                //   // document.body.removeChild(link);
                // });

                // r.downLoading = true;
                // getDownloadFileV3(job!.id, r.file_id).then((c) => {
                //   r.downLoading = false;

                //   // 打开弹窗
                //   // window.open(c.url);
                //   // const fileUrl = encodeURIComponent(c.url);
                //   // const name = encodeURIComponent(r.name);
                //   // window.open(
                //   //   `/api/drive/download?url=${fileUrl}&name=${name}`
                //   // );
                //   // const link = document.createElement("a");
                //   // link.target = "_blank";
                //   // link.href = c.url;
                //   // link.download = r.name;
                //   // document.body.appendChild(link);
                //   // link.click();
                //   // document.body.removeChild(link);
                // });
              }}
            ></Button>
          );
        }
        return "-";
      },
    },
  ];

  const tblRef: Parameters<typeof Table>[0]["ref"] = React.useRef(null);
  const data = React.useMemo(() => files, [files]);
  const onJobMenu = (e: MenuInfo, jobId: string) => {
    setLoading(true);
    updateJobState(jobId, e.key)
      .then((res) => {
        if (res?.success) {
          message.success("操作成功");
          loadDrives();
        } else {
          message.error(res?.message || "操作失败");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const menuItems: MenuProps["items"] = [
    {
      key: JobState.Continue,
      label: "继续",
    },
    {
      key: JobState.Initializing,
      label: "初始化",
    },
    {
      key: JobState.BackingUp,
      label: "执行",
    },
    {
      key: JobState.Paused,
      label: "暂停",
    },
    {
      key: JobState.Disabled,
      label: "禁用",
    },
    {
      key: JobState.None,
      label: "启用",
    },
    {
      key: JobState.Cancelled,
      label: "取消",
    },
    {
      key: JobState.Deleted,
      label: "删除",
    },
  ];
  const getMenuItems = (stateValue: JobState) => {
    switch (stateValue) {
      case JobState.None:
        return menuItems.filter((x) => x?.key == JobState.Initializing);
      case JobState.Initializing:
        return [];
      case JobState.Idle:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted
        );
      case JobState.Starting:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Scanning:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.BackingUp:
        return menuItems.filter(
          (x) => x?.key == JobState.Paused || x?.key == JobState.Cancelled
        );
      case JobState.Restoring:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Verifying:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Queued:
        return menuItems.filter((x) => x?.key == JobState.Cancelled);
      case JobState.Completed:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted
        );
      case JobState.Paused:
        return menuItems.filter(
          (x) => x?.key == JobState.Continue || x?.key == JobState.Cancelled
        );
      case JobState.Error:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted ||
            x?.key == JobState.Initializing
        );
      case JobState.Cancelling:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Cancelled:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted ||
            x?.key == JobState.Initializing
        );
      case JobState.Disabled:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.None ||
            x?.key == JobState.Deleted ||
            x?.key == JobState.Initializing
        );
      default:
        return [];
    }
    return [];
  };

  const currentInfo = React.useMemo(() => {
    return `包含 ${files?.filter((x) => x.isFile).length || 0} 个文件，${
      files?.filter((x) => x.isFolder).length || 0
    } 个文件夹，总大小 ${formatFileSize(
      files?.filter((x) => x.isFile).reduce((c, d) => c + d.size, 0) || 0
    )}`;
  }, [files]);

  const currentPathInfo = React.useMemo(() => {
    if (!job) {
      return "/";
    }
    if (currentFile) {
      return currentFile.key;
    }
    return job?.target + "/";
  }, [job, currentFile]);

  useEffect(() => {
    loadDrives();
    loadLocalStorages();
  }, []);

  // 加载阿里云盘
  const loadDrives = () => {
    setLoading(true);
    getDrives().then((c) => {
      setDrives(c || []);
      setLoading(false);
    });
  };

  // 加载本地存储
  const [localStorages, setLocalStorages] = useState<ILocalStorageConfig[]>();
  const loadLocalStorages = () => {
    setLoading(true);
    getStorages().then((c) => {
      setLocalStorages(c.data || []);
      setLoading(false);
    });
  };

  /**
   * 加载文件
   * @param jobId
   * @param parentId
   */
  const loadFiles = (jobId: string, parentId?: string) => {
    setTableLoading(true);
    getDriveFiles(jobId, parentId)
      .then((c) => {
        setFiles(c);

        // 如果没有父级时，说明查询的是根目录
        if (!parentId && c && c.length > 0) {
          getFile(jobId, c[0].parent_file_id).then((x) => {
            setCurrentFile(x);
            setRootFileId(x.file_id);
          });
        }
      })
      .finally(() => setTableLoading(false));
  };

  /**
   * 选择作业
   * @param j
   */
  const onSelectJob = (j: IDriveJob) => {
    // 非禁用、删除
    if (j.state != JobState.Disabled && j.state != JobState.Initializing) {
      setJob(j);
      loadFiles(j.id);
    }
  };

  /**
   * 选择文件夹
   */
  const onSelectFolder = (f: IDriveFile) => {
    setTableLoading(true);
    getFile(job!.id, f.file_id)
      .then((c) => {
        setCurrentFile(c);
        loadFiles(job!.id, c.file_id);
      })
      .finally(() => setTableLoading(false));
  };

  /**
   * 返回上一级
   * @param fid
   */
  const onSelectParentFolder = () => {
    if (currentFile) {
      setTableLoading(true);
      getFile(job!.id, currentFile.parent_file_id).then((c) => {
        setCurrentFile(c);
        loadFiles(job!.id, c.file_id);
      });
    }
  };
  /**
   * 返回根目录
   * @param fid
   */
  const onSelectRootFolder = () => {
    if (job) {
      onSelectJob(job!);
    }
  };

  // 显示编辑
  const [visibleEditJob, setVisibleEditJob] = useState(false);
  // 当前编辑的作业
  const [currentEditJob, setCurrentEditJob] = useState<IDriveJob | null>(null);
  // 当前编辑的云盘 ID
  const [currentDriveId, setCurrentDriveId] = useState<string>();

  /**
   * 作业编辑
   * @param job
   */
  const onJobEdit = (job: IDriveJob) => {
    setCurrentEditJob(job);
    setVisibleEditJob(true);
  };

  /**
   * 作业添加
   * @param job
   */
  const onJobAdd = (driveId: string) => {
    setCurrentDriveId(driveId);
    setCurrentEditJob({
      id: "",
      name: "",
      description: "",
      state: JobState.None,
      mode: 0,
      rapidUpload: true,
      checkLevel: 1,
      checkAlgorithm: "sha256",
      order: 0,
      isTemporary: false,
      isRecycleBin: true,
      uploadThread: 0,
      downloadThread: 0,
      schedules: [],
      filters: [],
      fileWatcher: true,
      defaultDrive: "backup",
      target: "",
      sources: [],
      isEncrypt: false,
      isEncryptName: false,
      hashAlgorithm: "SHA256",
      encryptAlgorithm: "AES256-GCM",
      encryptKey: "",
      compressAlgorithm: "Zstd",
    });
    setVisibleEditJob(true);
  };

  /**
   * 作业保存
   * @param value
   */
  const onJobSave = () => {
    setVisibleEditJob(false);
    loadDrives();

    // if (value) {
    //   if (value.id) {
    //     // 编辑
    //     updateJob(value).then((res) => {
    //       if (res?.success) {
    //         message.success("操作成功");
    //         setVisibleEditJob(false);
    //         loadDrives();
    //       } else {
    //         message.error(res?.message || "操作失败");
    //       }
    //     });
    //   } else {
    //     // 新增
    //     addJob(currentDriveId!, value).then((res) => {
    //       if (res?.success) {
    //         message.success("操作成功");
    //         setVisibleEditJob(false);
    //         loadDrives();
    //       } else {
    //         message.error(res?.message || "操作失败");
    //       }
    //     });
    //   }
    // }
  };

  /**
   * 作业编辑取消
   */
  const onJobSaveCancel = () => {
    setVisibleEditJob(false);
  };

  const colors = [
    {
      label: "天蓝",
      value: "#1677FF",
    },
    {
      label: "拂晓",
      value: "#1890ff",
    },
    {
      label: "薄暮",
      value: "#F5222D",
    },
    {
      label: "火山",
      value: "#FA541C",
    },
    {
      label: "日暮",
      value: "#FAAD14",
    },
    {
      label: "明青",
      value: "#13C2C2",
    },
    {
      label: "草绿",
      value: "#52C41A",
    },
    {
      label: "深蓝",
      value: "#2F54EB",
    },
    {
      label: "酱紫",
      value: "#722ED1",
    },
  ];

  const [settings, setSetting] = useState<Partial<ProSettings> | undefined>(
    () => {
      if (localStorage.getItem("theme")) {
        return JSON.parse(localStorage.getItem("theme")!) as ProSettings;
      }
      return {
        fixSiderbar: true,
        layout: "mix",
        splitMenus: true,
      };
    }
  );

  // 引导
  const welRef1 = useRef(null);
  const welRef2 = useRef(null);
  const [welcomOpen, setWelcomOpen] = useState<boolean>(false);
  const welcomSteps: TourProps["steps"] = [
    {
      title: "欢迎使用 MDrive 阿里云盘数据同步工具",
      description: "在这里添加授权、管理授权，添加作业，管理作业等操作。",
      target: () => welRef1.current,
    },
    {
      title: "在这里可以查看或管理云盘文件",
      description: "点击文件夹可以进入文件夹，点击文件可以下载。",
      target: () => welRef2.current,
    },
  ];

  // 检查作业状态
  const { data: dataJobStates, refetch } = useQuery({
    queryKey: [`jobs`],
    queryFn: async () => {
      const res = await getJobs();
      return res.data;
    },
    staleTime: 60 * 1000, // 60s 缓存
    refetchInterval: 1 * 1000, // 1 秒查询一次
  });
  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (dataJobStates && drives) {
      // 创建 drives 的深拷贝
      const newDrives = drives.map((drive) => ({
        ...drive,
        jobs: drive.jobs.map((job) => {
          // const updatedJob = dataJobStates.find((d) => d.id === job.id);
          // return updatedJob ? { ...job, state: updatedJob.state } : job;

          const updatedJob = dataJobStates.find((d) => d.id === job.id);
          if (updatedJob) {
            // 这里更新多个字段
            return {
              ...job,
              state: updatedJob.state,
              metadata: updatedJob.metadata,
              isMount: updatedJob.isMount,
            };
          }
          return job;
        }),
      }));

      // 使用新的 drives 数组来更新状态
      setDrives(newDrives);
    }

    // 只有状态变化时，检查更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataJobStates]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  return (
    // <ConfigProvider
    //   theme={{
    //     token: {
    //       // colorPrimary: primary,
    //       // // Seed Token，影响范围大
    //       // colorPrimary: "#00b96b",
    //       // borderRadius: 2,
    //       // // 派生变量，影响范围小
    //       // colorBgContainer: "#f6ffed",
    //     },

    //     //  // 1. 单独使用暗色算法
    //     //  algorithm: theme.darkAlgorithm,
    //   }}
    // >
    <ProLayout
      title="MDrive"
      // style={{
      //   paddingInline: "12px"
      //   // height: "100vh",
      //   // overflow: 'auto',
      // }}
      logo={<img src="/logo.png" style={{ width: 24, height: 24 }} />}
      {...defaultProps}
      {...settings}
      location={{
        pathname,
      }}
      footerRender={() => {
        return (
          <div className="text-center text-gray-400">
            Power by{" "}
            <a target="_blank" href="https://github.com/trueai-org/mdrive">
              MDrive
            </a>{" "}
            v3.0.0 |{" "}
            <a
              target="_blank"
              href="https://github.com/trueai-org/mdrive-webui"
            >
              WebUI
            </a>{" "}
            |{" "}
            <a target="_blank" href="https://github.com/trueai-org/mdrive">
              官网
            </a>{" "}
            |{" "}
            <a target="_blank" href="https://duplicati.net">
              Duplicati
            </a>
          </div>
        );
      }}
      // onMenuHeaderClick={(e) => console.log("e", e)}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            setPathname(item.path || "/");
            if (item.path == "/welcome") {
              setWelcomOpen(true);
            }
            if (item.path == "/setting") {
              setShowSetting(true);
            }
            if (item.path == "/support") {
              setShowSupport(true);
            }
            // if (item.path == "/about") {
            //   setShowAbout(true);
            // }
            if (item.path?.startsWith("http")) {
              window.open(item.path);
            }
          }}
        >
          {dom}
        </a>
      )}
      layout="top"
      loading={loading}
    >
      {/* <SettingDrawer
        pathname={pathname}
        enableDarkTheme
        settings={settings}
        onSettingChange={(changeSetting) => {
          setSetting(changeSetting);
        }}
        disableUrlParams={false}
      /> */}

      <ProCard split="vertical" style={{ minHeight: 520 }}>
        <ProCard
          bodyStyle={{ margin: 0, padding: 0 }}
          headerBordered
          title={<div className="font-bold">存储和作业</div>}
          colSpan={"432px"}
          ref={welRef1}
          extra={<OAuthComponent isAdd onOk={loadDrives} />}
        >
          {drives &&
            drives?.map((c, i) => {
              return (
                <ProList<{
                  job: IDriveJob;
                  title: string;
                }>
                  rowKey={c.id + i}
                  key={i}
                  style={{
                    borderBlockEnd: "1px solid rgba(211, 167, 255, 0.17)",
                  }}
                  headerTitle={
                    <div className="text-base whitespace-nowrap flex items-center">
                      <CloudOutlined className="mr-2" />
                      <span className="mr-2"> {c.name || "未命名云盘"} </span>
                      {c.metadata && c.metadata?.identity && (
                        <Tag className="uppercase" color="pink">
                          {c.metadata.identity}
                        </Tag>
                      )}

                      {c.metadata && c.metadata?.level && (
                        <Tag className="uppercase">{c.metadata.level}</Tag>
                      )}

                      {c.metadata &&
                        c.metadata.usedSize &&
                        c.metadata.totalSize && (
                          <span className="text-xs text-gray-500">
                            {formatFileSize(c.metadata.usedSize)} /{" "}
                            {formatFileSize(c.metadata.totalSize)}
                          </span>
                        )}
                    </div>
                  }
                  toolBarRender={() => {
                    return [
                      <OAuthComponent
                        drive={c}
                        onOk={loadDrives}
                        onJobAdd={() => onJobAdd(c.id)}
                      />,
                    ];
                  }}
                  // expandable={{
                  //   expandedRowKeys: c.expandedRowKeys,
                  //   onExpandedRowsChange: (e) => {
                  //     // c.expandedRowKeys = [
                  //     //   c.jobs.findIndex((x) => x.name == k.title),
                  //     // ];
                  //     // console.log("e", c.expandedRowKeys, e);
                  //     //  c.expandedRowKeys = e;
                  //     setExpandedRowKeys(e);
                  //   },
                  // }}
                  dataSource={c.jobs.map((x) => {
                    return {
                      title: x.name,
                      job: x,
                    };
                  })}
                  onRow={(r) => {
                    return {
                      onClick: () => {
                        onSelectJob(r.job);
                      },
                    };
                  }}
                  metas={{
                    title: {},
                    subTitle: {
                      render: (_, row) => {
                        return (
                          <>
                            {getJobStateTag(row.job.state)}
                            {row.job.isEncrypt && (
                              <LockTwoTone twoToneColor="#eb2f96" />
                            )}
                          </>
                        );
                      },
                    },
                    description: {
                      render: (_, row) => {
                        return (
                          <>
                            <div className="text-xs">
                              包含 {row.job?.metadata?.fileCount || 0} 个文件，
                              {row.job?.metadata?.folderCount || 0}{" "}
                              个文件夹，总大小{" "}
                              {formatFileSize(
                                row.job?.metadata?.totalSize || 0
                              )}
                            </div>

                            {row.job?.metadata?.message && (
                              <div className="text-xs">
                                {row.job!.metadata!.message}
                              </div>
                            )}
                          </>
                        );
                      },
                    },
                    actions: {
                      render: (_, r) => {
                        return (
                          <Dropdown.Button
                            size="small"
                            menu={{
                              items: getMenuItems(r.job.state),
                              onClick: (e) => {
                                onJobMenu(e, r.job.id);
                              },
                            }}
                            onClick={() => onJobEdit(r.job)}
                          >
                            <EditOutlined />
                          </Dropdown.Button>
                        );
                      },
                    },
                  }}
                />
              );
            })}

          {/* 本地存储 */}
          {localStorages &&
            localStorages.length > 0 &&
            localStorages?.map((c, i) => {
              return (
                <ProList<{
                  job: IDriveJob;
                  title: string;
                }>
                  rowKey={c.id + i}
                  key={i}
                  style={{
                    borderBlockEnd: "1px solid rgba(211, 167, 255, 0.17)",
                  }}
                  headerTitle={
                    <div className="text-base whitespace-nowrap flex items-center">
                      <DesktopOutlined className="mr-2" />
                      <span className="mr-2"> {c.name || "未命工作组"} </span>
                    </div>
                  }
                  toolBarRender={() => {
                    return [
                      <OAuthComponentLocal
                        config={c}
                        onOk={loadLocalStorages}
                        onJobAdd={() => onJobAdd(c.id)}
                      />,
                    ];
                  }}
                  // expandable={{
                  //   expandedRowKeys: c.expandedRowKeys,
                  //   onExpandedRowsChange: (e) => {
                  //     // c.expandedRowKeys = [
                  //     //   c.jobs.findIndex((x) => x.name == k.title),
                  //     // ];
                  //     // console.log("e", c.expandedRowKeys, e);
                  //     //  c.expandedRowKeys = e;
                  //     setExpandedRowKeys(e);
                  //   },
                  // }}
                  dataSource={c.jobs.map((x) => {
                    return {
                      title: x.name,
                      job: x,
                    };
                  })}
                  onRow={(r) => {
                    return {
                      onClick: () => {
                        onSelectJob(r.job);
                      },
                    };
                  }}
                  metas={{
                    title: {},
                    subTitle: {
                      render: (_, row) => {
                        return (
                          <>
                            {getJobStateTag(row.job.state)}
                            {row.job.isEncrypt && (
                              <LockTwoTone twoToneColor="#eb2f96" />
                            )}
                          </>
                        );
                      },
                    },
                    description: {
                      render: (_, row) => {
                        return (
                          <>
                            <div className="text-xs">
                              包含 {row.job?.metadata?.fileCount || 0} 个文件，
                              {row.job?.metadata?.folderCount || 0}{" "}
                              个文件夹，总大小{" "}
                              {formatFileSize(
                                row.job?.metadata?.totalSize || 0
                              )}
                            </div>

                            {row.job?.metadata?.message && (
                              <div className="text-xs">
                                {row.job!.metadata!.message}
                              </div>
                            )}
                          </>
                        );
                      },
                    },
                    actions: {
                      render: (_, r) => {
                        return (
                          <Dropdown.Button
                            size="small"
                            menu={{
                              items: getMenuItems(r.job.state),
                              onClick: (e) => {
                                onJobMenu(e, r.job.id);
                              },
                            }}
                            onClick={() => onJobEdit(r.job)}
                          >
                            <EditOutlined />
                          </Dropdown.Button>
                        );
                      },
                    },
                  }}
                />
              );
            })}
        </ProCard>
        <ProCard
          bodyStyle={{ margin: 0, padding: 0 }}
          headerBordered
          title={<div className="font-bold mr-6">文件管理</div>}
          ref={welRef2}
          extra={<DownloadManager />}
        >
          <div className="flex px-6 py-4 flex-col w-full space-y-3 overflow-y-auto">
            <div className="flex flex-row space-x-2 items-center w-full">
              <Button
                onClick={() => onSelectRootFolder()}
                disabled={!job || rootFileId == currentFile?.file_id}
                icon={<HomeOutlined />}
              ></Button>
              <Button
                icon={<RollbackOutlined />}
                onClick={() => onSelectParentFolder()}
                disabled={!job || rootFileId == currentFile?.file_id}
              ></Button>
              <Input
                style={{ width: "100%" }}
                value={currentPathInfo}
                placeholder="文件夹"
              />
              <Button
                onClick={() => onSelectFolder(currentFile!)}
                disabled={!job}
                icon={<ReloadOutlined />}
              ></Button>
              {/* <Button icon={<CloudUploadOutlined />}></Button> */}
            </div>
            <Table
              virtual
              columns={fixedColumns}
              scroll={{ x: 400, y: 400 }}
              rowKey="file_id"
              dataSource={data || []}
              pagination={false}
              ref={tblRef}
              size="small"
              loading={tableLoading}
              rowSelection={{
                type: "checkbox",
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                columnWidth: 50,
              }}
            />

            <div className="flex flex-row items-center justify-between">
              {job && (
                <div className="text-xs text-gray-600">{currentInfo}</div>
              )}

              <div>
                <Button
                  type="primary"
                  ghost
                  icon={<DownloadOutlined />}
                  disabled={selectedRowKeys.length === 0}
                  onClick={addDownloadSelectedTasks}
                >
                  批量下载
                </Button>
              </div>
            </div>
            {/* <Input.TextArea
              className="bg-gray-50"
              rows={4}
              placeholder="日志"
              maxLength={6}
            /> */}
          </div>
        </ProCard>
      </ProCard>

      <JobEditModal
        visible={visibleEditJob}
        onOk={onJobSave}
        onCancel={onJobSaveCancel}
        jobConfig={currentEditJob!}
        currentDriveId={currentDriveId}
      />

      {/* <Modal
        title="关于"
        open={showAbout}
        width={760}
        footer={null}
        onCancel={() => setShowAbout(false)}
      >
        <div className="my-3">
          <div className="flex flex-col space-y-2">
            <div>
              多平台、模块化、安全的云盘同步工具备份，支持百度网盘、阿里云盘等，集成
              Duplicati、Kopia
              等多种模块，支持加密还原等，支持单向、镜像、双向等同步备份，完全免费开源。
            </div>
            <div>
              提供 Docker 版、Duplicati 版、Kopia 版、Windows 服务版、Windows
              版、手机版、网页版、Linux版、Mac 版等多平台版本。
            </div>
            <div>
              支持多种算法同步与备份，保证数据的安全性，任何第三方、任何云盘服务商都无法查看或分析你的数据，只有通过你本人设置的安全密钥才能解密数据，保证您的数据安全和隐私。
            </div>
            <div>
              更多文档：
              <a
                target="_blank"
                href="https://github.com/trueai-org/mdrive"
              >
                MDrive 官网
              </a>
            </div>
          </div>
        </div>
      </Modal> */}

      <Modal
        title="赞助与支持"
        open={showSupport}
        width={760}
        footer={null}
        onCancel={() => setShowSupport(false)}
      >
        <div className="my-3">
          <div className="flex flex-col space-y-2">
            <div>感谢所有的贡献者！</div>
            <div className="text-sm font-bold">
              如果您觉得本项目对您有帮助，欢迎收藏点赞，也可通过扫码购买会员，对作者提供支持！
            </div>
            <div>
              <span>
                👍👍阿里云盘推广返现，8T云盘低至6元/月，点击购买会员支持作者，最高30%返现🌸🌸
              </span>
              <a
                target="_blank"
                href="https://www.alipan.com/cpx/member?userCode=MzAwMzE5"
              >
                https://www.alipan.com/cpx/member?userCode=MzAwMzE5
              </a>
            </div>
            <div>限时推广返现，APP 扫码购买会员</div>
            <div>
              <img src="/images/aliyun.png" className="w-24"></img>
            </div>

            <div className="text-sm font-bold">
              微信返现客服：<span className="text-blue-500">tab-ai</span>
              （添加时请备注阿里云盘）
            </div>
            <div className="text-sm font-bold"> 打赏作者 </div>
            <div>
              <img src="/images/taibai.jpeg" className="w-64"></img>
            </div>
          </div>
        </div>
      </Modal>

      {renderDownloadModal()}

      <Modal
        title="设置"
        open={showSetting}
        width={760}
        footer={null}
        onCancel={() => setShowSetting(false)}
      >
        <div className="my-3 flex flex-col space-y-3">
          <div className="flex flex-row items-center">
            <span className="flex flex-col flex-none w-20">
              <span>网站主题：</span>
            </span>
            <div className="flex flex-row items-center space-x-2">
              <Select
                className="w-24"
                options={colors}
                value={settings?.colorPrimary}
                placeholder="主题色"
                onChange={(e) => {
                  const value: ProSettings = {
                    ...settings,
                    ...{ colorPrimary: e },
                  };
                  setSetting(value);
                  localStorage.setItem("theme", JSON.stringify(value));
                }}
              ></Select>
              <span
                style={{
                  backgroundColor: settings?.colorPrimary,
                }}
                className={`w-6 h-6 block rounded`}
              ></span>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <span className="flex flex-col flex-none w-20">
              <span>暗色模式：</span>
            </span>
            <div className="flex flex-col">
              <Switch
                checked={settings?.navTheme === "realDark"}
                onChange={(e) => {
                  const navTheme = e ? "realDark" : "light";
                  const value: ProSettings = {
                    ...settings,
                    ...{ navTheme: navTheme },
                  };
                  setSetting(value);
                  localStorage.setItem("theme", JSON.stringify(value));
                }}
              />
            </div>
          </div>
          <div className="flex flex-row">
            <span className="flex flex-col flex-none w-20">
              <span>登录密码：</span>
            </span>
            <div className="flex flex-col flex-1 text-gray-500">
              关于登录密码说明，请修改配置 appsettings.json，如果通过 docker
              启动也可以通过环境变量修改，示例：-e BASIC_AUTH_USER=admin -e
              BASIC_AUTH_PASSWORD=123456
            </div>
          </div>

          <div className="flex flex-row">
            <span className="flex flex-col flex-none w-20">
              <span>更多说明：</span>
            </span>
            <div className="flex flex-col flex-1 text-gray-500 space-y-2">
              <div>
                多平台、模块化、安全的云盘自动同步/备份工具，支持本地存储、阿里云盘等，支持
                <span className="text-orange-400">
                  {" "}
                  AES256-GCM、ChaCha20-Poly1305{" "}
                </span>
                加密，支持
                <span className="text-orange-400"> SHA256、BLAKE3 </span>
                哈希算法，支持
                <span className="text-orange-400"> Zstd、LZ4、Snappy </span>
                压缩，支持
                <span className="text-pink-400">
                  {" "}
                  文件名加密、文件打包、文件去重{" "}
                </span>
                等功能，支持容灾恢复，即便损坏{" "}
                <span className="text-red-400">99%</span>{" "}
                的文件，仍可支持恢复，支持单向、镜像、双向等同步/备份，软件完全免费开源，
                <span className="font-bold">
                  任何第三方或服务商都无查看您的数据，保证您的数据安全!
                </span>
              </div>
              <div>
                提供 Docker 版、Windows 版、Web 版、Linux 版等多平台版本。
              </div>
              <div>
                支持多种算法同步与备份，保证数据的安全性，任何第三方、任何云盘服务商都无法查看或分析你的数据，只有通过你本人设置的安全密钥才能解密数据，保证您的数据安全和隐私。
              </div>
              <div>
                更多文档：
                <a target="_blank" href="https://github.com/trueai-org/mdrive">
                  MDrive 官网
                </a>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Tour
        open={welcomOpen}
        onClose={() => setWelcomOpen(false)}
        steps={welcomSteps}
      />

      {/* <PageContainer
        className="w-full"
        content="欢迎使用"
        breadcrumbRender={false}
      >
        // 也可以通过 pathname 直接渲染页面
        {pathname == "/" && <>123</>}

        {pathname == "/welcome" && <>44444</>}

        // 2 种方式
        import reactLogo from "./assets/react.svg";
        import viteLogo from "/vite.svg";

        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
      </PageContainer> */}
    </ProLayout>
    // </ConfigProvider>
  );
}

export default App;
