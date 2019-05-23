import React from "react";
import styled from "styled-components";
import { colors } from "../colors";
import { Link } from "react-router-dom";

const Height = 45;

const MainBar = styled.div`
  width: 100%;
  background: ${colors.secondary};
  color: ${colors.white};
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: ${Height + "px"};
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const Spaces = styled.div`
  width: 20%;
  height: ${Height + "px"};
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const LogoWhite = styled.div`
  background: url("./logo.png");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: grayscale(100%) invert(100%);
  opacity: 0.7;
  width: ${Height - 10 + "px"};
  height: ${Height - 10 + "px"};
`;

const Profile = styled.div`
  width: ${Height - 10 + "px"};
  height: ${Height - 10 + "px"};
  text-align: center;
  font-size: 30px;
  color: ${colors.white};
`;

const FillSpace = styled.div`
  position: static;
  width: 100%;
  height: ${Height + 10 + "px"};
`;

interface IProps {}

const HeaderBar: React.FC<IProps> = (props: IProps) => {
  return (
    <React.Fragment>
      <FillSpace />
      <MainBar>
        <Spaces />
        <Spaces>
          <Link to="/">
            <LogoWhite />
          </Link>
        </Spaces>
        <Spaces>
          <Link to="/profile">
            <Profile>
              <i className="fas fa-user-circle" />
            </Profile>
          </Link>
        </Spaces>
      </MainBar>
    </React.Fragment>
  );
};

export default HeaderBar;
