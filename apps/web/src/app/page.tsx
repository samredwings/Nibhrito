"use client"

import { useEffect, useState } from 'react'

type Session = {
  id: string
  title: string
  mode: string
  status: string
  language: string
  updatedAt?: string
}

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/sessions`, { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`API returned ${response.status}`)
        return response.json() as Promise<{ data?: Session[] }>
      })
      .then((payload) => setSessions(payload.data ?? []))
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">Nibhrito</a>
        <span className="local-label">Private · local-first</span>
      </header>
      <section className="hero">
        <p className="eyebrow">YOUR STORIES, CONTINUED</p>
        <h1>Every story has a place to return to.</h1>
        <p className="intro">Your sessions and their continuity, collected in one private workspace.</p>
      </section>
      <section className="sessions" aria-labelledby="sessions-heading">
        <div className="section-heading">
          <div><p className="eyebrow">WORKSPACE</p><h2 id="sessions-heading">Recent sessions</h2></div>
          <span className="count">{sessions.length}</span>
        </div>
        {loading ? <p className="state">Loading sessions…</p> : null}
        {!loading && error ? <p className="state error">Could not load sessions: {error}</p> : null}
        {!loading && !error && sessions.length === 0 ? (
          <div className="empty"><h3>No sessions yet</h3><p>Create a session through the API to see it here.</p></div>
        ) : null}
        <ul className="session-list">
          {sessions.map((session) => (
            <li className="session-card" key={session.id}>
              <div><h3>{session.title}</h3><p>{session.mode} · {session.language}</p></div>
              <span className="status">{session.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <footer>Continuity belongs to you.</footer>
    </main>
  )
}
