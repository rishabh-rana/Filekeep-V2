import React from "react";
import styled from "styled-components";
import { queryFunctions } from "../../../appData/queryFunctions";
import { colors } from "../../../colors";

const Clipper = styled.div`
  overflow: hidden;
  width: 100%;
  display: block;
  height: calc(2.25rem + 2px);
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.dark_grey};
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid ${colors.light_grey};
  border-radius: 0.25rem;
  box-sizing: border-box;
`;

const Scrollable = styled.div`
  overflow-x: scroll;
  white-space: nowrap;
  overflow-y: hidden;
  height: calc(100% + 20px);
  cursor: text;
`;

interface IWord {
  color: colors;
}

const Word = styled.div<IWord>`
  cursor: default;
  display: inline-block;
  margin-right: 5px;
  background: ${props => props.color};
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  color: #495057;
`;

interface IProps {
  inputParser: any;
  input: string;
  handleLastBoxChange(e: React.ChangeEvent<HTMLInputElement>): void;
  handleFirstType(): void;
  handleBlur(): void;
  handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void;
}

const MainBar: React.FC<IProps> = React.memo((props: IProps) => {
  const handleScrollableclick = () => {
    const scrollableDiv = document.getElementById(
      "lastscrollablecontenteditable"
    );
    if (scrollableDiv) scrollableDiv.focus();
  };

  return (
    <Clipper>
      <Scrollable
        onClick={handleScrollableclick}
        id="mainScrollabledivtoscrolltoend"
      >
        {props.inputParser.map((word: string, index: number) => {
          var color = colors.blue;

          if (queryFunctions.indexOf(word) !== -1) color = colors.red;

          return (
            <Word key={index} color={color}>
              {word}
            </Word>
          );
        })}
        <input
          autoComplete="off"
          id="lastscrollablecontenteditable"
          style={{
            display: "inline-block",
            border: "none",
            outline: "none",
            width: "125px"
          }}
          value={props.input}
          onChange={e => props.handleLastBoxChange(e)}
          onFocus={props.handleFirstType}
          onBlur={props.handleBlur}
          onKeyDown={e => props.handleKeyPress(e)}
        />
      </Scrollable>
    </Clipper>
  );
});
export default MainBar;
