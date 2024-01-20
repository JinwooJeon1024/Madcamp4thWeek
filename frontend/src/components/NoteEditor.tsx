import React from 'react';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const NoteEditor: React.FC = () => {
  return (
    <Editor
      wrapperClassName="note-editor-wrapper"
      editorClassName="note-editor"
      toolbarClassName="note-toolbar"
    />
  );
};

export default NoteEditor;
