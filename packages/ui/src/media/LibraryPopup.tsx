import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@workspace/ui/components/dialog";
import type { MediaResponse } from "@workspace/contracts/media";
import MediaLibrary from "./library";

interface LibraryPopupProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (media: MediaResponse) => void;
}

const LibraryPopup = ({ open, setOpen, onSelect }: LibraryPopupProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Media Library</DialogTitle>
      <DialogContent className="min-w-[80%] max-h-[80svh] min-h-[80svh] overflow-auto!">
        <MediaLibrary onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  );
};

export default LibraryPopup;
