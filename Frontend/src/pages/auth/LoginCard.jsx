import React from 'react';
import { Link } from 'react-router-dom';

const LoginCard = ({ title, description, icon, color, role }) => {
  let navigatePath;

  // The logic now correctly checks for the roles being passed from MainDashboard
  if (role === "landInspector") {
    navigatePath = "/verifier-dashboard";
  } else if (role === "landOwner") {
    navigatePath = "/owner-dashboard";
  } else if (role === "contractOwner") {
    navigatePath = "/contract-owner-dashboard"; 
  } else if (role === "governmentRegistry") {
    navigatePath = "/government-registry";
  } else {
    navigatePath = "/"; 
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center max-w-sm mx-auto transition-transform transform hover:-translate-y-2 hover:shadow-xl">
      <div className={`p-4 rounded-full ${color.bg} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{description}</p>
      
      <Link
        to={navigatePath}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${color.buttonBg} hover:${color.buttonHoverBg}`}
      >
        {role === "governmentRegistry" ? "Access Registry" : "Login with MetaMask"}
      </Link>
    </div>
  );
};

export default LoginCard;