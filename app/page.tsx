"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Schedule from "./components/Schedule"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") return <div>Loading...</div>

  if (!session) return null

  return <Schedule />
}
