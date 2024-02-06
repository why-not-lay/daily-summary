import React, { Reducer, createContext, useContext, useReducer } from "react";

export enum ActionTypes {
  UPDATE_STATE = 'UPDATE_STATE',
}

interface GlobalState {
  isAuth?: boolean,
  token?: string,
  tid?: string,
}

interface Action {
  type: ActionTypes.UPDATE_STATE,
  payloads?: any,
}

const DEFAULT_STATE = {
  isAuth: false
}

// 状态快照，用于弥补 hook 外不能获取 state 的缺陷
const { getView, setView } = ((defaultView: GlobalState) => {
  let view = defaultView;
  const setView = (state: GlobalState) => {
    view = state;
  }
  const getView = () => view;
  return {
    getView,
    setView
  }
})(DEFAULT_STATE);

const Context = createContext<GlobalState>({});
const DispatchContext = createContext<React.Dispatch<Action>>(() => ({}));

const reducer = (state: GlobalState, action: Action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_STATE: {
      const newState = {
        ...state,
        ...action.payloads
      }
      setView(newState);
      return newState;
    }
  }
}

export { getView }
export const useStateContext = () => useContext(Context);
export const useDispatchContext = () => useContext(DispatchContext);

export const ContextProvider: React.FC<{ children: any }> = ({ children }) => {

  const [state, dispatch] = useReducer<Reducer<GlobalState, Action>>(reducer, DEFAULT_STATE);

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        { children }
      </DispatchContext.Provider>
    </Context.Provider>
  )
}