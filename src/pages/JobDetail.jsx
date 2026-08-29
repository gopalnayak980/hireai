import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import { Button, Badge, Card, EmptyState } from '../components/ui'
import {
  HiOutlineArrowLeft,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineCurrencyRupee,
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineCheck,
} from 'react-icons/hi2'

const jobsData = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Google',
    location: 'Bangalore',
    salary: '₹12 - ₹18 LPA',
    type: 'Full Time',
    skills: ['React', 'JavaScript', 'CSS', 'TypeScript', 'Tailwind CSS'],
    description:
      'We are looking for a skilled Frontend Developer to join our team at Google. You will be responsible for designing and implementing high-quality, scalable web applications used by millions globally. You will collaborate with UX designers, backend engineers, and product managers to deliver seamless interfaces.',
    experience: '0-2 years',
    openings: 5,
    responsibilities: [
      'Build modular, reusable, and accessible React UI components.',
      'Optimize web applications for maximum speed, responsiveness, and cross-browser scalability.',
      'Collaborate with product designers to implement pixel-perfect user experiences.',
      'Participate in code reviews, technical discussions, and automated UI testing.',
    ],
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Amazon',
    location: 'Hyderabad',
    salary: '₹15 - ₹22 LPA',
    type: 'Full Time',
    skills: ['Node.js', 'MongoDB', 'Express', 'AWS', 'Docker'],
    description:
      'Amazon is hiring Backend Developers to build resilient microservices, high-throughput data pipelines, and RESTful/GraphQL APIs for our e-commerce and cloud infrastructure.',
    experience: '1-3 years',
    openings: 3,
    responsibilities: [
      'Design, implement, and maintain scalable microservices using Node.js and cloud primitives.',
      'Implement data storage and caching solutions using MongoDB, Redis, and DynamoDB.',
      'Ensure high system reliability, low latency, and comprehensive automated test coverage.',
    ],
  },
  {
    id: 3,
    title: 'Full Stack Developer',
    company: 'Flipkart',
    location: 'Remote',
    salary: '₹10 - ₹16 LPA',
    type: 'Remote',
    skills: ['React', 'Node.js', 'MongoDB', 'GraphQL', 'Redux'],
    description:
      'Join Flipkart as a Full Stack Developer and work on cutting-edge e-commerce solutions serving millions of customers. You will contribute to both frontend user journeys and backend services.',
    experience: '0-2 years',
    openings: 8,
    responsibilities: [
      'Develop end-to-end features spanning React web clients and Node.js microservices.',
      'Design RESTful and GraphQL APIs with security and performance best practices.',
      'Troubleshoot and optimize application performance across client and server layers.',
    ],
  },
  {
    id: 4,
    title: 'Python Developer',
    company: 'Microsoft',
    location: 'Pune',
    salary: '₹14 - ₹20 LPA',
    type: 'Full Time',
    skills: ['Python', 'Flask', 'SQL', 'FastAPI', 'Azure'],
    description:
      'Microsoft is looking for Python Developers to build enterprise-grade automation tools, cloud backend services, and scalable data processing microservices.',
    experience: '1-2 years',
    openings: 4,
    responsibilities: [
      'Build robust REST services using Python (Flask / FastAPI) and relational databases.',
      'Integrate with Azure cloud services, message queues, and enterprise authentication.',
      'Write comprehensive unit and integration tests to ensure software reliability.',
    ],
  },
  {
    id: 5,
    title: 'React Developer',
    company: 'Zomato',
    location: 'Remote',
    salary: '₹8 - ₹14 LPA',
    type: 'Remote',
    skills: ['React', 'JavaScript', 'Tailwind', 'Next.js', 'Redux'],
    description:
      'Zomato is hiring React Developers to enhance our consumer food ordering and merchant management platforms with fluid micro-interactions and fast page loading.',
    experience: '0-1 years',
    openings: 6,
    responsibilities: [
      'Build modern, reactive user interfaces with React and Tailwind CSS.',
      'Optimize web performance, Core Web Vitals, and mobile viewport responsiveness.',
      'Integrate real-time ordering and tracking WebSockets into the web app.',
    ],
  },
  {
    id: 6,
    title: 'AI/ML Engineer',
    company: 'Infosys',
    location: 'Chennai',
    salary: '₹12 - ₹20 LPA',
    type: 'Full Time',
    skills: ['Python', 'TensorFlow', 'AI', 'PyTorch', 'LLMs'],
    description:
      'Infosys is looking for AI/ML Engineers to develop intelligent solutions, predictive models, and LLM automation workflows for enterprise clients worldwide.',
    experience: '1-3 years',
    openings: 2,
    responsibilities: [
      'Develop, train, and evaluate machine learning models and NLP pipelines.',
      'Deploy models into production microservices with monitoring and versioning.',
      'Collaborate with domain specialists to extract actionable insights from client data.',
    ],
  },
]

const JobDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [applied, setApplied] = useState(false)
  const [feedback, setFeedback] = useState('')

  const job = jobsData.find((j) => String(j.id) === String(id))

  // Fetch saved status on mount
  useEffect(() => {
    if (user && job) {
      API.get('/saved')
        .then((res) => {
          if (Array.isArray(res.data)) {
            const hasSaved = res.data.some((s) => String(s.jobId) === String(job.id))
            setIsSaved(hasSaved)
          }
        })
        .catch(() => {})
    }
  }, [user, job])

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-xl mx-auto px-4">
          <EmptyState
            title="Job Listing Not Found"
            description="The job position you are looking for does not exist or has expired."
            action={
              <Link to="/jobs">
                <Button variant="primary" size="md">
                  Browse All Jobs
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const handleToggleSave = async () => {
    if (!user) {
      setFeedback('Please log in to bookmark this job!')
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    setIsSaving(true)
    try {
      if (isSaved) {
        await API.delete(`/saved/${job.id}`)
        setIsSaved(false)
        setFeedback('Job removed from saved!')
      } else {
        await API.post('/saved', {
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          url: `/jobs/${job.id}`,
        })
        setIsSaved(true)
        setFeedback('Job saved to your dashboard!')
      }
    } catch (err) {
      if (err.response?.data?.message === 'Job already saved!') {
        setIsSaved(true)
      } else {
        setFeedback('Could not update saved job.')
      }
    } finally {
      setIsSaving(false)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const handleApply = () => {
    setApplied(true)
    setFeedback('Application submitted successfully!')
    setTimeout(() => setFeedback(''), 4000)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to all jobs</span>
          </Link>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <span>{feedback}</span>
            <button onClick={() => setFeedback('')} className="text-indigo-400 hover:text-indigo-600">
              ✕
            </button>
          </div>
        )}

        {/* Two-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Job Information Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <Card padding="lg" className="border-slate-200 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {job.title}
                    </h1>
                    <p className="text-sm font-semibold text-indigo-600 mt-1 flex items-center gap-1.5">
                      <HiOutlineBuildingOffice2 className="w-4 h-4 text-slate-400" />
                      <span>{job.company}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-normal">{job.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={job.type === 'Remote' ? 'success' : 'primary'} size="md" dot>
                    {job.type}
                  </Badge>
                </div>
              </div>

              {/* Key Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Location
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                    <HiOutlineMapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Salary Range
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                    <HiOutlineCurrencyRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.salary}</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Experience
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                    <HiOutlineBriefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.experience}</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Open Seats
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
                    <HiOutlineUsers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.openings} Openings</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Description Card */}
            <Card padding="lg" className="border-slate-200 shadow-card space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">About the Role</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{job.description}</p>
              </div>

              {job.responsibilities && (
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <HiOutlineCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Required Competencies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="primary" size="md">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

          </div>

          {/* Sidebar Actions Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Quick Action Container */}
            <Card padding="lg" className="border-slate-200 shadow-card">
              <h3 className="text-base font-bold text-slate-900 mb-2">Apply for this position</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Submit your profile directly. Our AI will assess your resume fit and highlight your strengths.
              </p>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-btn-primary"
                  disabled={applied}
                  onClick={handleApply}
                >
                  {applied ? '✓ Applied Successfully' : 'Apply Now'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  isLoading={isSaving}
                  onClick={handleToggleSave}
                  leftIcon={
                    isSaved ? (
                      <HiBookmark className="w-4 h-4 text-amber-500" />
                    ) : (
                      <HiOutlineBookmark className="w-4 h-4" />
                    )
                  }
                >
                  {isSaved ? 'Saved in Dashboard' : 'Save Job'}
                </Button>
              </div>

              {/* AI Resume Match Prompt Box */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 via-violet-50/60 to-slate-50 border border-indigo-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <HiOutlineSparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold text-slate-800">
                    AI Resume Compatibility
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Analyze your existing resume against this role to identify matched keywords and skill gaps.
                </p>
                <Link to="/ai-match">
                  <Button variant="ai" size="sm" className="w-full">
                    Run AI Match
                  </Button>
                </Link>
              </div>

              {/* Job Metadata Listing */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Job ID</span>
                  <span className="font-semibold text-slate-700">#HA-{job.id}092</span>
                </div>
                <div className="flex justify-between">
                  <span>Listing Status</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified Recruiter</span>
                  <span className="font-semibold text-indigo-600">✓ Verified</span>
                </div>
              </div>
            </Card>

          </div>

        </div>

      </div>
    </div>
  )
}

export default JobDetail