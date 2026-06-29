import { useParams, Link } from "react-router-dom"

const jobsData = [
  { id: 1, title: "Frontend Developer", company: "Google", location: "Bangalore", salary: "12-18 LPA", type: "Full Time", skills: ["React", "JavaScript", "CSS"], description: "We are looking for a skilled Frontend Developer to join our team at Google. You will be responsible for building and maintaining high-quality web applications.", experience: "0-2 years", openings: 5 },
  { id: 2, title: "Backend Developer", company: "Amazon", location: "Hyderabad", salary: "15-22 LPA", type: "Full Time", skills: ["Node.js", "MongoDB", "Express"], description: "Amazon is hiring Backend Developers to build scalable microservices and APIs for our e-commerce platform.", experience: "1-3 years", openings: 3 },
  { id: 3, title: "Full Stack Developer", company: "Flipkart", location: "Remote", salary: "10-16 LPA", type: "Remote", skills: ["React", "Node.js", "MongoDB"], description: "Join Flipkart as a Full Stack Developer and work on cutting-edge e-commerce solutions serving millions of users.", experience: "0-2 years", openings: 8 },
  { id: 4, title: "Python Developer", company: "Microsoft", location: "Pune", salary: "14-20 LPA", type: "Full Time", skills: ["Python", "Flask", "SQL"], description: "Microsoft is looking for Python Developers to build enterprise-grade applications and automation tools.", experience: "1-2 years", openings: 4 },
  { id: 5, title: "React Developer", company: "Zomato", location: "Remote", salary: "8-14 LPA", type: "Remote", skills: ["React", "JavaScript", "Tailwind"], description: "Zomato is hiring React Developers to enhance our food delivery platform and build new user-facing features.", experience: "0-1 years", openings: 6 },
  { id: 6, title: "AI/ML Engineer", company: "Infosys", location: "Chennai", salary: "12-20 LPA", type: "Full Time", skills: ["Python", "TensorFlow", "AI"], description: "Infosys is looking for AI/ML Engineers to develop intelligent solutions for our enterprise clients worldwide.", experience: "1-3 years", openings: 2 },
]

const JobDetail = () => {
  const { id } = useParams()
  const job = jobsData.find(j => j.id === parseInt(id))

  if (!job) return <div className="text-center mt-20 text-2xl text-gray-500">Job not found!</div>

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10 max-w-4xl mx-auto">

      {/* Back Button */}
      <Link to="/jobs" className="text-blue-600 hover:underline mb-6 inline-block">← Back to Jobs</Link>

      {/* Job Header */}
      <div className="bg-white rounded-xl shadow p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-blue-600 text-xl font-medium mt-1">{job.company}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium text-sm ${job.type === "Remote" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
            {job.type}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Location</p>
            <p className="font-semibold text-gray-700">📍 {job.location}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Salary</p>
            <p className="font-semibold text-gray-700">💰 {job.salary}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Experience</p>
            <p className="font-semibold text-gray-700">🎯 {job.experience}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-xs">Openings</p>
            <p className="font-semibold text-gray-700">👥 {job.openings} seats</p>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
        <p className="text-gray-600 leading-relaxed">{job.description}</p>

        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">Required Skills</h2>
        <div className="flex flex-wrap gap-2">
          {job.skills.map(skill => (
            <span key={skill} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-medium border border-blue-200">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Apply Section */}
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Interested in this role?</h2>
        <p className="text-gray-500 mb-6">Apply now and our AI will match your resume with this job!</p>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-700 text-white px-10 py-3 rounded-lg hover:bg-blue-600 transition font-bold text-lg">
            ✅ Apply Now
          </button>
          <button className="border-2 border-blue-700 text-blue-700 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-bold text-lg">
            🔖 Save Job
          </button>
        </div>
      </div>

    </div>
  )
}

export default JobDetail