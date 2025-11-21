import React from 'react';

const BrandHeader: React.FC = () => {
  return (
    <header className="bg-mk-blue-primary text-white shadow-md p-4 sticky top-0 z-40">
      <div className="container mx-auto flex justify-center items-center">
        <h1 className="text-2xl font-bold">MK Marketing</h1>
      </div>
    </header>
  );
};

export default BrandHeader;
