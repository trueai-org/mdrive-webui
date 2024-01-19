import React, { useState, useCallback, useEffect } from "react";
import {
  AutoComplete,
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Steps,
  message,
} from "antd";
import fetchJsonp from "fetch-jsonp";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { IDrive } from "@/api/model";
import {
  addDrive,
  deleteDrive,
  getPoints,
  updateDrive,
  updateSetDriveMount,
  updateSetDriveUnmount,
} from "@/api";

interface OAuthComponentProps {
  isAdd?: boolean;
  clientId?: string;
  redirectUri?: string;
  drive?: IDrive;
  onClose?: () => void;
  onJobAdd?: () => void;
  onOk?: () => void;
}

const { Step } = Steps;

const OAuthComponent: React.FC<OAuthComponentProps> = ({
  clientId = "8dfd3cd56aa14e7d89bedcf975d388ce",
  redirectUri = "https://api.duplicati.net/api/open/aliyundrive",
  onClose,
  isAdd,
  drive: driveInfo,
  onOk,
  onJobAdd,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [oauthInProgress, setOauthInProgress] = useState(false);
  const [oauthCreateToken, setOauthCreateToken] = useState("");
  const [token, setToken] = useState(() => {
    return driveInfo?.refreshToken || "";
  });

  const [form] = Form.useForm<IDrive>();
  const [currentStep, setCurrentStep] = useState(0);
  const [allStepsData, setAllStepsData] = useState<IDrive>();
  const [pointOptions, setPointOptions] = useState<{ value: string }[]>([]);

  const [point, setPoint] = useState<string | undefined>(driveInfo?.mountPoint);

  const [saveing, setSaveing] = useState(false);
  const [drive, setDrive] = useState(driveInfo);

  useEffect(() => {
    if (isModalVisible) {
      // setCurrentStep(0);
      setOauthCreateToken(
        Math.random().toString(36).substr(2) +
          Math.random().toString(36).substr(2)
      );

      getPoints().then((res) => {
        if (res.success) {
          setPointOptions(
            res.data?.map((x) => {
              return { value: x };
            }) || []
          );
        }
      });

      if (driveInfo) {
        driveInfo.isRecycleBin = driveInfo.mountConfig?.isRecycleBin;
        driveInfo.mountDrive = driveInfo.mountConfig?.mountDrive;
        driveInfo.mountPath = driveInfo.mountConfig?.mountPath;
        driveInfo.mountPoint = driveInfo.mountConfig?.mountPoint;
        driveInfo.mountReadOnly = driveInfo.mountConfig?.mountReadOnly;
        driveInfo.mountOnStartup = driveInfo.mountConfig?.mountOnStartup;
        driveInfo.rapidUpload = driveInfo.mountConfig?.rapidUpload;
      }

      setDrive(driveInfo);
      setPoint(driveInfo?.mountPoint);
      if (form && driveInfo) {
        form.setFieldsValue(driveInfo);
      }
    }
  }, [driveInfo, form, isModalVisible]);

  const startOAuth = useCallback(() => {
    setOauthInProgress(true);
    const url = `https://openapi.alipan.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:base,file:all:read,file:all:write&relogin=true&state=${oauthCreateToken}`;
    const w = 680;
    const h = 760;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;
    const wnd = window.open(
      url,
      "_blank",
      `height=${h},width=${w},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no`
    );

    let countDown = 300;
    const recheck = () => {
      countDown--;
      if (countDown > 0 && oauthCreateToken) {
        fetchJsonp(
          `https://api.duplicati.net/api/open/aliyundrive/token?state=${oauthCreateToken}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data) {
              // 处理获取到的数据
              setToken(data);
              setOauthInProgress(false);
              wnd?.close();

              // 不关闭弹窗
              // setIsModalVisible(false);
            } else {
              setTimeout(recheck, 1000);
            }
          })
          .catch(() => {
            setTimeout(recheck, 1000);
          });
      } else {
        setOauthInProgress(false);
        wnd?.close();
      }
    };

    setTimeout(recheck, 6000);
  }, [oauthCreateToken, clientId, redirectUri]);

  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    onClose && onClose();
  }, [onClose]);

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

  const onMount = async () => {
    if (!driveInfo || !driveInfo.id) {
      message.error("保存云盘后才能执行挂载磁盘");
      return;
    }
    if (!point) {
      message.error("请选择或输入挂载点");
      return;
    }

    setSaveing(true);

    // 先保存配置
    form
      .validateFields()
      .then(async (data) => {
        data.refreshToken = token;
        data.mountPoint = point;
        data.mountConfig = {
          isRecycleBin: data.isRecycleBin,
          mountDrive: data.mountDrive,
          mountPath: data.mountPath,
          mountPoint: data.mountPoint,
          mountReadOnly: data.mountReadOnly,
          mountOnStartup: data.mountOnStartup,
          rapidUpload: data.rapidUpload,
        };
        if (driveInfo) {
          const res = await updateDrive(driveInfo.id, data);
          if (res?.success) {
            // 然后挂载
            const r2 = await updateSetDriveMount(driveInfo.id);
            if (r2.success) {
              message.success(
                "挂载成功，首次初始化列表需要1~5分钟，请耐心等待"
              );
              onOk && onOk();
              hideModal();
            } else {
              message.error(r2.message || "操作失败");
            }
            setSaveing(false);
          } else {
            message.error(res?.message || "操作失败");
          }
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo?.errorFields[0].errors[0]);
      })
      .finally(() => {
        setSaveing(false);
      });
  };

  const onUnmount = () => {
    if (!driveInfo || !driveInfo.id) {
      message.error("保存云盘后才能执行挂载磁盘");
      return;
    }
    setSaveing(true);
    updateSetDriveUnmount(driveInfo.id)
      .then((res) => {
        if (res.success) {
          message.success("操作成功");
          onOk && onOk();
          hideModal();
        } else message.error(res.message || "操作失败");
      })
      .finally(() => setSaveing(false));
  };

  /**
   * 保存云盘
   */
  const onDriveSave = async () => {
    if (!token) {
      message.error("请授权");
      return;
    }

    setSaveing(true);
    form
      .validateFields()
      .then(async (data) => {
        data.refreshToken = token;
        data.mountPoint = point;
        data.mountConfig = {
          isRecycleBin: data.isRecycleBin,
          mountDrive: data.mountDrive,
          mountPath: data.mountPath,
          mountPoint: data.mountPoint,
          mountReadOnly: data.mountReadOnly,
          mountOnStartup: data.mountOnStartup,
          rapidUpload: data.rapidUpload,
        };

        if (driveInfo) {
          const res = await updateDrive(driveInfo.id, data);
          if (res?.success) {
            message.success("保存成功");
            onOk && onOk();
            setSaveing(false);
            hideModal();
          } else {
            message.error(res?.message || "操作失败");
          }
        } else {
          const res = await addDrive(data);
          if (res?.success) {
            message.success("保存成功");
            onOk && onOk();
            setSaveing(false);
            hideModal();
          } else {
            message.error(res?.message || "操作失败");
          }
        }
      })
      .catch((errorInfo) => {
        message.error(errorInfo?.errorFields[0].errors[0]);
      })
      .finally(() => {
        setSaveing(false);
      });
  };

  /**
   * 删除云盘
   */
  const onDriveDelete = async () => {
    if (driveInfo) {
      const res = await deleteDrive(driveInfo.id);
      if (res?.success) {
        message.success("操作成功");
        hideModal();
        onOk && onOk();
      } else {
        message.error(res?.message || "操作失败");
      }
    }
  };

  return (
    <>
      <Dropdown.Button
        menu={{
          items: isAdd
            ? [
                {
                  key: "import",
                  label: "导入配置",
                },
                {
                  key: "export",
                  label: "导出配置",
                },
              ]
            : [
                {
                  key: "add",
                  label: "添加作业",
                },
              ],
          onClick: (e) => {
            if (e.key == "add") {
              onJobAdd && onJobAdd();
            }
          },
        }}
        size="small"
        className="mr-2"
        onClick={() => {
          showModal();
        }}
      >
        {isAdd ? <PlusOutlined /> : <EditOutlined />}
      </Dropdown.Button>

      <Modal
        title="阿里云盘授权"
        open={isModalVisible}
        onCancel={hideModal}
        width={760}
        footer={
          <div>
            <Button
              disabled={driveInfo?.isMount}
              loading={saveing}
              onClick={onDriveSave}
              type="primary"
            >
              保存
            </Button>
            <Button onClick={hideModal} type="default">
              取消
            </Button>
          </div>
        }
      >
        <Spin spinning={oauthInProgress} tip="授权中">
          <Steps
            className="py-3"
            onChange={(e) => {
              setCurrentStep(e);
            }}
            current={currentStep}
            progressDot
          >
            <Step title="授权管理" />
            <Step title="云盘挂载" />
          </Steps>

          <Form
            disabled={driveInfo?.isMount}
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            {currentStep == 0 && (
              <>
                <Form.Item
                  tooltip="点击扫码获取阿里云盘授权令牌"
                  label="授权令牌"
                >
                  <Input.TextArea
                    placeholder="授权令牌"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    rows={5}
                  ></Input.TextArea>
                  <span
                    className="text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={startOAuth}
                  >
                    点击扫码授权
                  </span>

                  {!isAdd && (
                    <Popconfirm
                      title="解除授权令牌？"
                      description="解除授权将会同时删除当前云盘下的所有作业"
                      onConfirm={onDriveDelete}
                      okText="确认"
                      cancelText="取消"
                      placement="topLeft"
                    >
                      <span className="text-red-500 cursor-pointer hover:text-red-700 w-auto flex">
                        解除授权
                      </span>
                    </Popconfirm>
                  )}
                </Form.Item>
              </>
            )}

            {currentStep == 1 && (
              <>
                <Form.Item
                  tooltip="云盘挂载到本地磁盘的位置"
                  label="挂载点"
                  help={
                    <span>
                      如果你想将云盘或云盘的某个目录挂载到本地磁盘，像访问本地磁盘一样访问云盘，请设置挂载到磁盘的位置。
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
                  {drive && drive.id && (
                    <div className="flex flex-row items-center py-2">
                      {drive.isMount ? (
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
                  tooltip="程序启动后，立即将云盘挂载到本地磁盘"
                  valuePropName="checked"
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
                  name="mountReadOnly"
                  label="只读模式"
                  tooltip="以只读模式挂载阿里云盘时，无法对文件修改删除等"
                  valuePropName="checked"
                >
                  <Checkbox />
                </Form.Item>
                <Form.Item
                  name="mountDrive"
                  label="云盘类型"
                  tooltip="选择挂载的阿里云盘是备份盘还是资源库"
                >
                  <Select>
                    <Select.Option value="backup">备份盘</Select.Option>
                    <Select.Option value="resource">资源库</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="mountPath"
                  label="云盘目录"
                  tooltip="指定挂载云盘的某个目录"
                  help="如果你希望只挂载某个目录到本地磁盘，则输入云盘路径，格式：文件夹/文件夹/文件夹，示例：backup/mdrive"
                >
                  <Input />
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
            {currentStep < 1 && (
              <Button ghost type="primary" onClick={() => next()}>
                下一步
              </Button>
            )}
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default OAuthComponent;
