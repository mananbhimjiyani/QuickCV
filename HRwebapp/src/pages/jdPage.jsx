import { useState } from "react";
import NavBar from "../components/NavBar";

const JdPage = () => {
  const [jdFile, setJdFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleJdUpload = (e) => {
    setJdFile(e.target.files[0]);
    setError(null);
  };

  const handleCvUpload = (e) => {
    setCvFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jdFile || !cvFile) {
      setError("Please upload both JD and CV files");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("cv_file", cvFile);
      formData.append("jd_file", jdFile);

      const response = await fetch(
        "http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/api/compare_cv_jd",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze files");
      }

      const data = await response.json();
      // Normalize the response data structure
      const normalizedData = normalizeResponseData(data);
      setResult(normalizedData);
      console.log("Original data:", data);
      console.log("Normalized data:", normalizedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to normalize the response data structure
  const normalizeResponseData = (data) => {
    // Create a normalized copy of the data
    const normalized = { ...data };

    // Normalize skills_analysis structure
    if (data.skills_analysis) {
      normalized.skills_analysis = {
        matched: data.skills_analysis.matched || data.skills_analysis.matched_skills || [],
        missing: data.skills_analysis.missing || data.skills_analysis.missing_skills || [],
        bonus: data.skills_analysis.bonus || data.skills_analysis.bonus_skills || []
      };
    }

    // Normalize education_analysis structure
    if (data.education_analysis) {
      normalized.education_analysis = {
        degree: data.education_analysis.degree || "",
        // Handle different field names for relevance
        relevance: data.education_analysis.relevance || 
                  (data.education_analysis.degree_match === true ? "Relevant" : 
                   data.education_analysis.degree_match === false ? "Not Relevant" : "Unknown")
      };
    }

    // Normalize experience_analysis structure
    if (data.experience_analysis) {
      normalized.experience_analysis = {
        years: data.experience_analysis.years || data.experience_analysis.years_of_experience || "",
        level: data.experience_analysis.level || "",
        // Merge different field formats
        details: data.experience_analysis.details || [],
        domain_relevance: data.experience_analysis.domain_relevance || "",
        role_alignment: data.experience_analysis.role_alignment || ""
      };
    }

    // Normalize keyword_analysis structure
    if (data.keyword_analysis) {
      normalized.keyword_analysis = {
        present: data.keyword_analysis.present || data.keyword_analysis.present_keywords || [],
        missing: data.keyword_analysis.missing || data.keyword_analysis.missing_keywords || []
      };
    }

    return normalized;
  };

  // Helper function to safely access nested properties
  const safeGet = (obj, path, defaultValue = "") => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    
    return result || defaultValue;
  };

  // Calculate skills percentage for the donut chart
  const calculateSkillsPercentages = (result) => {
    if (!result || !result.skills_analysis) return { matched: 0, missing: 0, bonus: 0 };
    
    const matched = safeGet(result, "skills_analysis.matched", []).length;
    const missing = safeGet(result, "skills_analysis.missing", []).length;
    const bonus = safeGet(result, "skills_analysis.bonus", []).length;
    
    const total = matched + missing || 1; // Avoid division by zero
    
    return {
      matched: Math.round((matched / total) * 100),
      missing: Math.round((missing / total) * 100),
      bonus: bonus // Just count for bonus skills
    };
  };

  // Generate SVG for skills donut chart
  const renderSkillsDonutChart = (result) => {
    const { matched, missing } = calculateSkillsPercentages(result);
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate stroke-dasharray values
    const matchedStroke = (matched / 100) * circumference;
    const missingStroke = (missing / 100) * circumference;
    
    return (
      <svg width="180" height="180" viewBox="0 0 180 180" className="mx-auto">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke="#e0e0e0"
          strokeWidth="15"
        />
        {/* Matched Skills Arc */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke="#4ade80"
          strokeWidth="15"
          strokeDasharray={`${matchedStroke} ${circumference}`}
          transform="rotate(-90 90 90)"
        />
        {/* Missing Skills Arc */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke="#f87171"
          strokeWidth="15"
          strokeDasharray={`${missingStroke} ${circumference}`}
          strokeDashoffset={-matchedStroke}
          transform="rotate(-90 90 90)"
        />
        {/* Center Text */}
        <text x="90" y="85" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#4b5563">
          {matched}%
        </text>
        <text x="90" y="105" textAnchor="middle" fontSize="12" fill="#6b7280">
          Match
        </text>
      </svg>
    );
  };

  // Render compatibility meter
  const renderCompatibilityMeter = (score) => {
    const scoreValue = parseInt(score) || 0;
    let color = "#f87171"; // Red for low score
    
    if (scoreValue >= 70) {
      color = "#4ade80"; // Green for high score
    } else if (scoreValue >= 40) {
      color = "#facc15"; // Yellow for medium score
    }
    
    return (
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full" 
          style={{ 
            width: `${scoreValue}%`, 
            backgroundColor: color,
            transition: "width 1s ease-in-out"
          }}
        ></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#7461c2]">
      {/* <NavBar/> */}

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="hero min-h-[50vh] bg-cover bg-center relative rounded-2xl mb-12">
          <div className="hero-overlay bg-opacity-20"></div>
          <div className="hero-content text-center relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center justify-center mb-4">
                <h1 className="text-5xl font-bold text-white mr-3">
                  Job Description Analysis
                </h1>
                {/* Job Icon */}
                <img
                  src="https://img.icons8.com/?size=100&id=eoxMN35Z6JKg&format=png&color=000000"
                  alt="AI Job Analysis"
                  className="w-12 h-12 ml-2"
                />
              </div>
              <div className="bg-purple-800 bg-opacity-30 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                <p className="py-2 text-white font-bold text-lg mb-3">
                  Upload a job description and candidate CV to check
                  compatibility using our advanced AI analysis.
                </p>
                <div className="text-white text-sm text-left">
                  <p className="mb-2">
                    <span className="font-bold">
                      How compatibility is calculated:
                    </span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Skills matching (60%): Comparison of required skills with
                      candidate's expertise
                    </li>
                    <li>
                      Education relevance (20%): Evaluation of academic
                      qualifications against requirements
                    </li>
                    <li>
                      Experience analysis (20%): Assessment of work history and
                      domain knowledge
                    </li>
                  </ul>
                  <div className="flex items-center justify-center mt-4">
                    <p className="text-xs opacity-80">Powered by</p>
                    <span className="ml-2 font-bold text-sm flex items-center">
                      AI
                      <img
                        src="https://icons8.com/icon/20497/permanent-job"
                        alt="Permanent Job"
                        className="w-5 h-5 ml-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://img.icons8.com/?size=48&id=20497&format=png";
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Upload Section */}
        <div className="card bg-base-100 shadow-xl p-6 mb-12">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6">Upload Documents</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* JD Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">
                      Job Description (PDF)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleJdUpload}
                    className="file-input file-input-bordered file-input-primary w-full"
                  />
                  {jdFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {jdFile.name}
                    </div>
                  )}
                </div>

                {/* CV Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg">
                      Candidate CV (PDF)
                    </span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleCvUpload}
                    className="file-input file-input-bordered file-input-primary w-full"
                  />
                  {cvFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {cvFile.name}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="alert alert-error mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="card-actions justify-center">
                <button
                  type="submit"
                  className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Analyzing..." : "Check Compatibility"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="card bg-base-100 shadow-xl p-6 mb-12">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-6">Analysis Results</h2>

              {/* Compatibility Overview */}
              <div className="card bg-purple-100 shadow-lg mb-8">
                <div className="card-body">
                  <h3 className="card-title text-2xl text-purple-800 mb-4">
                    Compatibility Overview
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                    {/* Left Column - Score Visualization */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <p className="text-gray-700 text-lg font-semibold mb-2">Compatibility Score</p>
                        <div className="text-5xl font-bold text-purple-700">
                          {safeGet(result, "ats_score", 0)}%
                        </div>
                      </div>
                      
                      {/* Score Meter */}
                      <div className="w-full max-w-sm mb-2">
                        {renderCompatibilityMeter(safeGet(result, "ats_score", 0))}
                      </div>
                      
                      <div className="flex justify-between w-full max-w-sm text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* Right Column - Skills Match Visualization */}
                    <div className="flex flex-col items-center">
                      <p className="text-gray-700 text-lg font-semibold mb-2">Skills Match</p>
                      {renderSkillsDonutChart(result)}
                      
                      {/* Legend */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-sm">Matched Skills</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                          <span className="text-sm">Missing Skills</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="stat bg-white rounded-lg shadow-sm">
                      <div className="stat-title">Experience</div>
                      <div className="stat-value text-info text-2xl">
                        {safeGet(result, "experience_analysis.level", "N/A")}
                      </div>
                      <div className="stat-desc">
                        {safeGet(result, "experience_analysis.years", "N/A")}
                      </div>
                    </div>
                    
                    <div className="stat bg-white rounded-lg shadow-sm">
                      <div className="stat-title">Education</div>
                      <div className="stat-value text-info text-2xl">
                        {safeGet(result, "education_analysis.degree", "N/A")}
                      </div>
                      <div className="stat-desc">
                        {safeGet(result, "education_analysis.relevance", "N/A")}
                      </div>
                    </div>
                    
                    <div className="stat bg-white rounded-lg shadow-sm">
                      <div className="stat-title">Skills Coverage</div>
                      <div className="stat-value text-info text-2xl">
                        {calculateSkillsPercentages(result).matched}%
                      </div>
                      <div className="stat-desc">
                        {safeGet(result, "skills_analysis.matched", []).length} of {
                          safeGet(result, "skills_analysis.matched", []).length + 
                          safeGet(result, "skills_analysis.missing", []).length
                        } required skills
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="card bg-white shadow-lg mb-8">
                <div className="card-body">
                  <h3 className="card-title text-2xl mb-4">Skills Breakdown</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Matched Skills */}
                    <div className="card bg-green-50">
                      <div className="card-body">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          <h3 className="text-lg font-medium text-green-800">
                            Matched Skills
                          </h3>
                        </div>
                        <div className="mt-4">
                          {safeGet(result, "skills_analysis.matched", []).map((skill, index) => (
                            <div
                              key={index}
                              className="badge badge-success badge-lg gap-2 mr-2 mb-2"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="card bg-red-50">
                      <div className="card-body">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                          </svg>
                          <h3 className="text-lg font-medium text-red-800">
                            Missing Skills
                          </h3>
                        </div>
                        <div className="mt-4">
                          {safeGet(result, "skills_analysis.missing", []).map((skill, index) => (
                            <div
                              key={index}
                              className="badge badge-error badge-lg gap-2 mr-2 mb-2"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bonus Skills */}
                    <div className="card bg-blue-50">
                      <div className="card-body">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
                          </svg>
                          <h3 className="text-lg font-medium text-blue-800">
                            Bonus Skills
                          </h3>
                        </div>
                        <div className="mt-4">
                          {safeGet(result, "skills_analysis.bonus", []).map((skill, index) => (
                            <div
                              key={index}
                              className="badge badge-info badge-lg gap-2 mr-2 mb-2"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Details */}
              {(safeGet(result, "experience_analysis.details", []).length > 0 || 
                safeGet(result, "experience_analysis.role_alignment", "")) && (
                <div className="card bg-indigo-50 mb-8">
                  <div className="card-body">
                    <h3 className="card-title text-2xl text-indigo-800 mb-4">Experience Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                          </svg>
                          <h4 className="font-medium">Experience Details</h4>
                        </div>
                        
                        {safeGet(result, "experience_analysis.details", []).length > 0 && (
                          <ul className="list-disc ml-5 space-y-1 text-gray-700">
                            {result.experience_analysis.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        )}
                        
                        {/* If no details but there's role alignment */}
                        {safeGet(result, "experience_analysis.details", []).length === 0 && 
                          safeGet(result, "experience_analysis.role_alignment", "") && (
                          <p className="text-gray-700">
                            {result.experience_analysis.role_alignment}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                          </svg>
                          <h4 className="font-medium">Domain Assessment</h4>
                        </div>
                        
                        <div className="space-y-4">
                          {safeGet(result, "experience_analysis.years", "") && (
                            <div>
                              <div className="text-sm text-gray-500">Years of Experience</div>
                              <div className="font-semibold">{result.experience_analysis.years}</div>
                            </div>
                          )}
                          
                          {safeGet(result, "experience_analysis.domain_relevance", "") && (
                            <div>
                              <div className="text-sm text-gray-500">Domain Relevance</div>
                              <div className="font-semibold">{result.experience_analysis.domain_relevance}</div>
                            </div>
                          )}
                          
                          {safeGet(result, "experience_analysis.role_alignment", "") && 
                           safeGet(result, "experience_analysis.details", []).length > 0 && (
                            <div>
                              <div className="text-sm text-gray-500">Role Alignment</div>
                              <div className="font-semibold">{result.experience_analysis.role_alignment}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Improvement Suggestions */}
              <div className="card bg-yellow-50">
                <div className="card-body">
                  <h3 className="card-title text-yellow-800">
                    Improvement Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {safeGet(result, "improvement_suggestions", []).map(
                      (suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>{suggestion}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Summary Text */}
              <div className="card bg-gray-50 mt-6">
                <div className="card-body">
                  <h3 className="card-title text-gray-800">Detailed Summary</h3>
                  <p className="text-gray-700">{safeGet(result, "summary", "No summary available.")}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JdPage;