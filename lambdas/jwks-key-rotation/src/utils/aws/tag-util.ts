import { Tag } from '@aws-sdk/client-kms';

const tagsMatcher = /^(([^,^=]+=[^,^=]+),?)*$/;

export function getKeyTags(): Array<Tag> {
  const keyTags: string = process.env.KEY_TAGS || '';
  if (!tagsMatcher.test(keyTags)) {
    throw new Error(`Invalid tags ${keyTags}`);
  }

  return keyTags
    .split(',')
    .filter((keyTag) => !!keyTag)
    .map((keyTag) => keyTag.split('='))
    .map((keyTag) => ({
      TagKey: keyTag[0],
      TagValue: keyTag[1],
    }));
}
