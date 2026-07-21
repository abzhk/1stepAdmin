import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Editor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
        ],
      },
    });

    // Remove unwanted formatting from pasted content
    quillRef.current.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      delta.ops.forEach((op) => {
        if (op.attributes) {
          delete op.attributes.color;
          delete op.attributes.background;
          delete op.attributes.font;
          delete op.attributes.size;
        }
      });

      return delta;
    });

    quillRef.current.on("text-change", () => {
      const html = quillRef.current.root.innerHTML;
      onChange(html);
    });
  }, []);

  useEffect(() => {
    if (
      quillRef.current &&
      value !== undefined &&
      quillRef.current.root.innerHTML !== value
    ) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return <div ref={editorRef} className="bg-white rounded-lg" />;
};

export default Editor;