import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AppState } from "./modules/indexReducer";
import SignInWithGoogle from "./pages/Login";

import { throwErrorCreator } from "./modules/error/actionCreator";
import ErrorBoundary from "./components/ErrorHandlers/ErrorBoundary";

// import { setupPushNotifications } from "./utils/setupPushNotifications";
import { verifyLogin, LogoutAfterTimeout } from "./utils/auth/verifyLogin";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { IErrorPopup } from "./modules/error/types";
import SetupFilekeep from "./pages/SetupCompany";
import AppMainRouter from "./AppMainRouter";
import { bootAppLoadData } from "./utils/appStartup/bootAppLoadData";
import { handleCachingStructure } from "./APIs/caching/databaseStructure/handleCaching";
import { updateActiveCompany } from "./utils/getVariableServerPaths";
import { SyncActiveCompany } from "./modules/appActionCreator";
// import { getData } from "./APIs/caching/test/generateData";

interface IAppProps {
  uid: string | null;
  throwError(errorObj: IErrorPopup): void;
  syncActiveCompany(activeCompany: string): void;
  activeCompany: string | null;
  setupCompany: boolean;
}

const App: React.FC<IAppProps> = (props: IAppProps) => {
  // setup push on app load, we will revamp this later
  // useEffect(() => {
  //   if (props.uid)
  //   // setup push notifications
  //   setupPushNotifications(props.uid);
  // }, []);

  // setup app state
  const [unsubscribe, changeUnsubscribe] = useState<(() => void)[]>();

  const setupAppForUser = async () => {
    console.log("setting up App for user");
    await bootAppLoadData();
    const unsubscribeStructure = await handleCachingStructure();
    // logout if session has timed out or firebase has logged you out
    const unsubscribeAuth = LogoutAfterTimeout();
    changeUnsubscribe([...unsubscribeStructure, unsubscribeAuth]);
  };

  useEffect(() => {
    if (props.uid && !props.setupCompany) {
      console.log("should run only on startup when signedin");
      const activeCompany = localStorage.getItem("activeCompany");
      if (activeCompany) {
        props.syncActiveCompany(activeCompany);
      } else {
        updateActiveCompany(props.uid);
      }
    }
  }, []);

  useEffect(() => {
    if (props.uid && props.activeCompany) {
      if (unsubscribe) unsubscribe.forEach(unsub => unsub);
      // sync, update and cache the taglist and setup auth check
      setupAppForUser();
    }
  }, [props.activeCompany]);

  // verify login every time the uid in the redux store changes
  useEffect(() => {
    verifyLogin();
  }, [props.uid]);

  // RENDER COMPONENTS BELOW

  // view authscreen if not signed In
  if (!props.uid) {
    if (unsubscribe) unsubscribe.forEach(unsub => unsub());
    localStorage.removeItem("activeCompany");
    return <SignInWithGoogle />;
  }

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
    uid: state.authenticationState.uid,
    activeCompany: state.app.appCore.activeCompany,
    setupCompany: state.app.appCore.setupCompany
  };
};

const mapdispatch = (dispatch: any) => {
  return {
    throwError: (errorObj: IErrorPopup) =>
      dispatch(throwErrorCreator(errorObj)),
    syncActiveCompany: (activeCompany: string) =>
      dispatch(SyncActiveCompany(activeCompany))
  };
};

export default connect(
  mapstate,
  mapdispatch
)(App);
