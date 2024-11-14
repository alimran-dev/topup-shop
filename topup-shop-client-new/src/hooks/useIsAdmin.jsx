import { useEffect, useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import useAuth from "./useAuth";

const useIsAdmin = () => {
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setIsAdminLoading(false);
    }
    if (!loading && user) {
      axiosPrivate.get("/auth/isAdmin").then((res) => {
        setIsAdmin(res.data?.isAdmin);
        setIsAdminLoading(false);
      });
    }
  }, [axiosPrivate, loading, user]);

  return { isAdmin, isAdminLoading };
};

export default useIsAdmin;
