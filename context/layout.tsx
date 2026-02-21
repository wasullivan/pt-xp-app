import { TherapistProvider } from "../context/TherapistContext"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TherapistProvider>
          {children}
        </TherapistProvider>
      </body>
    </html>
  )
}
