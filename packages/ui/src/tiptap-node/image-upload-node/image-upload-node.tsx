"use client";

import { useCallback } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";

import { focusNextNode, isValidPosition } from "@workspace/ui/lib/tiptap-utils";
import { useMediaLibrary } from "@workspace/ui/hooks/use-media";
import { MediaUploadPlaceholder } from "@workspace/ui/media/media-upload-surface";

import "./image-upload-node.scss";

export const ImageUploadNode: React.FC<NodeViewProps> = (props) => {
  const { onMediaSelect } = useMediaLibrary();

  const replacePlaceholder = useCallback(
    (image: { src: string; alt: string; title: string }) => {
      const pos = props.getPos();

      if (!isValidPosition(pos)) {
        return;
      }

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + props.node.nodeSize })
        .insertContentAt(pos, {
          type: "image",
          attrs: image,
        })
        .run();

      focusNextNode(props.editor);
    },
    [props],
  );

  const openMediaLibrary = useCallback(() => {
    onMediaSelect((media) => {
      replacePlaceholder({
        src: media.url,
        alt: media.altText ?? media.name,
        title: media.name,
      });
    });
  }, [onMediaSelect, replacePlaceholder]);

  return (
    <NodeViewWrapper className="tiptap-image-upload" tabIndex={0}>
      <MediaUploadPlaceholder
        onClick={openMediaLibrary}
        title={
          <>
            <em>Click to open</em> media library
          </>
        }
        description="Choose an image from the library or upload a new one there."
      />
    </NodeViewWrapper>
  );
};
