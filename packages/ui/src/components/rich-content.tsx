import { cn } from "@workspace/ui/lib/utils";

import "./rich-content.scss";

interface RichContentProps {
  html: string;
  className?: string;
}

export function RichContent({ html, className }: RichContentProps) {
  return (
    <div className={cn("rich-content tiptap ProseMirror", className)}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
