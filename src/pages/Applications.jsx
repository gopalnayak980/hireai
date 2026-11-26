import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'
import getSafeExternalUrl from '../utils/safeExternalUrl'
import { Button, Card, EmptyState } from '../components/ui'

const STATUSES = ['Interested', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn']
const SOURCES = ['adzuna', 'recruiter', 'sample']

const todayInputValue = () => {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const dateInputValue = (value) => {
  if (!value) return todayInputValue()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return todayInputValue()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString()
}

const toDatePayload = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date.toISOString()
}

const emptyForm = () => ({
  title: '',
  company: '',
  location: '',
  jobUrl: '',
  source: 'manual',
  jobId: '',
  applicationDate: todayInputValue(),
  status: 'Interested',
  notes: '',
})

const formFromJob = (job) => {
  const source = SOURCES.includes(job?.source) ? job.source : 'manual'
  const jobId = job?.jobId ?? job?.id ?? job?._id
  return {
    ...emptyForm(),
    title: typeof job?.title === 'string' ? job.title : '',
    company: typeof job?.company === 'string' ? job.company : '',
    location: typeof job?.location === 'string' ? job.location : '',
    jobUrl: getSafeExternalUrl(job?.jobUrl) || getSafeExternalUrl(job?.url) || '',
    source: source === 'manual' ? 'manual' : source,
    jobId: source === 'manual' || jobId === undefined || jobId === null ? '' : String(jobId),
  }
}

const Applications = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [counts, setCounts] = useState(Object.fromEntries(STATUSES.map((status) => [status, 0])))
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState({})
  const [pendingDeleteId, setPendingDeleteId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const fetchVersion = useRef(0)

  const fetchApplications = useCallback(async () => {
    const requestId = ++fetchVersion.current
    setLoading(true)
    setError('')
    try {
      const response = await API.get('/applications', {
        params: {
          page,
          ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      })
      if (requestId !== fetchVersion.current) return
      if (!Array.isArray(response.data?.applications) || !response.data?.counts) {
        throw new Error('Unexpected application response')
      }
      setApplications(response.data.applications)
      setCounts(response.data.counts)
      setTotal(Number.isFinite(response.data.total) ? response.data.total : response.data.applications.length)
      setHasMore(response.data.hasMore === true)
    } catch {
      if (requestId === fetchVersion.current) setError('Unable to load your application tracker. Please try again.')
    } finally {
      if (requestId === fetchVersion.current) setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return undefined
    }
    const timer = setTimeout(() => void fetchApplications(), search.trim() ? 250 : 0)
    return () => {
      clearTimeout(timer)
      fetchVersion.current += 1
    }
  }, [user, fetchApplications, search])

  useEffect(() => {
    if (!user || !location.state?.newApplication) return
    setForm(formFromJob(location.state.newApplication))
    setShowForm(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [user, location.key, location.pathname, location.state, navigate])

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applications.filter((application) => (
      (statusFilter === 'All' || application.status === statusFilter) &&
      (!query || `${application.title} ${application.company}`.toLowerCase().includes(query))
    ))
  }, [applications, search, statusFilter])

  const updateForm = (setter, field, value) => setter((current) => ({ ...current, [field]: value }))

  const handleCreate = async (event) => {
    event.preventDefault()
    if (saving) return
    if (!form.title.trim() || !form.company.trim()) {
      setFeedback('Job title and company are required.')
      return
    }
    if (form.jobUrl && !getSafeExternalUrl(form.jobUrl)) {
      setFeedback('Enter a valid HTTP or HTTPS job URL.')
      return
    }
    if (form.source !== 'manual' && !form.jobId.trim()) {
      setFeedback('This listing is missing its source job ID. You can track it as a manual application instead.')
      return
    }
    const applicationDate = toDatePayload(form.applicationDate)
    if (!applicationDate) {
      setFeedback('Enter a valid application date.')
      return
    }

    setSaving(true)
    setFeedback('')
    try {
      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        jobUrl: form.jobUrl.trim(),
        source: form.source,
        applicationDate,
        status: form.status,
        notes: form.notes.trim(),
        ...(form.source !== 'manual' ? { jobId: form.jobId.trim() } : {}),
      }
      const response = await API.post('/applications', payload)
      setApplications((current) => [response.data, ...current])
      setCounts((current) => ({ ...current, [response.data.status]: (current[response.data.status] || 0) + 1 }))
      setTotal((current) => current + 1)
      setPage(1)
      setForm(emptyForm())
      setShowForm(false)
      setFeedback('Application added to your tracker.')
    } catch (requestError) {
      setFeedback(requestError.response?.status === 409
        ? 'This job is already in your application tracker.'
        : requestError.response?.status === 400
          ? requestError.response.data?.message || 'Check the application details and try again.'
          : 'Unable to add the application. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const beginEdit = (application) => {
    setEditingId(String(application._id))
    setEditForm({
      title: application.title || '',
      company: application.company || '',
      location: application.location || '',
      jobUrl: application.jobUrl || '',
      applicationDate: dateInputValue(application.applicationDate),
      status: application.status,
      notes: application.notes || '',
    })
    setPendingDeleteId('')
  }

  const saveEdit = async (application) => {
    if (!editForm.title.trim() || !editForm.company.trim()) {
      setFeedback('Job title and company are required.')
      return
    }
    if (editForm.jobUrl && !getSafeExternalUrl(editForm.jobUrl)) {
      setFeedback('Enter a valid HTTP or HTTPS job URL.')
      return
    }
    const applicationDate = toDatePayload(editForm.applicationDate)
    if (!applicationDate) {
      setFeedback('Enter a valid application date.')
      return
    }
    try {
      const response = await API.patch(`/applications/${encodeURIComponent(application._id)}`, {
        ...editForm,
        applicationDate,
      })
      setApplications((current) => current.map((item) => item._id === application._id ? response.data : item))
      if (application.status !== response.data.status) {
        setCounts((current) => ({
          ...current,
          [application.status]: Math.max(0, (current[application.status] || 0) - 1),
          [response.data.status]: (current[response.data.status] || 0) + 1,
        }))
      }
      setEditingId('')
      setFeedback('Application updated.')
    } catch (requestError) {
      setFeedback(requestError.response?.status === 400
        ? requestError.response.data?.message || 'Check the application details and try again.'
        : 'Unable to update the application. Please try again.')
    }
  }

  const deleteApplication = async (application) => {
    setDeletingId(String(application._id))
    try {
      await API.delete(`/applications/${encodeURIComponent(application._id)}`)
      setApplications((current) => current.filter((item) => item._id !== application._id))
      setCounts((current) => ({ ...current, [application.status]: Math.max(0, (current[application.status] || 0) - 1) }))
      setTotal((current) => Math.max(0, current - 1))
      if (applications.length === 1 && page > 1) setPage((current) => current - 1)
      setPendingDeleteId('')
      setFeedback('Application deleted.')
    } catch {
      setFeedback('Unable to delete the application. Please try again.')
    } finally {
      setDeletingId('')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-md mx-auto px-4">
          <Card padding="lg" className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to track applications</h1>
            <p className="text-sm text-slate-600 mb-6">Your application tracker is private to your account.</p>
            <div className="flex flex-col gap-2">
              <Button as={Link} to="/login" state={{ from: '/applications', newApplication: location.state?.newApplication }} className="w-full">Sign in</Button>
              <Button as={Link} to="/register" state={{ from: '/applications', newApplication: location.state?.newApplication }} variant="secondary" className="w-full">Create account</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Career workspace</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Application Tracker</h1>
            <p className="mt-1 text-sm text-slate-600">Keep your job search progress, notes, and next steps together.</p>
          </div>
          <Button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : 'Add application'}</Button>
        </div>

        {feedback && <p role="status" aria-live="polite" className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{feedback}</p>}

        {showForm && (
          <Card padding="lg" className="mb-7 border-slate-200 shadow-card">
            <h2 className="mb-4 text-base font-bold text-slate-900">Add an application</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Job title *
                <input required maxLength={200} value={form.title} onChange={(event) => updateForm(setForm, 'title', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Company *
                <input required maxLength={200} value={form.company} onChange={(event) => updateForm(setForm, 'company', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Location
                <input maxLength={200} value={form.location} onChange={(event) => updateForm(setForm, 'location', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Job URL
                <input type="url" maxLength={2048} value={form.jobUrl} onChange={(event) => updateForm(setForm, 'jobUrl', event.target.value)} placeholder="https://..." className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Application date
                <input type="date" required value={form.applicationDate} onChange={(event) => updateForm(setForm, 'applicationDate', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Status
                <select value={form.status} onChange={(event) => updateForm(setForm, 'status', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">
                  {STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Notes
                <textarea maxLength={4000} rows={3} value={form.notes} onChange={(event) => updateForm(setForm, 'notes', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" />
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" isLoading={saving}>Save application</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        <section aria-label="Application totals" className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card padding="sm"><span className="text-xs font-semibold text-slate-500">Total applications</span><p className="mt-1 text-2xl font-bold text-slate-900">{loading ? '—' : total}</p></Card>
          {STATUSES.map((status) => <Card key={status} padding="sm"><span className="text-[11px] font-semibold text-slate-500">{status}</span><p className="mt-1 text-xl font-bold text-indigo-700">{loading ? '—' : counts[status] || 0}</p></Card>)}
        </section>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <label className="sr-only" htmlFor="application-search">Search applications by job title or company</label>
          <input id="application-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search job title or company" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          <label className="sr-only" htmlFor="application-status-filter">Filter by application status</label>
          <select id="application-status-filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <option>All</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>

        {error && <Card padding="lg" className="mb-5 border-rose-200 bg-rose-50"><div className="flex items-center justify-between gap-3"><p role="alert" className="text-sm text-rose-800">{error}</p><Button variant="secondary" size="sm" onClick={() => void fetchApplications()}>Retry</Button></div></Card>}

        {loading ? (
          <Card padding="lg" role="status" aria-live="polite"><p className="text-sm text-slate-600">Loading your applications…</p></Card>
        ) : error ? null : applications.length === 0 && total === 0 && !search.trim() && statusFilter === 'All' ? (
          <EmptyState title="No applications tracked yet" description="Add an application manually or start from a saved job or listing detail page." action={<Button onClick={() => setShowForm(true)}>Add your first application</Button>} />
        ) : applications.length === 0 || visibleApplications.length === 0 ? (
          <EmptyState title="No applications match these filters" description="Try another status or search term." action={<Button variant="secondary" onClick={() => { setSearch(''); setStatusFilter('All'); setPage(1) }}>Clear filters</Button>} />
        ) : (
          <section aria-label="Recent applications" className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Recent applications</h2>
            {visibleApplications.map((application) => {
              const externalUrl = getSafeExternalUrl(application.jobUrl)
              const isEditing = editingId === application._id
              return (
                <Card key={application._id} padding="lg" className="border-slate-200 shadow-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{application.title}</h3>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">{application.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{application.company}{application.location ? ` · ${application.location}` : ''}</p>
                      <p className="mt-1 text-xs text-slate-500">Application date: {formatDate(application.applicationDate)} · Source: {application.source}</p>
                      {application.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{application.notes}</p>}
                      {externalUrl && <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-indigo-700 underline">Open job listing</a>}
                      {Array.isArray(application.statusHistory) && application.statusHistory.length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-600">Status history ({application.statusHistory.length})</summary>
                          <ol className="mt-2 space-y-1 border-l border-indigo-200 pl-3 text-xs text-slate-600">
                            {application.statusHistory.map((entry, index) => <li key={`${entry.changedAt}-${index}`}>{entry.status} · {formatDate(entry.changedAt)}</li>)}
                          </ol>
                        </details>
                      )}
                    </div>
                    {!isEditing && <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => beginEdit(application)}>Edit</Button>
                      {pendingDeleteId === application._id ? <><Button variant="danger" size="sm" isLoading={deletingId === application._id} onClick={() => void deleteApplication(application)}>Confirm delete</Button><Button variant="secondary" size="sm" onClick={() => setPendingDeleteId('')}>Cancel</Button></> : <Button variant="ghost" size="sm" className="text-rose-700" onClick={() => { setPendingDeleteId(application._id); setEditingId('') }}>Delete</Button>}
                    </div>}
                  </div>

                  {isEditing && (
                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      {['title', 'company', 'location'].map((field) => <label key={field} className="text-xs font-semibold capitalize text-slate-700">{field}{field !== 'location' && ' *'}<input value={editForm[field]} maxLength={200} onChange={(event) => updateForm(setEditForm, field, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>)}
                      <label className="text-xs font-semibold text-slate-700">Job URL<input type="url" value={editForm.jobUrl} maxLength={2048} onChange={(event) => updateForm(setEditForm, 'jobUrl', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      <label className="text-xs font-semibold text-slate-700">Application date<input type="date" value={editForm.applicationDate} onChange={(event) => updateForm(setEditForm, 'applicationDate', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      <label className="text-xs font-semibold text-slate-700">Status<select value={editForm.status} onChange={(event) => updateForm(setEditForm, 'status', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal">{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
                      <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Notes<textarea maxLength={4000} rows={3} value={editForm.notes} onChange={(event) => updateForm(setEditForm, 'notes', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                      <div className="flex gap-2 sm:col-span-2"><Button size="sm" onClick={() => void saveEdit(application)}>Save changes</Button><Button size="sm" variant="secondary" onClick={() => setEditingId('')}>Cancel</Button></div>
                    </div>
                  )}
                </Card>
              )
            })}
          </section>
        )}
        {!loading && !error && applications.length > 0 && (
          <nav aria-label="Application pages" className="mt-6 flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <span className="text-xs text-slate-600">Page {page}</span>
            <Button variant="secondary" size="sm" disabled={!hasMore} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </nav>
        )}
      </div>
    </main>
  )
}

export default Applications
