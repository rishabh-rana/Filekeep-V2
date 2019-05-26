import { combineReducers } from "redux";

import auth from "./auth/authReducer";
import error from "./error/errorReducer";
import app from "./appReducer";
import search from "./app/search/structuralSearchReducer";

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
