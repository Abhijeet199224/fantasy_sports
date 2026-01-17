// frontend/app/layout.js
import './globals.css'

export const metadata = {
  title: 'Fantasy Cricket League',
  description: 'Play fantasy cricket with friends',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold">Fantasy Cricket</a>
            <div className="flex gap-4">
              <a href="/matches" className="hover:underline">Matches</a>
              <a href="/contests" className="hover:underline">Contests</a>
              <a href="/my-teams" className="hover:underline">My Teams</a>
              <a href="/leaderboard" className="hover:underline">Leaderboard</a>
              <a href="/profile" className="hover:underline">Profile</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
