import { combineReducers } from "redux";

import auth from "./auth";
import error from "./error";

const rootReducer = combineReducers({
  authenticationState: auth,
  errorState: error
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
