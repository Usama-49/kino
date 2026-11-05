import Videos from "./components/Videos";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Explore Feed</h1>
        <p className="text-sm text-zinc-400">Watch recent community media</p>
      </div>

      <Videos />
    </main>
  );
}
