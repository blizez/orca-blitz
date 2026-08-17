import type { SVGProps } from "react";

const OpenCode = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} preserveAspectRatio="xMidYMid" viewBox="0 0 512 512" fill="none">
    <rect width="512" height="512" fill="#131010" />
    <path d="M320 224V352H192V224H320Z" fill="#5A5858" />
    <path fillRule="evenodd" clipRule="evenodd" d="M384 416H128V96H384V416ZM320 160H192V352H320V160Z" fill="white" />
  </svg>
);

const OpenCodeDark = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} preserveAspectRatio="xMidYMid" viewBox="0 0 512 512" fill="none">
    <rect width="512" height="512" fill="white" />
    <path d="M320 224V352H192V224H320Z" fill="#C0BEBE" />
    <path fillRule="evenodd" clipRule="evenodd" d="M384 416H128V96H384V416ZM320 160H192V352H320V160Z" fill="#131010" />
  </svg>
);

export { OpenCode, OpenCodeDark };
