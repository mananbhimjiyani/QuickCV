import { useState } from "react";
import HeroComponent from "./components/HeroComponent";
import NavBar from "./components/NavBar";
import "./App.css";
import UploadButton from "./components/UploadButton";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Details from "./pages/details";
import WhyUseUs from "./components/WhyUs";
import PoweredByGoogleGemini from "./components/PoweredByGoogle";
import axios from "axios";
import JdPage from "./pages/jdPage";

function App() {
  const [cvData, setCvData] = useState(null);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/api/upload_cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCvData(response.data.cv_summary); //state stores cv
    } catch (error) {
      console.error("Error uploading CV:", error);
    }
  };

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroComponent />
              <PoweredByGoogleGemini />
              <div id="uploadSection" className="py-20 bg-purple">
                <h2 className="text-3xl font-bold text-center">Upload CV</h2>
                <UploadButton onUpload={handleFileUpload} />
              </div>
            </>
          }
        />
        <Route path="/details" element={<Details />} />
        <Route path="/jdPage" element={<JdPage />} />
      </Routes>
      <WhyUseUs />
    </Router>
  );
}

export default App;
