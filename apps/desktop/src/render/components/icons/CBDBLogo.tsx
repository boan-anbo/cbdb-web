import React from 'react';

interface CBDBLogoProps {
  className?: string;
  size?: number;
}

/**
 * CBDB Logo Icon Component
 * You can replace the SVG path data with your actual logo SVG
 * or use an image tag inside if you prefer
 */
export const CBDBLogo: React.FC<CBDBLogoProps> = ({
  className = '',
  size = 24
}) => {
  // Option 1: Use an image
  return (
    <img
      src="/logo-192.png"
      alt="CBDB"
      className={className}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );

  // Option 2: Use inline SVG (replace with your actual logo SVG)
  // return (
  //   <svg
  //     width={size}
  //     height={size}
  //     viewBox="0 0 24 24"
  //     fill="none"
  //     xmlns="http://www.w3.org/2000/svg"
  //     className={className}
  //   >
  //     {/* Add your SVG path data here */}
  //     <path
  //       d="M12 2L2 7L12 12L22 7L12 2Z"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     />
  //   </svg>
  // );
};

export default CBDBLogo;