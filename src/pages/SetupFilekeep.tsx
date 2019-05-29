import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { AppState } from "../modules/indexReducer";
import { colors } from "../colors";
import {
  PUBLIC_STRUCTURE,
  IServerPrivateStructureObject,
  TAGNAME_TO_TAGID_MAP,
  ITagNameToTagidObject
} from "../modules/appTypes";
import { firestore } from "../config/firebase";
import { COMPANIES_COLLECTION } from "../config/firestoreConstants";
import { Dispatch } from "redux";
import {
  SyncSetupCompany,
  SyncActiveCompany,
  SyncActiveCompanyForSetup
} from "../modules/appActionCreator";
import { Redirect } from "react-router";
import { signoutAndCleanup } from "../utils/signout";

// error is occuring as the firebase listners fire immediately after sending the
//response to the server (latency compensation) he.ce we must find a way to
//introduce companyId within setupFilekeep component withpout updating state,
//as updating state will cause event liteners on that id to become active,
//t=which cause error

const Container = styled.div`
  padding: 0 25px;
`;

const Spacer = styled.div`
  margin-top: 20px;
  text-align: center;
  display: block;
  font-size: 20px;
  width: 100%;
`;

interface IProps {
  displayName: string;
  uid: string | null;
  returnToHome: boolean;
  activeCompany: string | null;
  finishSetup(activeCompany: string): void;
  syncActiveCompany(activeCompany: string): void;
}

