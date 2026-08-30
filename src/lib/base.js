export function withBase(path = '') {
  const raw = import.meta.env.BASE_URL || '/';
  const prefix = raw.endsWith('/') ? raw : `${raw}/`;
  if (!path || path === '/') return prefix;
  if (path.startsWith('#')) return `${prefix}${path}`;
  if (path.startsWith('http')) return path;
  return `${prefix}${path.replace(/^\//, '')}`;
}
