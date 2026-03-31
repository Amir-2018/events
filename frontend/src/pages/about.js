import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <PublicNavbar />
      
      <main className="pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-12 animate-in slide-in-from-left duration-700">
            À propos de <span className="text-blue-600">Nous</span>
          </h1>
          
          <div className="prose prose-xl prose-blue max-w-none text-gray-500 font-medium leading-relaxed space-y-8 animate-in fade-in duration-1000 delay-300">
            <p>
              Bienvenue chez <span className="text-gray-900 font-black italic">EventPro</span>. Nous sommes dédiés à fournir les meilleures solutions de gestion d'événements pour les professionnels et les organisations.
            </p>
            <p>
              Notre plateforme est conçue pour simplifier chaque aspect de l'organisation d'événements, de la planification initiale au suivi des résultats, en passant par la gestion des biens et des participants.
            </p>
              <div className="bg-gray-50 p-12 rounded-[40px] border border-gray-100 mt-12">
               <h3 className="text-gray-900 text-3xl font-black uppercase tracking-tight mb-6 italic">Notre Mission</h3>
               <p className="text-lg">
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
