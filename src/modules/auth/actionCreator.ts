import { SYNC_USERS, ISyncUsersAction, IUserData } from "./types";

export function SyncUsers(userData: IUserData): ISyncUsersAction {
  return {
    type: SYNC_USERS,
    payload: userData
  };
}
