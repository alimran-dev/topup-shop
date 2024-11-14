import PropTypes from "prop-types";
import useIsAdmin from "../hooks/useIsAdmin";
import Loader from "../components/Loader";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const { isAdmin, isAdminLoading } = useIsAdmin();

    if (isAdminLoading) {
        return <Loader isLoading={true} />;
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