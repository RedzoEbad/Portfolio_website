"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reorderable list: drag the handle with a mouse, or use the arrow buttons
 * (keyboard and touch). `onMove(from, to)` should reorder the backing array.
 */
export function SortableList<T>({ items, onMove, render, keyOf, className }: { items: T[]; onMove: (from: number, to: number) => void; render: (item: T, index: number) => React.ReactNode; keyOf: (item: T, index: number) => string; className?: string }) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, i) => (
        <li
          key={keyOf(item, i)}
          onDragOver={(e) => {
            if (drag === null) return;
            e.preventDefault();
            setOver(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (drag !== null && drag !== i) onMove(drag, i);
            setDrag(null);
            setOver(null);
          }}
          className={cn("flex items-start gap-2 rounded-xl border border-line bg-abyss/40 p-2 transition-[border-color,opacity]", drag === i && "opacity-40", over === i && drag !== i && "border-signal")}
        >
          <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1">
            <span
              draggable
              onDragStart={(e) => {
                setDrag(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                setDrag(null);
                setOver(null);
              }}
              className="hidden cursor-grab rounded p-1 text-fog hover:text-frost active:cursor-grabbing sm:block"
              title="Drag to reorder"
              aria-hidden="true"
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <button type="button" disabled={i === 0} onClick={() => onMove(i, i - 1)} className="rounded p-1 text-fog hover:bg-hull-2 hover:text-frost disabled:opacity-30" aria-label="Move up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button type="button" disabled={i === items.length - 1} onClick={() => onMove(i, i + 1)} className="rounded p-1 text-fog hover:bg-hull-2 hover:text-frost disabled:opacity-30" aria-label="Move down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">{render(item, i)}</div>
        </li>
      ))}
    </ul>
  );
}
