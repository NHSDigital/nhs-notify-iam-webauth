import { Tag } from '@aws-sdk/client-kms';

const commaSeparatedMatcher = /^([\w -=,?])*$/;
const parameterMatcher = /^([\w -])+=([\w -])+$/;

export function getKeyTags(): Array<Tag> {
  const commaSeparatedKeyTags: string = process.env.KEY_TAGS || '';
  if (!commaSeparatedMatcher.test(commaSeparatedKeyTags)) {
    throw new Error(`Invalid tags ${commaSeparatedKeyTags}`);
  }

  const parameters = commaSeparatedKeyTags
    .split(',')
    .filter((parameter) => !!parameter);

  if (
    parameters.findIndex((parameter) => !parameterMatcher.test(parameter)) > -1
  ) {
    throw new Error(`Invalid tag parameter ${commaSeparatedKeyTags}`);
  }

  return parameters
    .map((parameter) => parameter.split('='))
    .map((keyTag) => ({
      TagKey: keyTag[0],
      TagValue: keyTag[1],
    }));
}
