import { Mail, MailOpen, Trash2 } from "lucide-react";
import { adminMessages } from "@/lib/queries/admin";
import { AdminEmpty, AdminHeader, AdminPager } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/confirm";
import { deleteMessageAction, setMessageReadAction } from "@/lib/actions/profile";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminMessages({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p) || 1);
  const { items, total, pages } = await adminMessages(page);
  return (
    <>
      <AdminHeader title="Messages" description={`${total} message${total === 1 ? "" : "s"} from the contact form. Reply from your own email client.`} />
      {items.length === 0 ? (
        <AdminEmpty title="No messages yet" body="Messages sent through the public contact form appear here." />
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m._id} className={`rounded-2xl border p-5 ${m.read ? "border-line" : "border-signal/40 bg-signal/5"}`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {m.name}{" "}
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`} className="font-normal text-signal hover:underline">
                      {m.email}
                    </a>
                  </p>
                  {m.subject && <p className="text-sm">{m.subject}</p>}
                  <p className="text-xs text-fog">{formatDate(m.createdAt, { dateStyle: "medium", timeStyle: "short" } as Intl.DateTimeFormatOptions)}</p>
                </div>
                <div className="flex">
                  <ActionButton action={setMessageReadAction.bind(null, m._id, !m.read)} ariaLabel={m.read ? "Mark as unread" : "Mark as read"} title={m.read ? "Mark as unread" : "Mark as read"}>
                    {m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </ActionButton>
                  <ActionButton action={deleteMessageAction.bind(null, m._id)} ariaLabel="Delete message" confirm={{ title: "Delete this message?", body: `The message from ${m.name} will be permanently deleted.`, confirmLabel: "Delete", danger: true }}>
                    <Trash2 className="h-4 w-4" />
                  </ActionButton>
                </div>
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap text-frost/90">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
      <AdminPager page={page} pages={pages} base="/admin/messages" params={{}} />
    </>
  );
}
