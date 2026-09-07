"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WhatsNewNote {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface WhatsNewModalProps {
  notes: WhatsNewNote[];
  open: boolean;
  onClose: () => void;
}

export function WhatsNewModal({ notes, open, onClose }: WhatsNewModalProps) {
  const [index, setIndex] = useState(0);

  if (notes.length === 0) return null;

  const isFirst = index === 0;
  const isLast = index === notes.length - 1;
  const currentNote = notes[index];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  const handleNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (isFirst) return;
    setIndex((i) => i - 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-xl">
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <XIcon />
          <span className="sr-only">Cerrar</span>
        </Button>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1 pr-8">
            <h2 className="text-base font-medium">{currentNote.title}</h2>
            <p className="text-sm text-muted-foreground">
              {currentNote.description}
            </p>
          </div>

          <img
            src={currentNote.imageUrl}
            alt={currentNote.title}
            className="h-64 w-full rounded-lg object-cover"
          />

          <div className="flex items-center justify-center gap-1.5">
            {notes.map((note, i) => (
              <span
                key={note.id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === index ? "bg-foreground" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirst}
            >
              Anterior
            </Button>
            <Button variant="default" onClick={handleNext}>
              {isLast ? "Entendido" : "Siguiente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
