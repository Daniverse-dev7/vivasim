'use client';
export default function ErrorScreen({ reset }: { reset: () => void }) { return <main className="document"><h1>Let’s try that again.</h1><p>The screen could not load. Your saved draft stays in this browser.</p><button onClick={reset}>Retry</button><a href="/">Return to VivaSim</a></main>; }
