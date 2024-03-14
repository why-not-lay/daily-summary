import React from "react";
import { useStateContext } from "../../context/context-provider";
import { Navigate, useLocation } from "react-router-dom";
import { isAllMock } from "../../constant/common";

export const Auth: React.FC<{ children: any }> = ({ children }) => {
  const { pathname, state } = useLocation();
  const { isAuth } = useStateContext();

  let toAuth = false;
  let redirectPath = pathname;
  const redirectState: { redirect?: string } = {};

  if(pathname === '/auth/user') {
    if(isAuth) {
      toAuth = true;
      redirectPath = state?.redirect ?? '/';
    }
  } else {
    if(!isAuth) {
      toAuth = true;
      redirectPath = '/auth/user';
      redirectState.redirect = pathname;
    }
  }

  return (
    <>
      {
        toAuth && !isAllMock ? (
          <Navigate to={redirectPath} state={redirectState} replace/>
        ) : (
          children
        )
      }
    </>
  )
}