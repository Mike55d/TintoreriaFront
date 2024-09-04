import { IOptions } from 'sanitize-html';

export const SANITIZE_CONFIG: IOptions = {
  allowedTags: false,
  allowedAttributes: false,
  exclusiveFilter: (frame: any) => {
    const tags = ['script', 'input', 'textarea', 'button', 'select'];
    return tags.includes(frame.tag);
  },
  transformTags: {
    '*': (tagName: string, attribs: { [key: string]: string }) => {
      Object.keys(attribs).forEach(attr => {
        if (attr.startsWith('on')) {
          delete attribs[attr];
        }
      });
      return {
        tagName,
        attribs
      };
    }
  }
};
