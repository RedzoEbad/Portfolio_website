import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl">That item doesn&apos;t exist</h1>
      <p className="mt-2 text-fog">It may have been deleted.</p>
      <Link href="/admin" className="mt-6 inline-block text-signal underline">
        Back to the dashboard
      </Link>
    </div>
  );
}
