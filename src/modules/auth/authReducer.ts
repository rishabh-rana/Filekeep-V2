import {
  IAuthState,
  ISyncUsersAction,
  SYNC_USERS
} from "../../typesAndConstants/authTypes";

const initialState: IAuthState = {
  uid:
    localStorage.getItem("uid") === null ? null : localStorage.getItem("uid"),
  displayName: "User"
};

const reducer = (
  state = initialState,
  action: ISyncUsersAction
): IAuthState => {
  switch (action.type) {
    case SYNC_USERS:
      if (action.payload && action.payload.uid) {
        localStorage.setItem("uid", action.payload.uid);
        localStorage.setItem("displayName", action.payload.displayName);
        return {
          ...state,
          uid: action.payload.uid,
          displayName: action.payload.displayName
        };
      } else {
        localStorage.removeItem("uid");
        localStorage.removeItem("displayName");
        return { ...state, uid: null, displayName: "User" };
      }
  }

  return state;
};

export default reducer;
