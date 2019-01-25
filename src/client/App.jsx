import React from 'react'
import { Router } from '@reach/router'
import { useQuery } from 'react-apollo-hooks'

import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import CheckIn from './pages/CheckIn'
import Dashboard from './pages/Dashboard'
import ThemeProvider from './components/ThemeProvider'
import CurrentUser from './queries/CurrentUser'

export default function App() {
  let {
    data: { currentUser },
    loading,
    error,
  } = useQuery(CurrentUser, { suspend: false })
  console.log('App', { loading, error, currentUser })
  if (loading) return null

  return (
    <ThemeProvider>
      <Router>
        <Home path="/" currentUser={currentUser} />
        <Login path="/login" currentUser={currentUser} />
        <SignUp path="/onboarding" currentUser={currentUser} />
        <CheckIn path="/check-in" currentUser={currentUser} />
        <Dashboard path="/dashboard/*" currentUser={currentUser} />
      </Router>
    </ThemeProvider>
  )
}
