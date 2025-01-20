import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import { setLoading, setUser, setError } from '../store/slices/authSlice';
import PopupMessage from '../components/PopupMessage';
import { FiUser, FiPhone, FiMail, FiLock, FiDollarSign, FiEye, FiEyeOff } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { SUCCESS_MESSAGES } from '../config/messages';
import TransitionSpinner from '../components/common/TransitionSpinner';

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'This email is already registered. Please try logging in instead.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'permission-denied': 'Unable to create user profile. Please try again.',
  'firebase/permission-denied': 'Unable to create user profile. Please try again.',
  'default': 'An error occurred during sign up. Please try again.'
};

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [popup, setPopup] = useState({ visible: false, message: '', type: '' });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const validatePasswords = (pass, confirmPass) => {
    return pass === confirmPass;
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordMatch(validatePasswords(password, confirmPass));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !fullName || !phone) {
      setPopup({
        visible: true,
        message: 'All fields are required to create your account',
        type: 'error'
      });
      return;
    }

    if (password.length < 6) {
      setPopup({
        visible: true,
        message: 'Password must be at least 6 characters long for security',
        type: 'error'
      });
      return;
    }

    if (!validatePasswords(password, confirmPassword)) {
      setPopup({
        visible: true,
        message: 'Password confirmation does not match. Please check and try again',
        type: 'error'
      });
      return;
    }

    try {
      dispatch(setLoading(true));
      setPopup({
        visible: true,
        message: SUCCESS_MESSAGES.creating,
        type: 'info'
      });

      // 1. Create authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Auth user created:', user.uid);

      // 2. Prepare user data
      const userData = {
        uid: user.uid,
        fullName,
        email,
        phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 3. Save to Firestore with explicit error handling
      try {
        console.log('Attempting to save user data:', userData);
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        console.log('User data saved successfully');

        // 4. Update Redux store
        dispatch(setUser(userData));

        // 5. Show success message
        setPopup({
          visible: true,
          message: SUCCESS_MESSAGES.accountCreated,
          type: 'success'
        });

        // 6. Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');

        // 7. Navigate to login
        setIsRedirecting(true);
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: SUCCESS_MESSAGES.loginRedirect,
              email: user.email
            }
          });
        }, 2000);

      } catch (firestoreError) {
        console.error('Firestore Error:', firestoreError);
        // Handle specific Firestore errors
        let errorMessage = 'Failed to save user data. Please try again.';
        
        if (firestoreError.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please check your database rules.';
        }
        
        setPopup({
          visible: true,
          message: errorMessage,
          type: 'error'
        });
      }

    } catch (authError) {
      console.error('Auth Error:', authError);
      const errorMessage = ERROR_MESSAGES[authError.code] || ERROR_MESSAGES.default;
      dispatch(setError(errorMessage));
      setPopup({
        visible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 px-4">
      {isRedirecting && <TransitionSpinner message="Redirecting to login..." />}
      <PopupMessage {...popup} onClose={() => setPopup(prev => ({ ...prev, visible: false }))} />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
              <FiDollarSign className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Start managing your expenses today
          </p>
        </div>

        <div className="backdrop-blur-sm bg-white/80 p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Full Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Phone Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
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

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm Password"
                  className={`block w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 transition-all duration-200 ${
                    !passwordMatch && confirmPassword 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-indigo-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors" />
                  )}
                </button>
                {!passwordMatch && confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 animate-pulse">Passwords do not match</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <LoadingSpinner text={SUCCESS_MESSAGES.creating} white={true} />
                ) : (
                  'Create Account'
                )}
              </div>
            </button>
          </form>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
