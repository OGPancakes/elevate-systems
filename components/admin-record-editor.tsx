import { deleteAdminRecord, updateAdminRecord } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function AdminRecordEditor({
  table,
  id,
  status,
  notes,
  statuses,
  returnTo
}: {
  table: "leads" | "inquiries" | "bookings" | "purchases";
  id: string;
  status: string;
  notes: string;
  statuses: string[];
  returnTo: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="font-semibold text-white">Follow-up</h2>
      <form action={updateAdminRecord} className="mt-4 space-y-4">
        <input name="table" type="hidden" value={table} />
        <input name="id" type="hidden" value={id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <label className="block space-y-2">
          <span className="text-sm text-white/55">Status</span>
          <select
            className="w-full rounded-md border border-white/10 bg-[#0b1120] px-3 py-3 text-sm text-white outline-none"
            defaultValue={status}
            name="status"
          >
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/55">Internal notes</span>
          <textarea
            className="min-h-36 w-full resize-y rounded-md border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white outline-none ring-sky-300/30 focus:ring-2"
            defaultValue={notes}
            name="notes"
            placeholder="Follow-up context, next steps, or account notes"
          />
        </label>
        <Button className="w-full" type="submit">Save changes</Button>
      </form>
      <form action={deleteAdminRecord} className="mt-3">
        <input name="table" type="hidden" value={table} />
        <input name="id" type="hidden" value={id} />
        <button className="w-full rounded-md border border-red-400/20 px-3 py-2.5 text-sm text-red-200 transition hover:bg-red-400/10">
          Delete record
        </button>
      </form>
    </section>
  );
}
