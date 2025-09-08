import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Enhanced Feature card component with hover animations
const FeatureCard = ({ title, description, icon, additionalInfo }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group">
    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mb-6 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4 transition-colors duration-300 group-hover:text-blue-600">{title}</h3>
    <p className="text-gray-600 mb-4 transition-colors duration-300 group-hover:text-gray-800">{description}</p>
    {additionalInfo && (
      <div className="text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md">
        {additionalInfo}
      </div>
    )}
  </div>
);

// Enhanced Stats component with counter animation
const StatCard = ({ number, label, icon }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const target = parseInt(number.replace(/\D/g, ''));
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, number]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`stat-${label}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [label]);

  return (
    <div
      id={`stat-${label}`}
      className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 group"
    >
      <div className="flex justify-center mb-3 text-blue-600 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div className="text-3xl font-bold text-blue-600 mb-2">
        {number.includes('%') || number.includes('+') ?
          `${count}${number.replace(/\d/g, '')}` :
          count
        }
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
};

// Enhanced Process Step component
const ProcessStep = ({ step, title, description, icon }) => (
  <div className="flex flex-col items-center text-center p-6 group">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white mb-4 text-xl font-bold transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-6">
      {step}
    </div>
    <div className="mb-4 text-blue-600 transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-blue-600">{title}</h3>
    <p className="text-gray-600 text-sm transition-colors duration-300 group-hover:text-gray-800">{description}</p>
  </div>
);

// Interactive Login Card component
const LoginCard = ({ title, description, color, role, onLogin, icon }) => (
  <div className={`${color.bg} p-8 rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer`}>
    <div className="flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">{title}</h3>
    <p className="text-gray-600 mb-6 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{description}</p>
    <button
      onClick={onLogin}
      className={`w-full py-3 px-6 ${color.buttonBg} hover:${color.buttonHoverBg} text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105`}
    >
      Access Dashboard
    </button>
  </div>
);

// Animated Partner Logo component
const PartnerLogo = ({ src, alt, delay = 0 }) => (
  <div
    className="partner-logo-container"
    style={{ animationDelay: `${delay}s` }}
  >
    <img
      src={src}
      alt={alt}
      className="h-16 md:h-20 lg:h-24 opacity-70 hover:opacity-100 transition-all duration-500 transform hover:scale-110 filter hover:drop-shadow-lg hover:brightness-110"
    />
  </div>
);

// Main Dashboard Component
const MainDashboard = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Mock wallet connection function
  const connectWallet = async () => {
    console.log('Connecting wallet...');
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleLogin = async (role) => {
    await connectWallet();
    switch (role) {
      case 'propertyBuyer':
        navigate('/buyer-dashboard/profile');
        break;
      case 'landInspector':
        navigate('/verifier-dashboard');
        break;
      case 'landOwner':
        navigate('/owner-dashboard/profile');
        break;
      case 'governmentRegistry':
        navigate('/government-registry');
        break;
      default:
        navigate('/');
        break;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-gray-50 overflow-x-hidden">

      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-[#101828]
 to-gray-900 text-gray-200 py-55 px-4 md:px-8 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl flex flex-col items-center justify-center text-center gap-12"> {/* Changed to justify-center and text-center */}
          <div className="z-10">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold mb-7 animate-pulse">
              🚀 Revolutionary Land Registry Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white">
              Revolutionize Land Registration with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">Blockchain</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-6">
              Experience a new era of secure, transparent, and immutable land record management powered by cutting-edge blockchain technology.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transform hover:scale-105 transition-transform duration-300">
                ✅ 100% Fraud-Proof
              </span>
              <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transform hover:scale-105 transition-transform duration-300">
                ⚡ 90% Faster Processing
              </span>
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-2 rounded-full text-sm font-medium transform hover:scale-105 transition-transform duration-300">
                🔐 Bank-Level Security
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/about-us" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                Explore Features
              </Link>
              <button
                onClick={connectWallet}
                className="inline-block px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                Connect Wallet
              </button>
            </div>
          </div>
          {/* Removed the image div from here */}
        </div>

        {/* Enhanced background animations */}
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-gradient-to-br from-[#123962] to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-green-500 to-[#123962] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes slideRightToLeft {
          0% { transform: translateX(100vw); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(-100vw); opacity: 0; }
        }

        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 30px rgba(147, 51, 234, 0.5)); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045); }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .partner-logo-container {
          animation: slideRightToLeft 15s linear infinite;
          filter: drop-shadow(0 0 10px rgba(18, 57, 98, 0.3));
        }

        .partner-logo-container:hover {
          animation-play-state: paused;
          filter: drop-shadow(0 0 20px rgba(18, 57, 98, 0.6));
        }

        .partner-logos-track {
          display: flex;
          width: calc(200px * 10);
          animation: slideRightToLeft 20s linear infinite;
        }

        .partner-logos-container {
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }
      `}</style>


      {/* Enhanced Login Section */}
      <section className="bg-gradient-to-br from-gray-100 to-blue-50 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
            Log In to Your <span className="text-blue-600">Role</span>
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Choose your role to access specialized features and comprehensive dashboard functionalities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <LoginCard
              title="Property Buyer"
              description="Browse verified properties, complete secure purchases, and manage your real estate portfolio with inspector verification."
              color={{ bg: "bg-gradient-to-br from-blue-50 to-blue-100", buttonBg: "bg-gradient-to-r from-blue-600 to-blue-700", buttonHoverBg: "from-blue-700 to-blue-800" }}
              role="propertyBuyer"
              onLogin={() => handleLogin('propertyBuyer')}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              }
            />
            <LoginCard
              title="Land Inspector"
              description="Verify land authenticity, approve documents, and ensure compliance for all transactions with regulatory oversight."
              color={{ bg: "bg-gradient-to-br from-green-50 to-green-100", buttonBg: "bg-gradient-to-r from-green-600 to-green-700", buttonHoverBg: "from-green-700 to-green-800" }}
              role="landInspector"
              onLogin={() => handleLogin('landInspector')}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <LoginCard
              title="Land Owner"
              description="Manage your property portfolio, view land records, and initiate new registrations with complete ownership control."
              color={{ bg: "bg-gradient-to-br from-yellow-50 to-yellow-100", buttonBg: "bg-gradient-to-r from-yellow-600 to-yellow-700", buttonHoverBg: "from-yellow-700 to-yellow-800" }}
              role="landOwner"
              onLogin={() => handleLogin('landOwner')}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <LoginCard
              title="Government Registry"
              description="Access government land metadata registry with IPFS integration for official document verification and retrieval."
              color={{ bg: "bg-gradient-to-br from-purple-50 to-purple-100", buttonBg: "bg-gradient-to-r from-purple-600 to-purple-700", buttonHoverBg: "from-purple-700 to-purple-800" }}
              role="governmentRegistry"
              onLogin={() => handleLogin('governmentRegistry')}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="bg-white py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
            How It <span className="text-blue-600">Works</span>
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Our streamlined process makes land registration simple, secure, and transparent.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProcessStep
              step="1"
              title="Get Verified"
              description="Buyers get verified by certified land inspectors to access premium properties and ensure trustworthy transactions."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <ProcessStep
              step="2"
              title="Browse Properties"
              description="Explore verified properties with complete documentation and transparent pricing on our secure marketplace."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            />
            <ProcessStep
              step="3"
              title="Secure Purchase"
              description="Complete transactions through smart contracts with escrow protection and automatic ownership transfer."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            />
            <ProcessStep
              step="4"
              title="Digital Ownership"
              description="Receive your digital ownership certificate with unique blockchain verification for instant authenticity."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
            />
          </div>
        </div>
      </section>

       {/* Enhanced Stats Section */}
      <section className="bg-white py-16 px-4 -mt-8 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              number="3+"
              label="Integrated Registries"
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            />
            <StatCard
              number="50+"
              label="Testnet Properties"
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard
              number="15+"
              label="Active Demos"
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            <StatCard
              number="100%"
              label="Secure Transactions"
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            />
          </div>
        </div>
      </section>


      {/* Enhanced Features Section */}
      <section className="bg-gradient-to-br from-gray-100 to-blue-50 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
            Key <span className="text-blue-600">Features</span>
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Advanced blockchain technology meets user-friendly design.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="Secure & Transparent"
              description="Immutable records on blockchain guarantee data integrity, eliminating fraud and ensuring complete trust."
              additionalInfo="256-bit Encryption"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            <FeatureCard
              title="Verified Buyers"
              description="All buyers undergo verification by certified land inspectors, ensuring trustworthy transactions."
              additionalInfo="Inspector Verified"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <FeatureCard
              title="Digital Documentation"
              description="Securely store and manage all land documents using decentralized IPFS network with global accessibility."
              additionalInfo="IPFS Powered"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6-6h.01M9 18h6m-3-6h.01M9 6h6m-6 12h.01" />
                </svg>
              }
            />
            <FeatureCard
              title="Smart Contracts"
              description="Automated escrow and ownership transfer through smart contracts ensure secure, instant, and transparent transactions."
              additionalInfo="Automated Escrow"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Enhanced Partners & Integrations Section with Animated Logos */}
      <section className="bg-white py-20 px-4 overflow-hidden relative">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Powered by Leading <span className="text-blue-600">Blockchain Technology</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Built on cutting-edge blockchain infrastructure with industry-leading partners
          </p>


          {/* Technology stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center group">
              <div className="text-3xl font-bold text-blue-600 mb-2 transition-transform duration-300 group-hover:scale-110">5+</div>
              <div className="text-gray-600">Blockchain Networks</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-green-600 mb-2 transition-transform duration-300 group-hover:scale-110">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-purple-600 mb-2 transition-transform duration-300 group-hover:scale-110">24/7</div>
              <div className="text-gray-600">Global Access</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-yellow-600 mb-2 transition-transform duration-300 group-hover:scale-110">∞</div>
              <div className="text-gray-600">Scalability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Why Choose Us Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
            Why Choose Our <span className="text-blue-600">Platform?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Built for the Future</h3>
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Zero Fraud Risk</h4>
                    <p className="text-gray-600">Blockchain technology makes property fraud mathematically impossible with cryptographic security.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mr-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Verified Participants</h4>
                    <p className="text-gray-600">All buyers and sellers undergo rigorous verification by certified land inspectors.</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center mr-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Instant Transactions</h4>
                    <p className="text-gray-600">Smart contracts enable instant, secure property transfers with automated escrow.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Benefits</h3>
              <div className="space-y-4">
                {[
                  { color: "bg-blue-600", text: "Permanent immutable records" },
                  { color: "bg-green-600", text: "Inspector-verified participants" },
                  { color: "bg-yellow-600", text: "Real-time transaction tracking" },
                  { color: "bg-purple-600", text: "Global accessibility 24/7" },
                  { color: "bg-red-600", text: "Automated escrow protection" },
                  { color: "bg-indigo-600", text: "Instant ownership verification" }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-gray-700 group">
                    <div className={`w-3 h-3 ${benefit.color} rounded-full mr-4 transition-transform duration-300 group-hover:scale-125`}></div>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Call to Action Section */}
      <section className="bg-gradient-to-br from-[#123962] via-[#101828]
  to-[#123962] text-white py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to Transform Property Management?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join the future of land registry with unmatched security, transparency, and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              Start Your Demo
            </Link>
            <Link to="/contact" className="inline-block px-8 py-4 bg-blue-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              Contact Us
            </Link>
          </div>
        </div>
        {/* Background animation elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xl mb-4">Blockchain Land Registry</h3>
              <p className="text-sm leading-relaxed mb-6">
                Revolutionizing property management through secure, transparent blockchain technology.
              </p>
              <div className="flex space-x-4">
                {['f', 't', 'in'].map((social, index) => (
                  <div key={index} className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    {social}
                  </div>
                ))}
              </div>
            </div>
            {[
              {
                title: "Platform",
                links: ["How It Works", "Security Features", "API Documentation", "Integration Guide"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Support", "System Status", "User Community"]
              },
              {
                title: "Legal & Compliance",
                links: ["Privacy Policy", "Terms of Service", "Regulatory Compliance", "Security Audits"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Blockchain Land Registry. All rights reserved. | Powering the future of property management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default MainDashboard;