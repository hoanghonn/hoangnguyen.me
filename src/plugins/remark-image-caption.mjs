import { visit } from 'unist-util-visit';

export function remarkImageCaption() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (node.children.length === 1 && node.children[0].type === 'image') {
        const img = node.children[0];
        const alt = img.alt ?? '';
        const title = img.title ?? alt;
        parent.children[index] = {
          type: 'html',
          value: `<figure><img src="${img.url}" alt="${alt}" />${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`,
        };
      }
    });
  };
}
