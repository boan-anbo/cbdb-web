import React from 'react';
import {
  CBDBBlock,
  CBDBBlockHeader,
  CBDBBlockTitle,
  CBDBBlockContent,
} from '@/render/components/ui/cbdb-block';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/render/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface CollapsibleDocBlockProps {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showFooter?: boolean;
  footerText?: string;
}

export function CollapsibleDocBlock({
  title,
  isOpen,
  onOpenChange,
  children,
  showFooter = true,
  footerText,
}: CollapsibleDocBlockProps) {
  const defaultFooterText = footerText || `End of ${title}`;

  return (
    <div className={`mt-3 -ml-2 ${isOpen ? '' : 'inline-block'}`}>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CBDBBlock className="border-l-4 border-primary/20">
          <CollapsibleTrigger className="text-left cursor-pointer w-full">
            <CBDBBlockHeader className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300">
              <CBDBBlockTitle className="text-xs flex items-center justify-between text-primary-foreground">
                <span className="flex-1">
                  <span className="inline">{title}</span>{' '}
                  <span className="text-xs font-normal opacity-75 whitespace-nowrap inline" style={{ fontVariant: 'small-caps' }}>
                    (click to expand/collapse)
                  </span>
                </span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ease-out ml-2 flex-shrink-0 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </CBDBBlockTitle>
            </CBDBBlockHeader>
          </CollapsibleTrigger>
          <CollapsibleContent
            style={{
              transition: 'all 200ms ease-out',
              opacity: isOpen ? 1 : 0,
              maxHeight: isOpen ? '10000px' : '0px'
            }}
            className="overflow-hidden"
          >
            <CBDBBlockContent>
              {children}
            </CBDBBlockContent>
          </CollapsibleContent>
          {showFooter && isOpen && (
            <CollapsibleTrigger className="w-full text-left cursor-pointer">
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 p-2">
                <div className="text-xs flex items-center justify-between text-primary-foreground">
                  <span className="flex items-center gap-2">
                    <span className="text-xs opacity-50">— {defaultFooterText} —</span>
                    <span className="text-xs font-normal opacity-75" style={{ fontVariant: 'small-caps' }}>
                      (click to collapse)
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ease-out ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </CollapsibleTrigger>
          )}
        </CBDBBlock>
      </Collapsible>
    </div>
  );
}