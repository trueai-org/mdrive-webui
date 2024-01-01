// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosResponse } from "axios";
import type { AxiosTransform, CreateAxiosOptions } from "./axiosTransform";
import { defAxios } from "./defAxios";

// import axios from "axios";
// import React from "react";

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误
   */
  transformRequestHook: (res: AxiosResponse<any>) => {
    console.log("res", res);

    if (!res) {
      return;
    }

    return res;

    // const { status } = res;

    // if (status === 401) {
    //   error401Count++;
    //   localStorage.setItem("error401Count", error401Count.toString());
    //   // console.log("401", error401Count);

    //   // 3次后才推出
    //   if (error401Count >= 3) {
    //     Toast.show("登录失效");
    //     GP.logout();
    //     localStorage.removeItem("error401Count");
    //   }

    //   // 1.5s 后重新加载
    //   setTimeout(() => {
    //     window.location.reload();
    //   }, 1500);

    //   // 直接返回
    //   return;

    //   // let hash = window.location.hash;
    //   // if (hash && !hash.endsWith("login")) {
    //   //   if (hash.indexOf("/") >= 0) {
    //   //     hash = hash.substring(hash.indexOf("/") + 1);
    //   //   }
    //   // }

    //   // // 跳转路由
    //   // // history.push("/login");
    //   // window.location.href =
    //   //   "/v2/login" + (hash && "/" + hash) + "?autoLogin=1";

    //   // return;
    // }

    // const { data: result } = res;
    // if (!result) {
    //   Toast.show("请求失败");
    //   return;
    // }

    // // 后端返回字段
    // const { code, success, message, data } = result;

    // if (success) {
    //   return data;
    // }

    // // 全局自定义业务编码
    // if (code === 2001) {
    //   Toast.show(message || "您的企业微信账号未绑定机构后台账号");
    //   window.location.href = "/v2/login-warning";
    //   return;
    // } else if (code === 2002) {
    //   Toast.show(message || "企业微信未注册员工，请注册员工账号");
    //   window.location.href = "/v2/login?register=1";
    //   return;
    // }

    // // 试用已到期
    // if (code === 4002) {
    //   console.log(window.location);
    //   let pathname = window.location.pathname;
    //   if (pathname == "/v2/login") {
    //     // 登录页面
    //     handleShowLogoDialog(
    //       "该账号的试用已到期，账号无法登录",
    //       "请联系校加工作人员进行续费~"
    //     );
    //   } else {
    //     // 操作页面
    //     handleShowPageDialog(
    //       "该账号的试用已到期，请联系下方客服进行续费~",
    //       "若对校加系统的功能不熟悉，或不知道什么场景才适用，也可以联系客服进行功能咨询和演示哦~"
    //     );
    //   }
    //   return;
    // }

    // // 合作已到期
    // if (code === 4003) {
    //   let pathname = window.location.pathname;
    //   if (pathname == "/v2/login") {
    //     // 登录页面
    //     handleShowLogoDialog(
    //       "该企业合作已到期，账号无法登录",
    //       "请联系校加工作人员进行续费~"
    //     );
    //   } else {
    //     // 操作页面
    //     handleShowPageDialog(
    //       "系统使用权限已到期，账号无法继续使用该功能。请及时联系工作人员续费~"
    //     );
    //   }
    //   return;
    // }

    // // 暂停合作
    // if (code === 4004) {
    //   let pathname = window.location.pathname;
    //   if (pathname == "/v2/login") {
    //     handleShowLogoDialog(
    //       "该企业已暂停合作，账号无法登录",
    //       "如有其他需求，请联系校加工作人员~"
    //     );
    //   } else {
    //     let img = React.createElement("img", {
    //       src: "/v2/images/service-code1.png",
    //       style: {
    //         width: "136px",
    //         height: "136px",
    //         marginLeft: "20%",
    //         marginTop: "20px",
    //       },
    //     });
    //     let text = React.createElement(
    //       "div",
    //       null,
    //       "该企业已暂停合作，账号无法继续使用该功能。如有其他需求，请联系校加工作人员~"
    //     );
    //     handleShowPageDialog(
    //       "该企业已暂停合作，账号无法继续使用该功能。如有其他需求，请联系校加工作人员~"
    //     );
    //   }
    //   return;
    // }

    // // 账号开通数量已上限
    // if (code === 4010) {
    //   handleShowLogoDialog("该手机号开通数量超出限制");
    //   return;
    // }

    // // 账号已存在
    // if (code === 4020) {
    //   handleShowLogoDialog("该手机号已被注册");
    //   return;
    // }

    // if (!success && message) {
    //   console.log("message", message);
    //   Toast.show(message);
    //   return Promise.reject(result);
    // }
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config) => {
    // // 请求之前处理config
    // const token = GP.getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    // if (error?.response?.status === 401) {

    //   error401Count++;
    //   localStorage.setItem("error401Count", error401Count.toString());
    //   // console.log("401", error401Count);

    //   // 3次后才推出
    //   if (error401Count >= 3) {
    //     Toast.show("登录失效");
    //     GP.logout();
    //     localStorage.removeItem("error401Count");
    //   }

    //   // 1.5s 后重新加载
    //   setTimeout(() => {
    //     window.location.reload();
    //   }, 1500);

    //   return new Promise(() => {});

    //   // let hash = window.location.hash;
    //   // if (hash && !hash.endsWith("login")) {
    //   //   if (hash.indexOf("/") >= 0) {
    //   //     hash = hash.substring(hash.indexOf("/") + 1);
    //   //   }
    //   // }

    //   // // 跳转路由
    //   // // history.push("/v2/login");
    //   // window.location.href =
    //   //   "/v2/login" + (hash && "/" + hash) + "?autoLogin=1";

    //   // return new Promise(() => {});
    // }

    // if (error?.response?.status >= 500) {
    //   Toast.show("请求失败");
    // }

    // if (axios.isCancel(error)) {
    //   console.log("Cancel error", error);
    //   return new Promise(() => {});
    // }

    // if (axios.isAxiosError(error)) {
    //   const url = window.location.href;

    //   console.log("isAxiosError error", url, error);

    //   // 暂时不再抛出错误，以后处理 todo
    //   return new Promise(() => {});

    //   // 关于回调的链接特殊处理，由于回调被取消了，不抛出异常
    //   // 如果出现其他异常，则需要正常提示，否则接口 finally 无法捕获
    //   // if (url.includes("auth-callback") || url.includes("open.weixin.qq.com")) {
    //   //   return new Promise(() => {});
    //   // }
    // }

    return Promise.reject(error);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  const config: CreateAxiosOptions = {
    // TODO
    // baseURL: apiUrl,
    transform,
    proxy: false,
    withCredentials: true,
  };
  return new defAxios({ ...config, ...opt });
}

export const defHttp = createAxios();

function createUploadAxios(opt?: Partial<CreateAxiosOptions>) {
  const config: CreateAxiosOptions = {
    // TODO
    // baseURL: '',
    transform,
    proxy: false,
    withCredentials: true,
  };
  return new defAxios({ ...config, ...opt });
}

export const uploadHttp = createUploadAxios();
