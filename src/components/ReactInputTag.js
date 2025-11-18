import React, { useState, useRef } from "react";
import closeIcon from "../assets/closeimageicon.png";

const ReactInputTag = ({ tags = [], onChange, placeholder, error, onFocus, disabled }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const MAX_TAGS = 5;

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleInputFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue &&
      tags.length < MAX_TAGS &&
      !tags.includes(trimmedValue)
    ) {
      onChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleContainerClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`flex flex-wrap items-center gap-2 bg-[#F5F5F5] w-full cursor-text ${
        error ? "border border-[#cc000d]" : ""
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      style={{
        height: "50px",
        padding: "0 16px",
        overflowY: "auto",
        boxSizing: "border-box"
      }}
    >
      {tags.map((tag, index) => (
        <div
          key={index}
          className="flex items-center gap-1 bg-[#000000] rounded-sm px-2 py-1 flex-shrink-0"
        >
          <span className="text-xs font-[Montserrat] font-medium text-white whitespace-nowrap">
            {tag}
          </span>

          <img
            src={closeIcon}
            alt="Remove tag"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) removeTag(index);
            }}
            className="w-3 h-3 cursor-pointer flex-shrink-0"
          />
        </div>
      ))}

      {tags.length < MAX_TAGS && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 outline-none text-sm bg-transparent font-[Montserrat] font-medium text-black min-w-[100px] h-full"
          style={{ color: "#000000" }}
        />
      )}
    </div>
  );
};

export default ReactInputTag;