import {useViewData} from '@client/components/ViewDataProvider';

export type UA = {
  mobile: boolean,
  tablet: boolean,
  desktop: boolean,
};

export const useUA = () => {
  const {ua} = useViewData<{ua: UA}>() || {};

  return ua;
};
