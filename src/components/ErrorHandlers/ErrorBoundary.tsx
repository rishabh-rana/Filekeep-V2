import React from "react";
import ErrorBoundaryTemplate from "./ErrorBoundaryTemplate";
import mixpanel from "../../config/mixpanel";

interface IProps {
  message?: string;
}

interface IState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<IProps, IState> {
  state = {
    hasError: false
  };
  //catch error from children
  componentDidCatch(error: any, info: any) {
    mixpanel.track("CrashedApplication");
    this.setState({
      hasError: true
    });
  }
  render() {
    if (this.state.hasError) {
      //return a template for the error page if error [make a graphic for this]
      console.log(this.props.message);
      return (
        <ErrorBoundaryTemplate
          message={
            this.props.message || "Something went wrong please reload the page"
          }
        />
      );
    } else {
      // return children if no error
      return this.props.children;
    }
  }
}

export default ErrorBoundary;
