"use client";
import Document from '@tiptap/extension-document'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import SectionComponent from '../Section/SectionExtension';

import "./Tiptap.css";
import { CharacterCount } from '../Extensions/Pagination/Counter';
import Placeholder from '@tiptap/extension-placeholder';
import { Pagination } from '../Extensions/Pagination/Pagination';

const CustomDocument = Document.extend({
  content: 'page+',
})

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      CustomDocument,
      SectionComponent,
      StarterKit.configure({
        document: false,
      }),
      Pagination
      // CharacterCount.configure({
      //   limit: 20,
      // }),
    ],
  })



  return (
    <div style={{
      display:'flex',
      justifyContent:'center',
      alignContent:'center'
    }}>
    <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap;