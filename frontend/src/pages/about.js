import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-5 animate-spin" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '20s' }}></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-10 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '8s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-3 animate-ping" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '15s' }}></div>
        <div className="absolute top-40 left-40 w-20 h-20 rounded-full opacity-15 animate-bounce" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 right-40 w-32 h-32 rounded-full opacity-8 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '6s' }}></div>
      </div>
      
      <PublicNavbar />
      
      <main className="pt-40 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-12 animate-in slide-in-from-left duration-700">
            À propos de <span className="text-[#31a7df]">Nous</span>
          </h1>
          
          <div className="prose prose-xl prose-blue max-w-none text-gray-500 font-medium leading-relaxed space-y-8 animate-in fade-in duration-1000 delay-300">
            <p>
              Bienvenue chez <span className="text-gray-900 font-black italic">EventPro</span>. Nous sommes dédiés à fournir les meilleures solutions de gestion d'événements pour les professionnels et les organisations.
            </p>
            <p>
              Notre plateforme est conçue pour simplifier chaque aspect de l'organisation d'événements, de la planification initiale au suivi des résultats, en passant par la gestion des biens et des participants.
            </p>
              <div className="bg-gray-50 p-12 rounded-[40px] border border-gray-100 mt-12 hover:shadow-xl transition-all group">
               <h3 className="text-gray-900 text-3xl font-black uppercase tracking-tight mb-6 italic group-hover:text-[#31a7df] transition-colors">Notre Mission</h3>
               <p className="text-lg group-hover:scale-105 transition-transform">
                 Offrir une expérience utilisateur exceptionnelle et des outils puissants pour transformer vos idées en événements mémorables et réussis.
               </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
