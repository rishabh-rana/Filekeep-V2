import { combineReducers } from "redux";

import auth from "./auth/reducer";
import error from "./error/reducer";
import app from "./appReducer";
import board from "./app/Board/reducer";

const rootReducer = combineReducers({
  authenticationState: auth,
  errorState: error,
  app: combineReducers({
    appCore: app,
    board
  })
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
