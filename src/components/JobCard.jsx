import { Link } from "react-router-dom"

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
          <p className="text-blue-600 font-medium">{job.company}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${job.type === "Remote" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
          {job.type}
        </span>
      </div>

      <div className="flex gap-4 text-gray-500 text-sm mb-4">
        <span>📍 {job.location}</span>
        <span>💰 {job.salary}</span>
      </div>

     <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}} className="mb-4">
  {job.skills.map(skill => (
    <span key={skill} style={{whiteSpace: 'nowrap', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #BFDBFE'}}>
  {skill}
</span>
  ))}
</div>

      <Link
        to={`/jobs/${job.id}`}
        className="block text-center bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
      >
        View Details
      </Link>
    </div>
  )
}

export default JobCard