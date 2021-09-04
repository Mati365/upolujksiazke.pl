import ReactDOM from 'react-dom/server';
import TurndownService from 'turndown';
import {ReactElement} from 'react';

/**
 * Transforms JSX to message accepted by wykop format
 * (markdown)
 *
 * @export
 * @param {ReactElement<any>} node
 * @return {string}
 */
export function renderJSXToMessage(node: ReactElement<any>): string {
  const html = ReactDOM.renderToStaticMarkup(node);

  return (
    new TurndownService()
      .turndown(html)
      .toString()
      .replace(/([ ]*\n)/g, '\n')
  );
}
