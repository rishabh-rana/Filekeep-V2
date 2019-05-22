import { combineReducers } from "redux";

import auth from "./auth/authReducer";
import error from "./error/errorReducer";
import app from "./appReducer";

const rootReducer = combineReducers({
  authenticationState: auth,
  errorState: error,
  app
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
