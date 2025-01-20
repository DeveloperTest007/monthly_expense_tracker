import { useEffect, Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { router } from './routes';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/Spinner';

const App = () => {
  const { loading } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Handle auth state changes if needed
      console.log('Auth state changed:', user ? 'logged in' : 'logged out');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex justify-center items-center">
          <Spinner size="lg" color="blue" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
