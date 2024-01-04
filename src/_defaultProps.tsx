import { ChromeFilled, CrownFilled, SmileFilled } from "@ant-design/icons";

export default {
  route: {
    path: "/",
    routes: [
      {
        path: "/welcome",
        name: "欢迎",
        icon: <SmileFilled />,
        component: "./Welcome",
      },
      {
        path: "/admin",
        name: "设置",
        icon: <CrownFilled />,
        access: "canAdmin",
        component: "./Admin",
        routes: [
          {
            path: "/admin/sub-page1",
            name: "一级页面",
            icon: "https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg",
            component: "./Welcome",
          },
          {
            path: "/admin/sub-page2",
            name: "二级页面",
            icon: <CrownFilled />,
            component: "./Welcome",
          },
          {
            path: "/admin/sub-page3",
            name: "三级页面",
            icon: <CrownFilled />,
            component: "./Welcome",
          },
        ],
      },
      {
        path: "https://",
        name: "日志",
        icon: <ChromeFilled />,
      },
      {
        path: "https://ant.design",
        name: "关于",
        icon: <ChromeFilled />,
      },
    ],
  },
  location: {
    pathname: "/",
  },
};
