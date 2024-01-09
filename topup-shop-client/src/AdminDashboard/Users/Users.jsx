import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  const handleSearch = e => {
    // console.log(e.target.value);
    setIsLoading(true);
    axiosPrivate.get(`/admin/users?email=${e.target.value}`)
      .then(res => {
        setUsers(res.data);
        setIsLoading(false);
    })
  }
  useEffect(() => {
    window.scrollTo(0, 0);
    axiosPrivate.get(`/admin/users`)
      .then(res => {
        setUsers(res.data);
        setIsLoading(false);
    })
  },[axiosPrivate])
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        All Users({users.length})
          </h1>
          <div>
              <input onChange={handleSearch} type="text" className="border border-gray-400 w-80 block mx-auto my-3 py-1.5 px-3 rounded text-center" placeholder="User's Email" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
        {
          users.map(user=> <UserCard user={user} setIsLoading={setIsLoading} key={user._id} />)
              }
          </div>
    </div>
  );
};

export default Users;
