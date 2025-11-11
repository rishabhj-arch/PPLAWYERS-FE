import * as React from "react";
const TrashIcon = ({ strokecolor, size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
  >
    <path
      stroke={strokecolor}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M17.5 4.983a84.752 84.752 0 0 0-8.35-.416c-1.65 0-3.3.083-4.95.25l-1.7.166M7.083 4.142l.184-1.092c.133-.792.233-1.383 1.641-1.383h2.184c1.408 0 1.516.625 1.641 1.391l.184 1.084M15.708 7.617l-.541 8.391c-.092 1.309-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.016-2.492-2.325l-.541-8.391M8.608 13.75h2.775M7.917 10.417h4.166"
    />
  </svg>
);
export default TrashIcon;
