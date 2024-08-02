import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import SectionComponent from './SectionComponent'

export default Node.create({
    name: "sectionNode",
    group: 'inline*',
    draggable: true,
    content: "heading block*",
    inline: false,
    isolating: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="section"]',
            },
        ]
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'section' }), 0]
    },
    addNodeView() {
        return ReactNodeViewRenderer(SectionComponent)
    },

})