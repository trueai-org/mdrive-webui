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
  PlusOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { ColumnsType } from "antd/es/table";

import {
  addDrive,
  addJob,
  deleteDrive,
  getDownloadFile,
  getDriveFiles,
  getDrives,
  getFile,
  updateDrive,
  updateJob,
  updateJobState,
} from "./api";
import { IDrive, IDriveFile, IDriveJob, JobState } from "./api/model";
import { formatFileSize, getJobStateTag } from "./utils";
import OAuthComponent from "./components/OAuthComponent";
import JobEditModal from "./components/JobEditModal";
import { MenuInfo } from "rc-menu/lib/interface";
import defaultProps from "./_defaultProps";

import "./App.css";
import { Select } from "antd/lib";

function App() {
  const [pathname, setPathname] = useState("/");
  const [showAbout, setShowAbout] = useState(false);
  const [showSetting, setShowSetting] = useState(false);

  // const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

  const [msg, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [drives, setDrives] = useState<IDrive[]>();
  const [job, setJob] = useState<IDriveJob>();
  const [files, setFiles] = useState<IDriveFile[]>();
  const [currentFile, setCurrentFile] = useState<IDriveFile>();
  const [rootFileId, setRootFileId] = useState<string>();

  const fixedColumns: ColumnsType<IDriveFile> = [
    {
      title: "名称",
      dataIndex: "name",
      fixed: "left",
      render: (_, r) => {
        if (r.category == "image") {
          return (
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              <FileImageTwoTone />
              <span>{r.name}</span>
            </div>
          );
        } else if (r.category == "video") {
          return (
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              <VideoCameraTwoTone />
              <span>{r.name}</span>
            </div>
          );
        } else if (r.category == "doc") {
          return (
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              <FileTextOutlined />
              <span>{r.name}</span>
            </div>
          );
        } else if (r.category == "audio") {
          return (
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              <AudioTwoTone />
              <span>{r.name}</span>
            </div>
          );
        } else if (r.category == "zip") {
          return (
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              <FileZipTwoTone />
              <span>{r.name}</span>
            </div>
          );
        } else if (r.category == "app") {
          return (
            <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
              <FileOutlined />
              <span>{r.name}</span>
            </div>
          );
        } else if (r.isFolder) {
          return (
            <div
              onClick={() => {
                onSelectFolder(r);
              }}
              className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500"
            >
              <FolderOutlined />
              <span>{r.name}</span>
            </div>
          );
        }

        return (
          <div className="space-x-1 text-base flex items-center cursor-pointer hover:text-blue-500">
            <span>{r.name}</span>
          </div>
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
              // disabled={r.downLoading}
              onClick={() => {
                // r.downLoading = true;
                getDownloadFile(job!.id, r.file_id).then((c) => {
                  // r.downLoading = false;
                  // window.open(c.url);

                  const fileUrl = encodeURIComponent(c.url);
                  const name = encodeURIComponent(r.name);
                  window.open(
                    `/api/drive/download?url=${fileUrl}&name=${name}`
                  );

                  // const link = document.createElement("a");
                  // link.target = "_blank";
                  // link.href = c.url;
                  // link.download = r.name;
                  // document.body.appendChild(link);
                  // link.click();
                  // document.body.removeChild(link);
                });
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
          msg.success("操作成功");
          setTimeout(() => {
            loadDrives();
          }, 500);
        } else {
          msg.error(res?.message || "操作失败");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const menuItems: MenuProps["items"] = [
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
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Initializing:
        return menuItems.filter((x) => x?.key == JobState.Paused);
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
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Restoring:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Verifying:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Queued:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Completed:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted
        );
      case JobState.Paused:
        return menuItems.filter((x) => x?.key == JobState.Cancelled);
      case JobState.Error:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted
        );
      case JobState.Cancelling:
        return menuItems.filter((x) => x?.key == JobState.Paused);
      case JobState.Cancelled:
        return menuItems.filter(
          (x) =>
            x?.key == JobState.BackingUp ||
            x?.key == JobState.Disabled ||
            x?.key == JobState.Deleted
        );
      case JobState.Disabled:
        return menuItems.filter(
          (x) => x?.key == JobState.None || x?.key == JobState.Deleted
        );
      default:
        return menuItems.filter((x) => x?.key == JobState.Paused);
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
  }, []);

  const loadDrives = () => {
    setLoading(true);
    getDrives().then((c) => {
      setDrives(c || []);
      setLoading(false);
    });
  };

  const delayLoadDrives = () => {
    setTimeout(() => {
      loadDrives();
    }, 500);
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
    setJob(j);
    loadFiles(j.id);
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
    });
    setVisibleEditJob(true);
  };

  /**
   * 作业保存
   * @param value
   */
  const onJobSave = (value: IDriveJob) => {
    if (value) {
      if (value.id) {
        // 编辑
        updateJob(value).then((res) => {
          if (res?.success) {
            msg.success("操作成功");
            setVisibleEditJob(false);
            setTimeout(() => {
              loadDrives();
            }, 500);
          } else {
            msg.error(res?.message || "操作失败");
          }
        });
      } else {
        // 新增
        addJob(currentDriveId!, value).then((res) => {
          if (res?.success) {
            msg.success("操作成功");
            setVisibleEditJob(false);
            setTimeout(() => {
              loadDrives();
            }, 500);
          } else {
            msg.error(res?.message || "操作失败");
          }
        });
      }
    }
  };

  /**
   * 作业编辑取消
   */
  const onJobSaveCancel = () => {
    setVisibleEditJob(false);
  };

  /**
   * 删除云盘
   */
  const onDriveDelete = async (driveId: string) => {
    const res = await deleteDrive(driveId);
    if (res?.success) {
      msg.success("操作成功");
      delayLoadDrives();
    } else {
      msg.error(res?.message || "操作失败");
    }
  };

  /**
   * 保存云盘
   */
  const onDriveSave = async (token: string, driveId?: string) => {
    if (driveId) {
      const res = await updateDrive(driveId, token);
      if (res?.success) {
        msg.success("保存成功");
        delayLoadDrives();
      } else {
        msg.error(res?.message || "操作失败");
      }
    } else {
      const res = await addDrive(token);
      if (res?.success) {
        msg.success("保存成功");
        delayLoadDrives();
      } else {
        msg.error(res?.message || "操作失败");
      }
    }
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
            if (item.path == "/about") {
              setShowAbout(true);
            }
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
          extra={<OAuthComponent onOk={(tk) => onDriveSave(tk)} isAdd />}
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
                      <Tooltip title="添加作业">
                        <Button
                          type="link"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => onJobAdd(c.id)}
                        ></Button>
                      </Tooltip>,
                      <OAuthComponent
                        drive={c}
                        onDelete={() => onDriveDelete(c.id)}
                        onOk={(tk) => onDriveSave(tk, c.id)}
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
                        return getJobStateTag(row.job.state);
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
          title={<div className="font-bold">文件管理</div>}
          ref={welRef2}
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
            />

            {job && <div className="text-xs text-gray-600">{currentInfo}</div>}
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
      />

      <Modal
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
                href="https://github.com/trueai-org/MDriveSync"
              >
                MDriveSync 官网
              </a>
            </div>
          </div>
        </div>
      </Modal>

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
            <div className="flex flex-col flex-1 text-gray-400">
              请修改配置 appsettings.json，如果通过 docker
              启动也可以通过环境变量修改，示例：-e BASIC_AUTH_USER=admin -e
              BASIC_AUTH_PASSWORD=123456
            </div>
          </div>
        </div>
      </Modal>

      {contextHolder}

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
