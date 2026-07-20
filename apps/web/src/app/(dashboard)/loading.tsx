export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-6">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
