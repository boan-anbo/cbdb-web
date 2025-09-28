/**
 * Graph color utilities
 * Converts CSS variables to usable color values for graph libraries
 */

/**
 * Get computed color value from CSS variable
 * Converts oklch/hsl CSS variables to hex colors
 */
export function getCSSVariableColor(variable: string): string {
  if (typeof window === 'undefined') {
    // Fallback colors for SSR
    const fallbacks: Record<string, string> = {
      '--primary': '#3b82f6',
      '--chart-1': '#3b82f6',
      '--chart-2': '#6366f1',
      '--chart-3': '#8b5cf6',
      '--chart-4': '#a855f7',
      '--chart-5': '#c084fc',
      '--muted-foreground': '#71717a',
      '--foreground': '#18181b',
    };
    return fallbacks[variable] || '#666666';
  }

  // Get the computed style value
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(variable).trim();

  if (!value) {
    console.warn(`CSS variable ${variable} not found`);
    return '#666666';
  }

  // If it's already a hex color, return it
  if (value.startsWith('#')) {
    return value;
  }

  // If it's an oklch value, we need to convert it
  if (value.includes('oklch') || /^[\d.]+\s+[\d.]+\s+[\d.]+/.test(value)) {
    // Create a temporary element to get the computed color
    const temp = document.createElement('div');
    temp.style.color = value.startsWith('oklch') ? value : `oklch(${value})`;
    temp.style.display = 'none';
    document.body.appendChild(temp);

    const computedColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    // Convert rgb/rgba to hex
    const rgb = computedColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const hex = '#' + [0, 1, 2].map(i => {
        const val = parseInt(rgb[i]);
        return ('0' + val.toString(16)).slice(-2);
      }).join('');
      return hex;
    }
  }

  return '#666666'; // Fallback
}

/**
 * Get theme colors for graph nodes and edges
 */
export function getGraphThemeColors() {
  return {
    primary: getCSSVariableColor('--primary'),
    chart1: getCSSVariableColor('--chart-1'),
    chart2: getCSSVariableColor('--chart-2'),
    chart3: getCSSVariableColor('--chart-3'),
    chart4: getCSSVariableColor('--chart-4'),
    chart5: getCSSVariableColor('--chart-5'),
    mutedForeground: getCSSVariableColor('--muted-foreground'),
    foreground: getCSSVariableColor('--foreground'),
    mutedEdge: getCSSVariableColor('--muted-foreground') + '4d', // 30% opacity
  };
}