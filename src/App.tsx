import { useEffect, useState } from "react";
import React from "react";
import { Button, Dropdown, Input, MenuProps, Table, Tag } from "antd";
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
} from "@ant-design/icons";
import { format } from "date-fns";
import { ColumnsType } from "antd/es/table";

import defaultProps from "./_defaultProps";
import "./App.css";
import { useOAuth } from "./hooks/useOAuth";
import { getDownloadFile, getDriveFiles, getDrives, getFile } from "./api";
import { IDrive, IDriveFile, IDriveJob } from "./api/api";
import { formatFileSize, getJobStateTag } from "./utils";
import OAuthComponent from "./components/OAuthComponent";

const onMenuClick: MenuProps["onClick"] = (e) => {
  console.log("click", e);
};

const items = [
  {
    key: "1",
    label: "执行",
  },
  {
    key: "2",
    label: "刷新",
  },
  {
    key: "3",
    label: "暂停",
  },
  {
    key: "4",
    label: "删除",
  },
];

function App() {
  const [pathname, setPathname] = useState("/list/sub-page/sub-sub-page1");

  const { hide } = useOAuth();

  // const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

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
        // app - .exe

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
      width: 120,
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
    setLoading(true);
    getDrives().then((c) => {
      // c.forEach((x) => (x.expandedRowKeys = []));
      console.log("c", c);
      setDrives(c || []);
      setLoading(false);
    });
  }, []);

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
      <ProCard split="vertical">
        <ProCard
          bodyStyle={{ margin: 0, padding: 0 }}
          headerBordered
          title={<div className="font-bold">存储和作业</div>}
          colSpan={"432px"}
          extra={
            <OAuthComponent
              clientId="12561ebaf6504bea8a611932684c86f6"
              redirectUri="https://api.duplicati.net/api/open/aliyundrive"
              onClose={hide}
            />
          }
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
                      <span className="mr-2"> {c.name} </span>
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
                      <Button
                        key="3"
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                      ></Button>,
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
                      render: () => {
                        return (
                          <Dropdown.Button
                            size="small"
                            menu={{ items, onClick: onMenuClick }}
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
