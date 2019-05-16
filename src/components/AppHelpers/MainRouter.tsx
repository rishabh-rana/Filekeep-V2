import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import ErrorPopup from "../ErrorHandlers/ErrorPopup";

interface IProps {}

const MainRouter: React.FC<IProps> = (props: IProps) => {
  return (
    <BrowserRouter>
      <React.Fragment>
        <Route path="/" component={() => <div>Hello Filekeep</div>} />
        <Route path="/" component={ErrorPopup} />
      </React.Fragment>
    </BrowserRouter>
  );
};

export default MainRouter;
