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
} from "antd";
import { IDriveJob } from "@/api/model";

const { Step } = Steps;

interface JobEditModalProps {
  visible: boolean;
  onOk: (job: IDriveJob) => void;
  onCancel: () => void;
  jobConfig: IDriveJob;
}

const JobEditModal: React.FC<JobEditModalProps> = ({
  visible,
  onOk,
  onCancel,
  jobConfig,
}) => {
  const [form] = Form.useForm<IDriveJob>();
  const [currentStep, setCurrentStep] = useState(0);
  const [allStepsData, setAllStepsData] = useState<IDriveJob>();
  const [msg, contextHolder] = message.useMessage();
  const [saveing, setSaveing] = useState(false);

  useEffect(() => {
    if (form && visible) {
      setAllStepsData(jobConfig);
      form.setFieldsValue(jobConfig);
    }
  }, [visible, jobConfig, form]);

  const updateStepData = () => {
    form.validateFields().then((values) => {
      setAllStepsData({ ...allStepsData, ...values });
    });
  };

  const next = () => {
    form
      .validateFields()
      .then((values) => {
        setAllStepsData({ ...allStepsData, ...values });
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        msg.error(errorInfo?.errorFields[0].errors[0]);
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
        msg.error(errorInfo?.errorFields[0].errors[0]);
      });
  };

  const handleSubmit = () => {
    setSaveing(true);
    form
      .validateFields()
      .then((values) => {
        const value: IDriveJob = { ...allStepsData, ...values };
        setAllStepsData(value);
        onOk && onOk(value);
      })
      .catch((errorInfo) => {
        msg.error(errorInfo?.errorFields[0].errors[0]);
      })
      .finally(() => {
        setSaveing(false);
      });
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
      {contextHolder}
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
      </Steps>

      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        {currentStep == 0 && (
          <>
            <Form.Item required name="id" label="作业标识">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="name"
              label="作业名称"
              rules={[{ required: true, message: "请输入任务/作业名称" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="作业描述">
              <Input />
            </Form.Item>
            <Form.Item name="schedules" label="作业计划">
              <Select mode="tags" tokenSeparators={[","]} />
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
          </>
        )}
        {currentStep == 1 && (
          <>
            <Form.Item
              name="sources"
              label="本地目录"
              tooltip="源路劲、本地路径，请选择本地文件夹"
            >
              <Select mode="tags" tokenSeparators={[","]} />
            </Form.Item>

            <Form.Item
              name="defaultDrive"
              label="目标位置"
              tooltip="阿里云盘的存储位置，个人私有文件建议存储到备份盘"
            >
              <Select>
                <Select.Option value="resource">资源库</Select.Option>
                <Select.Option value="backup">备份盘</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="target"
              label="目标目录"
              tooltip="云盘存储路径，远程备份/同步存储的路径"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="filters"
              label="过滤文件"
              tooltip="排除本地不需要过滤的文件/文件夹"
            >
              <Select mode="tags" tokenSeparators={[","]} />
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
          </>
        )}
        {currentStep == 2 && (
          <>
            <Form.Item
              name="checkAlgorithm"
              tooltip="文件是否变更检查算法"
              label="文件对比检查算法"
            >
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
                <span>
                  0：比较文件大小和时间，1：采样计算文件
                  hash（推荐），2：比较整个文件的 hash
                  <br />
                  3：比较文件头部 hash，4：比较文件尾部 hash
                </span>
              }
            >
              <InputNumber min={0} max={4} />
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

      <div className="pt-3 items-center justify-center w-full flex">
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
