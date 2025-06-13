"use client";
import { createStore, StateCreator } from "zustand/vanilla";

const isSSR = typeof window === "undefined";

// SSR-safe wrapper for Zustand stores with hydration support
const ssrSafe =
  <T>(config: StateCreator<T, [], [], T>): StateCreator<T, [], [], T> =>
  (setState, getState, store) => {
    if (!isSSR) {
      let hydrated = false;
      let initialState: T;
      const origGetInitialState = store.getInitialState;

      store.getInitialState = () =>
        hydrated ? initialState : origGetInitialState();

      // Create a simple hydrate method that respects setState overloads
      // Add hydrate to store
      (store as any).hydrate = (partial: Partial<T>) => {
        if (!hydrated) {
          setState(partial as any); // Use type assertion to handle overload complexity
          initialState = store.getState();
          hydrated = true;
        }
      };

      return config(setState, getState, store);
    }

    const ssrSetState: typeof setState = () => {
      throw new Error("Cannot set state of Zustand store in SSR");
    };

    store.setState = ssrSetState;
    return config(ssrSetState, getState, store);
  };

// Store types
export interface AppState {
  count: number;
  initialized: boolean;
}

export interface AppActions {
  initialize: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
  resetCount: () => void;
}

export type AppStore = AppState & AppActions;

export const defaultInitState: AppState = {
  count: 0,
  initialized: false,
};

const createStoreConfig =
  (initState: AppState): StateCreator<AppStore, [], [], AppStore> =>
  (setState, getState, store) => ({
    ...initState,

    initialize: (count: number) => {
      if (!getState().initialized) {
        const newState = { count, initialized: true };
        setState(newState);
        const storeWithHydrate = store as any;
        if (storeWithHydrate.hydrate) {
          storeWithHydrate.hydrate(newState);
        }
      }
    },

    incrementCount: () => {
      if (!isSSR) {
        setState((state: AppStore) => ({ count: state.count + 1 }));
      }
    },

    decrementCount: () => {
      if (!isSSR) {
        setState((state: AppStore) => ({ count: state.count - 1 }));
      }
    },

    resetCount: () => {
      if (!isSSR) {
        setState({ count: 0 });
      }
    },
  });

export const createAppStore = (initState: AppState = defaultInitState) => {
  return createStore<AppStore>()(
    ssrSafe<AppStore>(createStoreConfig(initState)),
  );
};

export const appStore = createAppStore();

// Add proper typing for the hydrate method on the store instance
declare module "zustand/vanilla" {
  interface StoreApi<T> {
    hydrate?: (partial: Partial<T>) => void;
  }
}

export { isSSR };
