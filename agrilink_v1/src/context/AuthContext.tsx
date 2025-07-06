import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, User, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
});

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "29912240469-0qqtbvpd5hnc5qd5f4vgvf5vc4m8ckgp.apps.googleusercontent.com",
    iosClientId: "29912240469-0qqtbvpd5hnc5qd5f4vgvf5vc4m8ckgp.apps.googleusercontent.com",
    webClientId: "29912240469-0qqtbvpd5hnc5qd5f4vgvf5vc4m8ckgp.apps.googleusercontent.com",
    expoClientId: "29912240469-0qqtbvpd5hnc5qd5f4vgvf5vc4m8ckgp.apps.googleusercontent.com"
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch(console.error);
    }
  }, [response]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        throw new Error('Google sign in was not successful');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 