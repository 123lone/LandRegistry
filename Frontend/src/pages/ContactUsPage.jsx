import React from 'react';

const ContactUsPage = () => {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Contact Us</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          If you have any questions or need support, please reach out to us using the form below.
        </p>
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea id="message" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Send Message</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUsPage;