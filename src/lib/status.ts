export function getStatusMessage(enabled: boolean): string {
  return enabled
    ? 'Active - identities are anonymized'
    : 'Inactive - identities are visible';
}
