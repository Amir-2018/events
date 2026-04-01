import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative overflow-hidden flex flex-col">
   
      
      <PublicNavbar />
      
      <main className="pt-40 pb-20 relative z-10 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/2">
               <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-12 animate-in slide-in-from-left duration-700">
                Contactez-<span className="text-[#31a7df] text-6xl lg:text-8xl block">Nous</span>
              </h1>
              <p className="text-xl text-gray-500 font-medium mb-12 max-w-lg leading-relaxed animate-in fade-in duration-1000 delay-300">
                Vous avez une question ou besoin d'aide ? Notre équipe est là pour vous répondre dans les plus brefs délais.
              </p>
              
                 <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df] group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></div>
                    <span className="font-black tracking-tight text-lg group-hover:text-[#31a7df] transition-colors">Amir Maalaoui</span>
                 </div>
                 <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df] group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg></div>
                    <span className="font-black tracking-tighter text-lg group-hover:text-[#31a7df] transition-colors">amir.maalaoui27@gmail.com</span>
                 </div>
                 <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg hover:scale-105 transition-all group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df] group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg></div>
                    <span className="font-black tracking-tighter text-lg group-hover:text-[#31a7df] transition-colors">+216 93379344</span>
                 </div>

            </div>
            
            <div className="lg:w-1/2 animate-in fade-in zoom-in duration-1000 delay-500">
               <form className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-500 flex flex-col gap-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Contactez-nous</h2>
                    <p className="text-gray-600 text-sm">Nous sommes là pour vous aider</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Prénom</label>
                       <input type="text" className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm hover:border-[#31a7df]/50" placeholder="Jean" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Nom</label>
                       <input type="text" className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm hover:border-[#31a7df]/50" placeholder="Dupont" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Email</label>
                     <input type="email" className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm hover:border-[#31a7df]/50" placeholder="jean.dupont@email.com" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Message</label>
                     <textarea rows="4" className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm resize-none hover:border-[#31a7df]/50" placeholder="Votre message ici..."></textarea>
                  </div>
                  <button type="submit" className="w-full text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 mt-4 group relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <i className="fas fa-paper-plane group-hover:scale-110 transition-transform"></i>
                      Envoyer le message
                    </span>
                  </button>
               </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
