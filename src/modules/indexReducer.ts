import { combineReducers } from "redux";

import auth from "./auth/reducer";
import error from "./error/reducer";
import app from "./appReducer";
import search from "./app/buildStructure/reducer";

const rootReducer = combineReducers({
  authenticationState: auth,
  errorState: error,
  app: combineReducers({
    appCore: app,
    search
  })
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
