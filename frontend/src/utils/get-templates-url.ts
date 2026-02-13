export function getTemplatesUrl(path: string): string {
  const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';

  return `${protocol}//${domain}${path}`;
}
