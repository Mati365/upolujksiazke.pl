import React, {CSSProperties} from 'react';

import {useI18n} from '@client/i18n';

import {BrochurePageRecord} from '@api/types';
import {useViewerContext} from '../../context/viewerContext';
import {isImagePage} from '../../helpers';

type ViewerPageProps = {
  page: BrochurePageRecord,
  style: CSSProperties,
};

export const ViewerPage = ({page, style}: ViewerPageProps) => {
  const t = useI18n('brochure.viewer');
  const {title} = useViewerContext(
    ({state: {brochure}}) => ({
      title: brochure.title,
    }),
  );

  let content = null;
  if (isImagePage(page)) {
    content = (
      <img
        className='c-viewer-slider__page-image'
        src={page.image.preview.file}
        alt={
          t(
            'page_title',
            {
              index: page.index + 1,
              title,
            },
          )
        }
      />
    );
  }

  return (
    <div
      className='c-viewer-slider__page'
      style={style}
    >
      {content}
    </div>
  );
};

ViewerPage.displayName = 'ViewerPage';
