import React from "react";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import HeaderBar from "./pages/Header";
import SearchBar from "./components/SearchBar/search";
import Profile from "./pages/Profile";
import ErrorPopup from "./components/ErrorHandlers/ErrorPopup";
import { connect } from "react-redux";
import { AppState } from "./modules/indexReducer";

interface IProps {
  shouldSetupCompany: boolean;
}

const AppMainRouter: React.FC<IProps> = (props: IProps) => {
  // redirect to setup company if not done yet
  if (props.shouldSetupCompany) return <Redirect to="/setup" />;

  return (
    <BrowserRouter>
      <React.Fragment>
        <Route path="/" component={HeaderBar} />
        <Route path="/" exact component={SearchBar} />
        <Route path="/profile" exact component={Profile} />
        <Route path="/" component={ErrorPopup} />
      </React.Fragment>
    </BrowserRouter>
  );
};

const mapstate = (state: AppState) => {
  return {
    shouldSetupCompany: state.app.appCore.setupCompany
  };
};

export default connect(mapstate)(AppMainRouter);
