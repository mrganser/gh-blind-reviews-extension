import { describe, expect, it } from 'vitest';
import { getStatusMessage } from './status';

describe('getStatusMessage', () => {
  it('returns active message when enabled', () => {
    expect(getStatusMessage(true)).toBe('Active - identities are anonymized');
  });

  it('returns inactive message when disabled', () => {
    expect(getStatusMessage(false)).toBe('Inactive - identities are visible');
  });
});
