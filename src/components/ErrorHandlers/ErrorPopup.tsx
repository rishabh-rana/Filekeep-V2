import React, { useEffect } from "react";
import { connect } from "react-redux";
import styled, { keyframes } from "styled-components";

import { resolveErrorCreator } from "../../modules/error/actionCreator";

import { AppState } from "../../modules/indexReducer";
import { IErrorState } from "../../modules/error/types";

const comeInFromTop = keyframes`
  0% {
    top : -100px;
  }

  10% {
    top : 0;
  }

  90% {
    top : 0;
  }

  100% {
    top : -100px;
  }
`;

interface IErrorPopupStyled {
  duration: number;
  color: string;
}

const ErrorPopupStyled = styled.div<IErrorPopupStyled>`
  position: absolute;
  top: 0;
  transition: 0.5s;
  left: 0;
  right: 0;
  animation: ${comeInFromTop} ${props => props.duration + 100 + "ms"};
  min-height: 60px;
  font-size: 18px;
  padding: 10px;
  padding-top: 25px;
  padding-left: 20px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background: white;
  border-bottom: 4px solid ${props => props.color};
`;

interface IErrorPopupHandlerProps {
  resolveError: any;
  errorData: IErrorState;
}

const ErrorPopupHandler: React.FC<IErrorPopupHandlerProps> = (
  props: IErrorPopupHandlerProps
) => {
  return props.errorData.error ? (
    <ErrorPopup resolveError={props.resolveError} errorData={props.errorData} />
  ) : null;
};

interface IErrorPopupProps {
  resolveError: any;
  errorData: IErrorState;
}

const ErrorPopup: React.FC<IErrorPopupProps> = (props: IErrorPopupProps) => {
  useEffect(() => {
    if (
      props &&
      props.errorData.error &&
      props.errorData &&
      props.errorData.data &&
      props.errorData.data.duration
    ) {
      setTimeout(() => {
        props.resolveError();
      }, props.errorData.data.duration);
    } else {
      props.resolveError();
    }
  }, [props]);

  return (
    <ErrorPopupStyled
      color={props.errorData.data.color || "yellow"}
      duration={props.errorData.data.duration || 3500}
      onClick={() => {
        if (props.errorData.data.clickAction) {
          props.errorData.data.clickAction();
        }

        props.resolveError();
      }}
    >
      {props.errorData.data.message}
    </ErrorPopupStyled>
  );
};

const mapstate = (state: AppState) => {
  return {
    errorData: state.errorState
  };
};

const mapdispatch = (dispatch: any) => {
  return {
    resolveError: () => dispatch(resolveErrorCreator())
  };
};

export default connect(
  mapstate,
  mapdispatch
)(ErrorPopupHandler);
