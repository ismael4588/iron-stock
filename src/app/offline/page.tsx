export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl">📦</p>
      <h1 className="text-xl font-bold">אין חיבור לאינטרנט</h1>
      <p className="text-muted max-w-sm">
        האפליקציה תעבוד שוב כשהחיבור יחזור. נתונים שמורים מקומית יוצגו כשאפשר.
      </p>
    </main>
  );
}
