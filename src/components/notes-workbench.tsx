"use client";

import { useState } from "react";
import { EXEGETICAL_STEPS, type NoteType } from "@/lib/exegesis";
import { ConfirmButton } from "@/components/confirm-button";

type NoteRow = {
  id: number;
  type: NoteType;
  title: string;
  body: string;
  createdAt: Date | string;
};

export function NotesWorkbench({
  passageId,
  notes,
  addNote,
  deleteNote,
}: {
  passageId: number;
  notes: NoteRow[];
  addNote: (fd: FormData) => Promise<void>;
  deleteNote: (fd: FormData) => Promise<void>;
}) {
  const [active, setActive] = useState<NoteType | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const counts = new Map<NoteType, number>();
  for (const n of notes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);

  const visible = active === "all" ? notes : notes.filter((n) => n.type === active);
  const step = EXEGETICAL_STEPS.find((s) => s.type === active);
  const formDefaultType: NoteType = active === "all" ? "observation" : active;

  return (
    <div className="card overflow-hidden">
      {/* Step tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-parchment-200 bg-parchment-100/60 p-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            active === "all"
              ? "bg-oxblood-700 text-white"
              : "text-ink-700 hover:bg-parchment-200"
          }`}
        >
          All <span className="opacity-60">{notes.length}</span>
        </button>
        {EXEGETICAL_STEPS.map((s) => {
          const n = counts.get(s.type) ?? 0;
          const isActive = active === s.type;
          return (
            <button
              key={s.type}
              type="button"
              onClick={() => setActive(s.type)}
              title={s.label}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? "bg-oxblood-700 text-white" : "text-ink-700 hover:bg-parchment-200"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? "bg-amber-200 text-oxblood-900" : "bg-parchment-300 text-ink-700"
                }`}
              >
                {s.step}
              </span>
              {s.short}
              {n > 0 && <span className="opacity-60">{n}</span>}
            </button>
          );
        })}
      </div>

      {/* Step guidance */}
      <div className="flex flex-col gap-3 border-b border-parchment-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          {step ? (
            <>
              <div className="font-serif text-lg font-semibold text-ink-900">
                Step {step.step} · {step.label}
              </div>
              <div className="text-sm italic text-oxblood-700">{step.question}</div>
              <p className="mt-1 max-w-2xl text-xs text-ink-700">{step.description}</p>
            </>
          ) : (
            <>
              <div className="font-serif text-lg font-semibold text-ink-900">All notes</div>
              <p className="text-xs text-ink-700">
                Notes ordered by exegetical step. Select a step to focus and add notes for it.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"} shrink-0`}
        >
          {showForm ? "Close" : "+ Add note"}
        </button>
      </div>

      {/* Add note form */}
      {showForm && (
        <form
          action={async (fd) => {
            await addNote(fd);
            setShowForm(false);
          }}
          className="space-y-3 border-b border-parchment-200 bg-parchment-50 p-4"
        >
          <input type="hidden" name="passageId" value={passageId} />
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="label">Step</label>
              <select name="type" defaultValue={formDefaultType} className="input" key={formDefaultType}>
                {EXEGETICAL_STEPS.map((s) => (
                  <option key={s.type} value={s.type}>
                    {s.step}. {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Heading (optional)</label>
              <input name="title" className="input" placeholder="e.g. Anarthrous predicate in v. 1c" />
            </div>
          </div>
          <div>
            <label className="label">Note</label>
            <textarea
              name="body"
              rows={5}
              required
              className="input"
              placeholder="Record your observation, analysis, or question…"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              Save note
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      {visible.length === 0 ? (
        <div className="p-8 text-center text-sm text-ink-700/70">
          No notes {step ? `for ${step.label.toLowerCase()}` : ""} yet.
        </div>
      ) : (
        <ul className="divide-y divide-parchment-200">
          {visible.map((n) => {
            const s = EXEGETICAL_STEPS.find((x) => x.type === n.type)!;
            return (
              <li key={n.id} className="group p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gold-500">
                      <span>
                        {s.step}. {s.label}
                      </span>
                    </div>
                    {n.title && (
                      <div className="font-serif text-base font-semibold text-ink-900">{n.title}</div>
                    )}
                  </div>
                  <form action={deleteNote} className="opacity-0 transition-opacity group-hover:opacity-100">
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="passageId" value={passageId} />
                    <ConfirmButton message="Delete this note?">Delete</ConfirmButton>
                  </form>
                </div>
                <p className="prose-note mt-1">{n.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
