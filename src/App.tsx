import React, { useEffect } from "react";
import { connect } from "react-redux";
import { AppState } from "./modules/indexReducer";
import SignInWithGoogle from "./pages/Login";

import { throwErrorCreator } from "./modules/error/errorActionCreator";
import ErrorBoundary from "./components/ErrorHandlers/ErrorBoundary";

import { setupPushNotifications } from "./utils/setupPushNotifications";
import { verifyLogin, LogoutAfterTimeout } from "./utils/verifyLogin";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { syncPrivateStructureToState } from "./utils/syncPrivateStructureToState";

import { handleCachingStructure } from "./APIs/caching/databaseStructure/handleCaching";
import { IErrorPopup } from "./modules/error/errorTypes";
import SetupFilekeep from "./pages/SetupFilekeep";
import AppMainRouter from "./AppMainRouter";

interface IAppProps {
  uid: string | null;
  throwError(errorObj: IErrorPopup): void;
}

const App: React.FC<IAppProps> = (props: IAppProps) => {
  const syncCachePrivateStructure = async () => {
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
      syncCachePrivateStructure();
    }
    //@ts-ignore
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
          <Switch>
            <Route path="/setup" component={SetupFilekeep} />
            <Route path="/" component={AppMainRouter} />
          </Switch>
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
