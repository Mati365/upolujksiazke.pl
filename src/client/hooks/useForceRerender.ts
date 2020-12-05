import {useState} from 'react';

export const useForceRerender = () => {
  const [, setState] = useState<{}>();

  return () => {
    setState({});
  };
};
