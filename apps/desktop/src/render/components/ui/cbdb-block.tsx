/**
 * CBDB Block Component
 *
 * A compact, space-efficient block component that extends and overrides
 * the default shadcn Card with CBDB-specific styling for uniformity.
 */

import * as React from 'react';
import { cn } from '@/render/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { ChevronDown, ChevronLeft } from 'lucide-react';

// Context for managing collapse state
interface CBDBBlockContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  collapsible: boolean;
}

const CBDBBlockContext = React.createContext<CBDBBlockContextValue | undefined>(
  undefined,
);

const useCBDBBlock = () => {
  const context = React.useContext(CBDBBlockContext);
  return context;
};

// CBDB Block Root - Elegant container similar to FormControlGroup
interface CBDBBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const CBDBBlock = React.forwardRef<HTMLDivElement, CBDBBlockProps>(
  (
    {
      className,
      children,
      collapsible = false,
      defaultCollapsed = false,
      onCollapsedChange,
      ...props
    },
    ref,
  ) => {
    const [isCollapsed, setIsCollapsedInternal] =
      React.useState(defaultCollapsed);

    const setIsCollapsed = React.useCallback(
      (collapsed: boolean) => {
        setIsCollapsedInternal(collapsed);
        onCollapsedChange?.(collapsed);
      },
      [onCollapsedChange],
    );

    return (
      <CBDBBlockContext.Provider
        value={{ isCollapsed, setIsCollapsed, collapsible }}
      >
        <Card
          ref={ref}
          className={cn(
            'min-w-0 cbdb-block',
            isCollapsed && collapsible && 'rounded-lg', // Ensure all corners are rounded when collapsed
            className,
          )}
          {...props}
        >
          {children}
        </Card>
      </CBDBBlockContext.Provider>
    );
  },
);
CBDBBlock.displayName = 'CBDBBlock';

/**
 * CBDB Block Actions - Container for action buttons in the header
 *
 * @example
 * ```tsx
 * <CBDBBlockActions>
 *   <Button size="icon" variant="ghost">
 *     <ExternalLink className="size-4" />
 *   </Button>
 * </CBDBBlockActions>
 * ```
 */
const CBDBBlockActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2', className)}
    onClick={(e) => e.stopPropagation()} // Prevent header toggle when clicking actions
    {...props}
  />
));
CBDBBlockActions.displayName = 'CBDBBlockActions';

/**
 * CBDB Block Header - Elegant header with accent border and optional actions
 *
 * Use CBDBBlockActions as a child to add action buttons:
 *
 * @example
 * ```tsx
 * <CBDBBlockHeader>
 *   <CBDBBlockTitle>My Title</CBDBBlockTitle>
 *   <CBDBBlockActions>
 *     <Button size="icon" variant="ghost">
 *       <ExternalLink className="size-4" />
 *     </Button>
 *   </CBDBBlockActions>
 * </CBDBBlockHeader>
 * ```
 */
interface CBDBBlockHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CBDBBlockHeader = React.forwardRef<HTMLDivElement, CBDBBlockHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const context = useCBDBBlock();
    const { isCollapsed, setIsCollapsed, collapsible } = context || {};

    const handleToggle = () => {
      if (collapsible && setIsCollapsed) {
        setIsCollapsed(!isCollapsed);
      }
    };

    // Separate children into title/description and actions
    let titleContent: React.ReactNode[] = [];
    let actionContent: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === CBDBBlockActions) {
        actionContent = child;
      } else {
        titleContent.push(child);
      }
    });

    return (
      <CardHeader
        ref={ref}
        className={cn(
          'py-2 px-4',
          collapsible && 'cursor-pointer select-none', // Make header clickable when collapsible
          className,
        )}
        onClick={collapsible ? handleToggle : undefined}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">{titleContent}</div>
          <div className="flex items-center gap-2">
            {actionContent}
            {collapsible && (
              <button
                type="button"
                className="p-1 hover:bg-muted rounded transition-colors ml-2"
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? (
                  <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                )}
              </button>
            )}
          </div>
        </div>
      </CardHeader>
    );
  },
);
CBDBBlockHeader.displayName = 'CBDBBlockHeader';

