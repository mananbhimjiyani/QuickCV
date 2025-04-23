import React from "react";

const CvCard = ({ cvData }) => {
  return (
    <div >
      <h3 className="text-xl font-bold">CV Summary</h3>
      <p><strong>Name:</strong> {cvData.FirstName} {cvData.LastName}</p>
      <p><strong>Email:</strong> {cvData.Email}</p>
      <p><strong>Education:</strong> {cvData.Education.join(", ")}</p>
      <p><strong>Skills:</strong> {cvData.Skills.join(", ")}</p>
      <p><strong>Links:</strong> {cvData.Links.join(", ")}</p>
    </div>
  );
};

export default CvCard;
