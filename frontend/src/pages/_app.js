import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}

import PublicNavbar from '../components/PublicNavbar';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const publicRoutes = ['/', '/about', '/contact', '/services', '/login', '/register-admin'];
  const isPublicRoute = publicRoutes.includes(router.pathname) || router.pathname.startsWith('/event/');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicNavbar />
        <main className={`${isPublicRoute ? '' : 'pt-20'}`}>
          {isPublicRoute ? (
            <Component {...pageProps} />
          ) : (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          )}
        </main>
      </div>
    </AuthProvider>
  );
}
