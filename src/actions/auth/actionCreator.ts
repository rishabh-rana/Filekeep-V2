import {
  SYNC_USERS,
  ISyncUsersAction,
  IUserData
} from "../../types/store/auth";

export function SyncUsers(userData: IUserData): ISyncUsersAction {
  return {
    type: SYNC_USERS,
    payload: userData
  };
}
