import React from "react";
import './index.css';
import { LVPair } from "../../types/common";
import { NavLink } from "react-router-dom";

interface NavigationToolProps {
  paths?: LVPair<string>[],
}

const NavigationTool: React.FC<NavigationToolProps> = (props) => {
  const { paths = [] } = props;
  return (
    <div className="navigation_tool-container">
      {
        paths.map(lv => (
          <div
            className="item"
            key={lv.value}
          >
            <NavLink
              to={lv.value}
            >
              {lv.label}
            </NavLink>
          </div>
        ))
      }
      <div className="item">

      </div>
    </div>
  )
}

export default NavigationTool;