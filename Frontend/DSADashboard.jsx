import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DSADashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleStartCoding = () => {
    localStorage.setItem("dsa-role", role);
    localStorage.setItem("dsa-difficulty", difficulty);
    navigate("/code-editor");
  };

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist",
    "SDE",
    "ML Engineer",
  ];
  const levels = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative">
      {/* Profile Dropdown (Top Left, shifted downward) */}
<div className="absolute top-20 left-6 z-50" ref={dropdownRef}>
  <button
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="bg-gray-900 text-white px-5 py-2 rounded-xl shadow-md font-semibold hover:bg-gray-800 transition"
  >
    ☰ Profile
  </button>

  {dropdownOpen && (
    <div className="mt-3 bg-gray-900 text-white border border-gray-700 rounded-xl shadow-xl w-64 overflow-hidden">
      <div className="flex flex-col divide-y divide-gray-700">

        <button
          onClick={() => {
            setDropdownOpen(false);
            navigate("/profile");
          }}
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition text-sm font-medium"
        >
          <span className="text-lg">🧑</span>
          <span>View Profile</span>
        </button>

        <button
          onClick={() => {
            setDropdownOpen(false);
            navigate("/interview-history");
          }}
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-800 transition text-sm font-medium"
        >
          <span className="text-lg">📜</span>
          <span>Past Interviews</span>
        </button>

        <button
          onClick={() => {
            setDropdownOpen(false);
            localStorage.clear();
            navigate("/login");
          }}
          className="flex items-center gap-3 px-5 py-4 hover:bg-red-800 transition text-sm font-medium text-red-400 hover:text-white"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )}


      </div>

      {/* Left Panel */}
      <div className="lg:w-1/2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex flex-col justify-center items-start px-10 py-20">
        <h1 className="text-5xl font-bold mb-4">DSA Practice</h1>
        <p className="text-lg max-w-md">
          Select your role and difficulty level to begin solving tailored coding challenges.
        </p>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">Get Started</h2>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Choose a Role --</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Choose Difficulty --</option>
              {levels.map((level) => (
                <option key={level} value={level.toLowerCase()}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartCoding}
            disabled={!role || !difficulty}
            className={`w-full py-3 rounded-md font-semibold transition duration-200 ${
              role && difficulty
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Start Coding
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSADashboard;
