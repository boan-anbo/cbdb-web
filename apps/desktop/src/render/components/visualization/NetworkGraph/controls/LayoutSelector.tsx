/**
 * LayoutSelector Component
 *
 * Dropdown selector for switching between graph layouts.
 * Can be integrated with controls or used standalone.
 */

import { FC, CSSProperties } from 'react';
import { ControlPosition } from './types';

interface LayoutSelectorProps {
  /** Available layouts */
  availableLayouts: string[];
  /** Currently selected layout */
  currentLayout?: string;
  /** Handler for layout change */
  onLayoutChange: (layout: string) => void;
  /** Position of the selector */
  position?: ControlPosition;
  /** Container opacity */
  containerOpacity?: number;
  /** Width in pixels */
  width?: number;
  /** Custom styles */
  style?: CSSProperties;
  /** Custom class name */
  className?: string;
}

const LayoutSelector: FC<LayoutSelectorProps> = ({
  availableLayouts,
  currentLayout,
  onLayoutChange,
  position = 'top-left',
  containerOpacity = 0.3,
  width = 120,  // Default width for layout selector
  style,
  className
}) => {
  // Container styles with consistent width
  const containerStyles: CSSProperties = {
    position: 'absolute',
    zIndex: 1000,
    ...getPositionStyles(position),
    backgroundColor: `rgba(255, 255, 255, ${containerOpacity})`,
    backdropFilter: 'blur(8px)',
    borderRadius: '8px',
    padding: '0',  // Remove padding to match search box
    width: `${width}px`,
    height: '36px',  // Fixed height to match search
    ...style
  };

  // Default styles for the dropdown
  const dropdownStyles: CSSProperties = {
    width: '100%',
    height: '100%',  // Fill container height
    padding: '6px 12px',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',  // Slight inner background like search
    border: 'none',  // Remove border
    borderRadius: '8px',  // Match container radius
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={containerStyles} className={className}>
      <select
        value={currentLayout || availableLayouts[0]}
        onChange={(e) => onLayoutChange(e.target.value)}
        style={dropdownStyles}
        aria-label="Select graph layout"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        }}
      >
        <optgroup label="Layout">
          {availableLayouts.map(layout => (
            <option key={layout} value={layout}>
              {formatLayoutName(layout)}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

/**
 * Get position styles based on control position
 */
function getPositionStyles(position: ControlPosition): CSSProperties {
  const offset = 10;

  switch (position) {
    case 'top-left':
      return { top: offset, left: offset };
    case 'top-right':
      return { top: offset, right: offset };
    case 'bottom-left':
      return { bottom: offset, left: offset };
    case 'bottom-right':
      return { bottom: offset, right: offset };
    default:
      return { top: offset, left: offset };
  }
}

/**
 * Format layout name for display
 */
function formatLayoutName(layout: string): string {
  return layout
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default LayoutSelector;