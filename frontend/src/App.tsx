import React from 'react';
import { Outlet } from 'react-router-dom';
import { paths } from './routers';
import './App.css';
import BaseHeader from './components/base-header';

const App: React.FC = () => {
  return (
    <div className="App">
      <BaseHeader
        paths={paths}
      />
      <div className="body">
        <Outlet/>
      </div>
    </div>
  );
}

export default App;
