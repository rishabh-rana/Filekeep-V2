import React, { useState } from "react";
import { connect } from "react-redux";
import { AppState } from "../../modules/indexReducer";
import { MainStructureMap } from "../../modules/app/buildStructure/types";
import { firestore } from "../../config/firebase";
import {
  COMPANIES_COLLECTION,
  MAIN_DATA_SUBCOLLECTION
} from "../../config/firestoreConstants";

interface IProps {
  structure: MainStructureMap;
  activeCompany: string | null;
}

const MainStructure: React.FC<IProps> = (props: IProps) => {
  if (Object.keys(props.structure).length === 0 || !props.activeCompany) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "10px" }}>
      {Object.keys(props.structure).map(listId => {
        return (
          <div
            style={{
              display: "inline-block",
              background: "salmon",
              borderRadius: "5px",
              overflow: "hidden",
              width: "200px",
              marginRight: "10px",
              marginBottom: "10px"
            }}
          >
            <div
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.15)",
                padding: "20px",
                marginBottom: "10px"
              }}
            >
              {props.structure[listId].header}
            </div>
            <div
              style={{ width: "100%", padding: "5px", boxSizing: "border-box" }}
            >
              {props.structure[listId].nodes.map(nodeData => {
                return (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.1)",
                      borderRadius: "5px",
                      width: "100%",
                      marginBottom: "5px",
                      padding: "8px",
                      boxSizing: "border-box"
                    }}
                  >
                    {nodeData.title}
                  </div>
                );
              })}
            </div>
            <div>
              <HandleAddition
                nodeId={listId}
                activeCompany={props.activeCompany as string}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface IHandleAdditionProps {
  nodeId: string;
  activeCompany: string;
}

const HandleAddition: React.FC<IHandleAdditionProps> = (
  props: IHandleAdditionProps
) => {
  const [input, changeInput] = useState("");
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.length > 2) {
      console.log("done");
      firestore
        .collection(COMPANIES_COLLECTION)
        .doc(props.activeCompany)
        .collection(MAIN_DATA_SUBCOLLECTION)
        .doc(props.nodeId)
        .collection(MAIN_DATA_SUBCOLLECTION)
        .add({
          nodeId: props.nodeId,
          title: input
        });
      changeInput("");
    }
  };
  return (
    <div
      style={{
        marginTop: "10px",
        width: "100%"
      }}
    >
      <input
        style={{
          border: "1px solid black",
          padding: "5px",
          background: "transparent"
        }}
        value={input}
        placeholder="Enter text and press enter"
        onChange={e => changeInput(e.target.value)}
        onKeyDown={e => handleEnter(e)}
      />
    </div>
  );
};

const mapstate = (state: AppState) => {
  return {
    structure: state.app.search.mainStructure,
    activeCompany: state.app.appCore.activeCompany
  };
};

export default connect(mapstate)(MainStructure);
