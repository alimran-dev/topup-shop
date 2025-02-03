import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import UserCard from "./UserCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import InfinityLoader from "../../components/InfinityLoader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const limit = 8;
  const page = Math.ceil(users.length / limit + 1);

  const getUsers = () => {
    axiosPrivate
      .get(`/user/admin/all?page=${page}&limit=${limit}&search=${search}`)
      .then((res) => {
        // console.log(res.data);
        setUsers([...users, ...res.data.users]);
        setTotalUsers(res.data?.totalUsers);
        setIsLoading(false);
      });
  };
  const fetchMoreData = () => {
    if (totalUsers > users.length) {
      getUsers();
    }
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setUsers([]);
  };
  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        All Users({totalUsers})
      </h1>
      <div>
        <input
          onChange={handleSearch}
          type="text"
          className="border border-gray-400 w-80 block mx-auto my-3 py-1.5 px-3 rounded text-center"
          placeholder="User's Email"
        />
      </div>
      <InfiniteScroll
        dataLength={users.length}
        hasMore={users.length < totalUsers}
        next={fetchMoreData}
        loader={<InfinityLoader />}
      >
        <div className="flex flex-wrap items-stretch justify-center gap-4">
          {users.map((user) => (
            <UserCard user={user} setIsLoading={setIsLoading} key={user._id} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Users;
