import React from 'react';

import {BrochureRecord} from '@api/types';
import {BrochureTitle} from './parts';

type BrochureInfoProps = {
  brochure: BrochureRecord,
};

export const BrochureInfo = ({brochure}: BrochureInfoProps) => (
  <>
    <BrochureTitle brochure={brochure} />
  </>
);

BrochureInfo.displayName = 'BrochureInfo';
