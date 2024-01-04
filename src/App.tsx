import { useEffect, useState } from "react";
import React from "react";
import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { ProCard, ProLayout, ProList } from "@ant-design/pro-components";
import {
  CloudUploadOutlined,
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

function App() {
  const [pathname, setPathname] = useState("/list/sub-page/sub-sub-page1");
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

  return (
    <ProLayout
      title="MDrive"
      logo={<img src="/logo.png" style={{ width: 24, height: 24 }} />}
      {...defaultProps}
      location={{
        pathname,
      }}
      onMenuHeaderClick={(e) => console.log("e", e)}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            setPathname(item.path || "/welcome");
          }}
        >
          {dom}
        </a>
      )}
      layout="top"
      loading={loading}
    >
      <ProCard split="vertical" style={{ minHeight: 520 }}>
        <ProCard
          bodyStyle={{ margin: 0, padding: 0 }}
          headerBordered
          title={<div className="font-bold">存储和作业</div>}
          colSpan={"432px"}
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
              <Button icon={<CloudUploadOutlined />}></Button>
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
      {contextHolder}
    </ProLayout>

    //   <PageContainer
    //     className="w-full"
    //     content="欢迎使用"
    //     breadcrumbRender={false}
    //   >
    //     <div>Hello World</div>

    //     <div>
    //       <a href="https://vitejs.dev" target="_blank">
    //         <img src={viteLogo} className="logo" alt="Vite logo" />
    //       </a>
    //       <a href="https://react.dev" target="_blank">
    //         <img src={reactLogo} className="logo react" alt="React logo" />
    //       </a>
    //     </div>

    //     <div style={{ padding: "0 24px" }}>
    //       <h1 className="text-red-400">antd version: {version}</h1>
    //       <Space>
    //         <DatePicker />
    //         <Button type="primary">Primary Button</Button>
    //       </Space>
    //     </div>

    //     <div className="card">
    //       <button onClick={() => setCount((count) => count + 1)}>
    //         count is {count}
    //       </button>
    //       <p>
    //         Edit <code>src/App.tsx</code> and save to test HMR
    //       </p>
    //     </div>
    //     <p className="read-the-docs">
    //       Click on the Vite and React logos to learn more
    //     </p>
    //   </PageContainer>
    // </ProLayout>
  );
}

export default App;
