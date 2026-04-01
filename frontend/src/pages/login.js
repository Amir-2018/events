import { useState } from 'react';
import { authAPI, passwordResetAPI } from '../lib/api';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import PublicNavbar from '../components/PublicNavbar';

export default function Login() {
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN', 'REGISTER_CLIENT', 'REGISTER_ADMIN', 'FORGOT_PASSWORD'
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '',
    nom: '',
    prenom: '',
    email: '',
    tel: ''
  });
  
  // Forgot password specific state
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: code, 3: new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleForgotPasswordInputChange = (field, value) => {
    setForgotPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        email: formData.username,
        password: formData.password
      });
      
      const { token, user: userData } = response.data.data;
      login(token, userData);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await authAPI.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        tel: formData.tel,
        password: formData.password
      });
      
      setSuccessMsg('Compte client créé avec succès. Vous pouvez maintenant vous connecter.');
      setTimeout(() => setMode('LOGIN'), 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await authAPI.registerAdmin({
        username: formData.username,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      });
      
      setSuccessMsg('Compte administrateur créé avec succès. En attente d\'approbation.');
      setTimeout(() => setMode('LOGIN'), 4000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription admin');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await passwordResetAPI.requestReset(forgotPasswordData.email);
      setSuccessMsg('Un code de vérification a été envoyé à votre adresse email');
      setForgotPasswordStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await passwordResetAPI.verifyCode(forgotPasswordData.email, forgotPasswordData.code);
      setSuccessMsg('Code vérifié avec succès');
      setForgotPasswordStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      await passwordResetAPI.resetPassword(forgotPasswordData.email, forgotPasswordData.code, forgotPasswordData.newPassword);
      setSuccessMsg('Mot de passe réinitialisé avec succès');
      
      // Retourner au mode login après 2 secondes
      setTimeout(() => {
        setMode('LOGIN');
        setForgotPasswordStep(1);
        setForgotPasswordData({ email: '', code: '', newPassword: '', confirmPassword: '' });
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className="min-h-screen font-sans selection:bg-blue-50 selection:text-blue-900 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex relative overflow-hidden">
        
    

        {/* Left Side: Branding */}
        <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative p-12 pt-24">
           <div className="relative z-10 text-center max-w-lg">
              {/* Logo */}
              <div className="mb-8">
                <Link href="/" className="block">
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl hover:scale-105 transition-transform cursor-pointer" style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold mb-2 hover:scale-105 transition-transform cursor-pointer" style={{ color: '#31a7df' }}>EventPro</h1>
                </Link>
                <p className="text-sm font-medium text-gray-600">Plateforme de gestion d'événements</p>
              </div>

              {/* Features */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4 text-left group hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <i className="fas fa-calendar-alt text-[#31a7df] group-hover:scale-110 transition-transform"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Gestion d'événements</h3>
                    <p className="text-xs text-gray-600">Créez et gérez vos événements facilement</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left group hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <i className="fas fa-users text-green-600 group-hover:scale-110 transition-transform"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Gestion des participants</h3>
                    <p className="text-xs text-gray-600">Suivez les inscriptions et les invitations</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left group hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <i className="fas fa-building text-purple-600 group-hover:scale-110 transition-transform"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Gestion des biens</h3>
                    <p className="text-xs text-gray-600">Organisez vos lieux et salles</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all group">
                <div className="text-center group-hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold animate-pulse" style={{ color: '#31a7df', animationDuration: '2s' }}>500+</div>
                  <div className="text-xs text-gray-600">Événements</div>
                </div>
                <div className="text-center group-hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold animate-pulse" style={{ color: '#31a7df', animationDuration: '2.5s' }}>1K+</div>
                  <div className="text-xs text-gray-600">Utilisateurs</div>
                </div>
                <div className="text-center group-hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold animate-pulse" style={{ color: '#31a7df', animationDuration: '3s' }}>50+</div>
                  <div className="text-xs text-gray-600">Lieux</div>
                </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 pt-28 lg:pt-20 min-h-screen overflow-y-auto relative z-10">
          <div className="w-full max-w-md relative my-auto">
            
            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Mode Toggle - Only show for LOGIN and REGISTER modes */}
            {mode !== 'FORGOT_PASSWORD' && (
              <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-8 border border-gray-200/50 backdrop-blur-sm">
                 <button 
                   onClick={() => { setMode('LOGIN'); setError(''); setSuccessMsg(''); }}
                   className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${mode === 'LOGIN' ? 'bg-white shadow-md text-white' : 'text-gray-500 hover:text-gray-700'}`}
                   style={mode === 'LOGIN' ? { background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' } : {}}
                 >
                   <i className="fas fa-sign-in-alt mr-2"></i>
                   Connexion
                 </button>
                 <button 
                   onClick={() => { setMode('REGISTER_CLIENT'); setError(''); setSuccessMsg(''); }}
                   className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${mode === 'REGISTER_CLIENT' ? 'bg-white shadow-md text-white' : 'text-gray-500 hover:text-gray-700'}`}
                   style={mode === 'REGISTER_CLIENT' ? { background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' } : {}}
                 >
                   <i className="fas fa-user-plus mr-2"></i>
                   Inscription
                 </button>
              </div>
            )}

            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                 {mode === 'LOGIN' ? 'Bon retour !' : 
                  mode === 'REGISTER_CLIENT' ? 'Créer un compte' : 
                  mode === 'REGISTER_ADMIN' ? 'Compte Admin' : 
                  'Mot de passe oublié'}
               </h2>
               <p className="text-gray-600 text-sm">
                 {mode === 'LOGIN' 
                   ? 'Accédez à votre espace EventPro' 
                   : mode === 'REGISTER_CLIENT' 
                       ? 'Rejoignez-nous en tant que client' 
                       : mode === 'REGISTER_ADMIN'
                         ? 'Demande d\'accès administrateur'
                         : forgotPasswordStep === 1 
                           ? 'Saisissez votre adresse email'
                           : forgotPasswordStep === 2
                             ? 'Vérifiez votre code'
                             : 'Nouveau mot de passe'}
               </p>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <i className="fas fa-exclamation-triangle text-red-500 flex-shrink-0"></i>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <i className="fas fa-check-circle text-green-500 flex-shrink-0"></i>
                {successMsg}
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Identifiant / Email</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm hover:border-[#31a7df]/50"
                    placeholder="nom.utilisateur ou email"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Mot de Passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-6 relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt group-hover:scale-110 transition-transform"></i>
                        Se Connecter
                      </>
                    )}
                  </span>
                </button>
                
                {/* Lien mot de passe oublié */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT_PASSWORD'); setError(''); setSuccessMsg(''); }}
                    className="text-[#31a7df] hover:text-[#2596d1] text-sm font-medium transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER CLIENT FORM */}
            {mode === 'REGISTER_CLIENT' && (
              <form onSubmit={handleRegisterClientSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="jean.dupont@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="+216 XX XXX XXX"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Mot de Passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-6 group"
                  style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus group-hover:scale-110 transition-transform"></i>
                        Créer mon compte Client
                      </>
                    )}
                  </span>
                </button>
                
                <div className="text-center mt-6">
                   <button 
                     type="button"
                     onClick={() => { setMode('REGISTER_ADMIN'); setError(''); setSuccessMsg(''); }}
                     className="text-xs font-medium text-gray-500 hover:text-[#31a7df] transition-colors"
                   >
                     Devenir Administrateur à la place ?
                   </button>
                </div>
              </form>
            )}

            {/* REGISTER ADMIN FORM */}
            {mode === 'REGISTER_ADMIN' && (
              <form onSubmit={handleRegisterAdminSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-400/20 focus:border-gray-600 outline-none transition-all font-medium text-gray-900 text-sm"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-400/20 focus:border-gray-600 outline-none transition-all font-medium text-gray-900 text-sm"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-400/20 focus:border-gray-600 outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="jean.dupont@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-400/20 focus:border-gray-600 outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="j.dupont"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Mot de Passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-gray-400/20 focus:border-gray-600 outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-6"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Soumission...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-shield"></i>
                        Demander l'accès Admin
                      </>
                    )}
                  </span>
                </button>
                
                <div className="text-center mt-6">
                   <button 
                     type="button"
                     onClick={() => { setMode('REGISTER_CLIENT'); setError(''); setSuccessMsg(''); }}
                     className="text-xs font-medium text-gray-500 hover:text-[#31a7df] transition-colors"
                   >
                     Retour à l'inscription Client
                   </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'FORGOT_PASSWORD' && (
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        forgotPasswordStep >= stepNumber 
                          ? 'text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      style={forgotPasswordStep >= stepNumber ? { background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' } : {}}
                      >
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div className={`w-12 h-1 mx-2 rounded-full transition-all ${
                          forgotPasswordStep > stepNumber ? 'bg-[#31a7df]' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Étape 1: Email */}
                {forgotPasswordStep === 1 && (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Adresse email</label>
                      <input
                        type="email"
                        value={forgotPasswordData.email}
                        onChange={(e) => handleForgotPasswordInputChange('email', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-medium text-gray-900 text-sm"
                        placeholder="votre@email.com"
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Un code de vérification sera envoyé à cette adresse
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-6"
                      style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Envoi...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i>
                            Envoyer le code
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                )}

                {/* Étape 2: Code */}
                {forgotPasswordStep === 2 && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Code de vérification</label>
                      <input
                        type="text"
                        value={forgotPasswordData.code}
                        onChange={(e) => handleForgotPasswordInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#31a7df]/20 focus:border-[#31a7df] outline-none transition-all font-bold text-gray-900 text-center text-xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        Saisissez le code à 6 chiffres envoyé à {forgotPasswordData.email}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || forgotPasswordData.code.length !== 6}
                      className="w-full text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-6"
                      style={{ background: 'linear-gradient(135deg, #31a7df 0%, #2596d1 100%)' }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Vérification...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check"></i>
                            Vérifier le code
                          </>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(1)}
                      className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                      ← Changer d'adresse email
                    </button>
                  </form>
                )}

                {/* Étape 3: Nouveau mot de passe */}
                {forgotPasswordStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => handleForgotPasswordInputChange('newPassword', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-400/20 focus:border-green-600 outline-none transition-all font-medium text-gray-900 text-sm"
                        placeholder="Nouveau mot de passe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 ml-1 mb-1 block">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) => handleForgotPasswordInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-400/20 focus:border-green-600 outline-none transition-all font-medium text-gray-900 text-sm"
                        placeholder="Confirmer le mot de passe"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-6"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Réinitialisation...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-key"></i>
                            Réinitialiser le mot de passe
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                )}

                {/* Retour à la connexion */}
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => { 
                      setMode('LOGIN'); 
                      setForgotPasswordStep(1); 
                      setForgotPasswordData({ email: '', code: '', newPassword: '', confirmPassword: '' });
                      setError(''); 
                      setSuccessMsg(''); 
                    }}
                    className="text-[#31a7df] hover:text-[#2596d1] font-medium text-sm transition-colors"
                  >
                    ← Retour à la connexion
                  </button>
                </div>
              </div>
            )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