const SetupFilekeep: React.FC<IProps> = (props: IProps) => {
  // define state
  const [companyName, changeCompanyName] = useState("");
  const [teams, changeTeams] = useState("");
  const [projects, changeProjects] = useState("");
  const [channels, changeChannels] = useState("");

  const [projMap, changeProjMap] = useState<{ [project: string]: string[] }>(
    {}
  );

  useEffect(() => {
    if (props.activeCompany) {
      console.log("setup");
      localStorage.setItem(`settingUp${props.activeCompany}`, "yes");
    } else {
      const activeCompany = localStorage.getItem("activeCompany");
      if (activeCompany) {
        props.syncActiveCompany(activeCompany);
      }
    }
  }, [props.activeCompany]);

  const processString = (input: string): string[] => {
    return input.split(",");
  };

  const handleSend = async () => {
    if (
      channels.length === 0 ||
      teams.length < 2 ||
      projects.length < 2 ||
      Object.keys(projMap).length < 2 ||
      !props.activeCompany
    ) {
      console.log("show loader later in this case if only company was missing");
      return;
    }

    //
    const uuid = () => {
      return "xxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const teamArray = processString(teams.trim());
    const projectArray = processString(projects.trim());
    const channelArray = processString(channels.trim());
    const serverStructure: IServerPrivateStructureObject = {};
    const reverseMap: ITagNameToTagidObject = {};

    reverseMap[companyName] = {
      tagids: [props.activeCompany],
      type: "p"
    };

    teamArray.forEach(item => {
      const team = item.trim();
      const uid = uuid();
      // add team's name to the nameMap
      reverseMap[team] = {
        tagids: [uid],
        type: "p"
      };
      // add team to the structure
      serverStructure[uid] = props.activeCompany as string;
    });

    projectArray.forEach(item => {
      const proj = item.trim();
      projMap[proj].forEach(parentName => {
        const uid = uuid();
        serverStructure[uid] = reverseMap[parentName].tagids[0];

        if (reverseMap[proj]) {
          // push the team id into the reverseMap
          reverseMap[proj].tagids.push(uid);
        } else {
          reverseMap[proj] = {
            tagids: [uid],
            type: "p"
          };
        }
      });
    });

    // const projObjectTag: IParentObject = {};
    // projectArray.forEach(name => {
    //   const projname = name.trim();
    //   projObjectTag[tagidToNameMap[projname]] = true;
    // });

    channelArray.forEach(item => {
      const cha = item.trim();

      // set all projects as parents (we need to have quick onboarding)
      projectArray.forEach(nm => {
        const name = nm.trim();
        if (reverseMap[name]) {
          console.log(name);
          reverseMap[name].tagids.forEach(parentId => {
            console.log("adding a channel for", name);
            const uid = uuid();
            serverStructure[uid] = parentId;
            if (reverseMap[cha]) {
              reverseMap[cha].tagids.push(uid);
            } else {
              reverseMap[cha] = {
                tagids: [uid],
                type: "c"
              };
            }
          });
        }
      });
    });

    console.log("DATA:", serverStructure);
    console.log("REVMAP:", reverseMap);
    console.log("companyName", companyName, props.activeCompany);

    firestore
      .collection(COMPANIES_COLLECTION)
      .doc(props.activeCompany)
      .set({
        [PUBLIC_STRUCTURE]: serverStructure,
        [TAGNAME_TO_TAGID_MAP]: reverseMap,
        title: companyName,
        created: Date.now()
      });
    localStorage.removeItem(`settingUp${props.activeCompany}`);
    props.finishSetup(props.activeCompany);
  };

  if (props.returnToHome) {
    return <Redirect to="/" />;
  }

  return (
    <Container>
      <button onClick={() => signoutAndCleanup()}>Logout</button>
      <Spacer>Setting up Filekeep, {props.displayName}!</Spacer>
      <Spacer>Enter your company's Name</Spacer>
      <Spacer>
        <input
          value={companyName}
          onChange={e => changeCompanyName(e.target.value)}
        />
      </Spacer>
      <hr />
      <Spacer>SETUP TEAMS SEPERATED BY COMMAS</Spacer>
      <Spacer>
        <input value={teams} onChange={e => changeTeams(e.target.value)} />
      </Spacer>
      <SelectedView input={teams} typeName="Teams" />
      <hr />
      <Spacer>SETUP PROJECTS SEPERATED BY COMMAS</Spacer>
      <Spacer>
        <input
          value={projects}
          onChange={e => changeProjects(e.target.value)}
        />
      </Spacer>
      <SelectedView input={projects} typeName="Projects" />
      <hr />
      <Spacer>Map PROJECTS TO TEAMS</Spacer>
      <MapProjects
        changeProjMap={changeProjMap}
        projMap={projMap}
        teams={teams}
        projects={projects}
      />
      <hr />
      <Spacer>SETUP CHANNELS SEPERATED BY COMMAS</Spacer>
      <Spacer>
        <input
          value={channels}
          onChange={e => changeChannels(e.target.value)}
        />
      </Spacer>
      <SelectedView input={channels} typeName="Channels" />
      <button onClick={handleSend}>Send</button>
    </Container>
  );
};

interface IMapProjects {
  teams: string;
  projects: string;
  projMap: { [project: string]: string[] };
  changeProjMap: any;
}

const MapProjects: React.FC<IMapProjects> = (props: IMapProjects) => {
  const [teams, changeTeam] = useState<string[]>([]);
  const [projects, changeProjects] = useState<string[]>([]);

  useEffect(() => {
    changeTeam(props.teams.split(","));
    changeProjects(props.projects.split(","));
  }, [props.projects, props.teams]);

  const handleChange = (add: boolean, team: string, proj: string) => {
    team = team.trim();
    proj = proj.trim();
    if (add) {
      if (props.projMap[proj]) {
        props.changeProjMap({
          ...props.projMap,
          [proj]: [...props.projMap[proj], team]
        });
      } else {
        props.changeProjMap({
          ...props.projMap,
          [proj]: [team]
        });
      }
    } else {
      const a = [...props.projMap[proj]];
      a.splice(props.projMap[proj].indexOf(team), 1);
      props.changeProjMap({
        ...props.projMap,
        [proj]: a
      });
    }
  };

  return (
    <Spacer>
      {projects.map(proj => {
        return (
          <div
            key={proj}
            style={{
              display: "flex",
              justifyContent: "space-around",
              width: "100%"
            }}
          >
            <div>{proj}</div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {teams.map(team => {
                return (
                  <div key={team}>
                    <div style={{ display: "inline-block" }}>{team}</div>
                    <input
                      type="checkbox"
                      onChange={e => handleChange(e.target.checked, team, proj)}
                      style={{ display: "inline-block" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Spacer>
  );
};

interface IPropsSelectedView {
  input: string;
  typeName: string;
}

const SelectedViewHolder = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const SelectedItems = styled.div`
  background: ${colors.light_grey};
  border-radius: 7px;
  padding: 5px;
`;

const SelectedView: React.FC<IPropsSelectedView> = (
  props: IPropsSelectedView
) => {
  const [view, changeView] = useState<string[]>([]);

  useEffect(() => {
    changeView(props.input.split(","));
  }, [props.input]);

  return (
    <Spacer>
      <div>Selected {props.typeName}</div>
      <SelectedViewHolder>
        {view.map(item => {
          return <SelectedItems key={item}>{item.trim()}</SelectedItems>;
        })}
      </SelectedViewHolder>
    </Spacer>
  );
};

const mapState = (state: AppState) => {
  return {
    displayName: state.authenticationState.displayName,
    returnToHome: !state.app.appCore.setupCompany,
    uid: state.authenticationState.uid,
    activeCompany: state.app.appCore.activeCompanyForSetup
  };
};

const mapdispatch = (dispatch: Dispatch) => {
  return {
    finishSetup: (activeCompany: string) => {
      dispatch(SyncSetupCompany(false));
      dispatch(SyncActiveCompany(activeCompany));
    },
    syncActiveCompany: (activeCompany: string) => {
      dispatch(SyncActiveCompanyForSetup(activeCompany));
    }
  };
};

export default connect(
  mapState,
  mapdispatch
)(SetupFilekeep);
