import React, { useState, useCallback, useEffect } from "react";
import { Button, Input, Modal, Popconfirm, Spin, message } from "antd";
import fetchJsonp from "fetch-jsonp";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { IDrive } from "@/api/model";

interface OAuthComponentProps {
  isAdd?: boolean;
  clientId?: string;
  redirectUri?: string;
  drive?: IDrive;
  onClose?: () => void;
  onDelete?: () => Promise<void>;
  onOk?: (token: string) => Promise<void>;
}

const OAuthComponent: React.FC<OAuthComponentProps> = ({
  clientId = "12561ebaf6504bea8a611932684c86f6",
  redirectUri = "https://api.duplicati.net/api/open/aliyundrive",
  onClose,
  isAdd,
  drive: driveInfo,
  onDelete,
  onOk,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [oauthInProgress, setOauthInProgress] = useState(false);
  const [oauthCreateToken, setOauthCreateToken] = useState("");
  const [token, setToken] = useState(() => {
    return driveInfo?.refreshToken || "";
  });

  const [saveing, setSaveing] = useState(false);
  // const [drive, setDrive] = useState(driveInfo);

  useEffect(() => {
    if (isModalVisible) {
      setOauthCreateToken(
        Math.random().toString(36).substr(2) +
          Math.random().toString(36).substr(2)
      );
    }
  }, [isModalVisible]);

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

  // 保存
  const onSave = async () => {
    if (!token) {
      message.error("请授权");
      return;
    }

    setSaveing(true);
    onOk && (await onOk(token));
    setSaveing(false);
    hideModal();
  };

  return (
    <div>
      {isAdd ? (
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={showModal}
        ></Button>
      ) : (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={showModal}
        ></Button>
      )}

      <Modal
        title="阿里云盘授权"
        open={isModalVisible}
        onCancel={hideModal}
        width={760}
        footer={
          <div>
            <Button loading={saveing} onClick={onSave} type="primary">
              保存
            </Button>
            <Button onClick={hideModal} type="default">
              取消
            </Button>
          </div>
        }
      >
        <Spin spinning={oauthInProgress} tip="授权中">
          <div className="pb-6 mt-3">
            <div className="flex flex-row">
              <span className="flex flex-col flex-none w-20">
                <span>授权令牌：</span>
              </span>
              <div className="flex flex-col flex-1">
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
                    onConfirm={async () => {
                      onDelete && (await onDelete());
                      hideModal();
                    }}
                    okText="确认"
                    cancelText="取消"
                    placement="topLeft"
                  >
                    <span className="text-red-500 cursor-pointer hover:text-red-700 w-auto flex">
                      解除授权
                    </span>
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default OAuthComponent;
