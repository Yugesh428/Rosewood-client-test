/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API = "/api/ui/announcement";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-sans";

type MsgRow = {
  id: string;
  text: string;
  cta: string | null;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
};

export default function AnnouncementSection() {
  const [rows,         setRows]         = useState<MsgRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [deletingIds,  setDeletingIds]  = useState<Set<string>>(new Set());
  const [togglingIds,  setTogglingIds]  = useState<Set<string>>(new Set());
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editDraft,    setEditDraft]    = useState<Partial<MsgRow>>({});

  // ── Add form state ────────────────────────────────────────────────────────
  const [newText,  setNewText]  = useState("");
  const [newCta,   setNewCta]   = useState("");
  const [newLink,  setNewLink]  = useState("/pharmacy");
  const [adding,   setAdding]   = useState(false);

  // ── Fetch all (incl. inactive) ────────────────────────────────────────────
  const fetchRows = useCallback(() => {
    setLoading(true);
    fetch(`${API}?all=true`)
      .then(r => r.json())
      .then(json => { if (json.success) setRows(json.data || []); })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newText.trim()) { toast.error("Message text is required"); return; }
    setAdding(true);
    try {
      const res  = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText, cta: newCta || null, link: newLink }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Add failed");
      toast.success("Message added");
      setNewText(""); setNewCta(""); setNewLink("/pharmacy");
      fetchRows();
    } catch (err: any) {
      toast.error(err.message || "Add failed");
    } finally {
      setAdding(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggle = async (row: MsgRow) => {
    setTogglingIds(prev => new Set(prev).add(row.id));
    try {
      const res  = await fetch(`${API}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Toggle failed");
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, isActive: !r.isActive } : r));
    } catch (err: any) {
      toast.error(err.message || "Toggle failed");
    } finally {
      setTogglingIds(prev => { const s = new Set(prev); s.delete(row.id); return s; });
    }
  };

  // ── Inline edit save ──────────────────────────────────────────────────────
  const handleEditSave = async (id: string) => {
    try {
      const res  = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
      toast.success("Updated");
      setRows(prev => prev.map(r => r.id === id ? { ...r, ...editDraft } : r));
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const res  = await fetch(`${API}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
      toast.success("Deleted");
      setRows(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="p-6 bg-white space-y-6">

      {/* ── Existing messages ─────────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium mb-3">
          Messages&nbsp;
          <span className="text-gray-400 font-normal">
            ({rows.filter(r => r.isActive).length} active of {rows.length})
          </span>
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No messages yet. Add one below.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className={`rounded border p-3 transition-opacity ${row.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}
              >
                {editingId === row.id ? (
                  /* Inline edit mode */
                  <div className="space-y-2">
                    <input
                      className={inputCls}
                      value={editDraft.text ?? row.text}
                      onChange={e => setEditDraft(d => ({ ...d, text: e.target.value }))}
                      placeholder="Message text"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className={inputCls}
                        value={editDraft.cta ?? row.cta ?? ""}
                        onChange={e => setEditDraft(d => ({ ...d, cta: e.target.value }))}
                        placeholder="CTA label (e.g. Shop now)"
                      />
                      <input
                        className={inputCls}
                        value={editDraft.link ?? row.link ?? ""}
                        onChange={e => setEditDraft(d => ({ ...d, link: e.target.value }))}
                        placeholder="Link URL"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditSave(row.id)}
                        className="px-3 py-1 text-xs rounded text-white"
                        style={{ backgroundColor: "#D4AF37" }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex items-center gap-3">
                    {/* Order number */}
                    <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}</span>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{row.text}</p>
                      {row.cta && (
                        <p className="text-xs text-gray-400 truncate">
                          CTA: <span className="text-[#D4AF37] font-medium">{row.cta}</span>
                          {row.link && <span className="ml-1 text-gray-400">→ {row.link}</span>}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Active toggle */}
                      <button
                        type="button"
                        disabled={togglingIds.has(row.id)}
                        onClick={() => handleToggle(row)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${row.isActive ? "bg-[#D4AF37]" : "bg-gray-300"}`}
                        title={row.isActive ? "Active — click to hide" : "Hidden — click to show"}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${row.isActive ? "translate-x-4" : "translate-x-1"}`}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => { setEditingId(row.id); setEditDraft({}); }}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={deletingIds.has(row.id)}
                        onClick={() => handleDelete(row.id)}
                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors"
                      >
                        {deletingIds.has(row.id) ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      {/* ── Add new message ───────────────────────────────────────────────── */}
      <div className="border border-dashed border-gray-300 rounded p-4 space-y-3">
        <p className="text-sm font-medium">Add New Message</p>

        <div>
          <label className="block text-xs font-medium mb-1">Message Text <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="e.g. Free delivery on orders over £50"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">CTA Label <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={newCta}
              onChange={e => setNewCta(e.target.value)}
              placeholder="e.g. Shop now"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Link URL</label>
            <input
              type="text"
              value={newLink}
              onChange={e => setNewLink(e.target.value)}
              placeholder="/pharmacy"
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={adding}
          onClick={handleAdd}
          className="px-5 py-2 rounded-sm text-sm font-medium text-white disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "#D4AF37" }}
          onMouseEnter={e => { if (!adding) (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e"; }}
          onMouseLeave={e => { if (!adding) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"; }}
        >
          {adding ? "Adding…" : "Add Message"}
        </button>
      </div>

    </div>
  );
}
