import {
  KMSInvalidStateException,
  NotFoundException,
} from '@aws-sdk/client-kms';

export const KMS_NO_OP_ERRORS = [NotFoundException, KMSInvalidStateException];
