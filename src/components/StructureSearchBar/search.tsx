import React, { useState, useEffect, useRef, useMemo } from "react";
import DropDown from "./search/dropdownResults";
import MainBar from "./search/searchBarUI";

import styled from "styled-components";
import Fuse from "fuse.js";

import { connect } from "react-redux";
import { AppState } from "../../modules/indexReducer";
import { sendStructuralSearchQueryCreator } from "../../modules/app/Board/actionCreator";

import {
  queryFunctionsFuse,
  queryFunctions
} from "../../appData/queryFunctions";
import {
  IStructuralSearchQueryData,
  ParsedQueries
} from "../../modules/app/Board/types";
import {
  PrivateStructureMap,
  IPrivateStructureObject,
  ITagidToTagnameMap,
  ITagNameToTagidObject
} from "../../modules/appTypes";
import { Dispatch } from "redux";
import { getVariableServerPaths } from "../../utils/getVariableServerPaths";

//styled component
const DropList = styled.div`
  display: block;
  position: relative;
  width: 100%;
  z-index: 1000;
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

// interfaces

interface IProps {
  sharedFuseIndices: PrivateStructureMap | null;
  tagIdToNameMap: ITagidToTagnameMap | null;
  reversetagIdToNameMap: ITagNameToTagidObject | null;
  sendStructuralSearchQuery(queryData: IStructuralSearchQueryData): void;
}

//state description:
// input holds the current input foe processing and to semd query
// matchedRecords contain the records to be displayed in the dropdown, provided by fuse.js
// stopDelayMatchingTimeout : if to stop the setTimeout call on the input in case of unmount, used to ensure too uch processing doesnt take place
// turbo: set true by handleFirstType to get results of firt keystroke without any delay
// inFocus: determines if the input is in focus to Mount/ Unmount the DropDown

//the number of results to be displayed in the dropdown &
// the dealy before the dropdownlist updates, for performance upgrades only
enum Constants {
  numberofResults = 3,
  matchDelay = 200
}

const noIndicesError = "Cannot load data, you may be offline";

// fuse object
let fuse: Fuse<
  IPrivateStructureObject,
  Fuse.FuseOptions<IPrivateStructureObject>
> | null = null;
// fuse options
const FuseOptions: Fuse.FuseOptions<IPrivateStructureObject> = {
  threshold: 0.6,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  shouldSort: true,
  keys: ["tagName"]
};
//initial state
const initialState: IState = {
  turbo: false,
  inFocus: false,
  stopDelayMatchingTimeout: null,
  input: "",
  inputParser: [],
  matchedRecords: []
};

interface IState {
  input: string;
  inputParser: string[];
  matchedRecords: string[];
  turbo: boolean;
  inFocus: boolean;
  stopDelayMatchingTimeout: null | NodeJS.Timeout;
}

const SearchBar: React.FC<IProps> = (props: IProps) => {
  // state
  const [input, changeInput] = useState(initialState.input);
  const [matchedRecords, changeMatchedRecords] = useState(
    initialState.matchedRecords
  );
  const [inputParser, changeInputParser] = useState(initialState.inputParser);
  const [turbo, changeTurbo] = useState(initialState.turbo);
  const [inFocus, changeInFocus] = useState(initialState.inFocus);
  const [stopDelayMatchingTimeout, changeStopDelayMatchingTimeout] = useState(
    initialState.stopDelayMatchingTimeout
  );

  // inputRef to handle updated value of input in Timeout method (handleMatching)
  const inputRef = useRef(input);
  inputRef.current = input;

  const inputParserRef = useRef(inputParser);
  inputParserRef.current = inputParser;

  // helper functions

  //handle initial quick results for first keystroke, while also rendering the Dropdown
  const handleFirstType = () => {
    changeTurbo(true);
    changeInFocus(true);
  };

  const calculateFuseIndices = () => {
    if (props.sharedFuseIndices) {
      const fuseIndices: any = {};
      props.sharedFuseIndices.forEach(obj => {
        fuseIndices[obj.tagName] = true;
      });
      return Object.keys(fuseIndices).map(tagName => {
        return { tagName };
      });
    }
  };

  const fuseIndices = useMemo(calculateFuseIndices, [props.sharedFuseIndices]);

  //unmount DropDown by setting inFocus: false
  const handleBlur = () => {
    setTimeout(() => {
      changeInFocus(false);
    }, 100);
  };

  // this executes when input changes, handles Matching input with FuseIndices
  useEffect(() => {
    // stopDelayMatchingTimeout -> if value exist => skip this input change, do not process this keystroke
    if (stopDelayMatchingTimeout === null && fuse) {
      handleMatching();
    }
    if (turbo) changeTurbo(false);
  }, [input]);

  const handleChange = (e: any) => {
    var char = e.target.value;
    changeInput(char);
  };

  // handle backspace keypress
  const handleBackspace = (e: any) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (input === "") {
        // if current input is empty
        var newParser = [...inputParser];
        if (newParser.length !== 0) newParser.pop();
        if (newParser.length === 0) {
          // change dropdown options to all fuseindices
          handleFuserepair(null);
        } else {
          // change dropdown options depending on the previous two words
          // second argument will be undefined if only one word has been typed
          handleFuserepair(
            newParser[newParser.length - 1],
            newParser[newParser.length - 2]
          );
        }
        // set the updated records in state
        changeInputParser(newParser);
      } else {
        // if input was not empty, just delete previous character
        var newInput = input;
        newInput = newInput.slice(0, newInput.length - 1);
        changeInput(newInput);
      }
    }
  };
  // main keyboard handler
  const handleKeyPress = (e: any) => {
    handleBackspace(e);
    // handle sending the query using enter
    if (e.key === "Enter" && matchedRecords.length === 0) sendQuery();
  };

  const getMatchesStringArray = (
    match: IPrivateStructureObject[] | { tagName: string }[]
  ): string[] => {
    let matchStringArray: string[] = [];
    match.forEach((obj: any) => {
      matchStringArray.push(obj.tagName);
    });

    return matchStringArray;
  };

  const isArraySame = (arrayOne: string[], arrayTwo: string[]) => {
    if (arrayOne.length !== arrayTwo.length) return false;

    let isSame = true;

    arrayOne.forEach((item, index) => {
      if (item !== arrayTwo[index]) isSame = false;
    });

    return isSame;
  };

  //handle fuzzy search with fuse.js
  //stopDelayMatchingTimeout ensures that only after "matchDelay" milliseconds, the dropdown is calculated
  const handleMatching = () => {
    var stopDelay = setTimeout(
      () => {
        // return if fuse object is not present
        if (!fuse) return;

        //get matches for the last word
        var match = fuse
          .search(inputRef.current)
          .slice(0, Constants.numberofResults);

        //if match is an exact match, remove the dropdown results, without setting stopDelayMatchingTimeout for quick unmount
        if (match && match[0] && match[0].tagName === inputRef.current) {
          handleFuserepair(inputRef.current);
          changeStopDelayMatchingTimeout(null);
          changeInputParser([...inputParser, inputRef.current]);
          changeInput("");
          // exits to prevent calling setState below
          return;
        }

        const matchStringArray = getMatchesStringArray(match);

        // if new matches are found, set them as new options, else just set stopDelayMatchingTimeout: null to ensure
        //another match query can be made on the next keystroke
        if (
          !isArraySame(matchStringArray, matchedRecords) &&
          inputRef.current !== ""
        ) {
          changeStopDelayMatchingTimeout(null);
          changeMatchedRecords(matchStringArray);
        } else {
          changeStopDelayMatchingTimeout(null);
        }
      },
      turbo ? 20 : Constants.matchDelay
    );
    //above ensure if turbo is on, only 20ms delay is done

    // set stopeInterval !== null to prevent more queries to match from keystrokes

    changeStopDelayMatchingTimeout(stopDelay);
  };

  //stop matching current query
  const stopMatching = () => {
    clearTimeout(stopDelayMatchingTimeout as any);
    changeStopDelayMatchingTimeout(null);
  };

  // set options for next word, and display possible next word options in dropdown before typing
  const repairFuse = (filter: string | null, filterOn: string) => {
    if (!fuseIndices) {
      return;
    }

    if (
      props.sharedFuseIndices &&
      props.reversetagIdToNameMap &&
      props.tagIdToNameMap
    ) {
      if (filterOn === "in" && filter) {
        const helper: { [name: string]: true } = {};

        const currentIds = props.reversetagIdToNameMap[filter];

        const parentIds = currentIds.tagids.map(
          //@ts-ignore
          id => props.sharedFuseIndices.get(id).parent
        );
        parentIds.forEach(id => {
          //@ts-ignore
          const name = props.tagIdToNameMap[id] as string;
          helper[name] = true;
        });

        const newOptions: any = Object.keys(helper).map(word => {
          return { tagName: word };
        });

        // store details

        changeMatchedRecords(getMatchesStringArray(newOptions.slice(0, 3)));

        fuse = new Fuse(newOptions, FuseOptions);
      } else if (filterOn === "all") {
        // store the fuse details
        const fuseIndex = [...fuseIndices, ...queryFunctionsFuse];

        changeMatchedRecords(getMatchesStringArray(fuseIndex.slice(0, 3)));
        // fuse = new Fuse(fuseIndex, FuseOptions);
      } else if (filterOn === "functionsOnly") {
        changeMatchedRecords(
          getMatchesStringArray(queryFunctionsFuse.slice(0, 3))
        );
        // @ts-ignore
        fuse = new Fuse(queryFunctionsFuse, FuseOptions);
      } else if (filterOn === "cachedListOnly") {
        changeMatchedRecords(getMatchesStringArray(fuseIndices.slice(0, 3)));

        fuse = new Fuse(fuseIndices as any, FuseOptions);
      }
    } else {
      changeMatchedRecords([noIndicesError]);
    }
  };
  //call before setting setState, hence last element of inputParser should be previous tag
  const handleFuserepair = (tag: string | null, optionalFilter?: string) => {
    //pass null to move to intitial fuse

    if (tag === null) {
      repairFuse(null, "cachedListOnly");
      return;
    }

    if (queryFunctions.indexOf(tag) === -1) {
      repairFuse(null, "functionsOnly");
    } else if (queryFunctions.indexOf(tag) !== -1 && tag !== "in") {
      repairFuse(null, "cachedListOnly");
    } else if (tag === "in") {
      var filter = inputParserRef.current[inputParserRef.current.length - 1];
      if (optionalFilter) filter = optionalFilter;

      repairFuse(filter, "in");
    } else {
      repairFuse(null, "all");
    }
  };

  //handle the tag selection from dropdown
  const handleTagSelection = (tag: string) => {
    handleFuserepair(tag);
    changeInputParser([...inputParserRef.current, tag]);
    changeInput("");
  };

  //send query to firestore
  const sendQuery = async () => {
    //remember to remove any current event listnerrs if required, or handle this in tabbed behaviour
    const { activeCompany } = await getVariableServerPaths();
    if (!props.reversetagIdToNameMap || !activeCompany) return;

    const parser: ParsedQueries = [];
    let slice = 0;
    const queryArray: string[][] = [];
    inputParser.forEach((tagName, i) => {
      if (tagName === "and") {
        queryArray.push(inputParser.slice(slice, i));
        slice = i + 1;
      }
    });
    queryArray.push(inputParser.slice(slice));

    const calculateNewTagids = (
      heirarchy: string[],
      currentIds: string[],
      childIds: string[],
      level: number
    ) => {
      const newTagids = childIds.filter(id => {
        return (
          //@ts-ignore
          currentIds.indexOf(props.sharedFuseIndices.get(id).parent) !== -1
        );
      });

      if (level === heirarchy.length - 1) {
        parser.push({
          tagids: newTagids,
          //@ts-ignore
          type: props.reversetagIdToNameMap[heirarchy[level]].type
        });
      } else {
        //@ts-ignore
        calculateNewTagids(
          heirarchy,
          newTagids,
          //@ts-ignore
          props.reversetagIdToNameMap[heirarchy[level + 1]].tagids,
          level + 1
        );
      }
    };

    queryArray.forEach(query => {
      const heirarachy: string[] = [];
      query.forEach((word, i) => {
        if (queryFunctions.indexOf(word) === -1) {
          heirarachy.push(word);
        }
      });
      if (heirarachy.length > 1) {
        calculateNewTagids(
          heirarachy.reverse(),
          //@ts-ignore
          props.reversetagIdToNameMap[heirarachy[0]].tagids,
          //@ts-ignore
          props.reversetagIdToNameMap[heirarachy[1]].tagids,
          1
        );
      } else {
        // just one word exists
        //@ts-ignore
        parser.push(props.reversetagIdToNameMap[heirarachy[0]]);
      }
    });

    console.log(parser);

    props.sendStructuralSearchQuery({
      parsedQueries: parser,
      activeCompany
    });
  };

  //prepare new fuse if fuseindices change in the app state

  useEffect(() => {
    if (fuseIndices) {
      // reset everything if props.sharedFuseIndices change
      changeInputParser([]);
      changeInput("");
      changeMatchedRecords([]);
      fuse = new Fuse(fuseIndices as any, FuseOptions);
    }
  }, [props.sharedFuseIndices]);

  //   stop matching if unmounted
  useEffect(() => {
    return () => {
      stopMatching();
    };
  }, []);

  return (
    <Wrapper>
      <MainBar
        inputParser={inputParser}
        input={input}
        handleLastBoxChange={handleChange}
        handleFirstType={handleFirstType}
        handleBlur={handleBlur}
        handleKeyPress={handleKeyPress}
      />
      {inFocus && (
        <DropList>
          <DropDown
            dropdownOptions={matchedRecords}
            handleTagSelection={handleTagSelection}
          />
        </DropList>
      )}
      <button onClick={sendQuery}>Search</button>
    </Wrapper>
  );
};

const mapstate = (state: AppState) => {
  return {
    sharedFuseIndices: state.app.appCore.private_structure,
    tagIdToNameMap: state.app.appCore.tagIdToTagNameMap,
    reversetagIdToNameMap: state.app.appCore.tagNameToTagidMap
  };
};

const mapdispatch = (dispatch: Dispatch) => {
  return {
    sendStructuralSearchQuery: (queryData: IStructuralSearchQueryData) =>
      dispatch(sendStructuralSearchQueryCreator(queryData))
  };
};

export default connect(
  mapstate,
  mapdispatch
)(SearchBar);
