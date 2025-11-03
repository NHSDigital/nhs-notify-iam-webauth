import { getTemplatesUrl } from '@/utils/get-templates-url';

describe('getTemplatesUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('in production', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      });
      process.env.NOTIFY_DOMAIN_NAME = 'nhsnotify.nhs.uk';
    });

    it('should use https protocol', () => {
      const result = getTemplatesUrl('/templates/message-templates');
      expect(result).toBe('https://nhsnotify.nhs.uk/templates/message-templates');
    });

    it('should generate absolute URLs for templates app', () => {
      const result = getTemplatesUrl('/templates/create-email-template');
      expect(result).toBe(
        'https://nhsnotify.nhs.uk/templates/create-email-template'
      );
    });

    it('should handle query parameters', () => {
      const result = getTemplatesUrl('/templates/message-templates?tab=drafts');
      expect(result).toBe(
        'https://nhsnotify.nhs.uk/templates/message-templates?tab=drafts'
      );
    });

    it('should fallback to localhost when NOTIFY_DOMAIN_NAME is not set', () => {
      delete process.env.NOTIFY_DOMAIN_NAME;
      const result = getTemplatesUrl('/templates/message-templates');
      expect(result).toBe('https://localhost:3000/templates/message-templates');
    });
  });

  describe('in development', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });
    });

    it('should use http protocol', () => {
      const result = getTemplatesUrl('/templates/message-templates');
      expect(result).toBe('http://localhost:3000/templates/message-templates');
    });

    it('should handle query parameters', () => {
      const result = getTemplatesUrl('/templates/message-templates?tab=drafts');
      expect(result).toBe('http://localhost:3000/templates/message-templates?tab=drafts');
    });

    it('should fallback to localhost when NOTIFY_DOMAIN_NAME is not set', () => {
      delete process.env.NOTIFY_DOMAIN_NAME;
      const result = getTemplatesUrl('/templates/message-templates');
      expect(result).toBe('http://localhost:3000/templates/message-templates');
    });
  });
});
