import React, { useState } from "react";
import axios from "axios";
import CvCard from "./CvCard"; 

const UploadButton = () => {
  const [file, setFile] = useState(null);
  const [cvData, setCvData] = useState(null); // cv data for modal
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/api/upload_cv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCvData(response.data.cv_summary); 
      setIsModalOpen(true); 
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file!");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); 
    setCvData(null); 
  };

  return (
    <div>
    <div className="py-8">
    <div className="flex justify-center items-center flex-col">
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Pick a file</span>
        </div>
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          onChange={handleFileChange}
        />
      </label>
      <div className="mt-4">
        <button className="btn btn-primary btn-wide" onClick={handleUpload}>
          Upload CV
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg w-96">
            <CvCard cvData={cvData} />
            <button className="btn btn-primary mt-4" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default UploadButton;
