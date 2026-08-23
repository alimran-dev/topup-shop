import avatar from "../../assets/images/avater.png";
import PropTypes from "prop-types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useState } from "react";
import Swal from "sweetalert2";
import UserName from "../../components/reusuable/UserName/UserName";

const UserCard = ({ user, setIsLoading }) => {
  const [isBanned, setIsBanned] = useState(user?.isBanned) || {};
  const [balance, setBalance] = useState(user?.balance) || {};
  const axiosPrivate = useAxiosPrivate();
  const { name, email, phone, photo, spent, orders, coins, isVerified } = user || {};
  // console.log(user);
  const handleBlockUnblock = () => {
    setIsLoading(true);
    axiosPrivate
      .patch("/user/admin/status", { email: email, isBanned: !isBanned })
      .then((res) => {
        setIsLoading(false);
        if (res.data?.modifiedCount > 0) setIsBanned(!isBanned);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const handleAddBalance = (e) => {
    e.preventDefault();
    if (!e.target.addBalance.value) return;
    setIsLoading(true);
    const addBalance = e.target.addBalance.value;
    axiosPrivate
      .patch("/user/admin/balance", { email: email, addBalance: addBalance })
      .then((res) => {
        setIsLoading(false);
        e.target.reset();
        if (res.data?.modifiedCount > 0) {
          setBalance(balance + addBalance * 1);
          Swal.fire({
            title: `Balance added: ${addBalance}`,
            position: "top",
            toast: true,
            timer: 1500,
            showConfirmButton: false,
            icon: "success",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        Swal.fire({
          title: `${err.response?.data?.error}`,
          timer: 2000,
          position: "top",
          showConfirmButton: false,
          toast: true,
          icon: "error",
        });
      });
    // console.log(addBalance);
  };
  return (
    <div className="border w-64 py-4 px-4 rounded shadow">
      <img
        src={photo || avatar}
        alt={photo}
        className="w-14 h-14 block mx-auto rounded-full"
        onError={(e) => {
          e.target.onerror = null; // prevents looping
          e.target.src = avatar; // fallback image
        }}
      />
      {/* <h3 className="text-center font-bold text-lg">{name}</h3> */}
      <div className="block w-fit mx-auto">
      <UserName name={name} isVerified={isVerified} />
      </div>
      <p className="overflow-auto">
        <span className="font-bold">Email: </span>
        {email}
      </p>
      <p className="">
        <span className="font-bold">Phone: </span>
        {phone}
      </p>
      <p className="">
        <span className="font-bold">Balance: </span>
        {balance}
      </p>
      <p className="">
        <span className="font-bold">Coins: </span>
        {coins}
      </p>
      <p className="">
        <span className="font-bold">Total Orders: </span>
        {orders}
      </p>
      <p className="">
        <span className="font-bold">Total Spent: </span>
        {spent}
      </p>
      {isBanned ? (
        <button
          onClick={handleBlockUnblock}
          className="bg-green-600 px-3 py-1 font-semibold text-white rounded block mx-auto my-4"
        >
          Unblock
        </button>
      ) : (
        <button
          onClick={handleBlockUnblock}
          className="bg-red-600 px-3 py-1 font-semibold text-white rounded block mx-auto my-4"
        >
          Block
        </button>
      )}

      <form
        onSubmit={handleAddBalance}
        className="flex items-center justify-center"
      >
        <input
          type="text"
          name="addBalance"
          className="border-2 py-1 px-3 rounded-l h-8 w-1/2"
          placeholder="100.00"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-primary to-secondary px-3 py-1 text-white font-semibold rounded-r h-8"
        >
          Add Fund
        </button>
      </form>
    </div>
  );
};

export default UserCard;
UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};
