import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { AppState } from "../modules/indexReducer";
import { IAuthState } from "../modules/auth/types";
import { colors } from "../colors";

import { createNewCompany } from "../utils/createNewCompany";
import { signoutAndCleanup } from "../utils/auth/signout";

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
}

const Profile: React.FC<IProps> = (props: IProps) => {
  const signout = (): void => {
    signoutAndCleanup();
  };

  return (
    <React.Fragment>
      <div>Name: {props.profile.displayName}</div>
      <Button onClick={signout}>Signout</Button>
      <Button onClick={() => createNewCompany(props.profile.uid as string)}>
        Retry Shiut
      </Button>
    </React.Fragment>
  );
};

const mapstate = (state: AppState) => {
  return {
    profile: state.authenticationState
  };
};

export default connect(mapstate)(Profile);
