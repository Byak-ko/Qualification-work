const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
  
  export default SkeletonCard