interface AvatarDisplayProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
};

export function AvatarDisplay({ name, photoUrl, size = 'md' }: AvatarDisplayProps) {
  const initial = name.charAt(0).toUpperCase();

  if (photoUrl) {
    return <img src={photoUrl} alt={name} className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`} />;
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0 bg-primary text-primary-foreground`}>
      {initial}
    </div>
  );
}
