import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="navbar bg-[#7461c2]">
      <Link to="/">
        <a className="btn btn-ghost text-xl text-white">QuickCV</a>
      </Link>

      <Link to="/">
        <button className="btn btn-success ml-6">Upload CV</button>
      </Link>
      <Link to="/details">
        <button className="btn btn-primary ml-6">View Details</button>
      </Link>
      <Link to="/jdpage">
      <button className="btn btn-primary ml-6">JD/ATS/Compatibility</button>

      </Link>
    </div>
  );
};

export default NavBar;
