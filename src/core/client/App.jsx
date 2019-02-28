import React from 'react'
import { Router } from '@reach/router'

import Home from './pages/Home'
import ThemeProvider from './components/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Home path="/" />
      </Router>
    </ThemeProvider>
  )
}