// CBDB Block Title - Uppercase with accent border
const CBDBBlockTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      'text-xs font-semibold uppercase tracking-wider text-muted-foreground border-l-2 border-primary pl-2', // FormControlGroup style
      className,
    )}
    {...props}
  />
));
CBDBBlockTitle.displayName = 'CBDBBlockTitle';

// CBDB Block Description - Subtle description
const CBDBBlockDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn(
      'text-xs mt-1 ml-3', // Indented under title
      className,
    )}
    {...props}
  />
));
CBDBBlockDescription.displayName = 'CBDBBlockDescription';

// CBDB Block Content - Clean content area with optional scrolling
interface CBDBBlockContentProps extends React.HTMLAttributes<HTMLDivElement> {
  hasHeader?: boolean;
  overflow?: boolean | 'horizontal' | 'vertical' | 'both';
  scrollable?: boolean; // Alias for overflow='vertical' for clarity
  maxHeight?: string; // Optional max height for vertical scrolling
}

const CBDBBlockContent = React.forwardRef<
  HTMLDivElement,
  CBDBBlockContentProps
>(
  (
    {
      className,
      hasHeader = true,
      overflow = false,
      scrollable = false,
      maxHeight,
      style,
      ...props
    },
    ref,
  ) => {
    const context = useCBDBBlock();
    const isCollapsed = context?.isCollapsed ?? false;

    // Determine overflow behavior
    const overflowClass = React.useMemo(() => {
      if (scrollable || overflow === 'vertical') {
        return cn(
          'overflow-y-auto overflow-x-hidden',
          maxHeight || 'max-h-[600px]', // Default max height if not specified
        );
      }
      if (overflow === true || overflow === 'horizontal') {
        return 'overflow-x-auto overflow-y-hidden min-w-0';
      }
      if (overflow === 'both') {
        return cn('overflow-auto min-w-0', maxHeight || 'max-h-[600px]');
      }
      return '';
    }, [overflow, scrollable, maxHeight]);

    // Use grid trick for smooth height animation without breaking child height calculations
    return (
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out h-full',
          isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        )}
        style={style?.height ? { height: style.height } : undefined}
      >
        <div className="overflow-hidden min-h-0">
          <CardContent
            ref={ref}
            className={cn(
              'px-4 pt-2 pb-4 cbdb-block-content h-full',
              !hasHeader && 'pt-6', // Add top padding when no header
              overflowClass,
              className,
            )}
            data-overflow={
              overflow ? String(overflow) : scrollable ? 'vertical' : undefined
            }
            style={
              maxHeight && !className?.includes('max-h-')
                ? { maxHeight, ...style }
                : style
            }
            {...props}
          />
        </div>
      </div>
    );
  },
);
CBDBBlockContent.displayName = 'CBDBBlockContent';

// CBDB Block Footer - Clean footer
const CBDBBlockFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const context = useCBDBBlock();
  const isCollapsed = context?.isCollapsed ?? false;

  // Use grid trick for smooth height animation
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-200 ease-in-out',
        isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
      )}
    >
      <div className="overflow-hidden">
        <CardFooter
          ref={ref}
          className={cn('flex items-center px-4 pb-4 pt-0', className)}
          style={style}
          {...props}
        />
      </div>
    </div>
  );
});
CBDBBlockFooter.displayName = 'CBDBBlockFooter';

export {
  CBDBBlock,
  CBDBBlockHeader,
  CBDBBlockActions,
  CBDBBlockFooter,
  CBDBBlockTitle,
  CBDBBlockDescription,
  CBDBBlockContent,
  useCBDBBlock,
};
