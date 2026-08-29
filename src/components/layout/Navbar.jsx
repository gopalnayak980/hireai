import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Badge } from '../ui'
import {
  HiOutlineBriefcase,
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSquares2X2,
  HiOutlineBookmark,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineChevronDown,
} from 'react-icons/hi2'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setIsUserDropdownOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Navigation link configuration
  const navLinks = [
    {
      label: 'Jobs',
      to: '/jobs',
      icon: <HiOutlineBriefcase className="w-4 h-4" />,
    },
    {
      label: 'Live Jobs',
      to: '/real-jobs',
      icon: <HiOutlineMagnifyingGlass className="w-4 h-4" />,
    },
    {
      label: 'AI Match',
      to: '/ai-match',
      icon: <HiOutlineSparkles className="w-4 h-4 text-violet-500" />,
      badge: 'AI',
    },
    {
      label: 'Interview Prep',
      to: '/interview-prep',
      icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" />,
    },
  ]

  // Add dashboard link if authenticated
  if (user) {
    navLinks.push({
      label: 'Dashboard',
      to: '/dashboard',
      icon: <HiOutlineSquares2X2 className="w-4 h-4" />,
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg py-1 px-1.5"
            aria-label="HireAI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-200">
              <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Hire<span className="text-gradient-ai">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                Career Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }
                `}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-violet-100 text-violet-700 leading-none">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-subtle"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium capitalize">
                      {user.role || 'Member'}
                    </span>
                  </div>
                  <HiOutlineChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180 text-slate-600' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-card-hover py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <HiOutlineSquares2X2 className="w-4 h-4 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <HiOutlineBookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Jobs</span>
                      </Link>
                      <Link
                        to="/ai-match"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <HiOutlineSparkles className="w-4 h-4 text-violet-500" />
                        <span>AI Resume Match</span>
                      </Link>
                      <Link
                        to="/interview-prep"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-slate-400" />
                        <span>Interview Prep</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                {getInitials(user.name)}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <HiOutlineXMark className="w-6 h-6" />
              ) : (
                <HiOutlineBars3 className="w-6 h-6" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown / Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top duration-200 shadow-lg">
          {/* User quick status in mobile */}
          {user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Badge variant="primary" size="sm">
                {user.role === 'jobseeker' ? 'Job Seeker' : 'Recruiter'}
              </Badge>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-violet-100 text-violet-700 leading-none">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleLogout}
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<HiOutlineArrowRightOnRectangle className="w-4 h-4 text-rose-500" />}
              >
                Sign Out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="w-full">
                  <Button variant="secondary" size="md" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
