import { useState } from "react"
import JobCard from "../components/JobCard"

const jobsData = [
  { id: 1, title: "Frontend Developer", company: "Google", location: "Bangalore", salary: "12-18 LPA", type: "Full Time", skills: ["React", "JavaScript", "CSS"] },
  { id: 2, title: "Backend Developer", company: "Amazon", location: "Hyderabad", salary: "15-22 LPA", type: "Full Time", skills: ["Node.js", "MongoDB", "Express"] },
  { id: 3, title: "Full Stack Developer", company: "Flipkart", location: "Remote", salary: "10-16 LPA", type: "Remote", skills: ["React", "Node.js", "MongoDB"] },
  { id: 4, title: "Python Developer", company: "Microsoft", location: "Pune", salary: "14-20 LPA", type: "Full Time", skills: ["Python", "Flask", "SQL"] },
  { id: 5, title: "React Developer", company: "Zomato", location: "Remote", salary: "8-14 LPA", type: "Remote", skills: ["React", "JavaScript", "Tailwind"] },
  { id: 6, title: "AI/ML Engineer", company: "Infosys", location: "Chennai", salary: "12-20 LPA", type: "Full Time", skills: ["Python", "TensorFlow", "AI"] },
]

const Jobs = () => {
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")

  const filtered = jobsData.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchLocation = locationFilter === "All" || job.location === locationFilter
    const matchType = typeFilter === "All" || job.type === typeFilter
    return matchSearch && matchLocation && matchType
  })

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Browse Jobs</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <input
          type="text"
          placeholder="Search by title, company or skill..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:outline-none focus:border-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
        >
          <option value="All">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Pune">Pune</option>
          <option value="Chennai">Chennai</option>
          <option value="Remote">Remote</option>
        </select>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Full Time">Full Time</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-gray-500 mb-4">{filtered.length} jobs found</p>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0
          ? filtered.map(job => <JobCard key={job.id} job={job} />)
          : <p className="text-gray-400 text-lg">No jobs found!</p>
        }
      </div>
    </div>
  )
}

export default Jobs