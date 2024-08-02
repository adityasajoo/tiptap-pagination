"use client";
import Document from '@tiptap/extension-document'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'
import SectionComponent from '../Section/SectionExtension';

import "./Tiptap.css";
import { CharacterCount } from '../Extensions/Pagination/Counter';
import Placeholder from '@tiptap/extension-placeholder';

const CustomDocument = Document.extend({
  content: 'sectionNode+',
})

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      CustomDocument,
      SectionComponent,
      StarterKit.configure({
        document: false,
      }),
      // CharacterCount.configure({
      //   limit: 20,
      // }),
    ],
  })



  return (
    <>
    <EditorContent editor={editor} />
    </>
  )
}

export default Tiptap;