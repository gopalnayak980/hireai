import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-20 px-8 text-center">
        <h1 className="text-5xl font-bold mb-4">Find Your Dream Job with <span className="text-yellow-300">AI</span></h1>
        <p className="text-xl mb-8 text-blue-100">Upload your resume — AI will match you with the best jobs instantly</p>
        <div className="flex justify-center gap-4">
          <Link to="/jobs" className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition">Browse Jobs</Link>
          <Link to="/register" className="border-2 border-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-600 transition">Get Started</Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto py-12 px-8">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-4xl font-bold text-blue-700">500+</h2>
          <p className="text-gray-500 mt-2">Jobs Available</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-4xl font-bold text-blue-700">200+</h2>
          <p className="text-gray-500 mt-2">Companies</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-4xl font-bold text-blue-700">1000+</h2>
          <p className="text-gray-500 mt-2">Users Hired</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Why HireAI?</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">AI Resume Match</h3>
            <p className="text-gray-500">Upload resume — AI finds best matching jobs for you instantly</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Smart Filter</h3>
            <p className="text-gray-500">Filter jobs by skills, location, salary and job type easily</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">One Click Apply</h3>
            <p className="text-gray-500">Apply to multiple jobs in seconds with your saved profile</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white text-center py-16 px-8 mt-10">
        <h2 className="text-3xl font-bold mb-4">Ready to find your dream job?</h2>
        <p className="text-blue-100 mb-8">Join thousands of job seekers using HireAI</p>
        <Link to="/register" className="bg-yellow-400 text-blue-900 px-10 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition">Get Started Free</Link>
      </div>

    </div>
  )
}

export default Home