import React, { useState, useEffect, useRef, useMemo } from "react";
import DropDown from "./search/dropdownResults";
import MainBar from "./search/searchBarUI";

import styled from "styled-components";
import Fuse from "fuse.js";

import { connect } from "react-redux";
import { AppState } from "../../modules/indexReducer";
import { sendStructuralSearchQueryCreator } from "../../modules/app/search/structuralSearchActionCreator";

import {
  queryFunctionsFuse,
  queryFunctions
} from "../../appData/queryFunctions";
import { IStructuralSearchQueryData } from "../../modules/app/search/structuralSearchTypes";
import {
  PrivateStructureMap,
  IPrivateStructureObject,
  ITagidToTagnameMap
} from "../../modules/appTypes";
import { Dispatch } from "redux";

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
  sendStructuralSearchQuery(queryData: IStructuralSearchQueryData): void;
}

//state description:
// input holds the current input foe processing and to semd query
// matchedRecords contain the records to be displayed in the dropdown, provided by fuse.js
// stopDelayMatchingTimeout : if to stop the setTimeout call on the input in case of unmount, used to ensure too uch processing doesnt take place
// turbo: set true by handleFirstType to get results of firt keystroke without any delay
// inFocus: determines if the input is in focus to Mount/ Unmount the DropDown

interface IState {
  turbo: boolean;
  stopDelayMatchingTimeout: any;
  inFocus: boolean;
  fuseFilters: {
    cached_list?: boolean;
    filter?: string | null;
    queryFunctionsFuse?: boolean;
  };
}

//the number of results to be displayed in the dropdown &
// the dealy before the dropdownlist updates, for performance upgrades only
enum Constants {
  numberofResults = 3,
  matchDelay = 1000
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
  fuseFilters: {
    cached_list: true
  }
};

