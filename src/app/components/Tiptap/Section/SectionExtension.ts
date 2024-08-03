import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import SectionComponent from './SectionComponent'
let gid = 0;

export default Node.create({
    name: "page",
    draggable: true,
    content: `block*`,
    group: "block",
    isolating: true,
    selectable: false,
    inline: false,

    parseHTML() {
        return [
            {
                tag: 'page',
            },
        ]
    },
    renderHTML({ node, HTMLAttributes }) {
        gid += 1;
        const pid = Math.random().toString(36).substring(2, 10);
        if (!node.attrs.id) {

            // @ts-ignore
            node.attrs.id = pid;
        }
        return ["page", mergeAttributes(HTMLAttributes, { id: pid }), 0];
    },
    addNodeView() {
        return ReactNodeViewRenderer(SectionComponent)
    },

    addAttributes() {
        return {
            HTMLAttributes: {},
            pageNumber: {
                default: 1
            },
            id: {
                parseHTML: (element) => element.getAttribute("id"),
                renderHTML: (attributes) => {
                    if (!attributes.id) {
                        return {};
                    }
                    return {
                        id: attributes.id
                    };
                }
            }
        };
    },

})