import React from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button } from './ui'
import {
  HiOutlineMapPin,
  HiOutlineCurrencyRupee,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2'

/**
 * Modern, reusable JobCard component for HireAI
 * Handles both curated internal jobs and live Adzuna marketplace jobs.
 */
const JobCard = ({
  job,
  isSaved = false,
  onToggleSave,
  isSaving = false,
  className = '',
}) => {
  if (!job) return null

  // Generate company initial / avatar gradient
  const getCompanyInitials = (name) => {
    if (!name || name === 'Unknown') return 'CO'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Format posted date if available
  const formatPostedDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) return 'Posted today'
      if (diffDays === 1) return 'Posted 1 day ago'
      if (diffDays < 30) return `Posted ${diffDays} days ago`
      return `Posted ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
    } catch {
      return null
    }
  }

  const isRemote = job.type === 'Remote' || (job.location && job.location.toLowerCase().includes('remote'))
  const postedText = formatPostedDate(job.created)

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200/80 shadow-card 
        hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 
        p-6 flex flex-col justify-between relative group
        ${className}
      `}
    >
      <div>
        {/* Top Header: Company Avatar + Title + Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Company Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-slate-100 border border-slate-200/70 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 shadow-subtle group-hover:border-indigo-200 transition-colors">
              {getCompanyInitials(job.company)}
            </div>

            {/* Title & Company */}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug truncate">
                {job.title}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5 truncate">
                <HiOutlineBuildingOffice2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{job.company || 'Confidential Company'}</span>
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              disabled={isSaving}
              aria-label={isSaved ? 'Remove from saved jobs' : 'Save this job'}
              className={`
                p-2 rounded-xl border transition-all duration-150 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                ${isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200/80 hover:text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }
              `}
            >
              {isSaved ? (
                <HiBookmark className="w-4 h-4 text-amber-500" />
              ) : (
                <HiOutlineBookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Metadata Badges & Details */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-3 mb-3.5">
          {job.location && (
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium text-slate-600">
              <HiOutlineMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[140px]">{job.location}</span>
            </span>
          )}

          {job.salary && (
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium text-slate-600">
              <HiOutlineCurrencyRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{job.salary}</span>
            </span>
          )}

          {isRemote && (
            <Badge variant="success" size="sm" dot>
              Remote
            </Badge>
          )}

          {job.type && job.type !== 'Remote' && (
            <Badge variant="info" size="sm">
              {job.type}
            </Badge>
          )}

          {job.matchScore && (
            <Badge variant="ai" size="sm">
              <HiOutlineSparkles className="w-3 h-3 mr-0.5" />
              {job.matchScore}% Match
            </Badge>
          )}
        </div>

        {/* Description Snippet */}
        {job.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-normal">
            {job.description.replace(/<[^>]*>?/gm, '')}
          </p>
        )}

        {/* Skills Tag Chips */}
        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-medium bg-indigo-50/70 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100/80"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[11px] font-medium text-slate-400 px-1.5 py-0.5">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          {postedText && (
            <>
              <HiOutlineClock className="w-3.5 h-3.5" />
              <span>{postedText}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Internal Job Detail Link */}
          {job.id && !job.url && (
            <Link to={`/jobs/${job.id}`}>
              <Button variant="secondary" size="sm">
                View Details
              </Button>
            </Link>
          )}

          {/* External Live Job Apply Link */}
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button
                variant="primary"
                size="sm"
                rightIcon={<HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />}
              >
                Apply Now
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobCard