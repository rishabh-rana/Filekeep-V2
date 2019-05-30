import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";

//styled divs
const DropItemTray = styled.div`
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  background: white;
  margin-top: 3px;
  border-radius: 0.25rem;
  height: auto;
  overflow: hidden;
`;

interface IDropItem {
  active: boolean;
}

const DropItem = styled.div<IDropItem>`
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  height: calc(2.25rem + 2px);
  cursor: pointer;

  ${props =>
    props.active &&
    css`
      background: lightblue;
    `}
`;

interface IProps {
  dropdownOptions: string[];
  handleTagSelection(tag: string): void;
}

const DropDown: React.FC<IProps> = React.memo(
  (props: IProps) => {
    // state: main contains the records to be displayed
    // active is the current active item

    const [activeItem, changeActiveItem] = useState<number>(0);

    //use props instead os state here
    // const [dropdownOptions, changeDropdownOptions] = useState<IFuseIndex[]>([]);

    // handle list traversal using keyboard
    const handleKeyboardInput = (e: any) => {
      if (e.key === "ArrowDown" && activeItem < 2) {
        e.preventDefault();
        // set the item below as active
        changeActiveItem(activeItem + 1);
      } else if (e.key === "ArrowUp" && activeItem > 0) {
        e.preventDefault();

        changeActiveItem(activeItem - 1);
      } else if (e.key === "Enter") {
        // e.preventDefault();
        // ensure myTag exists before trying to append it
        if (
          props.dropdownOptions.length !== 0 &&
          props.dropdownOptions[activeItem]
        ) {
          var myTag = props.dropdownOptions[activeItem];
          props.handleTagSelection(myTag);

          let scrollableShell = document.getElementById(
            "mainScrollabledivtoscrolltoend"
          );

          if (scrollableShell) scrollableShell.scrollLeft = 100000;
        }
      }
    };

    //Lifecycle hooks

    useEffect(() => {
      changeActiveItem(0);
    }, [props.dropdownOptions]);

    useEffect(() => {
      document.addEventListener("keydown", handleKeyboardInput);

      return () => {
        document.removeEventListener("keydown", handleKeyboardInput);
      };
    });

    // render the dropdown

    return (
      <DropItemTray key={activeItem}>
        {props.dropdownOptions.map((item: string, index: number) => {
          return (
            <DropItem
              key={index}
              active={index === activeItem}
              onClick={() => props.handleTagSelection(item)}
            >
              {item}
            </DropItem>
          );
        })}
      </DropItemTray>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.dropdownOptions.length !== nextProps.dropdownOptions.length)
      return false;

    let dontReRender = true;
    prevProps.dropdownOptions.forEach((item: string, index: number) => {
      if (item !== nextProps.dropdownOptions[index]) dontReRender = false;
    });

    return dontReRender;
  }
);

export default DropDown;
