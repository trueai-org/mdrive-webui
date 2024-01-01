import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { CreateAxiosOptions } from "./axiosTransform";

export class defAxios {
  private axiosInstance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * @description: Interceptor configuration
   */
  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) {
      return;
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform;

    // Request interceptor configuration processing
    this.axiosInstance.interceptors.request.use((config: any) => {
      if (requestInterceptors) {
        config = requestInterceptors(config);
      }
      return config;
    }, undefined);

    // Request interceptor error capture
    requestInterceptorsCatch &&
      this.axiosInstance.interceptors.request.use(
        undefined,
        requestInterceptorsCatch
      );

    // Response result interceptor processing
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      if (responseInterceptors) {
        res = responseInterceptors(res);
      }
      return res;
    }, undefined);

    // Response result interceptor error capture
    responseInterceptorsCatch &&
      this.axiosInstance.interceptors.response.use(
        undefined,
        responseInterceptorsCatch
      );
  }

  get<T = any>(config: AxiosRequestConfig, data?: any): Promise<T> {
    return this.request({ ...config, method: "GET", data });
  }

  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "POST" });
  }

  put<T = any>(config: AxiosRequestConfig, data?: any): Promise<T> {
    return this.request({ ...config, method: "PUT", data });
  }

  delete<T = any>(config: AxiosRequestConfig, data?: any): Promise<T> {
    return this.request({ ...config, method: "DELETE", data });
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const transform = this.getTransform();
    const { requestCatchHook, transformRequestHook } = transform || {};
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<any>>(config)
        .then((res: AxiosResponse<any>) => {
          if (transformRequestHook) {
            try {
              const ret = transformRequestHook(res);
              resolve(ret);
            } catch (err) {
              reject(err || new Error("request error!"));
            }
            return;
          }
          if (!res.data.success && res.data.message) {
            // Toast.show(res.data.message)
            // TODO error
            console.log("error", res);
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error) => {
          if (requestCatchHook) {
            reject(requestCatchHook(e));
            return;
          } else {
            // let msg = "请求失败"

            // if(e && e?.response && e.response.message) {

            //   msg = e.response.message
            // } else if(e.message) {
            //   msg = e.message
            // }
            // Toast.show(msg)
            // TODO msg
            console.log("msg", e);
          }
          reject(e);
        });
    });
  }
}
