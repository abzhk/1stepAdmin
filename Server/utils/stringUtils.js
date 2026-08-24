export const capitalizeName = (name) => {
  if (typeof name !== 'string' || !name.trim()) return name;
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
