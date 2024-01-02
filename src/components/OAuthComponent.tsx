import React, { useState, useCallback, useEffect } from "react";
import { Button, Modal } from "antd";
import fetchJsonp from "fetch-jsonp";
import { PlusOutlined } from "@ant-design/icons";

interface OAuthComponentProps {
  clientId: string;
  redirectUri: string;
  onClose: () => void;
}

const OAuthComponent: React.FC<OAuthComponentProps> = ({
  clientId,
  redirectUri,
  onClose,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [oauthInProgress, setOauthInProgress] = useState(false);
  const [oauthCreateToken, setOauthCreateToken] = useState("");
  const [token, setToken] = useState("");

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
              setIsModalVisible(false);
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
    onClose();
  }, [onClose]);

  return (
    <div>
      <Button
        type="link"
        size="small"
        icon={<PlusOutlined />}
        onClick={showModal}
      ></Button>
      {/* {token || "-"} */}
      <Modal
        title="阿里云盘登录授权"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
      >
        {oauthInProgress ? (
          <p>授权中 {token || '-'}</p>
        ) : (
          <Button type="primary" onClick={startOAuth}>
            扫码登录
          </Button>
        )}
      </Modal>
    </div>
  );
};

export default OAuthComponent;