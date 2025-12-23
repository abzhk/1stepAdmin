import React from 'react';
import { FiSearch } from 'react-icons/fi';

const NavbarSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <FiSearch className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-80 pl-10 px-4 py-2 rounded-full bg-gray-50 text-gray-800 
          focus:outline-none focus:ring-2 focus:ring-lightbutton border border-gray-200"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default NavbarSearch;