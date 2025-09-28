import * as React from 'react';
import { cn } from '@/render/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface FormControlGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

/**
 * FormControlGroup - A container for grouping related form controls with an optional title
 * Used to organize form sections visually, similar to Access form field groups
 */
const FormControlGroup = React.forwardRef<HTMLDivElement, FormControlGroupProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        {title && (
          <CardHeader className="pb-3 pt-3 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-l-2 border-primary pl-2">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn(!title && 'pt-6')}>
          {children}
        </CardContent>
      </Card>
    );
  }
);

FormControlGroup.displayName = 'FormControlGroup';

export { FormControlGroup };