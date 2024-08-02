import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useEffect } from 'react'
import './SectionComponent.css'

const SectionComponent = (props: NodeViewProps) => {
  const addSection = () => {
    const endPos = props.getPos() + props.node.nodeSize;
    props.editor
      .chain()
      .focus(endPos)
      .insertContent({
        type: 'sectionNode',
        content: [
          {
            type: 'heading',
            
          },
          {
            type: 'paragraph',
          },
        ],
      })
      .run();
  };

  return (
    <NodeViewWrapper className='section-node'>
      <NodeViewContent className='content' >
      </NodeViewContent>

    {/* <NodeViewContent className='content'>
      <h1>
        Heading
      </h1>
    </NodeViewContent> */}
        <button className='add-btn' onClick={addSection}>Add Section</button>
  </NodeViewWrapper>
  )
}

export default SectionComponent;