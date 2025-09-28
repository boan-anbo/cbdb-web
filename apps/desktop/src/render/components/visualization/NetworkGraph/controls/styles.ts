/**
 * Unified styling configuration for graph controls
 */

export interface ControlTheme {
  containerOpacity: number;
  containerHoverOpacity: number;
  borderColor: string;
  borderHoverColor: string;
  controlHeight: number;
  controlWidth: number;
  borderRadius: number;
  fontSize: number;
  spacing: number;
  blurAmount: number;
}

export const defaultTheme: ControlTheme = {
  containerOpacity: 0.3,
  containerHoverOpacity: 0.4,
  borderColor: 'rgba(224, 224, 224, 0.5)',
  borderHoverColor: 'rgba(200, 200, 200, 0.7)',
  controlHeight: 36,
  controlWidth: 150,  // Reduced from 250 to 150 for search box
  borderRadius: 8,
  fontSize: 14,
  spacing: 10,
  blurAmount: 8,
};

/**
 * Generate container styles for controls
 */
export const getContainerStyles = (
  theme: Partial<ControlTheme> = {}
): React.CSSProperties => {
  const t = { ...defaultTheme, ...theme };
  return {
    backgroundColor: `rgba(255, 255, 255, ${t.containerOpacity})`,
    backdropFilter: `blur(${t.blurAmount}px)`,
    borderRadius: `${t.borderRadius}px`,
    zIndex: 1000,
  };
};

/**
 * Generate button styles for controls
 */
export const getButtonStyles = (theme: Partial<ControlTheme> = {}): React.CSSProperties => {
  const t = { ...defaultTheme, ...theme };
  return {
    width: '32px',
    height: '32px',
    border: `1px solid ${t.borderColor}`,
    borderRadius: '4px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    margin: '2px',
    padding: '6px',
  };
};

/**
 * CSS for search control customization
 */
export const getSearchControlCSS = (theme: Partial<ControlTheme> = {}): string => {
  const t = { ...defaultTheme, ...theme };

  return `
    /* Main search control */
    .custom-search-container .react-select__control {
      background-color: rgba(255, 255, 255, ${t.containerOpacity}) !important;
      border: none !important;
      border-radius: ${t.borderRadius}px !important;
      box-shadow: none !important;
      min-height: ${t.controlHeight}px !important;
      height: ${t.controlHeight}px !important;
      flex-direction: row-reverse !important;  /* Search icon at beginning */
    }

    /* Focused state */
    .custom-search-container .react-select__control--is-focused {
      background-color: rgba(255, 255, 255, ${t.containerHoverOpacity}) !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Menu open state */
    .custom-search-container .react-select__control--menu-is-open {
      background-color: rgba(255, 255, 255, ${t.containerHoverOpacity}) !important;
    }

    /* Hover state */
    .custom-search-container .react-select__control:hover {
      background-color: rgba(255, 255, 255, ${t.containerHoverOpacity}) !important;
      border: none !important;
    }

    /* Value container */
    .custom-search-container .react-select__value-container {
      background-color: transparent !important;
      padding: 2px 8px !important;
    }

    /* Input container */
    .custom-search-container .react-select__input-container {
      background-color: transparent !important;
    }

    /* Indicators container */
    .custom-search-container .react-select__indicators {
      background-color: transparent !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    /* Search icon */
    .custom-search-container .react-select__indicator {
      background-color: transparent !important;
      padding: 4px !important;
      color: rgba(0, 0, 0, 0.5) !important;
    }

    /* Hide separator */
    .custom-search-container .react-select__indicator-separator {
      display: none !important;
    }

    /* Hide dropdown arrow */
    .custom-search-container .react-select__dropdown-indicator {
      display: none !important;
    }

    /* Placeholder text */
    .custom-search-container .react-select__placeholder {
      color: rgba(0, 0, 0, 0.5) !important;
    }

    /* Single value */
    .custom-search-container .react-select__single-value {
      color: rgba(0, 0, 0, 0.8) !important;
    }

    /* Dropdown menu */
    .custom-search-container .react-select__menu {
      background-color: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(${t.blurAmount}px) !important;
      border: 1px solid ${t.borderColor} !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }

    /* Menu options */
    .custom-search-container .react-select__option {
      background-color: transparent !important;
    }

    .custom-search-container .react-select__option--is-focused {
      background-color: rgba(0, 0, 0, 0.05) !important;
    }

    .custom-search-container .react-select__option--is-selected {
      background-color: rgba(0, 0, 0, 0.1) !important;
    }
  `;
};