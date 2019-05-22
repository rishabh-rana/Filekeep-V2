// export action types
export const SYNC_USERS = "syncusers";

// export reducer state
export interface IAuthState {
  uid: string | null;
  displayName: string;
}

// export dipatch props
export interface IUserData {
  uid: string | null;
  displayName: string;
}

// export action types
export interface ISyncUsersAction {
  type: typeof SYNC_USERS;
  payload: IUserData;
}
