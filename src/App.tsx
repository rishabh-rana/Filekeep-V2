import React, { useEffect } from "react";
import { connect } from "react-redux";
import { AppState } from "./modules/indexReducer";
import SignInWithGoogle from "./pages/Login";

import { throwError } from "./modules/error/errorActions";
import ErrorBoundary from "./components/ErrorHandlers/ErrorBoundary";

import { setupPushNotifications } from "./utils/setupPushNotifications";
import { verifyLogin, LogoutAfterTimeout } from "./utils/verifyLogin";
import { BrowserRouter, Route } from "react-router-dom";
import ErrorPopup from "./components/ErrorHandlers/ErrorPopup";

import { updateAndCacheFuseIndices } from "./APIs/caching/databaseStructure/root";
import { updateAndCacheSharedFuseIndices } from "./APIs/caching/databaseStructure/sharedChannels";
import { syncFuseIndicesFromDB } from "./utils/syncFuseIndices";

interface IAppProps {
  uid: string | null;
  throwError: any;
}

const App: React.FC<IAppProps> = (props: IAppProps) => {
  const setupTaglist = async () => {
    await syncFuseIndicesFromDB();
    updateAndCacheFuseIndices();
    updateAndCacheSharedFuseIndices();
  };

  useEffect(() => {
    if (props.uid) {
      // push notifications
      setupPushNotifications(props.uid);
      // logout if session has timed out or firebase has logged you out
      LogoutAfterTimeout();
      // sync, update and cache the taglist
      setupTaglist();
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
          <Route path="/" component={() => <div>Hello Filekeep</div>} />
          <Route path="/" component={ErrorPopup} />
        </React.Fragment>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const mapstate = (state: AppState) => {
  return {
    uid: state.authenticationState.uid,
    companyData: state.coreCompanyData
  };
};

export default connect(
  mapstate,
  { throwError }
)(App);
