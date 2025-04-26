import PropTypes from "prop-types";

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

CvCard.propTypes = {
  cvData: PropTypes.shape({
    FirstName: PropTypes.string,
    LastName: PropTypes.string,
    Email: PropTypes.string,
    Education: PropTypes.arrayOf(PropTypes.string),
    Skills: PropTypes.arrayOf(PropTypes.string),
    Links: PropTypes.arrayOf(PropTypes.string),
  })
};

export default CvCard; 