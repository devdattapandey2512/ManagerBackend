export function newId(prefix = 'prof_') {
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${Date.now()}${rand}`;
}
