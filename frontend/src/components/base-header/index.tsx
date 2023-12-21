import React from "react";
import { Menu } from 'tdesign-react';
import { LVPair } from "../../types/common";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const { HeadMenu, MenuItem } = Menu;

interface BaseHeaderProps {
  paths?: LVPair<string>[],
}

const BaseHeader: React.FC<BaseHeaderProps> = (props) => {
  const { paths = [] } = props;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <HeadMenu
      className="base_header"
      theme="dark"
      value={pathname}
    >
      {
        paths.map(lv => (
          <MenuItem
            key={lv.value}
            value={lv.value}
            onClick={() => navigate(lv.value)}
          >
            {lv.label}
          </MenuItem>
        ))
      }
    </HeadMenu>
  )
}

export default BaseHeader;