
export const parseCors = (mode: string, cors: string): string[] | string => {
  if (mode.toLowerCase() == 'dev') return '*';
  const cors_str = cors || '';
  return `${cors_str}`.split(',').map((item) => item.trim());
};
