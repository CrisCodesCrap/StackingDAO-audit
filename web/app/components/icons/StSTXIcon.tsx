import React from 'react';

export default function StSTXIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1.5 inline"
      width="20"
      height="20"
      fill="none"
      {...props}
    >
      <circle cx="10" cy="10" r="10" fill="#C8ECE0" />
      <path
        fill="#308D8A"
        d="m11.9841 11.8973 2.1674 3.3839h-1.6192l-2.54433-3.9758-2.54436 3.9758H5.83304l2.16742-3.3751H4.89069V10.625H15.0938v1.2723h-3.1097ZM15.1407 8.07765V9.375H4.89072V8.07765h3.06381l-2.15156-3.3589h1.62659l2.58184 4.052 2.5905-4.052h1.6266l-2.1516 3.3589h3.0638Z"
      />
    </svg>
  );
}
