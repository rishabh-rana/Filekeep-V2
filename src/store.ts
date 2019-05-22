import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import reducers from "./modules/indexReducer";
import middlewares from "./middlewares/index";

const store = createStore(reducers, {}, applyMiddleware(thunk, ...middlewares));

export default store;
