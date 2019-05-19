import React, { useState, useEffect, useRef } from "react";
import DropDown from "./search/dropdownResults";
import MainBar from "./search/searchBarUI";

import styled from "styled-components";
import Fuse from "fuse.js";

import { connect } from "react-redux";
import { AppState } from "../../modules/indexReducer";

import {
  queryFunctionsFuse,
  queryFunctions,
  queryFunctionsStart
} from "../../appData/queryFunctions";
import { IFuseIndex } from "./types";

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
  sharedFuseIndices: IFuseIndex[] | false;
}

//state description:
// input holds the current input foe processing and to semd query
// matchedRecords contain the records to be displayed in the dropdown, provided by fuse.js
// stopDelayMatchingTimeout : if to stop the setTimeout call on the input in case of unmount, used to ensure too uch processing doesnt take place
// turbo: set true by handleFirstType to get results of firt keystroke without any delay
// inFocus: determines if the input is in focus to Mount/ Unmount the DropDown

interface IState {
  inputParser: string[];
  matchedRecords: string[];
  turbo: boolean;
  stopDelayMatchingTimeout: any;
  inFocus: boolean;
  fuseOn: {
    cached_list?: boolean;
    queryFunctionsStart?: boolean;
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

// fuse object
let fuse: any = null;
// fuse options
const FuseOptions = {
  threshold: 0.1,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  keys: ["tag"]
};
//initial state
const initialState: IState = {
  inputParser: [],
  matchedRecords: [],
  turbo: false,
  inFocus: false,
  stopDelayMatchingTimeout: null,
  fuseOn: {
    cached_list: true,
    queryFunctionsStart: true
  }
};

const SearchBar: React.FC<IProps> = (props: IProps) => {
  // state
  const [state, setState] = useState<IState>(initialState);
  const [input, changeInput] = useState("");
  // inputRef to handle updated value of input in Timeout method (handleMatching)
  const inputRef = useRef(input);
  inputRef.current = input;

  // function to process indices for memoization
  const processIndices = (
    index1: IFuseIndex[] | false,
    index2: IFuseIndex[] | false
  ) => {
    if (index1 && index2) {
      console.log("Calculated indices");
      return [...index1, ...index2];
    } else return null;
  };

  // memoize the index building process
  // let fuse_indices: IFuseIndex[] | null = useMemo(
  //   () => processIndices(props.rootFuseIndices, props.sharedFuseIndices),
  //   [props.rootFuseIndices, props.sharedFuseIndices]
  // );

  let fuse_indices = props.sharedFuseIndices;

  // helper functions

  //handle initial quick results for first keystroke, while also rendering the Dropdown
  const handleFirstType = () => {
    setState({ ...state, turbo: true, inFocus: true });
  };

  //unmount DropDown by setting inFocus: false
  const handleBlur = () => {
    setState({ ...state, inFocus: false });
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
        var newParser = [...state.inputParser];
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
        setState({
          ...state,
          inputParser: newParser
        });
      } else {
        // if input was not empty, just delete previous character
        var newInput = input;
        newInput = newInput.slice(0, newInput.length - 1);
        changeInput(newInput);
        if (state.stopDelayMatchingTimeout === null) {
          handleMatching();
        }
      }
    }
  };
  // main keyboard handler
  const handleKeyPress = (e: any) => {
    handleBackspace(e);
    // handle sending the query using enter
    if (e.key === "Enter" && state.matchedRecords.length === 0) sendQuery();
  };

