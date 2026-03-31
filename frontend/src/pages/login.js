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
      <div className="min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 bg-white flex">
        
        {/* Left Side: Image */}
        <div className="hidden lg:flex w-1/2 bg-blue-50/50 flex-col items-center justify-center relative overflow-hidden p-12 pt-24 border-r border-blue-100/50">
           <div className="absolute top-0 right-0 w-full h-full bg-blue-600/5 z-0"></div>
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl z-0"></div>
           <img src="/login.svg" alt="EventPro Login" className="relative z-10 w-full max-w-lg object-contain animate-in fade-in zoom-in-95 duration-1000 drop-shadow-2xl flex-1" />
           
           <div className="relative z-10 text-center mt-12 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-blue-950 mb-4 italic">Bienvenue sur EventPro</h2>
              <p className="text-blue-800/70 font-medium max-w-md mx-auto leading-relaxed">La plateforme complète pour organiser, gérer et suivre vos événements et vos biens en toute simplicité.</p>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 pt-28 lg:pt-20 min-h-screen overflow-y-auto">
          <div className="w-full max-w-md relative my-auto">
            
            <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl shadow-blue-100/50 border border-gray-100 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Mode Toggle - Only show for LOGIN and REGISTER modes */}
            {mode !== 'FORGOT_PASSWORD' && (
              <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 border border-gray-100">
                 <button 
                   onClick={() => { setMode('LOGIN'); setError(''); setSuccessMsg(''); }}
                   className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'LOGIN' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   Connexion
                 </button>
                 <button 
                   onClick={() => { setMode('REGISTER_CLIENT'); setError(''); setSuccessMsg(''); }}
                   className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'REGISTER_CLIENT' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   Inscription
                 </button>
              </div>
            )}

            <div className="text-center mb-8">
               <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">
                 {mode === 'LOGIN' ? 'Bon retour' : 
                  mode === 'REGISTER_CLIENT' ? 'Créer un compte' : 
                  mode === 'REGISTER_ADMIN' ? 'Compte Admin' : 
                  'Mot de passe oublié'}
               </h2>
               <p className="text-gray-400 font-medium text-sm">
                 {mode === 'LOGIN' 
                   ? 'Accédez à votre espace Eventify Pro' 
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
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-3 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-100 text-green-700 p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {successMsg}
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Identifiant / Email</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900"
                    placeholder="nom.utilisateur ou email"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Mot de Passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 mt-4"
                >
                  {loading ? 'Connexion en cours...' : 'Se Connecter'}
                </button>
                
                {/* Lien mot de passe oublié */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT_PASSWORD'); setError(''); setSuccessMsg(''); }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER CLIENT FORM */}
            {mode === 'REGISTER_CLIENT' && (
              <form onSubmit={handleRegisterClientSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="jean.dupont@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="+216 XX XXX XXX"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Mot de Passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg mt-4 disabled:opacity-50"
                >
                  {loading ? 'Création en cours...' : 'Créer mon compte Client'}
                </button>
                
                <div className="text-center mt-6">
                   <button 
                     type="button"
                     onClick={() => { setMode('REGISTER_ADMIN'); setError(''); setSuccessMsg(''); }}
                     className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
                   >
                     Devenir Administrateur à la place ?
                   </button>
                </div>
              </form>
            )}

            {/* REGISTER ADMIN FORM */}
            {mode === 'REGISTER_ADMIN' && (
              <form onSubmit={handleRegisterAdminSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="jean.dupont@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="j.dupont"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Mot de Passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg mt-4 disabled:opacity-50"
                >
                  {loading ? 'Soumission...' : 'Demander l\'accès Admin'}
                </button>
                
                <div className="text-center mt-6">
                   <button 
                     type="button"
                     onClick={() => { setMode('REGISTER_CLIENT'); setError(''); setSuccessMsg(''); }}
                     className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        forgotPasswordStep >= stepNumber 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div className={`w-12 h-1 mx-2 ${
                          forgotPasswordStep > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Étape 1: Email */}
                {forgotPasswordStep === 1 && (
                  <form onSubmit={handleRequestCode} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Adresse email</label>
                      <input
                        type="email"
                        value={forgotPasswordData.email}
                        onChange={(e) => handleForgotPasswordInputChange('email', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900"
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                    >
                      {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                    </button>
                  </form>
                )}

                {/* Étape 2: Code */}
                {forgotPasswordStep === 2 && (
                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Code de vérification</label>
                      <input
                        type="text"
                        value={forgotPasswordData.code}
                        onChange={(e) => handleForgotPasswordInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-center text-2xl tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Saisissez le code à 6 chiffres envoyé à {forgotPasswordData.email}
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || forgotPasswordData.code.length !== 6}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                    >
                      {loading ? 'Vérification...' : 'Vérifier le code'}
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
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => handleForgotPasswordInputChange('newPassword', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                        placeholder="Nouveau mot de passe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) => handleForgotPasswordInputChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 text-sm"
                        placeholder="Confirmer le mot de passe"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg mt-4 disabled:opacity-50"
                    >
                      {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
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
