import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FiMail, FiLock, FiEye, FiEyeOff, FiDollarSign } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PopupMessage from '../components/PopupMessage';
import { SUCCESS_MESSAGES } from '../config/messages';
import { validateEmail, validatePassword } from '../utils/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, message: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const location = useLocation();
  const signupSuccess = location.state?.message;
  const signupEmail = location.state?.email;

  useEffect(() => {
    if (signupSuccess) {
      setPopup({
        visible: true,
        message: signupEmail
          ? SUCCESS_MESSAGES.welcomeBack
          : SUCCESS_MESSAGES.loginRedirect,
        type: 'success'
      });
      if (signupEmail) {
        setEmail(signupEmail);
      }
    }
  }, [signupSuccess, signupEmail]);

  const handleError = (errorMessage) => {
    setPopup({
      visible: true,
      message: errorMessage,
      type: 'error'
    });
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setValidationErrors({
      email: emailError,
      password: passwordError
    });

    return !emailError && !passwordError;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setValidationErrors(prev => ({ ...prev, email: validateEmail(email) }));
    } else if (field === 'password') {
      setValidationErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      const errorMessages = {
        'auth/invalid-email': 'Invalid email format',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/invalid-login-credentials': 'Invalid login credentials',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later',
        'auth/network-request-failed': 'Network error. Please check your connection',
      };

      const errorMessage = errorMessages[error.code] || 'An error occurred. Please try again.';

      setPopup({
        visible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === 'email') {
      setEmail(value);
      if (touched.email) {
        setValidationErrors(prev => ({
          ...prev,
          email: validateEmail(value)
        }));
      }
    } else if (field === 'password') {
      setPassword(value);
      if (touched.password) {
        setValidationErrors(prev => ({
          ...prev,
          password: validatePassword(value)
        }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <PopupMessage {...popup} onClose={() => setPopup(prev => ({ ...prev, visible: false }))} />
      {error && <PopupMessage visible={true} message={error} type="error" onClose={() => setError('')} />}

      {/* Decorative background pattern */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(15 23 42 / 0.04)\'%3E%3Path d=\'M0 .5H31.5V32\'/%3E%3C/svg%3E")' }}>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 transform transition-all hover:scale-[1.01]">
          <div className="flex flex-col items-center mb-8">
            {/* Replace the existing app icon */}
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform hover:rotate-12 transition-transform duration-300">
              <FiDollarSign className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Expense Tracker
            </h1>
            <p className="mt-2 text-gray-600">Welcome back! Please sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className={`block w-full pl-10 px-4 py-3 border rounded-xl text-gray-900 
                    placeholder:text-gray-400 transition-all bg-white/50 hover:bg-white focus:bg-white
                    ${touched.email && validationErrors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-indigo-500'
                    } focus:ring-2 focus:border-transparent`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => handleInputChange(e, 'email')}
                  onBlur={() => handleBlur('email')}
                />
                {touched.email && validationErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`block w-full pl-10 pr-12 px-4 py-3 border rounded-xl text-gray-900 
                    placeholder:text-gray-400 transition-all bg-white/50 hover:bg-white focus:bg-white
                    ${touched.password && validationErrors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-indigo-500'
                    } focus:ring-2 focus:border-transparent`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => handleInputChange(e, 'password')}
                  onBlur={() => handleBlur('password')}
                />
                {touched.password && validationErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner text={SUCCESS_MESSAGES.loggingIn} white={true} />
              ) : (
                'Sign in'
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;