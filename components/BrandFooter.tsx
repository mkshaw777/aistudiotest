import React from 'react';

const BrandFooter: React.FC = () => {
  return (
    <footer className="bg-slate-100 text-center text-sm text-mk-gray-text p-4 border-t mt-auto">
      <div className="container mx-auto">
        © {new Date().getFullYear()} MK Marketing. All rights reserved.
      </div>
    </footer>
  );
};

export default BrandFooter;
