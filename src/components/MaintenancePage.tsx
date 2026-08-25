import React from 'react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Logo with pulse animation */}
                <div className="flex justify-center mb-12 animate-pulse">
                    <img
                        src="/khealth-logo.webp"
                        alt="KHealth Logo"
                        className="h-24 md:h-32 w-auto object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Main card with floating animation */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-yellow-400 relative overflow-hidden animate-float">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-transparent to-yellow-100 opacity-50 animate-shimmer"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-yellow-400 p-6 rounded-full shadow-lg">
                                <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Message */}
                        <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-4">
                            Приемането на поръчки за този клуб е временно преустановено
                        </h1>

                        <p className="text-center text-slate-600 text-lg">
                            Благодарим за разбирането!
                        </p>
                    </div>

                    {/* Decorative dots */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default MaintenancePage;