import { createContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../api/auth';

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_INIT': return { ...state, user: action.payload, status: 'idle' };
    case 'AUTH_LOADING': return { ...state, status: 'loading' };
    case 'AUTH_SUCCESS': return { user: action.payload, status: 'success' };
    case 'AUTH_ERROR': return { ...state, status: 'error', error: action.payload };
    case 'AUTH_LOGOUT': return { user: null, status: 'idle', error: null };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null, status: 'idle', error: null });

  useEffect(() => {
    const initAuth = async () => {
      if (!authService.token) return;
      dispatch({ type: 'AUTH_LOADING' });
      try {
        const user = await authService.fetchUser();
        dispatch({ type: 'AUTH_INIT', payload: user });
      } catch {
        authService.clearToken();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };
    initAuth();
  }, []);

  const authenticate = useCallback(async (credentials, isLogin = true) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const data = isLogin
        ? await authService.signin(credentials)
        : await authService.signup(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user || data });
      return data;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  const deauthenticate = useCallback(async () => {
    await authService.signout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={{ authenticate, deauthenticate }}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error('useAuthState must be used within AuthProvider');
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) throw new Error('useAuthDispatch must be used within AuthProvider');
  return context;
};
