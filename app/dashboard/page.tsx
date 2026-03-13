import AuthGuard from '@/components/auth-guard'
import React from 'react'

export default function page() {
  return (
    <AuthGuard>
        <h1>Dashboard</h1>
    </AuthGuard>
  )
}
