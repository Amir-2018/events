export default function EventImage({ src, alt, className, ...props }) {
  // Si l'image est en base64, l'utiliser directement
  if (src && src.startsWith('data:image')) {
    return (
      <img 
        src={src} 
        alt={alt}
        className={className}
        onError={(e) => {
          console.warn('Erreur de chargement d\'image base64');
          e.target.style.display = 'none';
        }}
        {...props}
      />
    );
  }
  
  // Si c'est une URL classique, l'utiliser aussi
  if (src && src.startsWith('http')) {
    return (
      <img 
        src={src} 
        alt={alt}
        className={className}
        onError={(e) => {
          console.warn('Erreur de chargement d\'image URL');
          e.target.style.display = 'none';
        }}
        {...props}
      />
    );
  }
  
  // Si pas d'image, afficher un placeholder
  return (
    <div 
      className={`bg-gray-200 flex items-center justify-center ${className}`}
      {...props}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className="w-8 h-8 text-gray-400"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" 
        />
      </svg>
    </div>
  );
}