interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textStyle?: 'horizontal' | 'vertical';
}

export default function Logo({ size = 'md', showText = true, textStyle = 'horizontal' }: LogoProps) {
  const sizes = {
    sm: { container: 'w-10 h-10', heart: 'w-3 h-3', text: 'text-xl' },
    md: { container: 'w-16 h-16', heart: 'w-4 h-4', text: 'text-3xl' },
    lg: { container: 'w-20 h-20', heart: 'w-5 h-5', text: 'text-4xl' },
    xl: { container: 'w-32 h-32', heart: 'w-8 h-8', text: 'text-6xl' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex ${textStyle === 'horizontal' ? 'flex-row items-center gap-4' : 'flex-col items-center gap-2'}`}>
      <div className={`${currentSize.container} bg-white rounded-full flex items-center justify-center shadow-lg relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-3">
          <path
            d="M50 35 C45 35 40 30 40 25 C40 20 45 15 50 20 C55 15 60 20 60 25 C60 30 55 35 50 35 Z"
            fill="#F7838D"
          />

          <circle cx="35" cy="50" r="12" fill="#F7838D" />
          <circle cx="65" cy="50" r="12" fill="#F7838D" />

          <ellipse cx="35" cy="75" rx="18" ry="20" fill="#F7838D" />
          <ellipse cx="65" cy="75" rx="22" ry="25" fill="#F7838D" />
        </svg>
      </div>

      {showText && (
        <div className={textStyle === 'horizontal' ? '' : 'text-center'}>
          <h1 className={`${currentSize.text} font-bold text-brand-coral tracking-wide`} style={{ fontFamily: "'Tan Nimbus', sans-serif" }}>
            Long Link
          </h1>
          {size !== 'sm' && (
            <p className="text-brand-coral/70 italic text-sm" style={{ fontFamily: "'ARIMO', sans-serif" }}>
              Love That Travels With You
            </p>
          )}
        </div>
      )}
    </div>
  );
}
