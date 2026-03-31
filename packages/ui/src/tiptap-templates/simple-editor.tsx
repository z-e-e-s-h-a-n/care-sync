"use client";

import { useEffect, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "@workspace/ui/tiptap-ui-primitive/button";
import { Spacer } from "@workspace/ui/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@workspace/ui/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@workspace/ui/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@workspace/ui/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "../tiptap-node/blockquote-node/blockquote-node.scss";
import "../tiptap-node/code-block-node/code-block-node.scss";
import "../tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "../tiptap-node/list-node/list-node.scss";
import "../tiptap-node/image-node/image-node.scss";
import "../tiptap-node/heading-node/heading-node.scss";
import "../tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@workspace/ui/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@workspace/ui/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@workspace/ui/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@workspace/ui/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@workspace/ui/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@workspace/ui/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@workspace/ui/tiptap-ui/link-popover";
import { MarkButton } from "@workspace/ui/tiptap-ui/mark-button";
import { TextAlignButton } from "@workspace/ui/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@workspace/ui/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@workspace/ui/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@workspace/ui/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@workspace/ui/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "@workspace/ui/hooks/tiptap/use-is-breakpoint";

// --- Lib ---
import "./simple-editor.scss";

import type { FieldChildrenProps } from "@workspace/ui/components/form";
import { cn } from "../lib/utils";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor<TFormData>({
  name,
  value,
  onChange,
  isInvalid,
  disabled,
  onBlur,
  placeholder = "",
}: FieldChildrenProps<TFormData>) {
  const isMobile = useIsBreakpoint();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main",
  );

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode,
    ],
    content: value ?? placeholder,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <div
      aria-invalid={isInvalid}
      className={cn(
        "simple-editor-wrapper dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent",
      )}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar className="simple-editor-toolbar">
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          name={name}
          disabled={disabled}
          onBlur={onBlur}
          className="simple-editor-content relative max-h-[70svh] overflow-y-auto"
        />
      </EditorContext.Provider>
    </div>
  );
}
