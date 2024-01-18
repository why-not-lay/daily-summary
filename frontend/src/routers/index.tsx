import DailyList from '../views/daily-list';
import { serializePaths } from '../utils/app';
import App from '../App';
import Main from '../views/main';
import { UserAuth } from '../views/auth/user-auth';

export interface RouteConfig {
  label?: string,
  path?: string,
  element?: React.ReactNode | null;
  children?: RouteConfig[],
}

export const routers: RouteConfig[] = [
  {
    path: '/auth',
    element: <App/>,
    children: [
      {
        path: 'user',
        label: '用户验证',
        element: <UserAuth/>
      }
    ]
  },
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '',
        label: '主页',
        element: <Main />
      },
      {
        path: 'dailyList',
        label: '记录列表',
        element: <DailyList />
      }
    ]
  },
];

// 去除验证页面
export const paths = serializePaths(routers.slice(1));