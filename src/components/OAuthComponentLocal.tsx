import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Popconfirm,
  message,
} from "antd";

import { EditOutlined } from "@ant-design/icons";
import { ILocalStorageConfig, LocalStorageEditRequest } from "@/api/model";
import { addStorage, deleteStorage, editStorage } from "@/api/local";

interface OAuthComponentProps {
  config?: ILocalStorageConfig;
  onClose?: () => void;
  onJobAdd?: () => void;
  onOk?: () => void;
}

const OAuthComponentLocal: React.FC<OAuthComponentProps> = ({
  onClose,
  config: info,
  onOk,
  onJobAdd,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [name, setName] = useState(() => {
    return info?.name || "";
  });

  const [form] = Form.useForm<LocalStorageEditRequest>();

  const [saveing, setSaveing] = useState(false);

  useEffect(() => {
    if (isModalVisible) {
      if (form && info) {
        form.setFieldsValue(info);
      }
    }
  }, [info, form, isModalVisible]);

  const showModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    onClose && onClose();
  }, [onClose]);

  /**
   * 保存
   */
  const onSave = async () => {
    if (!name) {
      message.error("请输入工作组名称");
      return;
    }

    setSaveing(true);
    form
      .validateFields()
      .then(async (data) => {
        data.name = name;

        if (info) {
          const res = await editStorage(info.id, data);
          if (res?.success) {
            message.success("保存成功");
            onOk && onOk();
            setSaveing(false);
            hideModal();
          } else {
            message.error(res?.message || "操作失败");
          }
        } else {
          const res = await addStorage(data);
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
   * 删除
   */
  const onLocalDelete = async () => {
    if (info) {
      const res = await deleteStorage(info.id);
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
          items: [
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
        <EditOutlined />
      </Dropdown.Button>

      <Modal
        title="本地存储配置"
        open={isModalVisible}
        onCancel={hideModal}
        width={760}
        footer={
          <div className="flex flex-row space-x-2 items-center justify-end">
            <Button loading={saveing} onClick={onSave} type="primary">
              保存
            </Button>
            <Button onClick={hideModal} type="default">
              取消
            </Button>
          </div>
        }
      >
        <Form
          className="py-6"
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="工作组名称"
            required
            help={
              <>
                <span>创建本地存储工作组后，才能添加作业。</span>
                <Popconfirm
                  title="删除工作组？"
                  description="删除工作组将会同时删除当前工作组下的所有作业"
                  onConfirm={onLocalDelete}
                  okText="确认"
                  cancelText="取消"
                  placement="topLeft"
                >
                  <span className="text-red-500 cursor-pointer hover:text-red-700 w-auto flex">
                    删除工作组
                  </span>
                </Popconfirm>
              </>
            }
          >
            <Input
              placeholder="请输入工作组名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default OAuthComponentLocal;
