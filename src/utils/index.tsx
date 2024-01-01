import { Tag } from "antd";
import { JobState } from "../api";

export const getJobStateTag = (state: JobState) => {
  let color = "default";
  let text = "";

  switch (state) {
    case JobState.None:
      color = "grey";
      text = "默认";
      break;
    case JobState.Initializing:
      color = "blue";
      text = "初始化中";
      break;
    case JobState.Idle:
      color = "green";
      text = "空闲";
      break;
    case JobState.Starting:
      color = "orange";
      text = "启动中";
      break;
    case JobState.Scanning:
      color = "cyan";
      text = "扫描中";
      break;
    case JobState.BackingUp:
      color = "purple";
      text = "备份中";
      break;
    case JobState.Restoring:
      color = "magenta";
      text = "还原中";
      break;
    case JobState.Verifying:
      color = "gold";
      text = "校验中";
      break;
    case JobState.Queued:
      color = "lime";
      text = "队列中";
      break;
    case JobState.Completed:
      color = "success";
      text = "完成";
      break;
    case JobState.Paused:
      color = "warning";
      text = "暂停";
      break;
    case JobState.Error:
      color = "error";
      text = "错误";
      break;
    case JobState.Cancelling:
      color = "volcano";
      text = "取消中";
      break;
    case JobState.Cancelled:
      color = "default";
      text = "已取消";
      break;
    case JobState.Disabled:
      color = "black";
      text = "禁用";
      break;
    default:
      text = "未知";
  }

  return <Tag color={color}>{text}</Tag>;
};

export const getJobStateName = (stateValue: number) => {
  switch (stateValue) {
    case JobState.None:
      return "默认";
    case JobState.Initializing:
      return "初始化中";
    case JobState.Idle:
      return "空闲";
    case JobState.Starting:
      return "启动中";
    case JobState.Scanning:
      return "扫描中";
    case JobState.BackingUp:
      return "备份中";
    case JobState.Restoring:
      return "还原中";
    case JobState.Verifying:
      return "校验中";
    case JobState.Queued:
      return "队列中";
    case JobState.Completed:
      return "完成";
    case JobState.Paused:
      return "暂停";
    case JobState.Error:
      return "错误";
    case JobState.Cancelling:
      return "取消中";
    case JobState.Cancelled:
      return "已取消";
    case JobState.Disabled:
      return "禁用";
    default:
      return "未知";
  }
};

export function formatFileSize(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
