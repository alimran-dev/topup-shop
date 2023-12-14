import PropTypes from "prop-types";
import { createContext, useState } from "react";

export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(true);
    const AuthInfo={ user }
    return <AuthContext.Provider value={AuthInfo}>{children}</AuthContext.Provider>
};

export default AuthProvider;
AuthProvider.propTypes = {
    children: PropTypes.node,
}