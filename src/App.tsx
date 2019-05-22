import React, { useEffect } from "react";
import { connect } from "react-redux";
import { AppState } from "./modules/indexReducer";
import SignInWithGoogle from "./pages/Login";

import { throwErrorCreator } from "./modules/error/errorActionCreator";
import ErrorBoundary from "./components/ErrorHandlers/ErrorBoundary";

import { setupPushNotifications } from "./utils/setupPushNotifications";
import { verifyLogin, LogoutAfterTimeout } from "./utils/verifyLogin";
import { BrowserRouter, Route } from "react-router-dom";
import ErrorPopup from "./components/ErrorHandlers/ErrorPopup";

import { syncPrivateStructureToState } from "./utils/syncPrivateStructureToState";

import SearchBar from "./components/SearchBar/search";
import { handleCachingStructure } from "./APIs/caching/databaseStructure/handleCaching";
import { IErrorPopup } from "./modules/error/errorTypes";

interface IAppProps {
  uid: string | null;
  throwError(errorObj: IErrorPopup): void;
}

const App: React.FC<IAppProps> = (props: IAppProps) => {
  const setupFuseIndices = async () => {
    await syncPrivateStructureToState();
    handleCachingStructure();
  };

  useEffect(() => {
    if (props.uid) {
      // push notifications
      setupPushNotifications(props.uid);
      // logout if session has timed out or firebase has logged you out
      LogoutAfterTimeout();
      // sync, update and cache the taglist
      setupFuseIndices();
    }
  }, []);

  // HANDLE LOGIN VERIFICATION

  // verify login every time the uid in the redux store changes
  useEffect(() => {
    verifyLogin();
  }, [props.uid]);

  // RENDER COMPONENTS BELOW

  // view authscreen if not signed In
  if (!props.uid) return <SignInWithGoogle />;

  // app
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <React.Fragment>
          <Route path="/" component={SearchBar} />
          <Route path="/" component={ErrorPopup} />
        </React.Fragment>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const mapstate = (state: AppState) => {
  return {
    uid: state.authenticationState.uid
  };
};

const mapdispatch = (dispatch: any) => {
  return {
    throwError: (errorObj: IErrorPopup) => dispatch(throwErrorCreator(errorObj))
  };
};

export default connect(
  mapstate,
  mapdispatch
)(App);
