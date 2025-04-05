type SpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
};

const Spinner = ({ 
  size = 'medium', 
  color = 'primary' 
}: SpinnerProps) => {
  const sizeClasses = {
    small: 'w-4 h-4 border',
    medium: 'w-6 h-6 border-2',
    large: 'w-10 h-10 border-3'
  };
  
  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    success: 'border-green-500', 
    danger: 'border-red-500'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-t-transparent 
        rounded-full 
        animate-spin
      `} />
      
      {size === 'large' && (
        <div className={`
          absolute w-6 h-6 
          ${colorClasses[color]}
          border-t-transparent border-2
          rounded-full animate-spin
          opacity-60
        `} style={{ animationDirection: 'reverse' }} />
      )}
    </div>
  );
};

export default Spinner;
