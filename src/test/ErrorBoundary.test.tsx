import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Helper component that throws an error intentionally
const FaultyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Simulated UI crash for testing');
  }
  return <div data-testid="normal-content">Tampilan Normal Bioskop</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children correctly when there are no errors', () => {
    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('normal-content')).toHaveTextContent('Tampilan Normal Bioskop');
  });

  it('catches runtime exception and renders cinema error fallback without blank screen', () => {
    // Suppress console.error in test output for intentional errors
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Halaman">
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kendala Memuat Halaman')).toBeInTheDocument();
    expect(screen.getByText('Muat Ulang Halaman')).toBeInTheDocument();
    expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();

    spy.mockRestore();
  });
});
