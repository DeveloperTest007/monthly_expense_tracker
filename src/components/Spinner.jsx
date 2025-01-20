const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-300'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className={`w-full h-full rounded-full border-2 border-t-transparent ${colorClasses[color]}`}></div>
    </div>
  );
};

export default Spinner;
