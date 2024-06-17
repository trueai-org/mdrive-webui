import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Table,
  message,
  Space,
  Tooltip,
  Form,
  InputNumber,
  Input,
  TreeSelect,
  TreeSelectProps,
} from "antd";
import {
  CloudDownloadOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PlayCircleOutlined,
  LockTwoTone,
  SettingOutlined,
  FolderTwoTone,
  UserOutlined,
  HomeTwoTone,
  DesktopOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import {
  getDownloadTasks,
  getGlobalDownloadSpeed,
  removeDownloadTask,
  pauseDownloadTask,
  continueDownloadTask,
  openfoldDownloadTask,
  getPaths,
  getDownloadSettings,
  setDownloadSettings,
} from "@/api";

import { ColumnsType } from "antd/es/table";
import { DefaultOptionType } from "antd/es/select";
import { DownloadStatus, DownloadTask } from "@/api/model";

const { SHOW_PARENT } = TreeSelect;

type StatusColorMap = {
  [key in DownloadStatus]: string;
};

const statusColorMap: StatusColorMap = {
  [DownloadStatus.Pending]: "bg-gray-400",
  [DownloadStatus.Downloading]: "bg-blue-500 animate-pulse",
  [DownloadStatus.Paused]: "bg-orange-500",
  [DownloadStatus.Completed]: "bg-green-500",
  [DownloadStatus.Failed]: "bg-red-500",
};

interface DownloadSettingsProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: SettingsValues) => void;
  initialValues: SettingsValues;
}

interface SettingsValues {
  maxConcurrentDownloads: number;
  defaultDownloadPath: string;
  downlaodSpeedLimit: number;
}

