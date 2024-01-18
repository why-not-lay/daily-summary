import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routers } from './routers';
import { ContextProvider } from './context/context-provider';
import './index.css';
import 'tdesign-react/es/style/index.css';

const router = createBrowserRouter(routers);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ContextProvider>
    <RouterProvider router={router}/>
  </ContextProvider>
);