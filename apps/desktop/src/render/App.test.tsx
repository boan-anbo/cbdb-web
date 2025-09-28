import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText('CBDB Desktop')).toBeInTheDocument();
  });

  it('renders React working message', () => {
    render(<App />);
    expect(screen.getByText('✅ React is Working!')).toBeInTheDocument();
  });
});