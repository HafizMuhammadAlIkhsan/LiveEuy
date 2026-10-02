import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CastSection } from '../components/CastSection';
import { CastMember } from '../types';

describe('CastSection Component', () => {
  const mockActors: CastMember[] = [
    {
      name: 'Simon Baker',
      character: 'Patrick Jane',
      profileUrl: 'https://images.unsplash.com/photo-test-simon.jpg'
    },
    {
      name: 'Robin Tunney',
      character: 'Teresa Lisbon',
      profileUrl: 'https://images.unsplash.com/photo-test-robin.jpg'
    },
    {
      name: 'Tim Kang',
      character: 'Kimball Cho'
    }
  ];

  it('renders actors list with names and character roles', () => {
    const { getByText } = render(<CastSection actors={mockActors} title="Cast" />);

    expect(getByText('Cast')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
    expect(getByText('Simon Baker')).toBeInTheDocument();
    expect(getByText('Patrick Jane')).toBeInTheDocument();
    expect(getByText('Robin Tunney')).toBeInTheDocument();
    expect(getByText('Teresa Lisbon')).toBeInTheDocument();
    expect(getByText('Tim Kang')).toBeInTheDocument();
    expect(getByText('Kimball Cho')).toBeInTheDocument();
  });

  it('renders fallback portrait with initials when profileUrl is absent', () => {
    const { getByText } = render(<CastSection actors={mockActors} />);
    // Tim Kang's initials "TK"
    expect(getByText('TK')).toBeInTheDocument();
  });

  it('generates cast members when only castFallback string array is provided', () => {
    const castFallback = ['Iko Uwais', 'Chelsea Islan'];
    const { getByText } = render(<CastSection castFallback={castFallback} />);

    expect(getByText('Iko Uwais')).toBeInTheDocument();
    expect(getByText('Chelsea Islan')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
  });

  it('triggers onActorClick when an actor card is clicked', () => {
    const handleActorClick = vi.fn();
    const { getByText } = render(
      <CastSection actors={mockActors} onActorClick={handleActorClick} />
    );

    fireEvent.click(getByText('Simon Baker'));
    expect(handleActorClick).toHaveBeenCalledWith('Simon Baker');
  });

  it('returns null if there are no actors and no cast fallback', () => {
    const { container } = render(<CastSection actors={[]} castFallback={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
