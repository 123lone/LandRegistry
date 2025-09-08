import React from 'react';

const faqData = [
  {
    question: "What is a blockchain-based land registry?",
    answer: "It's a system that uses blockchain technology to store land ownership records. This makes the records permanent, secure, and transparent, as they cannot be altered without consensus from the network."
  },
  {
    question: "How does it prevent fraud?",
    answer: "Every transaction is recorded as an immutable block on the chain. This means once a record is created, it's virtually impossible to change or delete, preventing common forms of fraud like document forgery."
  },
  {
    question: "How are documents stored?",
    answer: "Documents like deeds and legal papers are stored on a decentralized file system like IPFS (InterPlanetary File System), and only a unique hash of the document is stored on the blockchain. This keeps the blockchain efficient while ensuring document integrity."
  },
  {
    question: "What is the role of a Land Inspector?",
    answer: "A Land Inspector is a verified authority who manually reviews and approves user profiles and land documents before they are permanently recorded on the blockchain."
  },
];

const FAQPage = () => {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Frequently Asked Questions</h1>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {faqData.map((item, index) => (
          <div key={index} className="border-b pb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.question}</h3>
            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;