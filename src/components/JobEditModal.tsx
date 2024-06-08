import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  InputNumber,
  Button,
  Steps,
  message,
  TreeSelect,
  TreeSelectProps,
  AutoComplete,
  Divider,
} from "antd";
import {
  FolderTwoTone,
  HomeTwoTone,
  UserOutlined,
  ReloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { IDriveJob } from "@/api/model";
import {
  addJob,
  getCronTags,
  getPaths,
  getPoints,
  updateJob,
  updateSetMount,
  updateSetUnmount,
} from "@/api";
import { DefaultOptionType } from "antd/es/select";

const { Step } = Steps;
const { SHOW_PARENT } = TreeSelect;

interface JobEditModalProps {
  visible: boolean;
  // onOk: (job: IDriveJob) => void;
  onOk: () => void;
  onCancel: () => void;
  jobConfig: IDriveJob;
  currentDriveId?: string;
}

const JobEditModal: React.FC<JobEditModalProps> = ({
  visible,
  onOk,
  onCancel,
  jobConfig,
  currentDriveId,
}) => {
  const [form] = Form.useForm<IDriveJob>();
  const [currentStep, setCurrentStep] = useState(0);
  const [allStepsData, setAllStepsData] = useState<IDriveJob>();
  const [saveing, setSaveing] = useState(false);
  const [cronTags, setCronTags] = useState<string[]>([]);
  const [pointOptions, setPointOptions] = useState<{ value: string }[]>([]);
  const [point, setPoint] = useState<string>();

  const [showPwd, setShowPwd] = useState<boolean>();

  useEffect(() => {
    getCronTags().then((res) => {
      setCronTags(res);
    });
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
    getPoints().then((res) => {
      if (res.success) {
        setPointOptions(
          res.data?.map((x) => {
            return { value: x };
          }) || []
        );
      }
    });
  }, []);

  useEffect(() => {
    if (form && visible) {
      setCurrentStep(0);
      setShowTreeSelect(true);

      if (jobConfig) {
        jobConfig.mountOnStartup = jobConfig.mountConfig?.mountOnStartup;
        jobConfig.mountPoint = jobConfig.mountConfig?.mountPoint;
        jobConfig.mountReadOnly = jobConfig.mountConfig?.mountReadOnly;
      }

      setAllStepsData(jobConfig);
      form.setFieldsValue(jobConfig);
      setValue(jobConfig.sources || []);
      setPoint(jobConfig.mountPoint);
    }
  }, [visible, jobConfig, form]);

  const updateStepData = () => {
    form.validateFields().then((values) => {
      setAllStepsData({ ...allStepsData, ...values });
    });
  };

  const isEncrypt = Form.useWatch("isEncrypt", form);

  const next = () => {
    form
      .validateFields()
      .then((values) => {
        setAllStepsData({ ...allStepsData, ...values });
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        message.error(errorInfo?.errorFields[0].errors[0]);
      });
  };

  const prev = () => {
    form
      .validateFields()
      .then((values) => {
        setAllStepsData({ ...allStepsData, ...values });
        setCurrentStep(currentStep - 1);
      })
      .catch((errorInfo) => {
        message.error(errorInfo?.errorFields[0].errors[0]);
      });
  };

  const handleSubmit = () => {
    setSaveing(true);
    form
      .validateFields()
      .then((values) => {
        const value: IDriveJob = { ...allStepsData, ...values };

        value.mountConfig = {
          mountPoint: value.mountPoint,
          mountReadOnly: value.mountReadOnly,
          mountOnStartup: value.mountOnStartup,
        };

        setAllStepsData(value);

        if (value.id) {
          // 编辑
          updateJob(value).then((res) => {
            if (res?.success) {
              message.success("操作成功");
              // setVisibleEditJob(false);
              // loadDrives();
              onOk && onOk();
            } else {
              message.error(res?.message || "操作失败");
            }
          });
        } else {
          // 新增
          addJob(currentDriveId!, value).then((res) => {
            if (res?.success) {
              message.success("操作成功");
              // setVisibleEditJob(false);
              // loadDrives();
              onOk && onOk();
            } else {
              message.error(res?.message || "操作失败");
            }
          });
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo?.errorFields[0].errors[0]);
      })
      .finally(() => {
        setSaveing(false);
      });
  };

  // 树下拉选择框
  const [showTreeSelect, setShowTreeSelect] = useState(true);
  const [value, setValue] = useState<string[]>(() => {
    return jobConfig?.sources || [];
  });
  const [paths, setPaths] = useState<DefaultOptionType[]>([]);
  const onChange = (newValue: string[]) => {
    setValue(newValue);
    setAllStepsData((prev) => {
      if (prev) {
        prev.sources = newValue;
      }
      return prev;
    });

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

  const onMount = () => {
    if (!jobConfig.id) {
      message.error("保存作业后才能执行挂载磁盘");
      return;
    }

    if (!point) {
      message.error("请选择或输入挂载点");
      return;
    }

    setSaveing(true);

    form
      .validateFields()
      .then((values) => {
        const value: IDriveJob = { ...allStepsData, ...values };

        value.mountConfig = {
          mountPoint: value.mountPoint,
          mountReadOnly: value.mountReadOnly,
          mountOnStartup: value.mountOnStartup,
        };

        setAllStepsData(value);

        if (value.id) {
          // 先保存作业
          updateJob(value).then((res) => {
            if (res?.success) {
              // message.success("操作成功");
              // setVisibleEditJob(false);
              // loadDrives();

              // 然后挂载磁盘
              updateSetMount(jobConfig.id)
                .then((res) => {
                  if (res.success) {
                    // message.success("操作成功");
                    message.success(
                      "挂载成功，首次初始化列表需要1~5分钟，请耐心等待"
                    );
                    onOk && onOk();
                  } else {
                    message.error(res.message || "操作失败");
                  }
                })
                .finally(() => setSaveing(false));
            } else {
              message.error(res?.message || "操作失败");
              setSaveing(false);
            }
          });
        } else {
          // 新增
          addJob(currentDriveId!, value)
            .then((res) => {
              if (res?.success) {
                message.warning("添加作业成功，请重新设置挂载");
                // setVisibleEditJob(false);
                // loadDrives();
                onOk && onOk();
              } else {
                message.error(res?.message || "操作失败");
              }
            })
            .finally(() => setSaveing(false));
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo?.errorFields[0].errors[0]);
        setSaveing(false);
      });
  };

  const onUnmount = () => {
    if (!jobConfig.id) {
      message.error("保存作业后才能执行挂载磁盘");
      return;
    }

    if (!point) {
      message.error("请选择或输入挂载点");
      return;
    }

    setSaveing(true);
    updateSetUnmount(jobConfig.id)
      .then((res) => {
        if (res.success) {
          message.success("操作成功");
          onOk && onOk();
        } else message.error(res.message || "操作失败");
      })
      .finally(() => setSaveing(false));
  };

  // 写一个随机 16~32 位的密码随机
  const randomString = () => {
    const len = Math.floor(Math.random() * 16) + 16;
    const chars =
      "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678@#%&*——+-={}|0123456789,.//';[]{]\\|\"<>?~`!@#$%^&*()_+";

    const maxPos = chars.length;
    let pwd = "";
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return pwd;
  };
  const copyToClipboard = () => {
    const pwd = form.getFieldValue("encryptKey");
    navigator.clipboard.writeText(pwd).then(
      () => {
        message.success("复制成功");
      },
      () => {
        message.error("复制失败");
      }
    );
  };

  return (
    <Modal
      title="作业配置"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={760}
      footer={[
        <Button
          loading={saveing}
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          保存
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
      ]}
      className="w-full"
    >
      <Steps
        className="py-3"
        onChange={(e) => {
          updateStepData();
          setCurrentStep(e);
        }}
        current={currentStep}
      >
        <Step title="基本信息" />
        <Step title="作业配置" />
        <Step title="高级设置" />
        <Step title="挂载配置" />
      </Steps>

      <Form
        disabled={jobConfig?.isMount}
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        {currentStep == 0 && (
          <>
            <Form.Item
              name="name"
              label="作业名称"
              rules={[{ required: true, message: "请输入任务/作业名称" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="schedules"
              label="作业计划"
              help={
                <span>
                  更多示例：
                  <a
                    href="https://www.bejson.com/othertools/cron/"
                    target="_blank"
                  >
                    Cron 表达式
                  </a>
                  ，支持自定义作业时间，示例：0 15 10 * * ?。
                </span>
              }
            >
              <Select
                options={cronTags?.map((x) => {
                  return { value: x };
                })}
                mode="tags"
                tokenSeparators={[","]}
              />
            </Form.Item>
            <Form.Item
              name="mode"
              label="同步模式"
              help="镜像：以本地为主，如果远程和本地不一致则删除远程文件；备份：以本地为主，将本地备份到远程，不删除远程文件；双向：双向同步，同时保留，冲突的文件重新命名。"
            >
              <Select>
                <Select.Option value={0}>镜像</Select.Option>
                <Select.Option value={1}>备份</Select.Option>
                <Select.Option value={2}>双向</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="isEncrypt"
              label="启用加密"
              valuePropName="checked"
              tooltip="是否启用阿里云盘文件加密功能"
              help="文件结构保持不变，文件内容加密，加密后的文件无法直接查看，解密后才能查看。"
            >
              <Checkbox
                disabled={allStepsData?.id ? true : false}
                onChange={updateStepData}
              />
            </Form.Item>

            {isEncrypt && (
              <>
                <Form.Item
                  name="isEncryptName"
                  label="文件名加密"
                  valuePropName="checked"
                  tooltip="是否启用对文件名称进行加密"
                  help="启用文件名称加密，将会额外占用 1KB 的空间。"
                >
                  <Checkbox disabled={allStepsData?.id ? true : false} />
                </Form.Item>

                <Form.Item
                  tooltip="默认：AES256-GCM"
                  name="encryptAlgorithm"
                  label="加密算法"
                  required
                >
                  <Select disabled={allStepsData?.id ? true : false}>
                    <Select.Option value="AES256-GCM">AES256-GCM</Select.Option>
                    <Select.Option value="ChaCha20-Poly1305">
                      ChaCha20-Poly1305
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  tooltip="默认：Zstd"
                  name="compressAlgorithm"
                  label="压缩算法"
                  required
                >
                  <Select disabled={allStepsData?.id ? true : false}>
                    <Select.Option>None</Select.Option>
                    <Select.Option value="Zstd">Zstd</Select.Option>
                    <Select.Option value="LZ4">LZ4</Select.Option>
                    <Select.Option value="Snappy">Snappy</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  tooltip="默认：SHA256"
                  name="hashAlgorithm"
                  label="哈希算法"
                  required
                >
                  <Select disabled={allStepsData?.id ? true : false}>
                    <Select.Option value="SHA256">SHA256</Select.Option>
                    <Select.Option value="BLAKE3">BLAKE3</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="密钥" required>
                  <Form.Item name="encryptKey" noStyle>
                    <Input.Password
                      style={{ width: "60%" }}
                      visibilityToggle={{
                        visible: showPwd,
                        onVisibleChange: setShowPwd,
                      }}
                      disabled={allStepsData?.id ? true : false}
                    />
                  </Form.Item>

                  {!allStepsData?.id && (
                    <Button
                      type="link"
                      onClick={() => {
                        setShowPwd(true);
                        const pwd = randomString();
                        form.setFieldsValue({ encryptKey: pwd });
                      }}
                      icon={<ReloadOutlined />}
                    ></Button>
                  )}

                  <Button
                    type="link"
                    onClick={copyToClipboard}
                    icon={<CopyOutlined />}
                  ></Button>
                </Form.Item>
              </>
            )}
          </>
        )}
        {currentStep == 1 && (
          <>
            <Form.Item
              required
              label="本地目录"
              tooltip="源路劲、本地路径，请选择本地文件夹"
              help="请选择或输入本地文件夹，支持多选，例如：E:\test, E:\kopia"
            >
              {showTreeSelect ? (
                <TreeSelect
                  treeData={paths}
                  onChange={onChange}
                  treeCheckable
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
              ) : (
                <Select
                  onChange={onChange}
                  value={value}
                  mode="tags"
                  allowClear
                  tokenSeparators={[",", "，"]}
                  placeholder={"请输入粘贴文件夹路径"}
                />
              )}
              <span
                className="cursor-pointer text-blue-500 block py-1"
                onClick={() => {
                  setShowTreeSelect(!showTreeSelect);
                }}
              >
                {showTreeSelect
                  ? "切换为输入文件夹"
                  : "切换为选择文件夹，多个以逗号分割"}
              </span>
            </Form.Item>

            <Form.Item
              required
              name="defaultDrive"
              label="目标位置"
              tooltip="阿里云盘的存储位置，个人私有文件建议存储到备份盘"
            >
              <Select>
                <Select.Option value="backup">备份盘</Select.Option>
                <Select.Option value="resource">资源库</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              required
              name="target"
              label="目标目录"
              tooltip="云盘存储路径，远程备份/同步存储的路径"
              help="路径格式：/文件夹/文件夹/文件夹，示例：backup/mdrive"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="filters"
              label="过滤文件"
              tooltip="排除本地不需要过滤的文件/文件夹"
              help={
                <>
                  <div>
                    支持正则表达式，多个文件/文件夹用逗号分隔，过滤的文件/文件夹不会同步
                  </div>
                  <div>
                    示例：/Recovery/*, *.log, *.tmp, **/@Recycle/*,
                    **/logs/*，更多示例请参考官网。
                  </div>
                </>
              }
            >
              <Select mode="tags" tokenSeparators={[",", "，"]} />
            </Form.Item>
            <Form.Item
              name="restore"
              label="还原目录"
              tooltip="还原文件时的本地文件夹"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="rapidUpload"
              label="启用秒传"
              valuePropName="checked"
              tooltip="是否启用阿里云盘秒传功能"
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              name="isRecycleBin"
              label="启用回收站"
              tooltip="是否启用回收站，如果启用则删除文件时，保留到回收站"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              name="isTemporary"
              label="立即执行"
              tooltip="表示是否启动后立即执行作业，如果是一次性作业，请选择立即执行"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </>
        )}
        {currentStep == 2 && (
          <>
            <Form.Item required name="id" label="作业标识">
              <Input disabled />
            </Form.Item>
            <Form.Item name="description" label="作业描述">
              <Input />
            </Form.Item>
            <Form.Item
              name="checkAlgorithm"
              tooltip="文件是否变更检查算法"
              label="文件对比检查算法"
            >
              <Select>
                <Select.Option value="SHA1">SHA1</Select.Option>
                <Select.Option value="SHA256">SHA256</Select.Option>
                <Select.Option value="BLAKE3">BLAKE3</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="checkLevel"
              label="文件对比检查级别"
              tooltip="文件变更时，文件是否变动检查算法级别，默认：1"
              help={
                <span>1：采样计算文件（推荐），2：计算整个文件（耗时）</span>
              }
            >
              <InputNumber min={1} max={2} />
            </Form.Item>
            <Form.Item
              name="fileWatcher"
              label="启用文件系统监听"
              valuePropName="checked"
              tooltip="启用监听可以更加快捷的计算需要同步的文件"
            >
              <Checkbox />
            </Form.Item>
            <Form.Item name="order" label="显示顺序" tooltip="作业显示顺序">
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item
              name="uploadThread"
              label="上传并行任务数"
              tooltip="上传并行任务数（0：自动，最大：10）"
            >
              <InputNumber min={0} max={10} />
            </Form.Item>
            <Form.Item
              name="downloadThread"
              label="下载并行任务数"
              tooltip="下载并行任务数（0：自动，最大：10）"
            >
              <InputNumber min={0} max={10} />
            </Form.Item>
          </>
        )}
        {currentStep == 3 && (
          <>
            <Form.Item
              tooltip="云盘挂载到本地磁盘的位置"
              label="挂载点"
              help={
                <span>
                  如果你想将云盘的备份目录挂载到本地磁盘，像访问本地磁盘一样访问云盘，请设置挂载到磁盘的位置。
                  <br />
                  确保挂载的磁盘盘符没有被占用，Linux 确保是空的文件夹。
                  <br />
                  windows 示例：C:\，linux 示例：/tmp。
                  <br />
                  <span>
                    请确保已安装磁盘驱动，下载驱动：
                    <a href="/driver/Dokan_x64.msi" target="_blank">
                      Windows_x64.msi
                    </a>
                    <Divider type="vertical" />
                    <a href="/driver/Dokan_x86.msi" target="_blank">
                      Windows_x86.msi
                    </a>
                  </span>
                </span>
              }
            >
              <AutoComplete
                options={pointOptions}
                placeholder="请输入或选择挂载点"
                value={point}
                onChange={(v) => {
                  setPoint(v);
                  setAllStepsData((prev) => {
                    if (prev) {
                      prev.mountPoint = v;
                    }
                    return prev;
                  });
                }}
              />
              {jobConfig.id && (
                <div className="flex flex-row items-center py-2">
                  {jobConfig.isMount ? (
                    <div className="flex flex-row items-center">
                      <span className="text-green-400">当前已挂载磁盘</span>
                      <span className="text-gray-400">
                        （挂载中不可修改配置）
                      </span>
                      <Divider type="vertical" className="ml-4" />
                      <Button
                        loading={saveing}
                        size="small"
                        type="link"
                        onClick={onUnmount}
                        disabled={false}
                      >
                        卸载挂载
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-row items-center">
                      <span className="text-gray-400">
                        当前未挂载到本地磁盘
                      </span>
                      <Divider type="vertical" className="ml-4" />
                      <Button
                        loading={saveing}
                        size="small"
                        type="link"
                        onClick={onMount}
                      >
                        立即挂载
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Form.Item>
            <Form.Item
              name="mountOnStartup"
              label="自动挂载"
              tooltip="作业启动后，立即挂载磁盘"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              name="mountReadOnly"
              label="只读模式"
              tooltip="以只读模式挂载阿里云盘时，无法对文件修改删除等"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </>
        )}
      </Form>

      <div className="pt-3 items-center justify-center w-full flex">
        {currentStep > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            上一步
          </Button>
        )}
        {currentStep < 3 && (
          <Button ghost type="primary" onClick={() => next()}>
            下一步
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default JobEditModal;
