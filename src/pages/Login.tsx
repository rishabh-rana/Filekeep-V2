import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Dispatch } from "redux";
import { signInWithGoogle } from "./Login/signInWithGoogle";

const Container = styled.div`
  padding: 20px;
  text-align: center;
  padding-top: 50px;
`;

const SignInButton = styled.div`
  height: 100px;
  max-width: 400px;
  margin: 0 auto;
  background: url("./googleSigninButton.png");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
`;

const SmallInfoText = styled.div`
  color: grey;
  opacity: 0.8;
  font-size: 16px;
  text-align: center;
`;
interface IProps {
  signIn(): void;
}

const SignInWithGoogle: React.FC<IProps> = (props: IProps) => {
  return (
    <Container>
      <SignInButton onClick={props.signIn} />
      <SmallInfoText>More options coming soon...</SmallInfoText>
    </Container>
  );
};

const mapdispatch = (dispatch: Dispatch) => {
  return {
    signIn: () => signInWithGoogle(dispatch)
  };
};

export default connect(
  null,
  mapdispatch
)(SignInWithGoogle);
