import {
  IAppState,
  ISyncFuseIndicesAction,
  SYNC_ROOT_FUSE_INDICES
} from "../typesAndConstants/appTypes";

const initialState: IAppState = {
  activeCompany: localStorage.getItem("activeCompany"),
  root_fuse_indices: false
};

const reducer = (
  state = initialState,
  action: ISyncFuseIndicesAction
): IAppState => {
  switch (action.type) {
    case SYNC_ROOT_FUSE_INDICES:
      return { ...state, root_fuse_indices: action.payload };
  }

  return state;
};

export default reducer;
