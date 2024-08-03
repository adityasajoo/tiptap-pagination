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
        type: 'page',
        content: [
          {
            type: 'paragraph',
          },
        ],
      })
      .run();
  };

  return (
    <NodeViewWrapper className='section-node' id={props.node.attrs.id} >
      <NodeViewContent className='content' >
      </NodeViewContent>

    {/* <NodeViewContent className='content'>
      <h1>
        Heading
      </h1>
    </NodeViewContent> */}
        {/* <button className='add-btn' onClick={addSection}>Add Section</button> */}
        <div style={{
          display:'flex',
          width:'100%',
          justifyContent:'end',
          alignItems:'center',
          margin:'5px',
 
  
        }}>

          <div style={{        
            padding:'5px 20px',
            background:'gray',
            borderRadius:'10px',
            color:'white'}}>
          <p>{props.node.attrs.pageNumber}</p>
          </div>
        </div>
  </NodeViewWrapper>
  )
}

export default SectionComponent;