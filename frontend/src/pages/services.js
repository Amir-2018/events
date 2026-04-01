import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function ServicesPage() {
  const services = [
    { 
      title: "Gestion d'Événements", 
      desc: "Configuration complète, gestion des dates, lieux et types d'événements avec interface intuitive.", 
      icon: "fas fa-calendar-alt",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Gestion des Biens", 
      desc: "Suivi détaillé de vos salles, équipements et ressources matérielles en temps réel.", 
      icon: "fas fa-building",
      color: "from-green-500 to-green-600"
    },
    { 
      title: "Suivi des Participants", 
      desc: "Gestion des inscriptions, listes d'attente et communications automatisées.", 
      icon: "fas fa-users",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Analyses & Rapports", 
      desc: "Rapports détaillés sur la fréquentation et l'utilisation des ressources avec graphiques.", 
      icon: "fas fa-chart-line",
      color: "from-orange-500 to-orange-600"
    },
    { 
      title: "Interface Admin", 
      desc: "Outils d'administration puissants pour contrôler tous les accès et permissions.", 
      icon: "fas fa-shield-alt",
      color: "from-red-500 to-red-600"
    },
    { 
      title: "Support Dédié", 
      desc: "Une équipe à votre écoute 24/7 pour vous accompagner dans tous vos projets.", 
      icon: "fas fa-headset",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const features = [
    {
      title: "Interface Moderne",
      desc: "Design épuré et intuitif pour une expérience utilisateur optimale",
      icon: "fas fa-palette"
    },
    {
      title: "Temps Réel",
      desc: "Synchronisation instantanée de toutes les données et notifications",
      icon: "fas fa-bolt"
    },
    {
      title: "Sécurisé",
      desc: "Protection avancée des données avec chiffrement et sauvegardes",
      icon: "fas fa-lock"
    },
    {
      title: "Mobile First",
      desc: "Optimisé pour tous les appareils, smartphone, tablette et desktop",
      icon: "fas fa-mobile-alt"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-4 animate-spin" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '25s' }}></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full opacity-6 animate-pulse" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '8s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full opacity-3 animate-ping" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '15s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 rounded-full opacity-8 animate-bounce" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)', animationDuration: '6s' }}></div>
      </div>
      
      <PublicNavbar />
      
      <main className="pt-40 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-8 animate-in slide-in-from-bottom duration-700">
              Nos <span className="text-[#31a7df]">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
              EventPro vous offre une suite complète d'outils pour gérer vos événements de A à Z. 
              De la planification à l'analyse des résultats, nous vous accompagnons à chaque étape.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 animate-in fade-in duration-1000 delay-500">
            {services.map((service, i) => (
              <div key={i} className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, #31a7df 0%, #2596d1 100%)` }}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${service.icon} text-2xl text-white`}></i>
                  </div>
                  
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-[#31a7df] transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-gray-50 rounded-[50px] p-12 lg:p-16 mb-20 animate-in fade-in duration-1000 delay-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tight mb-4">
                Pourquoi Choisir <span className="text-[#31a7df]">EventPro</span> ?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Notre plateforme combine innovation technologique et simplicité d'utilisation pour vous offrir la meilleure expérience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="text-center group">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                    <i className={`${feature.icon} text-2xl text-[#31a7df] group-hover:scale-110 transition-transform`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#31a7df] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-br from-[#31a7df] to-[#2596d1] rounded-[50px] p-12 lg:p-16 text-white animate-in fade-in duration-1000 delay-900">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-6">
              Prêt à Commencer ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'organisateurs qui font confiance à EventPro pour leurs événements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/login" 
                className="bg-white text-[#31a7df] px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-rocket"></i>
                Commencer Gratuitement
              </a>
              <a 
                href="/contact" 
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#31a7df] transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-phone"></i>
                Nous Contacter
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
