import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import JobCard from '../components/JobCard'
import { Button, Badge, Input, Select, EmptyState } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineFunnel,
  HiOutlineXMark,
} from 'react-icons/hi2'

const defaultJobsData = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Google',
    location: 'Bangalore',
    salary: '₹12 - ₹18 LPA',
    type: 'Full Time',
    skills: ['React', 'JavaScript', 'CSS', 'TypeScript'],
    description: 'We are looking for a skilled Frontend Developer to join our team at Google. Build high-performance, accessible, and scalable web interfaces.',
    experience: '0-2 years',
    openings: 5,
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Amazon',
    location: 'Hyderabad',
    salary: '₹15 - ₹22 LPA',
    type: 'Full Time',
    skills: ['Node.js', 'MongoDB', 'Express', 'AWS'],
    description: 'Amazon is hiring Backend Developers to build scalable microservices and resilient APIs for our cloud infrastructure.',
    experience: '1-3 years',
    openings: 3,
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    company: 'Flipkart',
    location: 'Remote',
    salary: '₹10 - ₹16 LPA',
    type: 'Remote',
    skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    description: 'Join Flipkart as a Full Stack Developer and work on high-traffic e-commerce solutions serving millions of customers.',
    experience: '0-2 years',
    openings: 8,
  },
  {
    id: 4,
    title: 'Python Developer',
    company: 'Microsoft',
    location: 'Pune',
    salary: '₹14 - ₹20 LPA',
    type: 'Full Time',
    skills: ['Python', 'Flask', 'SQL', 'Azure'],
    description: 'Microsoft is looking for Python Developers to build enterprise-grade automation tools and cloud-backed microservices.',
    experience: '1-2 years',
    openings: 4,
  },
  {
    id: 5,
    title: 'React Developer',
    company: 'Zomato',
    location: 'Remote',
    salary: '₹8 - ₹14 LPA',
    type: 'Remote',
    skills: ['React', 'JavaScript', 'Tailwind', 'Redux'],
    description: 'Zomato is hiring React Developers to enhance customer experience, optimize page speeds, and build interactive UI components.',
    experience: '0-1 years',
    openings: 6,
  },
  {
    id: 6,
    title: 'AI/ML Engineer',
    company: 'Infosys',
    location: 'Chennai',
    salary: '₹12 - ₹20 LPA',
    type: 'Full Time',
    skills: ['Python', 'TensorFlow', 'AI', 'PyTorch'],
    description: 'Infosys is looking for AI/ML Engineers to develop intelligent solutions, LLM pipelines, and computer vision models.',
    experience: '1-3 years',
    openings: 2,
  },
]

const Jobs = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [savedJobIds, setSavedJobIds] = useState([])
  const [savingId, setSavingId] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  // Fetch saved jobs if user is authenticated
  useEffect(() => {
    if (user) {
      API.get('/saved')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setSavedJobIds(res.data.map((j) => String(j.jobId)))
          }
        })
        .catch(() => {})
    }
  }, [user])

  // Handle Save / Unsave Job
  const handleToggleSave = async (job) => {
    if (!user) {
      setFeedbackMessage('Please sign in to save jobs!')
      setTimeout(() => setFeedbackMessage(''), 3000)
      return
    }

    const strId = String(job.id)
    const isCurrentlySaved = savedJobIds.includes(strId)
    setSavingId(job.id)

    try {
      if (isCurrentlySaved) {
        await API.delete(`/saved/${job.id}`)
        setSavedJobIds((prev) => prev.filter((id) => id !== strId))
        setFeedbackMessage('Job removed from saved!')
      } else {
        await API.post('/saved', {
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          url: job.url || '',
        })
        setSavedJobIds((prev) => [...prev, strId])
        setFeedbackMessage('Job saved to your dashboard!')
      }
    } catch (err) {
      if (err.response?.data?.message === 'Job already saved!') {
        setSavedJobIds((prev) => [...prev, strId])
      } else {
        setFeedbackMessage('Action failed. Please try again.')
      }
    } finally {
      setSavingId(null)
      setTimeout(() => setFeedbackMessage(''), 3000)
    }
  }

  // Filter jobs logic
  const filtered = defaultJobsData.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    const matchLocation = locationFilter === 'All' || job.location === locationFilter
    const matchType = typeFilter === 'All' || job.type === typeFilter
    return matchSearch && matchLocation && matchType
  })

  const handleClearFilters = () => {
    setSearch('')
    setLocationFilter('All')
    setTypeFilter('All')
  }

  const hasActiveFilters = search || locationFilter !== 'All' || typeFilter !== 'All'

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">
                  Curated Catalog
                </Badge>
                <Link to="/real-jobs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Looking for live market jobs? <span className="underline">Search Live Feed →</span>
                </Link>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Find your next opportunity
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Search verified openings and discover roles tailored to your technical skills.
              </p>
            </div>

            <Link to="/ai-match">
              <Button
                variant="ai"
                size="md"
                leftIcon={<HiOutlineSparkles className="w-4 h-4" />}
              >
                Match with AI
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-medium flex items-center justify-between animate-in fade-in duration-200 shadow-sm">
            <span>{feedbackMessage}</span>
            <button
              onClick={() => setFeedbackMessage('')}
              className="text-indigo-400 hover:text-indigo-600 p-1"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            
            {/* Search Input */}
            <div className="sm:col-span-6 lg:col-span-6">
              <Input
                label="Search Keyword"
                placeholder="Job title, company, or skill (e.g. React)..."
                leftIcon={<HiOutlineMagnifyingGlass className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Location Select */}
            <div className="sm:col-span-3 lg:col-span-3">
              <Select
                label="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Locations' },
                  { value: 'Bangalore', label: 'Bangalore' },
                  { value: 'Hyderabad', label: 'Hyderabad' },
                  { value: 'Pune', label: 'Pune' },
                  { value: 'Chennai', label: 'Chennai' },
                  { value: 'Remote', label: 'Remote' },
                ]}
              />
            </div>

            {/* Job Type Select */}
            <div className="sm:col-span-3 lg:col-span-3">
              <Select
                label="Job Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Types' },
                  { value: 'Full Time', label: 'Full Time' },
                  { value: 'Remote', label: 'Remote' },
                ]}
              />
            </div>
          </div>

          {/* Quick Filter Tag Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <HiOutlineFunnel className="w-3.5 h-3.5" /> Popular:
            </span>
            {['React', 'Node.js', 'Python', 'Full Stack', 'Remote'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearch(search === tag ? '' : tag)}
                className={`
                  text-xs px-3 py-1 rounded-full font-medium transition-all
                  ${search === tag
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }
                `}
              >
                {tag}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto flex items-center gap-1"
              >
                <HiOutlineXMark className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-700">
            Showing <span className="text-indigo-600 font-bold">{filtered.length}</span> {filtered.length === 1 ? 'position' : 'positions'}
          </p>
        </div>

        {/* Job Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.includes(String(job.id))}
                isSaving={savingId === job.id}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No jobs matching your criteria"
            description="Try loosening your search keywords, selecting a different location, or clearing active filters."
            action={
              <Button variant="outline" size="md" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            }
          />
        )}

      </div>
    </div>
  )
}

export default Jobs