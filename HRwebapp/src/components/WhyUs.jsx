import React from "react";

const WhyUseUs = () => {
  return (
    <div className="container mx-auto p-8" style={{ backgroundColor: '#7461c2' }}>
      <h2 className="text-4xl font-bold text-center mb-8 text-white">Why Choose Us?</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card bg-base-100 image-full w-96 shadow-xl">
          <figure>
            <img
              src="https://visme.co/blog/wp-content/uploads/2023/09/How-to-Create-an-Organizational-Strategy-that-Benefits-Your-Company-Thumbnail.jpg"
              alt="AI Insights"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">AI-Powered Insights</h2>
            <p>
              Leverage cutting-edge AI to extract meaningful insights from CVs,
              helping HR teams make faster, smarter hiring decisions.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 image-full w-96 shadow-xl">
          <figure>
            <img
              src="https://blogimage.vantagecircle.com/content/images/2023/06/VC_Featured-Image-Light-5.png"
              alt="Time Saving"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Time-Saving Automation</h2>
            <p>
              Automate the CV parsing process, allowing your team to focus on
              what matters most—finding the perfect candidates.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 image-full w-96 shadow-xl">
          <figure>
            <img
              src="https://akriviahcm.com/blog/wp-content/uploads/2024/05/International-HR-Day-2024-Shaping-the-future-with-HR-professionals.jpg"
              alt="Simplified Hiring"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Simplified Hiring</h2>
            <p>
              From resume parsing to candidate profiling, our platform streamlines
              the entire hiring process for more efficient talent acquisition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUseUs;
