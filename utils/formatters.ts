/**
 * Formatting Utilities for Dates, Numbers, and Agriculture Units
 */

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatConfidence = (confidence: number): string => {
  // If confidence is 0.0 - 1.0 format to percentage, otherwise treat as percentage
  const percentage = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
  return `${percentage}%`;
};

export const formatTemperature = (celsius?: number): string => {
  if (celsius === undefined || celsius === null) return '--°C';
  return `${Math.round(celsius)}°C`;
};

export const formatSoilValue = (value?: number, unit: string = ''): string => {
  if (value === undefined || value === null) return '--';
  return `${value} ${unit}`.trim();
};
