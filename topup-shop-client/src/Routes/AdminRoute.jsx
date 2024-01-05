import PropTypes from "prop-types";
import useIsAdmin from "../hooks/useIsAdmin";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const {user,loading } = useAuth();
    const { isAdmin, isAdminLoading } = useIsAdmin();
    const {pathname} = useLocation();

    if (loading || isAdminLoading) {
        return <Loader isLoading={true} />;
    }
    if (!user) {
        return <Navigate state={pathname} to={'/login'} />;
    }
    if (!isAdmin) {
        return <Navigate to={'/'} />;
    }
    return children;
};

export default AdminRoute;
AdminRoute.propTypes = {
    children: PropTypes.node,
}