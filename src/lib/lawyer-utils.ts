/**
 * Global utility for lawyer name enrichment.
 * Automatically prefixes "Advocate" to lawyer names across the platform.
 */
export const formatLawyerName = (name?: string | null, fallback = 'Legal Professional'): string => {
  const displayName = name || fallback;
  if (displayName.startsWith('Advocate ')) return displayName;
  return `Advocate ${displayName}`;
};
