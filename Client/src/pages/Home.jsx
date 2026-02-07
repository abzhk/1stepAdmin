import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen from-gray-50 to-gray-200 flex flex-col items-center text-center pt-24 px-6">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
        Welcome to <span className="text-blue-600">OneStep</span>
      </h1>
      <p className="text-gray-600 text-lg max-w-2xl mb-8">
        Empowering professionals through collaboration, knowledge sharing, and innovation.
        Join our community to access exclusive resources, expert discussions, and networking opportunities.
      </p>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-black px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
          onClick={() => navigate("/register")}
        >
          Join Now
        </button>
        <button
          className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-xl shadow-sm hover:bg-blue-50 transition duration-300"
          onClick={() => navigate("/about")}
        >
          Learn More
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Our Mission</h2>
          <p className="text-gray-600">
            To enhance professional excellence and foster collaboration across industries through teraphy and education.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Our Vision</h2>
          <p className="text-gray-600">
            To build a global network of professionals working together to create meaningful impact in their communities.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Get Involved</h2>
          <p className="text-gray-600">
            Become part of our programs, share your expertise, and help shape the future of professional growth.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Home;
