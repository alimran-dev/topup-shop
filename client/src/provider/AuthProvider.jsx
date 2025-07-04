import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import app from "../firebase/firebase.config";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import RegisterWorker from "../utils/registerServiceWorker";

export const AuthContext = createContext(null);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  const signUp = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };
  const loginUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };
  const updateUser = (displayName, photoURL) => {
    return updateProfile(auth.currentUser, { displayName, photoURL });
  };
  const updatePass = (newPassword) => {
    return updatePassword(auth.currentUser, newPassword);
  };
  const googleLogin = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };
  const logOut = () => {
    setLoading(false);
    return signOut(auth);
  };
  useEffect(() => {
    axiosPrivate
      .get("/user/profile")
      .then((res) => {
        const currentUser = res.data;
        currentUser.balance = parseFloat(currentUser.balance.toFixed(2));
        setUser(currentUser);

        // notification subscription
        const subscription = sessionStorage.getItem("subscription");
        if (!subscription) {
          RegisterWorker().then(() => {
            axiosPrivate.post("/notification/subscribe", {
              sub: JSON.parse(sessionStorage.getItem("subscription")),
            });
          });
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [axiosPrivate]);

  const AuthInfo = {
    user,
    setUser,
    loading,
    setLoading,
    signUp,
    loginUser,
    updateUser,
    updatePass,
    googleLogin,
    logOut,
    auth,
  };

  return (
    <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
AuthProvider.propTypes = {
  children: PropTypes.node,
};
