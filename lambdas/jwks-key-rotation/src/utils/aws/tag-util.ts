import { Tag } from '@aws-sdk/client-kms';

// eslint-disable-next-line sonarjs/slow-regex, security/detect-unsafe-regex
const commaSeparatedMatcher = /^(?:[\w =-]+,?)*$/;
const parameterMatcher = /^([\w -])+=([\w -])+$/;

const USAGE_TAG_NAME = 'Usage';
const USAGE_TAG_VALUE = 'CIS2-JWKS-AUTH';

export function getKeyTags(): Array<Tag> {
  const commaSeparatedKeyTags: string = process.env.KEY_TAGS || '';
  if (!commaSeparatedMatcher.test(commaSeparatedKeyTags)) {
    throw new Error(`Invalid tags ${commaSeparatedKeyTags}`);
  }

  const parameters = commaSeparatedKeyTags
    .split(',')
    .filter((parameter) => !!parameter);

  if (parameters.some((parameter) => !parameterMatcher.test(parameter))) {
    throw new Error(`Invalid tag parameter ${commaSeparatedKeyTags}`);
  }

<<<<<<< HEAD
  const tags = parameters
  .map((parameter) => parameter.split('='))
  .map((keyTag) => ({
    TagKey: keyTag[0],
    TagValue: keyTag[1],
  }));

  tags.push({
    TagKey: USAGE_TAG_NAME,
    TagValue: USAGE_TAG_VALUE
  })

  return tags;
=======
  return parameters
    .map((parameter) => parameter.split('='))
    .map((keyTag) => ({
      TagKey: keyTag[0],
      TagValue: keyTag[1],
    }));
>>>>>>> origin/main
}
