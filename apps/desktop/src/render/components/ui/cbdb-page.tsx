/**
 * CBDB Page Component
 *
 * A consistent page structure component that provides standard layout
 * for all pages in the CBDB application. Similar to CBDBBlock but for
 * full page layouts.
 *
 * ARCHITECTURE:
 * - CBDBPage: Flex container (header + content)
 * - CBDBPageHeader: Fixed header area (title, description, actions)
 * - CBDBPageContent: Scrollable content area with scrollbar-gutter
 *
 * SCROLLING BEHAVIOR:
 * - Only CBDBPageContent scrolls (has overflow-y: auto)
 * - scrollbar-gutter: stable prevents layout shift
 * - Header stays fixed at top while content scrolls
 *
 * USAGE:
 * ```tsx
 * <CBDBPage>
 *   <CBDBPageHeader>
 *     <CBDBPageTitle>Page Title</CBDBPageTitle>
 *     <CBDBPageDescription>Description</CBDBPageDescription>
 *   </CBDBPageHeader>
 *   <CBDBPageContent>
 *     <!-- Your scrollable content here -->
 *   </CBDBPageContent>
 * </CBDBPage>
 * ```
 *
 * This ensures ALL pages have consistent, shift-free scrolling behavior.
 */

import * as React from 'react';
import { cn } from '@/render/lib/utils';

// CBDB Page Root - Main page container with flex layout
const CBDBPage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'cbdb-page', // Identifies this as a CBDB page
      'flex flex-col', // Flex column layout for header and content
      'h-full', // Take full height from parent
      'px-4', // Moderate padding
      'py-2',
      'space-y-6', // Vertical spacing between sections
      className,
    )}
    style={{}}
    {...props}
  />
));
CBDBPage.displayName = 'CBDBPage';

// CBDB Page Header - Page title and description section
const CBDBPageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'space-y-1 pb-0', // Space between header and content
      className,
    )}
    {...props}
  />
));
CBDBPageHeader.displayName = 'CBDBPageHeader';

// CBDB Page Title - Main page title
const CBDBPageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-3xl  tracking-tight text-primary', // Large, prominent title
      className,
    )}
    {...props}
  />
));
CBDBPageTitle.displayName = 'CBDBPageTitle';

// CBDB Page Description - Subtitle/description text
const CBDBPageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-muted-foreground', // Subtle description text
      className,
    )}
    {...props}
  />
));
CBDBPageDescription.displayName = 'CBDBPageDescription';

// CBDB Page Actions - Container for page-level actions
const CBDBPageActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-2', // Horizontal action buttons
      className,
    )}
    {...props}
  />
));
CBDBPageActions.displayName = 'CBDBPageActions';

// CBDB Page Content - Main scrollable content area
const CBDBPageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'space-y-4', // Consistent spacing between content sections
      'min-h-0', // Allow shrinking below content height
      className,
    )}
    style={{
      ...style,
    }}
    {...props}
  />
));
CBDBPageContent.displayName = 'CBDBPageContent';

export {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageActions,
  CBDBPageContent,
};
