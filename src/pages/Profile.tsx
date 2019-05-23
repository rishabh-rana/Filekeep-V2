import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { AppState } from "../modules/indexReducer";
import { IAuthState } from "../modules/auth/authTypes";
import { auth } from "../config/firebase";
import { Dispatch } from "redux";
import { SyncUsers } from "../modules/auth/authActionCreator";
import { colors } from "../colors";

import firebase from "firebase";
import { createNewCompany } from "../utils/createNewCompany";

const Button = styled.button`
  border: none;
  border-radius: 5px;
  padding: 15px;
  background: ${colors.red};
  color: ${colors.white};
  margin-top: 30px;
  cursor: pointer;
`;

interface IProps {
  profile: IAuthState;
  signoutFromRedux(): void;
}

const Profile: React.FC<IProps> = (props: IProps) => {
  const signout = (): void => {
    auth.signOut();
    props.signoutFromRedux();
  };

  return (
    <React.Fragment>
      <div>Name: {props.profile.displayName}</div>
      <Button onClick={signout}>Signout</Button>
      <Button onClick={() => createNewCompany()}>Retry Shiut</Button>
    </React.Fragment>
  );
};

const mapstate = (state: AppState) => {
  return {
    profile: state.authenticationState
  };
};

const mapdispatch = (dispatch: Dispatch) => {
  return {
    signoutFromRedux: () =>
      dispatch(
        SyncUsers({
          uid: null,
          displayName: "User"
        })
      )
  };
};

export default connect(
  mapstate,
  mapdispatch
)(Profile);
