import React from 'react';
import { Link } from 'react-router-dom';

const TeamMemberCard = ({ name, role, imageUrl }) => (
  <div className="flex flex-col items-center text-center p-6 bg-gray-100 rounded-lg shadow-inner">
    <img src={imageUrl} alt={name} className="w-24 h-24 rounded-full mb-4 object-cover" />
    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
    <p className="text-blue-600 font-medium">{role}</p>
  </div>
);

const AboutUsPage = () => {
  const teamMembers = [
    { name: "Vipul Patil", role: "Co-Founder & CEO", imageUrl: "/vipul.png" },
    { name: "Athrava Rane", role: "Co-Founder & CTO", imageUrl: "/athrv.png" },
    { name: "Sahil Patil", role: "Lead Blockchain Dev", imageUrl: "/Sahil.png" },
    { name: "Srujan Boolewar", role: "Head of Marketing", imageUrl: "https://via.placeholder.com/150/FFFF00/000000?text=C" },
  ];

  return (
    <div className="container mx-auto max-w-7xl py-12">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white p-12 md:p-20 rounded-lg shadow-lg text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Our Vision: A New Era of Land Ownership
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          We are a team of innovators dedicated to building a transparent, secure, and efficient
          land registration ecosystem on the blockchain.
        </p>
      </section>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Our mission is to eliminate fraud and bureaucracy in property transactions by leveraging the power of
              decentralized technology. We believe that every land record should be immutable,
              publicly verifiable, and accessible to everyone.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We provide a modern, reliable system that ensures trust and fairness in every transaction,
              empowering both individuals and governments.
            </p>
          </div>
          <div>
            <img 
              src="https://via.placeholder.com/600x400" 
              alt="Mission illustration" 
              className="w-full rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} {...member} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-blue-600 text-white p-12 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Experience the future of land ownership today. Connect your wallet and join our secure platform.
        </p>
        <Link 
          to="/" 
          className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          Connect Wallet
        </Link>
      </section>
    </div>
  );
};

export default AboutUsPage;