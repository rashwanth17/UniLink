import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await authService.getMe();
          
          if (response.success) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.data.user,
                token,
              },
            });
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          }
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ 
            type: 'AUTH_FAILURE', 
            payload: error.response?.data?.message || 'Authentication failed' 
          });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        toast.success('Login successful!');
        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message });
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        toast.success('Registration successful!');
        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message });
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (updateData) => {
    try {
      const response = await authService.updateProfile(updateData);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      const response = await authService.uploadAvatar(file);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { profilePicture: response.data.profilePicture },
        });
        toast.success('Profile picture updated successfully!');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Avatar upload failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
