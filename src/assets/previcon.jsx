import * as React from "react";

const PrevIcon = ({ size = 24, color = "#717171" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.1757 18L15.5 16.6L11.1486 12L15.5 7.4L14.1757 6L8.5 12L14.1757 18Z"
      fill={color}
    />
  </svg>
);

export default PrevIcon;
