import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const {pathname} = useLocation();
    if (loading) {
        return <Loader isLoading={true} />;
    }
    if (!user) {
        return <Navigate state={pathname} to={'/login'} />;
    }
    return children;
};

export default PrivateRoute;
PrivateRoute.propTypes = {
    children: PropTypes.node,
}