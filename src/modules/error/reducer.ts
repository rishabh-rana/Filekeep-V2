import {
  IErrorState,
  ITHROW_ERROR_ACTION,
  IRESOLVE_ERROR_ACTION,
  THROW_ERROR,
  RESOLVE_ERROR
} from "./types";
import { colors } from "../../colors";

const initialState: IErrorState = {
  error: false,
  data: {}
};

enum DefaultValues {
  message = "Something went wrong, please try again",
  duration = 3500
}

const reducer = (
  state = initialState,
  action: ITHROW_ERROR_ACTION | IRESOLVE_ERROR_ACTION
): IErrorState => {
  switch (action.type) {
    case THROW_ERROR:
      let { message, color, clickAction, duration } = action.payload;

      // set defaults
      message = message ? message : DefaultValues.message;
      color = color ? color : colors.yellow;
      duration = duration ? duration : DefaultValues.duration;
      clickAction = clickAction ? clickAction : () => {};

      return {
        ...state,
        error: true,
        data: { message, color, duration, clickAction }
      };

    case RESOLVE_ERROR:
      return {
        ...state,
        error: false,
        data: {}
      };
  }

  return state;
};

export default reducer;
