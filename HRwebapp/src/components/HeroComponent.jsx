import React from "react";
import hrImage from "../assets/hr.jpg";

const HeroComponent = () => {
  const scrollToUploadSection = () => {
    document.getElementById("uploadSection").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="hero min-h-[70vh] bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${hrImage})`,
      }}
    >
      <div className="hero-overlay bg-opacity-20"></div>
      <div className="hero-content text-center relative z-10">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-black">WELCOME TO QuickCV</h1>
          <div className="bg-purple bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
            <p className="py-6 text-white font-bold">
              Effortlessly upload candidate CVs and let our platform extract key
              information using advanced AI technology. Improve your hiring
              process with faster and smarter data insights.
            </p>
          </div>
          <button className="btn btn-primary" onClick={scrollToUploadSection}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroComponent;
