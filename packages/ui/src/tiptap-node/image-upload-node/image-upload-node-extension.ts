import { mergeAttributes, Node } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageUploadNode as ImageUploadNodeComponent } from "@workspace/ui/tiptap-node/image-upload-node/image-upload-node";

export interface ImageUploadNodeOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: () => ReturnType;
    };
  }
}

/**
 * A Tiptap node extension that creates an image upload component.
 * @see registry/tiptap-node/image-upload-node/image-upload-node
 */
export const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  name: "imageUpload",

  group: "block",

  draggable: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "image-upload" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeComponent);
  },

  addCommands() {
    return {
      setImageUploadNode:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },

  /**
   * Adds Enter key handler to trigger the upload component when it's selected.
   */
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { nodeAfter } = selection.$from;

        if (
          nodeAfter &&
          nodeAfter.type.name === "imageUpload" &&
          editor.isActive("imageUpload")
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos);
          if (nodeEl && nodeEl instanceof HTMLElement) {
            // Since NodeViewWrapper is wrapped with a div, we need to click the first child
            const firstChild = nodeEl.firstChild;
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click();
              return true;
            }
          }
        }
        return false;
      },
    };
  },
});

export default ImageUploadNode;
