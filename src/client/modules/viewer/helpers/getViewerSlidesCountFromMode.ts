import {ViewerSizingMode} from '../context/utils/initialState';

export function getViewerSlidesCountFromMode(sizingMode: ViewerSizingMode): number {
  return (
    sizingMode.portrait
      ? 1
      : 2
  );
}
