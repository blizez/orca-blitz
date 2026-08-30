import { useState } from "react";
import { Button } from "@orca-blitz/ui/components/ui/button";
import { useSound } from "../../lib/sound-context";

interface DeleteBusinessModalProps {
  open: boolean;
  businessName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBusinessModal({
  open,
  businessName,
  onClose,
  onConfirm,
}: DeleteBusinessModalProps) {
  const { play } = useSound();
  const [input, setInput] = useState("");

  if (!open) return null;

  const canDelete = input === businessName;

  const handleConfirm = () => {
    if (!canDelete) return;
    onConfirm();
    setInput("");
    onClose();
  };

  const handleClose = () => {
    setInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Delete Business</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{businessName}</span>? This action cannot
            be undone.
          </p>
        </div>

        <div className="mb-4">
          <label className="text-sm text-muted-foreground">
            Type <span className="font-medium text-foreground">{businessName}</span> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={businessName}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleConfirm();
              play("error");
            }}
            disabled={!canDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
