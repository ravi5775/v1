
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-inner mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Sri Vinayaka Tenders. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
