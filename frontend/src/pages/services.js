import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function ServicesPage() {
  const services = [
    { title: "Gestion d'Événements", desc: "Configuration complète, gestion des dates, lieux et types d'événements." },
    { title: "Gestion des Biens", desc: "Suivi détaillé de vos salles, équipements et ressources matérielles." },
    { title: "Suivi des Participants", desc: "Gestion des inscriptions, listes d'attente et communications." },
    { title: "Analyses & Rapports", desc: "Rapports détaillés sur la fréquentation et l'utilisation des ressources." },
    { title: "Interface Admin", desc: "Outils d'administration puissants pour contrôler tous les accès." },
    { title: "Support Dédié", desc: "Une équipe à votre écoute pour vous accompagner dans vos projets." }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <PublicNavbar />
      
      <main className="pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-12 animate-in slide-in-from-bottom duration-700">
            Nos <span className="text-[#31a7df]">Services</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20 animate-in fade-in duration-1000 delay-300 text-left">
            {services.map((service, i) => (
              <div key={i} className="group p-10 bg-gray-50 rounded-[40px] border border-gray-100 hover:bg-[#31a7df] hover:-translate-y-2 transition-all shadow-sm hover:shadow-2xl hover:shadow-gray-200">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors">{service.title}</h3>
                <p className="text-gray-500 group-hover:text-blue-50 transition-colors leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
