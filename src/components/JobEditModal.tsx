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

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    form.setFieldsValue(jobConfig);
  }, [jobConfig, form]);

  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(currentStep - 1);

  const { Step } = Steps;

  return (
    <Modal
      title="作业配置"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="submit" type="primary" onClick={handleSubmit}>
          保存
        </Button>,
        <Button key="delete" onClick={handleDelete} danger>
          删除
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
      ]}
      className="w-full"
    >
      <Steps className="py-3" onChange={setCurrentStep} current={currentStep}>
        <Step title="基本信息" />
        <Step title="作业配置" />
        <Step title="高级设置" />
      </Steps>

      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        {currentStep == 0 && (
          <>
            <Form.Item required name="id" label="任务 ID">
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
              <Input />
            </Form.Item>
            {/* <Form.Item name="state" label="作业状态">
         
            </Form.Item> */}
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
          </>
        )}
        {currentStep == 1 && (
          <>
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
          </>
        )}
        {currentStep == 2 && (
          <>
            <Form.Item name="checkAlgorithm" label="文件对比检查算法">
              <Select>
                <Select.Option value="md5">MD5</Select.Option>
                <Select.Option value="sha1">SHA1</Select.Option>
                <Select.Option value="sha256">SHA256</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="checkLevel"
              label="文件对比检查级别"
              tooltip="文件变更时，文件是否变动检查算法级别，默认：1"
              help={
                <span className="text-gray-400">
                  0：比较文件大小和时间，1：采样计算文件
                  hash（推荐），2：比较整个文件的 hash
                  <br />
                  3：比较文件头部 hash，4：比较文件尾部 hash
                </span>
              }
            >
              <InputNumber defaultValue={1} min={0} max={4} />
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
              name="isTemporary"
              label="立即执行"
              tooltip="是否为临时作业，也表示是否立即执行作业"
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
      </Form>

      <div className="mt-3 items-center justify-center w-full flex">
        {currentStep > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            上一步
          </Button>
        )}
        {currentStep < 2 && (
          <Button ghost type="primary" onClick={() => next()}>
            下一步
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default JobEditModal;
