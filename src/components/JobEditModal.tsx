import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  InputNumber,
  Button,
} from "antd";
import { IDriveJob } from "@/api/api";

interface JobEditModalProps {
  visible: boolean;
  onOk: (job: IDriveJob) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  jobConfig: IDriveJob;
}

const JobEditModal: React.FC<JobEditModalProps> = ({
  visible,
  onOk,
  onCancel,
  onDelete,
  jobConfig,
}) => {
  const [form] = Form.useForm<IDriveJob>();

  useEffect(() => {
    form.setFieldsValue(jobConfig);
  }, [jobConfig, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onOk(values);
    });
  };

  const handleDelete = () => {
    onDelete(jobConfig.id);
  };

  return (
    <Modal
      title="编辑作业配置"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      footer={[
        <Button
          key="delete"
          onClick={handleDelete}
          className="bg-red-500 text-white"
        >
          删除
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          保存
        </Button>,
      ]}
      className="w-full"
    >
      <Form form={form} layout="vertical" className="space-y-4">
        <Form.Item name="id" label="任务 ID">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="name"
          label="任务/作业名称"
          rules={[{ required: true, message: "请输入任务/作业名称" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="作业/任务描述">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="state" label="作业状态">
          <Select>
            {/* 根据您的 JobState 枚举定义选项 */}
            {/* 例如: <Select.Option value="idle">Idle</Select.Option> */}
          </Select>
        </Form.Item>
        <Form.Item name="mode" label="作业级别">
          <Select>
            <Select.Option value="Mirror">镜像</Select.Option>
            <Select.Option value="Incremental">增量</Select.Option>
            {/* ...其他模式... */}
          </Select>
        </Form.Item>
        <Form.Item name="schedules" label="作业计划">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>
        <Form.Item name="filters" label="过滤文件/文件夹">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>
        <Form.Item name="sources" label="源目录">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>
        <Form.Item name="target" label="目标存储目录">
          <Input />
        </Form.Item>
        <Form.Item name="restore" label="还原目录">
          <Input />
        </Form.Item>
        <Form.Item
          name="rapidUpload"
          label="是否启用秒传功能"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item name="defaultDrive" label="默认备份的云盘">
          <Select>
            <Select.Option value="resource">资源库</Select.Option>
            <Select.Option value="backup">备份盘</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="checkAlgorithm" label="文件对比检查算法">
          <Select>
            <Select.Option value="md5">MD5</Select.Option>
            <Select.Option value="sha1">SHA1</Select.Option>
            <Select.Option value="sha256">SHA256</Select.Option>
            {/* ...其他算法... */}
          </Select>
        </Form.Item>
        <Form.Item name="checkLevel" label="文件对比检查级别">
          <InputNumber min={0} max={4} />
        </Form.Item>
        <Form.Item
          name="fileWatcher"
          label="启用文件系统监听"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item name="order" label="显示顺序">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          name="isTemporary"
          label="是否为临时任务"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          name="isRecycleBin"
          label="是否启用回收站"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item name="uploadThread" label="上传并行任务数">
          <InputNumber min={0} max={10} />
        </Form.Item>
        <Form.Item name="downloadThread" label="下载并行任务数">
          <InputNumber min={0} max={10} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JobEditModal;
