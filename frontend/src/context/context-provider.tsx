import React, { Reducer, createContext, useContext, useReducer } from "react";

enum ActionTypes {
  UPDATE_STATE = 'UPDATE_STATE',
}

interface GlobalState {
  isAuth?: boolean,
  key?: string,
}

interface Action {
  type: ActionTypes.UPDATE_STATE,
  payloads: any,
}

const Context = createContext<GlobalState>({});
const DispatchContext = createContext<React.Dispatch<Action>>(() => ({}));

const reducer = (state: GlobalState, action: Action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_STATE: {
      return {
        ...state,
        ...action.payloads
      }
    }
  }
}

export const useStateContext = () => useContext(Context);
export const useDispatchContext = () => useContext(DispatchContext);

export const ContextProvider: React.FC<{ children: any }> = ({ children }) => {

  const [state, dispatch] = useReducer<Reducer<GlobalState, Action>>(reducer, { isAuth: false })

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        { children }
      </DispatchContext.Provider>
    </Context.Provider>
  )
}