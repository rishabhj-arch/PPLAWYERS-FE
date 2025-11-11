import * as React from "react";

const Editicon = ({ strokeeditcolor = "#000", size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="20 20 20 20" 
    width={size}
    height={size}
    fill="none"
  >
    <path
      stroke={strokeeditcolor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.2}
      d="m31.05 23-6.842 7.242c-.258.275-.508.816-.558 1.191l-.308 2.7c-.109.975.591 1.642 1.558 1.475l2.683-.458c.375-.067.9-.342 1.159-.625l6.841-7.242c1.184-1.25 1.717-2.675-.125-4.416-1.833-1.725-3.225-1.117-4.408.133Z"
    />
  </svg>
);

export default Editicon;
