import DailyList from '../views/daily-list';
import { serializePaths } from '../utils/app';
import App from '../App';
import Main from '../views/main';

export interface RouteConfig {
  label?: string,
  path?: string,
  element?: React.ReactNode | null;
  children?: RouteConfig[],
}

export const routers: RouteConfig[] = [
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
  }
];

export const paths = serializePaths(routers);