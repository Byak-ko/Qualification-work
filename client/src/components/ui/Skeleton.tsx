const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
    
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
    </div>
    
    <div className="pt-2 flex justify-between items-center">
      <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

export default SkeletonCard