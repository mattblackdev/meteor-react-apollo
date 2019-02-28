import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { createMuiTheme } from '@material-ui/core/styles'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import blue from '@material-ui/core/colors/blue'
import merge from 'lodash/merge'

const defaultTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: blue,
  },
  typography: {
    useNextVariants: true,
  },
})

export default function ThemeProvider({ children, theme = {} }) {
  const mergedTheme = merge(defaultTheme, theme)
  console.log('theme', mergedTheme)
  return (
    <MuiThemeProvider theme={mergedTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
