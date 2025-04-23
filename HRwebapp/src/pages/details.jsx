import React, { useEffect, useState } from "react";
import axios from "axios";

const Details = () => {
  const [cvData, setCvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get("https://quickcv.onrender.com/api/get_details");
        setCvData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data!");
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mx-auto p-4" style={{ backgroundColor: '#7461c2' }}>
      <h1 className="text-3xl font-bold text-white">Candidate Details</h1>
      <div className="mt-4">
        {cvData.map((candidate, index) => (
          <div key={index} tabIndex={0} className="collapse bg-base-200 mb-4">
            <div className="collapse-title text-xl font-medium">
              {candidate.firstName} {candidate.lastName} - {candidate.email}
            </div>
            <div className="collapse-content">
              <p><strong>Education:</strong> {candidate.education}</p>
              <p><strong>Skills:</strong> {candidate.skills}</p>
              <p><strong>Links:</strong> {candidate.links}</p>
              <p><strong>CV Link:</strong> <a href={candidate.cvLink} target="_blank" rel="noopener noreferrer">{candidate.cvLink}</a></p>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Details;
