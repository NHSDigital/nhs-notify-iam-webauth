/**
 * Replaces variables within a template string using a variables object, and supports pluralisation.
 *
 * Supports:
 * - simple variable interpolation: `{{name}}`
 * - pluralisation: `{{variable|singular|plural}}`
 *
 * Example:
 * interpolate('Hello {{name}}, you have {{count}} {{count|message|messages}}.', {
 *   name: 'John',
 *   count: 2,
 * }); // => 'Hello John, you have 2 messages.'
 */

// eslint-disable-next-line security/detect-unsafe-regex, sonarjs/slow-regex
const interpolationPattern = /{{([^|}]+)(?:\|([^|}]+)\|([^}]+))?}}/g;

export function interpolate(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  return template.replace(interpolationPattern, (_, key, singular, plural) => {
    const value = variables[key];

    if (singular !== undefined && plural !== undefined) {
      const numeric = Number(value);

      if (Number.isNaN(numeric)) return plural;
      return numeric === 1 ? singular : plural;
    }

    return value == null ? '' : String(value);
  });
}
