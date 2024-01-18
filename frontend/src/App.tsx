import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { paths } from './routers';
import BaseHeader from './components/base-header';
import { Auth } from './components/auth';
import './App.css';

const App: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <div className="App">
      <Auth>
        {
          pathname === '/auth/user' ? (
            <Outlet/>
          ) : (
            <>
              <BaseHeader
                paths={paths}
              />
              <div className="body">
                <Outlet/>
              </div>
            </>
          )
        }
      </Auth>
    </div>
  );
}

export default App;
