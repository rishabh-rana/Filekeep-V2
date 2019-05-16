import React, { useEffect } from "react";
import { connect } from "react-redux";
import { AppState } from "./reducers/index";
import SignInWithGoogle from "./components/AuthScreens/SignInWithGoogle";

import { throwError } from "./actions/error/error";
import ErrorBoundary from "./components/ErrorHandlers/ErrorBoundary";
import { colors } from "./palette/colors";

import { setupPushNotifications } from "./utils/setupPushNotifications";
import { verifyLogin, LogoutAfterTimeout } from "./utils/verifyLogin";
import MainRouter from "./components/AppHelpers/MainRouter";

interface IAppProps {
  uid: string | null;
  throwError: any;
}

const App: React.FC<IAppProps> = (props: IAppProps) => {
  // SETUP PUSH NOTIFS

  useEffect(() => {
    if (props.uid) {
      // setup and use push notifications
      // second argument is the function to be called with the payload of the foreground notification
      setupPushNotifications(props.uid, (data: any) => {
        props.throwError({
          message: data.notification.body,
          color: colors.primary
        });
      });
      // logout if session has timed out or firebase has logged you out
      LogoutAfterTimeout();
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
      <MainRouter />
    </ErrorBoundary>
  );
};

const mapstate = (state: AppState) => {
  return {
    uid: state.authenticationState.uid
  };
};

export default connect(
  mapstate,
  { throwError }
)(App);
