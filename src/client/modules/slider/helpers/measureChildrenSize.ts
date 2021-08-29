import {Size} from '@shared/types';

/**
 * Measure all children size
 *
 * @param {HTMLElement} parentNode
 * @returns {Size[]}
 */
export function measureChildenSize(parentNode: HTMLElement): Size[] {
  return Array.from(parentNode.children).reduce(
    (list, node) => {
      const rect = node.getBoundingClientRect();
      list.push(
        {
          w: rect.width,
          h: rect.height,
        },
      );

      return list;
    },
    <Size[]> [],
  );
}
