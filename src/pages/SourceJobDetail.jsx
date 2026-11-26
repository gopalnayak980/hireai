import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import getSafeExternalUrl from '../utils/safeExternalUrl'
import formatSalary from '../utils/formatSalary'
import { getJobDetailPath, hasSavedJobSource } from '../utils/jobSource'
import { Button, Badge, Card, EmptyState } from '../components/ui'
import {
  HiOutlineArrowLeft,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBuildingOffice2,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineBriefcase,
  HiOutlineCurrencyRupee,
  HiOutlineMapPin,
  HiOutlineSparkles,
  HiOutlineUsers,
} from 'react-icons/hi2'

const cleanDescription = (value) => typeof value === 'string'
  ? value.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
  : ''

const SourceJobDetail = () => {
  const { source, id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const [recruiterJob, setRecruiterJob] = useState(null)
  const [loading, setLoading] = useState(source === 'recruiter')
  const [error, setError] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [savedStatusError, setSavedStatusError] = useState('')

  const routeJob = location.state?.job
  const adzunaJob = useMemo(() => (
    source === 'adzuna' && routeJob?.source === 'adzuna' && String(routeJob.id) === String(id)
      ? {
        id: String(routeJob.id),
        source: 'adzuna',
        title: typeof routeJob.title === 'string' ? routeJob.title : 'Untitled listing',
        company: typeof routeJob.company === 'string' ? routeJob.company : '',
        location: typeof routeJob.location === 'string' ? routeJob.location : '',
        salary: routeJob.salary,
        description: typeof routeJob.description === 'string' ? routeJob.description : '',
        url: typeof routeJob.url === 'string' ? routeJob.url : '',
        created: routeJob.created,
        skills: Array.isArray(routeJob.skills) ? routeJob.skills.filter((skill) => typeof skill === 'string') : [],
      }
      : null
  ), [source, id, routeJob])
  const job = source === 'adzuna' ? adzunaJob : source === 'recruiter' ? recruiterJob : null

  useEffect(() => {
    let isCurrent = true
    setError('')
    setRecruiterJob(null)

    if (source !== 'recruiter') {
      setLoading(false)
      if (source === 'adzuna' && !adzunaJob) {
        setError('Open this listing from live search to view its available details.')
      } else if (source !== 'adzuna') {
        setError('This job source is not recognized.')
      }
      return () => { isCurrent = false }
    }

    setLoading(true)
    API.get(`/jobs/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!isCurrent) return
        const data = response.data
        const responseId = data?._id || data?.id
        if (!data || typeof data !== 'object' || String(responseId) !== String(id)) {
          setError('This recruiter listing could not be found.')
          return
        }

        setRecruiterJob({
          id: String(responseId),
          source: 'recruiter',
          title: typeof data.title === 'string' ? data.title : 'Untitled listing',
          company: typeof data.company === 'string' ? data.company : '',
          location: typeof data.location === 'string' ? data.location : '',
          salary: data.salary,
          type: typeof data.type === 'string' ? data.type : '',
          skills: Array.isArray(data.skills) ? data.skills.filter((skill) => typeof skill === 'string') : [],
          description: typeof data.description === 'string' ? data.description : '',
          experience: typeof data.experience === 'string' ? data.experience : '',
          openings: Number.isFinite(data.openings) ? data.openings : null,
        })
      })
      .catch((requestError) => {
        if (!isCurrent) return
        setError(requestError.response?.status === 404
          ? 'This recruiter listing is no longer available.'
          : 'Unable to load this recruiter listing. Please try again.')
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => { isCurrent = false }
  }, [source, id, routeJob, adzunaJob])

  useEffect(() => {
    let isCurrent = true
    setSavedStatusError('')
    if (!user || !job) {
      setIsSaved(false)
      return () => { isCurrent = false }
    }

    API.get('/saved')
      .then((response) => {
        if (isCurrent && Array.isArray(response.data)) {
          setIsSaved(hasSavedJobSource(response.data, job.id, source))
        }
      })
      .catch(() => {
        if (isCurrent) setSavedStatusError('Saved-job status is temporarily unavailable.')
      })

    return () => { isCurrent = false }
  }, [user, job, source])

  const handleToggleSave = async () => {
    if (isSaving || !job) return
    if (!user) {
      setFeedback('Please log in to save this job.')
      return
    }

    setIsSaving(true)
    try {
      if (isSaved) {
        await API.delete(`/saved/${encodeURIComponent(String(job.id))}`)
        setIsSaved(false)
        setFeedback('Job removed from saved jobs.')
      } else {
        await API.post('/saved', {
          jobId: job.id,
          source,
          title: job.title,
          company: job.company || 'Company not listed',
          location: job.location,
          salary: typeof job.salary === 'string' ? job.salary : '',
          url: job.url || getJobDetailPath(source, job.id),
        })
        setIsSaved(true)
        setFeedback('Job saved to your dashboard.')
      }
    } catch (requestError) {
      if (requestError.response?.data?.message === 'Job already saved!') {
        try {
          const savedResponse = await API.get('/saved')
          if (hasSavedJobSource(savedResponse.data, job.id, source)) {
            setIsSaved(true)
            setFeedback('Job is already saved.')
          } else {
            setFeedback('A saved listing from another source uses this ID. Remove it from your dashboard before saving this listing.')
          }
        } catch {
          setFeedback('Unable to verify the existing saved job. Please try again.')
        }
      } else {
        setFeedback('Could not update saved job. Please try again.')
      }
    } finally {
      setIsSaving(false)
      window.setTimeout(() => setFeedback(''), 3000)
    }
  }

  const returnPath = source === 'sample' ? '/sample-jobs' : '/jobs'
  const applicationUrl = getSafeExternalUrl(job?.url)
  const description = cleanDescription(job?.description)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <Card padding="lg" className="text-center" role="status" aria-live="polite">
            <p className="text-sm font-medium text-slate-600">Loading recruiter listing…</p>
          </Card>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-xl mx-auto px-4">
          <EmptyState
            title={source === 'adzuna' ? 'Listing details unavailable' : 'Job Listing Not Found'}
            description={error || 'This job listing may have been removed.'}
            action={
              <Button as={Link} to={returnPath} variant="primary" size="md">
                {source === 'adzuna' ? 'Return to Live Search' : 'Browse Jobs'}
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={returnPath} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to {source === 'adzuna' ? 'live jobs' : 'jobs'}</span>
          </Link>
        </div>

        {feedback && <p role="status" className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">{feedback}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Card padding="lg" className="border-slate-200 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                    {(job.company || 'Job').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 break-words">{job.title}</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-indigo-600">
                      <HiOutlineBuildingOffice2 className="w-4 h-4 text-slate-400" />
                      <span>{job.company || 'Company not listed'}</span>
                      {job.location && <><span className="text-slate-300">•</span><span className="text-slate-500 font-normal">{job.location}</span></>}
                    </p>
                  </div>
                </div>
                <Badge variant={source === 'adzuna' ? 'success' : 'primary'} size="md" dot>
                  {source === 'adzuna' ? 'Adzuna listing' : 'Recruiter listing'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Location</span>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <HiOutlineMapPin className="w-4 h-4 text-slate-400" />{job.location || 'Not specified'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Salary</span>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <HiOutlineCurrencyRupee className="w-4 h-4 text-slate-400" />{formatSalary(job.salary, job.salary_min, job.salary_max)}
                  </p>
                </div>
                {job.type && <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Job type</span><p className="mt-1 text-sm font-bold text-slate-800">{job.type}</p></div>}
                {job.experience && <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Experience</span><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800"><HiOutlineBriefcase className="w-4 h-4 text-slate-400" />{job.experience}</p></div>}
                {Number.isFinite(job.openings) && <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Openings</span><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800"><HiOutlineUsers className="w-4 h-4 text-slate-400" />{job.openings}</p></div>}
              </div>
            </Card>

            <Card padding="lg" className="border-slate-200 shadow-card space-y-6">
              <div>
                <h2 className="mb-3 text-lg font-bold text-slate-900">About the Role</h2>
                <p className="text-sm leading-relaxed text-slate-600">{description || 'A detailed description was not provided for this listing.'}</p>
              </div>
              {job.skills.length > 0 && (
                <div>
                  <h2 className="mb-3 text-lg font-bold text-slate-900">Skills</h2>
                  <div className="flex flex-wrap gap-2">{job.skills.map((skill) => <Badge key={skill} variant="primary" size="md">{skill}</Badge>)}</div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card padding="lg" className="border-slate-200 shadow-card">
              <h2 className="mb-2 text-base font-bold text-slate-900">Job actions</h2>
              {applicationUrl ? (
                <Button as="a" href={applicationUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="lg" className="w-full" rightIcon={<HiOutlineArrowTopRightOnSquare className="w-4 h-4" />}>
                  Open application site
                </Button>
              ) : source === 'adzuna' ? (
                <p className="text-sm text-slate-500">An external application link is not available for this listing.</p>
              ) : (
                <p className="text-sm text-slate-500">Application instructions are not available for this listing.</p>
              )}

              <Button variant="secondary" size="md" className="mt-3 w-full" isLoading={isSaving} onClick={handleToggleSave} leftIcon={isSaved ? <HiBookmark className="w-4 h-4 text-amber-500" /> : <HiOutlineBookmark className="w-4 h-4" />}>
                {isSaved ? 'Saved in Dashboard' : 'Save Job'}
              </Button>
              <Button as={Link} to="/applications" state={{ newApplication: { id: String(job.id), source, title: job.title, company: job.company, location: job.location, url: applicationUrl || '' } }} variant="ghost" size="md" className="mt-2 w-full">
                Track application
              </Button>
              {savedStatusError && <p role="status" className="mt-3 text-xs text-amber-700">{savedStatusError}</p>}

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Button as={Link} to="/ai-match" variant="ai" size="sm" className="w-full" leftIcon={<HiOutlineSparkles className="w-4 h-4" />}>
                  Run AI Match
                </Button>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                Listing source: <span className="font-semibold text-slate-700">{source === 'adzuna' ? 'Adzuna' : 'HireAI recruiter listings'}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourceJobDetail
