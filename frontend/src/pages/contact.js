import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <PublicNavbar />
      
      <main className="pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/2">
               <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic mb-12 animate-in slide-in-from-left duration-700">
                Contactez-<span className="text-[#31a7df] text-6xl lg:text-8xl block">Nous</span>
              </h1>
              <p className="text-xl text-gray-500 font-medium mb-12 max-w-lg leading-relaxed animate-in fade-in duration-1000 delay-300">
                Vous avez une question ou besoin d'aide ? Notre équipe est là pour vous répondre dans les plus brefs délais.
              </p>
              
                 <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></div>
                    <span className="font-black tracking-tight text-lg">Amir Maalaoui</span>
                 </div>
                 <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df]"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg></div>
                    <span className="font-black tracking-tighter text-lg">amir.maalaoui27@gmail.com</span>
                 </div>
                 <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#31a7df]"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg></div>
                    <span className="font-black tracking-tighter text-lg">+216 93379344</span>
                 </div>

            </div>
            
            <div className="lg:w-1/2 animate-in fade-in zoom-in duration-1000 delay-500">
               <form className="bg-white p-12 rounded-[50px] shadow-2xl shadow-gray-100 border border-gray-50 flex flex-col gap-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Prénom</label>
                       <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-900" placeholder="Jean" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Nom</label>
                       <input type="text" className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-900" placeholder="Dupont" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Email</label>
                     <input type="email" className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-900" placeholder="jean.dupont@email.com" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Message</label>
                     <textarea rows="4" className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-900 resize-none" placeholder="Votre message ici..."></textarea>
                  </div>
                  <button type="submit" className="bg-[#31a7df] text-white py-6 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-[#2596d1] transition-all hover:shadow-xl active:scale-95 mt-4">Envoyer le message</button>
               </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
