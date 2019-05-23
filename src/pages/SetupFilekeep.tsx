import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { AppState } from "../modules/indexReducer";

const Container = styled.div`
  padding: 0 25px;
`;

interface IProps {
  displayName: string;
}

const SetupFilekeep: React.FC<IProps> = (props: IProps) => {
  return <Container>Setting up Filekeep, {props.displayName}!</Container>;
};

const mapState = (state: AppState) => {
  return {
    displayName: state.authenticationState.displayName
  };
};

export default connect(mapState)(SetupFilekeep);
