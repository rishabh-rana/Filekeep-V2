import React from "react";
import styled from "styled-components";

const Error = styled.div`
  padding: 20px;
  padding-top: 50px;
  font-size: 25px;
  color: grey;
  opacity: 0.7;
  text-align: center;
`;

interface IProps {
  message: string;
}

const ErrorBoundaryTemplate: React.FC<IProps> = (props: IProps) => {
  // make a grapic and put it here, it should be fluid as it will be used at many points

  return (
    <React.Fragment>
      <Error>
        {props.message}
        <div onClick={() => window.location.reload()}>
          <i className="fas fa-sync-alt" />
          <div>Tap to Reload Page</div>
        </div>
      </Error>
    </React.Fragment>
  );
};
export default ErrorBoundaryTemplate;
