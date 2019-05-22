import { SYNC_USERS, ISyncUsersAction, IUserData } from "./authTypes";

export function SyncUsers(userData: IUserData): ISyncUsersAction {
  return {
    type: SYNC_USERS,
    payload: userData
  };
}
