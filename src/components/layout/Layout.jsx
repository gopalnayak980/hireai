import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * Global application Layout component
 * Wraps page contents between the sticky Navbar and Footer
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