const DownloadSettingsModal: React.FC<DownloadSettingsProps> = ({
  visible,
  onCancel,
  onSave,
  initialValues,
}) => {
  const [form] = Form.useForm<SettingsValues>();

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave(values);
      // onCancel();
    });
  };

  // 树下拉选择框
  const [showTreeSelect, setShowTreeSelect] = useState(true);
  const [value, setValue] = useState<string>("");
  const [paths, setPaths] = useState<DefaultOptionType[]>([]);

  const onChange = (newValue: string) => {
    setValue(newValue);

    // const ss = {
    //   title: "源数据",
    //   label: "源数据",
    //   value: ":sources",
    //   key: ":sources",
    //   icon: <FolderOpenTwoTone />,
    //   children: value?.map((x) => {
    //     return {
    //       title: x,
    //       label: x,
    //       value: ":" + x,
    //       key: ":" + x,
    //       icon: <FolderTwoTone />,
    //       checked: true,
    //       isLeaf: true
    //     };
    //   }),
    //   checkable: false,
    // };
    // setPaths((prevPaths) => {
    //   return prevPaths.map((path) => (path.key === ":sources" ? ss : path));
    // });
  };

  // 递归更新
  const updateTreeData: any = (list: any[], key: any, children: any[]) => {
    return list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  };

  useEffect(() => {
    getPaths().then((res) => {
      if (res.success) {
        const us = res
          .data!.filter((x) => x.id.includes("%"))
          .map((x) => {
            return {
              title: x.text,
              label: x.text,
              value: x.resolvedpath || x.id,
              key: x.resolvedpath || x.id,
              icon: <FolderTwoTone />,
              children: [],
            };
          });
        const cs = res
          .data!.filter((x) => !x.id.includes("%"))
          .map((x) => {
            return {
              title: x.text,
              label: x.text,
              value: x.id,
              key: x.id,
              icon: <FolderTwoTone />,
              children: [],
            };
          });
        const rs: DefaultOptionType[] = [];
        if (us.length > 0) {
          rs.push({
            title: "用户数据",
            label: "用户数据",
            value: ":user",
            key: ":user",
            icon: <UserOutlined className="text-[#1677FF]" />,
            children: us,
            checkable: false,
            disabled: true,
          });
        }
        if (cs.length > 0) {
          rs.push({
            title: "计算机",
            label: "计算机",
            value: ":jsj",
            key: ":jsj",
            icon: <HomeTwoTone />,
            children: cs,
            checkable: false,
            disabled: true,
          });
        }
        // rs.push({
        //   title: "源数据",
        //   label: "源数据",
        //   value: ":sources",
        //   key: ":sources",
        //   icon: <FolderOpenTwoTone />,
        //   children: value?.map((x) => {
        //     return {
        //       title: x,
        //       label: x,
        //       value: ":" + x,
        //       key: ":" + x,
        //       icon: <FolderTwoTone />,
        //       checked: true,
        //       isLeaf: true,
        //     };
        //   }),
        //   checkable: false,
        // });

        setPaths(rs);
      }
    });
  }, []);

  const onLoadData: TreeSelectProps["loadData"] = async (node) => {
    if (!node.key || node.key.toString().startsWith(":")) return;
    try {
      const res = await getPaths(node.key as string);
      if (res.success) {
        const childNodes = res.data?.map((x) => ({
          title: x.text,
          label: x.text,
          value: x.id,
          key: x.id,
          children: [],
          icon: <FolderTwoTone />,
        }));

        setPaths((prevPaths) =>
          updateTreeData(prevPaths, node.key, childNodes || [])
        );

        // setPaths((prevPaths) => {
        //   return prevPaths.map((path) =>
        //     path.key === node.key ? { ...path, children: childNodes } : path
        //   );
        // });
      }
    } catch (error) {
      message.error("加载子文件夹时出错");
    }
  };
  return (
    <Modal
      title="下载设置"
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="maxConcurrentDownloads"
          label="最大并行下载数"
          rules={[{ required: true, message: "请输入最大并行下载数" }]}
        >
          <InputNumber min={1} max={10} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="downlaodSpeedLimit"
          label="下载速度限制"
          rules={[{ required: true, message: "请输入下载速度限制" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="0 表示不限速"
            addonAfter="B/s"
          />
        </Form.Item>

        <Form.Item
          required
          label="默认下载目录"
          tooltip="请选择本地文件夹"
          help="请选择或输入本地文件夹，例如：E:\test"
        >
          {showTreeSelect ? (
            <Form.Item name="defaultDownloadPath" noStyle>
              <TreeSelect
                treeData={paths}
                onChange={onChange}
                treeIcon
                style={{
                  width: "100%",
                }}
                allowClear
                treeDefaultExpandedKeys={[":user", ":jsj", ":sources"]}
                placeholder={"请选择文件夹"}
                showCheckedStrategy={SHOW_PARENT}
                value={value}
                loadData={onLoadData}
                treeNodeLabelProp="key"
              />
            </Form.Item>
          ) : (
            <Form.Item name="defaultDownloadPath" noStyle>
              <Input
                onChange={(e) => {
                  onChange(e.target.value);
                }}
                value={value}
                allowClear
                placeholder="请输入粘贴文件夹路径，例如：C:/Downloads"
              />
            </Form.Item>
          )}
          <span
            className="cursor-pointer text-blue-500 block py-1"
            onClick={() => {
              setShowTreeSelect(!showTreeSelect);
            }}
          >
            {showTreeSelect ? "切换为输入文件夹" : "切换为选择文件夹"}
          </span>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const DownloadManager = () => {
  const [visible, setVisible] = useState(false);
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [globalSpeed, setGlobalSpeed] = useState("0.00 B/s");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchGlobalSpeed();
      fetchTasks();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    const response = await getDownloadTasks();
    if (response.data.success) {
      setTasks(response.data.data!);
    }
  };

  const fetchGlobalSpeed = async () => {
    const response = await getGlobalDownloadSpeed();
    if (response.data.data) {
      setGlobalSpeed(response.data.data.speedString);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await removeDownloadTask(id);
    if (response.data.success) {
      message.success("删除成功");
      fetchTasks();
    } else {
      message.error("删除失败");
    }
  };

  const openfoldTask = async (id: string) => {
    const response = await openfoldDownloadTask(id);
    if (response.data.success) {
      message.success("打开成功");
    } else {
      message.error("打开失败");
    }
  };

  const handlePause = async (id: string) => {
    const response = await pauseDownloadTask(id);
    if (response.data.success) {
      message.success("暂停成功");
      fetchTasks();
    } else {
      message.error("暂停失败");
    }
  };

  const deleteSelectedTasks = async () => {
    await Promise.all(
      selectedRowKeys.map((id) => removeDownloadTask(id.toString()))
    );
    message.success("已删除选中任务");
    fetchTasks();
    setSelectedRowKeys([]);
  };

  const handleContinue = async (id: string) => {
    const response = await continueDownloadTask(id);
    if (response.data.success) {
      message.success("继续下载成功");
      fetchTasks();
    } else {
      message.error("继续下载失败");
    }
  };

  const columns: ColumnsType = [
    {
      title: "文件",
      dataIndex: "fileName",
      render: (text: string, record: DownloadTask) => (
        // 超出显示 ... 并使用  tootip 显示完整内容
        <Tooltip title={text} placement="right">
          <span className="truncate">
            <div className="flex items-center space-x-2">
              {record.isLocalFile ? (
                <DesktopOutlined className="text-blue-500" />
              ) : (
                <CloudOutlined className="text-blue-500" />
              )}

              {record.isEncrypted && <LockTwoTone twoToneColor="#eb2f96" />}
              <span className="truncate">{text}</span>
            </div>
          </span>
        </Tooltip>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      align: "left",
      width: 110,
      render: (status: DownloadStatus, record: DownloadTask) => (
        // 如果是下载中，则显示百分比进度条
        <Tooltip title={record.error}>
          <span className="flex flex-row items-center space-x-1.5">
            <span
              className={`inline-block w-3 h-3 rounded-full ${statusColorMap[status]}`}
            ></span>
            <span>
              {record.statusString}

              {record.totalBytes > 0 &&
                record.status === DownloadStatus.Downloading && (
                  <span className="ml-0.5 font-semibold text-xs text-blue-500">
                    {Math.floor(
                      (record.downloadedBytes / record.totalBytes) * 100
                    )}{" "}
                    %
                  </span>
                )}
            </span>
          </span>
        </Tooltip>
      ),
    },
    {
      title: "大小",
      dataIndex: "fileSize",
      width: 100,
      align: "right",
    },
    {
      title: "速度",
      dataIndex: "speedString",
      width: 100,
      align: "right",
    },
    {
      title: "用时",
      dataIndex: "durationSeconds",
      width: 100,
      align: "right",
      render: (text: number, record: DownloadTask) => (
        <span>{text > 0 ? record.durationString : "-"}</span>
      ),
    },

    {
      title: "时间",
      dataIndex: "createTimeString",
      width: 160,
      align: "right",
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      render: (_: any, record: DownloadTask) => (
        <Space size="small">
          {record.status === DownloadStatus.Paused ||
          record.status == DownloadStatus.Failed ? (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => handleContinue(record.id)}
              size="small"
            />
          ) : (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => handlePause(record.id)}
              disabled={record.status !== DownloadStatus.Downloading}
              size="small"
            />
          )}
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          />
          <Button
            size="small"
            icon={<FolderOpenOutlined />}
            onClick={() => openfoldTask(record.id)}
          />
        </Space>
      ),
      width: 120,
    },
  ];

  const activeTaskCount = tasks.filter(
    (task) => task.status !== DownloadStatus.Completed
  ).length;

  // 完成下载管理器的设置功能

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<SettingsValues>({
    maxConcurrentDownloads: 3, // 默认并行下载数
    defaultDownloadPath: "", // 默认下载路径
    downlaodSpeedLimit: 0, // 下载速度限制
  });

  const handleOpenSettings = () => {
    getDownloadSettings().then((res) => {
      if (res.data) {
        // 更新 settings 的值
        setSettings({
          maxConcurrentDownloads: res.data.maxParallelDownload,
          defaultDownloadPath: res.data.defaultDownload,
          downlaodSpeedLimit: res.data.downloadSpeedLimit,
        });

        setSettingsVisible(true);
      }
    });
  };

  const handleSaveSettings = (newSettings: SettingsValues) => {
    setSettings(newSettings);
    setDownloadSettings({
      defaultDownload: newSettings.defaultDownloadPath,
      maxParallelDownload: newSettings.maxConcurrentDownloads,
      downloadSpeedLimit: newSettings.downlaodSpeedLimit,
    }).then(() => {
      message.success("设置已保存");
      handleCancelSettings();
    });
  };

  const handleCancelSettings = () => {
    setSettingsVisible(false);
  };

  return (
    <>
      <div className="flex flex-row space-x-2 items-center -my-2.5">
        <Button
          icon={<CloudDownloadOutlined />}
          onClick={() => setVisible(true)}
        >
          下载管理 {activeTaskCount > 0 && `(${activeTaskCount})`}
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={handleOpenSettings}
        ></Button>
      </div>
      <Modal
        title={
          globalSpeed != "0.00 B/s"
            ? `下载管理器 - 速度 ${globalSpeed}`
            : "下载管理器"
        }
        open={visible}
        onCancel={() => setVisible(false)}
        width={1080}
        footer={
          <div className="flex flex-row w-full">
            <div className="flex-grow text-left text-gray-500 ml-2.5">
              共 {tasks.length} 个任务
            </div>

            <div className="flex flex-row space-x-2">
              <Button
                disabled={
                  tasks.filter(
                    (task) => task.status === DownloadStatus.Completed
                  ).length === 0
                }
                key="delete"
                onClick={() => {
                  tasks
                    .filter((task) => task.status === DownloadStatus.Completed)
                    .forEach((task) => handleDelete(task.id));
                }}
              >
                清除已完成任务
              </Button>

              <Button
                disabled={selectedRowKeys.length === 0}
                key="delete"
                onClick={deleteSelectedTasks}
              >
                删除选中任务
              </Button>
            </div>
          </div>
        }
        maskClosable={false}
      >
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={tasks}
          pagination={false}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            columnWidth: 50,
          }}
          scroll={{ y: 360 }}
          virtual={true}
        />
      </Modal>

      <DownloadSettingsModal
        visible={settingsVisible}
        onCancel={handleCancelSettings}
        onSave={handleSaveSettings}
        initialValues={settings}
      />
    </>
  );
};

export default DownloadManager;
