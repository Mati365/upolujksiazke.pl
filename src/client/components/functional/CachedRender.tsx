import React, {ReactNode} from 'react';

type CachedRenderProps = {
  cacheKey: any,
  children(): ReactNode,
};

export class CachedRender extends React.Component<CachedRenderProps> {
  shouldComponentUpdate(nextProps: CachedRenderProps) {
    return nextProps.cacheKey !== this.props.cacheKey;
  }

  render() {
    const {children} = this.props;

    return children();
  }
}
