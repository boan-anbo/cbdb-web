import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeExampleProps {
  title: string;
  subtitle?: string;
  description?: string;
  language: string;
  code: string;
  fontSize?: string;
}

export function CodeExample({
  title,
  subtitle,
  description,
  language,
  code,
  fontSize = '0.65rem'
}: CodeExampleProps) {
  const isJson = language === 'json';
  const theme = isJson ? oneLight : vscDarkPlus;
  const backgroundColor = isJson ? '#fafafa' : 'rgb(30, 30, 30)';

  return (
    <div>
      {title && <div className="text-sm font-medium mb-1">{title}</div>}
      {description && (
        <div className="text-sm text-muted-foreground mb-1">{description}</div>
      )}
      {subtitle && (
        <div className="text-sm text-muted-foreground mb-1">{subtitle}</div>
      )}
      <div className="rounded-md overflow-hidden border border-border">
        <SyntaxHighlighter
          language={language}
          style={theme}
          customStyle={{
            margin: 0,
            fontSize,
            background: backgroundColor
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}