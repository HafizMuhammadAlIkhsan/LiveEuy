import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalA11y } from '../hooks/useModalA11y';

describe('useModalA11y Hook', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('locks body scroll when modal is open and restores when closed', () => {
    const modalRef = { current: document.createElement('div') };
    const onClose = vi.fn();

    const { rerender } = renderHook(
      ({ isOpen }) => useModalA11y({ isOpen, onClose, modalRef }),
      { initialProps: { isOpen: true } }
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ isOpen: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when Escape key is pressed', () => {
    const modalRef = { current: document.createElement('div') };
    const onClose = vi.fn();

    renderHook(() => useModalA11y({ isOpen: true, onClose, modalRef }));

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(escapeEvent);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when other keys are pressed', () => {
    const modalRef = { current: document.createElement('div') };
    const onClose = vi.fn();

    renderHook(() => useModalA11y({ isOpen: true, onClose, modalRef }));

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(enterEvent);

    expect(onClose).not.toHaveBeenCalled();
  });
});
