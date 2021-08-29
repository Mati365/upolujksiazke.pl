import React, {ReactNode} from 'react';

type ErrorBoundaryState = {
  error?: Error,
  errorInfo?: object,
};

type ErrorBoundaryProps = {
  children: ReactNode,
  renderError(errorState?: ErrorBoundaryState): ReactNode;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error | null, errorInfo: object) {
    this.setState(
      {
        error,
        errorInfo,
      },
    );
  }

  render() {
    const {children, renderError} = this.props;
    const {error} = this.state;

    if (error)
      return renderError(this.state);

    return children;
  }
}