const SearchBar: React.FC<IProps> = (props: IProps) => {
  // state
  const [state, setState] = useState<IState>(initialState);
  const [input, changeInput] = useState("");
  const [matchedRecords, changeMatchedRecords] = useState<string[]>([]);
  const [inputParser, changeInputParser] = useState<string[]>([]);

  // inputRef to handle updated value of input in Timeout method (handleMatching)
  const inputRef = useRef(input);
  inputRef.current = input;

  const inputParserRef = useRef(inputParser);
  inputParserRef.current = inputParser;

  // helper functions

  //handle initial quick results for first keystroke, while also rendering the Dropdown
  const handleFirstType = () => {
    setState({ ...state, turbo: true, inFocus: true });
  };

  //unmount DropDown by setting inFocus: false
  const handleBlur = () => {
    setTimeout(() => {
      setState({ ...state, inFocus: false });
    }, 100);
  };

  // this executes when input changes, handles Matching input with FuseIndices
  useEffect(() => {
    // stopDelayMatchingTimeout -> if value exist => skip this input change, do not process this keystroke
    if (state.stopDelayMatchingTimeout === null && fuse) {
      handleMatching();
    }
    if (state.turbo) setState({ ...state, turbo: false });
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
    var stopDelayMatchingTimeout = setTimeout(
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
          setState({
            ...state,
            stopDelayMatchingTimeout: null
          });
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
          setState({
            ...state,
            stopDelayMatchingTimeout: null
          });
          changeMatchedRecords(matchStringArray);
        } else {
          setState({
            ...state,
            stopDelayMatchingTimeout: null
          });
        }
      },
      state.turbo ? 20 : Constants.matchDelay
    );
    //above ensure if turbo is on, only 20ms delay is done

    // set stopeInterval !== null to prevent more queries to match from keystrokes
    setState({
      ...state,
      stopDelayMatchingTimeout: stopDelayMatchingTimeout
    });
  };

  //stop matching current query
  const stopMatching = () => {
    clearTimeout(state.stopDelayMatchingTimeout);
    setState({
      ...state,
      stopDelayMatchingTimeout: null
    });
  };

  // set options for next word, and display possible next word options in dropdown before typing
  const repairFuse = (filter: string | null, filterOn: string) => {
    if (!props.sharedFuseIndices) {
      return;
    }

    if (props.sharedFuseIndices && props.tagIdToNameMap) {
      if (filterOn === "in" && filter) {
        let newOptions: any[] = [];

        Array.from(props.sharedFuseIndices.values()).forEach(index => {
          if (index.tagName === filter && index.parents) {
            index.parents.forEach(tag => {
              newOptions.push({
                //@ts-ignore
                tagName: props.tagIdToNameMap[tag]
              });
            });
          }
        });

        // store details
        setState({
          ...state,
          fuseFilters: {
            cached_list: true,
            filter: filter
          }
        });
        changeMatchedRecords(getMatchesStringArray(newOptions.slice(0, 3)));

        fuse = new Fuse(newOptions, FuseOptions);
      } else if (filterOn === "all") {
        // store the fuse details
        const fuseIndex = [
          ...Array.from(props.sharedFuseIndices.values()),
          ...queryFunctionsFuse
        ];
        setState({
          ...state,
          fuseFilters: {
            cached_list: true,
            queryFunctionsFuse: true
          }
        });
        changeMatchedRecords(getMatchesStringArray(fuseIndex.slice(0, 3)));
        // fuse = new Fuse(fuseIndex, FuseOptions);
      } else if (filterOn === "functionsOnly") {
        setState({
          ...state,
          fuseFilters: {
            queryFunctionsFuse: true
          }
        });

        changeMatchedRecords(
          getMatchesStringArray(queryFunctionsFuse.slice(0, 3))
        );

        // fuse = new Fuse(queryFunctionsFuse, FuseOptions);
      } else if (filterOn === "cachedListOnly") {
        let fuseIndices = Array.from(props.sharedFuseIndices.values());
        setState({
          ...state,
          fuseFilters: {
            cached_list: true
          }
        });

        changeMatchedRecords(getMatchesStringArray(fuseIndices.slice(0, 3)));

        fuse = new Fuse(fuseIndices, FuseOptions);
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
  const sendQuery = () => {
    //remember to remove any current event listnerrs if required, or handle this in tabbed behaviour
    if (!props.tagIdToNameMap) return;

    const reverseNameMap: any = {};

    Object.keys(props.tagIdToNameMap).forEach(tag => {
      //@ts-ignore
      reverseNameMap[props.tagIdToNameMap[tag]] = tag;
    });

    const newInputParser: string[] = [];
    inputParser.forEach(tagName => {
      if (reverseNameMap[tagName]) {
        // replace names by tags
        newInputParser.push(reverseNameMap[tagName]);
      } else {
        // for functions
        newInputParser.push(tagName);
      }
    });

    props.sendStructuralSearchQuery({
      inputParser: newInputParser,
      viewOptions: { displayType: "kanban", structureBy: "tag" }
    });
  };

  //prepare new fuse if fuseindices change in the app state

  useEffect(() => {
    if (
      props &&
      props.sharedFuseIndices &&
      props.sharedFuseIndices &&
      props.tagIdToNameMap
    ) {
      var newopts: any = [];
      var opts = state.fuseFilters;
      if (opts.cached_list === true && opts.filter) {
        let newOptions: any[] = [];

        Array.from(props.sharedFuseIndices.values()).forEach(index => {
          if (index.tag === opts.filter && index.parents) {
            index.parents.forEach(tag => {
              newOptions.push({
                //@ts-ignore
                tagName: props.tagIdToNameMap[tag]
              });
            });
          }
        });
        newopts = [...newOptions];
      } else if (opts.cached_list === true) {
        newopts = [...newopts, ...Array.from(props.sharedFuseIndices.values())];
      } else if (opts.queryFunctionsFuse === true) {
        newopts = [...newopts, ...queryFunctionsFuse];
      }

      fuse = new Fuse(newopts, FuseOptions);
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
      {state.inFocus && (
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
    sharedFuseIndices: state.app.private_structure,
    tagIdToNameMap: state.app.tagIdToNameMap
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
