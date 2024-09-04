import {
  Action,
  AnyAction,
  CombinedState,
  combineReducers,
  configureStore,
  DeepPartial,
  EnhancedStore
} from "@reduxjs/toolkit";
import { useMemo } from "react";
import { ThunkAction, ThunkMiddleware } from "redux-thunk";

import app from "./features/app/appSlice";
import { AppSliceType } from "./features/app/lib/types";

const rootReducer = combineReducers({
  app
});

export type RootState = ReturnType<typeof rootReducer>;

let store:
  | EnhancedStore<
    CombinedState<{ app: AppSliceType }>,
    AnyAction,
    [
      | ThunkMiddleware<CombinedState<{ app: AppSliceType }>, AnyAction, null>
      | ThunkMiddleware<
        CombinedState<{ app: AppSliceType }>,
        AnyAction,
        undefined
      >
    ]
  >
  | null
  | undefined = null;

/**
 * @brief create a new store and pass an initalState for hydrate the state
 * @param initialState inital state
 * @return return a new instance of the store
 */
export const initStore = (initialState?: RootState) => {
  const _store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState as DeepPartial<any>
  });
  return _store;
};

/**
 * @brief for SSR SSG create a new instance of the store, for the client return an unique instance, also this method performs
 * an state hidratation, so on client side, it method can be use to merge Server state and current client state
 * @param preloadedState
 */
export const initializeStore = (preloadedState?: RootState) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useStore(initialState?: RootState) {
  const _store = useMemo(() => initializeStore(initialState), [initialState]);
  return _store;
}

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
