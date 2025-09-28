/**
 * Reusable component for displaying kinship codes
 * Can be used in forms, tables, or any other context
 */

import React from 'react';
import { useKinshipCodes } from '@/render/contexts/KinshipCodesContext';
import { Input } from '@/render/components/ui/input';
import { Badge } from '@/render/components/ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/render/components/ui/tooltip';
import { cn } from '@/render/lib/utils';

interface KinshipCodeDisplayProps {
  code: number | null | undefined;
  /**
   * Display variant
   * - 'form': Two input fields for use in forms (shorthand + description)
   * - 'inline': Inline badge display
   * - 'compact': Just the shorthand with tooltip
   * - 'full': Full text display
   */
  variant?: 'form' | 'inline' | 'compact' | 'full';
  /**
   * Whether to show the info tooltip (only for form and inline variants)
   */
  showTooltip?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Whether the inputs are readonly (for form variant)
   */
  readOnly?: boolean;
}

export const KinshipCodeDisplay: React.FC<KinshipCodeDisplayProps> = ({
  code,
  variant = 'form',
  showTooltip = true,
  className,
  readOnly = true,
}) => {
  const { getKinshipCode, isLoading } = useKinshipCodes();

  // Get kinship code data
  const kinshipCode = getKinshipCode(code ?? 0);
  
  // Extract display values
  const shorthand = kinshipCode?.kinRel || 'U';
  const chineseName = kinshipCode?.kinRelChn || '未詳';
  const englishName = getEnglishFullName(shorthand);
  const fullDisplay = englishName ? `${chineseName} (${englishName})` : chineseName;

  if (isLoading) {
    return <div className={cn("animate-pulse h-8 bg-muted rounded", className)} />;
  }

  switch (variant) {
    case 'form':
      return (
        <div className={cn("flex gap-1", className)}>
          <Input
            type="text"
            value={shorthand}
            readOnly={readOnly}
            className="h-8 w-16 font-mono text-center bg-muted/50"
            title={fullDisplay}
          />
          <Input
            type="text"
            value={fullDisplay}
            readOnly={readOnly}
            className="h-8 flex-1 bg-muted/50"
          />
          {showTooltip && kinshipCode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 mt-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{shorthand} - {fullDisplay}</p>
                    {kinshipCode.kinPair1 && kinshipCode.kinPair2 && (
                      <p className="text-xs text-muted-foreground">
                        Compound: {kinshipCode.kinPair1} + {kinshipCode.kinPair2}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );

    case 'inline':
      return (
        <div className={cn("inline-flex items-center gap-1", className)}>
          <Badge variant="secondary" className="font-mono">
            {shorthand}
          </Badge>
          <span className="text-sm">{fullDisplay}</span>
          {showTooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{shorthand} - {fullDisplay}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );

    case 'compact':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className={cn("font-mono cursor-help", className)}
              >
                {shorthand}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullDisplay}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

    case 'full':
      return (
        <span className={cn("text-sm", className)}>
          {shorthand} - {fullDisplay}
        </span>
      );

    default:
      return null;
  }
};

/**
 * Helper to get English full name from abbreviation
 */
function getEnglishFullName(abbrev: string): string | null {
  const abbrevMap: Record<string, string> = {
    'U': 'Unknown',
    'F': 'Father',
    'M': 'Mother',
    'S': 'Son',
    'D': 'Daughter',
    'B': 'Brother',
    'Z': 'Sister',
    'H': 'Husband',
    'W': 'Wife',
    'FF': 'Paternal Grandfather',
    'FM': 'Paternal Grandmother',
    'MF': 'Maternal Grandfather',
    'MM': 'Maternal Grandmother',
    'FB': 'Father\'s Brother',
    'FZ': 'Father\'s Sister',
    'MB': 'Mother\'s Brother',
    'MZ': 'Mother\'s Sister',
    'BS': 'Brother\'s Son',
    'BD': 'Brother\'s Daughter',
    'ZS': 'Sister\'s Son',
    'ZD': 'Sister\'s Daughter',
    'SS': 'Son\'s Son',
    'SD': 'Son\'s Daughter',
    'DS': 'Daughter\'s Son',
    'DD': 'Daughter\'s Daughter',
  };

  return abbrevMap[abbrev] || null;
}

// Export a simple wrapper for non-context usage (e.g., in server-rendered components)
export const KinshipCodeText: React.FC<{ 
  code: number | null | undefined;
  shorthand?: string;
  chinese?: string;
}> = ({ code, shorthand = 'U', chinese = '未詳' }) => {
  const englishName = getEnglishFullName(shorthand);
  const display = englishName ? `${chinese} (${englishName})` : chinese;
  return <span>{shorthand} - {display}</span>;
};