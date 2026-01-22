import {auth} from '../firebase';
import{
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from 'firebase/auth';

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  export const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  export const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  export const logout = () => {
    return signOut(auth);
  };