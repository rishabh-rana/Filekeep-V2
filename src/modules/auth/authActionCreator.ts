import {
  SYNC_USERS,
  ISyncUsersAction,
  IUserData
} from "../../typesAndConstants/authTypes";

export function SyncUsers(userData: IUserData): ISyncUsersAction {
  return {
    type: SYNC_USERS,
    payload: userData
  };
}
