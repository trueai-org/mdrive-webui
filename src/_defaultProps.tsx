import {
  SmileFilled,
  SettingFilled,
  // InfoCircleFilled,
  LikeTwoTone,
  GithubFilled,
} from "@ant-design/icons";

export default {
  route: {
    path: "/",
    routes: [
      {
        path: "/welcome",
        name: "欢迎",
        icon: <SmileFilled />,
      },

      {
        path: "/setting",
        name: "设置",
        icon: <SettingFilled />,
      },
      // {
      //   path: "/about",
      //   name: "关于",
      //   icon: <InfoCircleFilled />,
      // },
      {
        path: "https://github.com/trueai-org/mdrive",
        name: "官网",
        icon: <GithubFilled />,
      },
      {
        path: "/support",
        name: "赞助",
        icon: <LikeTwoTone />,
      },
    ],
  },
  location: {
    pathname: "/",
  },
};