  //handle fuzzy search with fuse.js
  //stopDelayMatchingTimeout ensures that only after "matchDelay" milliseconds, the dropdown is calculated
  const handleMatching = () => {
    var stopDelayMatchingTimeout = setTimeout(
      () => {
        // below code is needed for creation api, deprecated for now

        // if (
        //   (state.inputParser[0] === "add" ||
        //     state.inputParser[0] === "create") &&
        //   inputRef.current[0] === "'"
        // ) {
        //   // if new node addition mode is set
        //   if (
        //     inputRef.current.length > 2 &&
        //     inputRef.current[inputRef.current.length - 1] === "'"
        //   ) {
        //     // handle matching the closing ' on a statement like "add 'xyz name'"
        //     var newParser = [...state.inputParser];
        //     var newinput = inputRef.current.slice(1);
        //     newinput = newinput.slice(0, newinput.length - 1);
        //     newParser.push(newinput);
        //     handleFuserepair(newinput);
        //     setState({
        //       ...state,
        //       inputParser: newParser,
        //       stopDelayMatchingTimeout: null
        //     });
        //     changeInput("");
        //   } else {
        //     setState({
        //       ...state,
        //       stopDelayMatchingTimeout: null
        //     });
        //   }
        //   return;
        // }

        // return if fuse object is not present
        if (!fuse) return;

        //get matches for the last word
        var match = fuse
          .search(inputRef.current)
          .slice(0, Constants.numberofResults);

        //if match is an exact match, remove the dropdown results, without setting stopDelayMatchingTimeout for quick unmount
        if (match && match[0] && match[0].tag === inputRef.current) {
          var newinput = "";

          // below code is needed for creation api, deprecated for now

          // if (inputRef.current === "add" || inputRef.current === "create")
          //   newinput = "'";

          var newinputParser = [...state.inputParser, inputRef.current];
          handleFuserepair(inputRef.current);
          setState({
            ...state,
            matchedRecords: [],
            inputParser: newinputParser,
            stopDelayMatchingTimeout: null
          });
          changeInput(newinput);
          // exits to prevent calling setState below
          return;
        }

        // if new matches are found, set them as new options, else just set stopDelayMatchingTimeout: null to ensure
        //another match query can be made on the next keystroke
        if (match !== state.matchedRecords) {
          let matchStringArray: string[] = [];
          match.forEach((obj: any) => {
            matchStringArray.push(obj.tag);
          });

          setState({
            ...state,
            matchedRecords: matchStringArray,
            stopDelayMatchingTimeout: null
          });
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

  const repairFuse = (filter: string | null, filterOn: any) => {
    if (fuse_indices) {
      if (filterOn === "in" && filter) {
        let newOptions: any[] = [];

        fuse_indices.forEach(index => {
          if (index.tag === filter && index.parents) {
            Object.keys(index.parents).forEach(tag => {
              newOptions.push({
                tag
              });
            });
          }
        });

        // store details
        setState({
          ...state,
          fuseOn: {
            cached_list: true,
            filter: filter
          }
        });

        fuse = new Fuse([...newOptions], FuseOptions);
      } else if (filterOn === "all") {
        // store the fuse details
        setState({
          ...state,
          fuseOn: {
            cached_list: true,
            queryFunctionsFuse: true,
            queryFunctionsStart: true
          }
        });
        fuse = new Fuse(
          [...fuse_indices, ...queryFunctionsFuse, ...queryFunctionsStart],
          FuseOptions
        );
      } else if (filterOn === "functionsOnly") {
        setState({
          ...state,
          fuseOn: {
            queryFunctionsFuse: true
          }
        });

        fuse = new Fuse([...queryFunctionsFuse], FuseOptions);
      } else if (filterOn === "cachedListOnly") {
        setState({
          ...state,
          fuseOn: {
            queryFunctionsStart: true,
            cached_list: true
          }
        });

        fuse = new Fuse([...fuse_indices, ...queryFunctionsStart], FuseOptions);
      }
    }
  };
  //call before setting setState, hence last element of inputParser should be previous tag
  const handleFuserepair = (tag: string | null, optionalFilter?: string) => {
    // pass empty string for everything
    if (tag === "") {
      repairFuse(null, "all");
    }
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
      // handle create and add mode i.e. ommit the filter
      if (
        state.inputParser[state.inputParser.length - 2] === "add" ||
        state.inputParser[state.inputParser.length - 2] === "create"
      ) {
        repairFuse(null, "cachedListOnly");
        return;
      }

      var filter = state.inputParser[state.inputParser.length - 1];
      if (optionalFilter) filter = optionalFilter;

      repairFuse(filter, "in");
    } else {
      repairFuse(null, "all");
    }
  };

  //handle the tag selection from dropdown
  const handleTagSelection = (tag: string) => {
    var newinputParser = [...state.inputParser];

    newinputParser.push(tag);

    handleFuserepair(tag);
    var newInput = "";
    if (tag === "add" || tag === "create") newInput = "'";
    setState({
      ...state,
      inputParser: newinputParser,
      matchedRecords: []
    });
    changeInput(newInput);
  };

  //send query to firestore
  const sendQuery = () => {
    //IMPORTANT
    //query, {augmentors} //ALWAYS DISPATCH Augmentor>Properties >>properties is important
    //remove previous listeners, the removeEventListener is an array of functions to be called
    // flush current structure and data
    // if (
    //   state.inputParser[0] !== "add" &&
    //   state.inputParser[0] !== "create"
    // ) {
    //   props.flushArchives();
    //   if (props.removeEventListener) {
    //     props.removeEventListener.forEach(rmls => {
    //       rmls();
    //     });
    //   }
    // }
    //send fresh query, get properties from a master state obtained from user properties later
    // also send across list of all hashtags used in current query
    // sending cachedlist to all queries currently, edit to include only for create queries
    // props.sendQuery(state.inputParser, {
    //   containerId: props.containerId,
    //   containerName: props.containerName,
    //   userDetails: props.userDetails,
    //   properties: {
    //     depth: 2,
    //     style: "list",
    //     structureBy: "tag"
    //   },
    //   cached_list: props.cached_list
    // });
  };

  //prepare new fuse if fuseindices change in the app state

  useEffect(() => {
    if (props && props.sharedFuseIndices && fuse_indices) {
      var newopts: any = [];
      var opts = state.fuseOn;
      if (opts.cached_list === true && opts.filter) {
        let newOptions: any[] = [];

        fuse_indices.forEach(index => {
          if (index.tag === opts.filter && index.parents) {
            Object.keys(index.parents).forEach(tag => {
              newOptions.push({
                tag
              });
            });
          }
        });
        newopts = [...newOptions];
      } else if (opts.cached_list === true) {
        newopts = [...newopts, ...fuse_indices];
      } else if (opts.queryFunctionsStart === true) {
        newopts = [...newopts, ...queryFunctionsStart];
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
        inputParser={state.inputParser}
        input={input}
        handleLastBoxChange={handleChange}
        handleFirstType={handleFirstType}
        handleBlur={handleBlur}
        handleKeyPress={handleKeyPress}
      />
      {state.inFocus && (
        <DropList>
          <DropDown
            dropdownOptions={state.matchedRecords}
            handleTagSelection={handleTagSelection}
          />
        </DropList>
      )}
    </Wrapper>
  );
};

const mapstate = (state: AppState) => {
  return {
    sharedFuseIndices: state.coreCompanyData.shared_fuse_indices
  };
};

export default connect(
  mapstate,
  null
)(SearchBar);
