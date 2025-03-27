import avater from "../../assets/images/avater.png";
import "./MyAccount.css";
import { TbCurrencyTaka } from "react-icons/tb";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axios from "axios";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";
import verifiedIcon from '../../assets/images/verified-icon.png';
import VerifyUser from "./VerifyUser/VerifyUser";
import toast from "react-hot-toast";

const imgApi = import.meta.env.VITE_IMGAPI;
const MyAccount = () => {
  const [eye, setEye] = useState(true);
  const [eye2, setEye2] = useState(true);
  const [eye3, setEye3] = useState(true);
  const [updateUserError, setUpdateUserError] = useState("");
  const [changePassError, setChangePassError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const handleUpdateUser = (e) => {
    e.preventDefault();
    setUpdateUserError("");
    setIsLoading(true);
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const photoFile = form.photo.files[0];
    if (photoFile) {
      axios
        .post(
          `https://api.imgbb.com/1/upload?key=${imgApi}`,
          { image: photoFile },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((res) => {
          // console.log(res.data);
          if (res.data?.data?.display_url) {
            const updateUser = {
              name,
              email,
              photo: res.data?.data?.display_url,
            };
            axiosPrivate
              .patch("/user/update", updateUser)
              .then((res) => {
                setUser(res.data);
                setIsLoading(false);
                Swal.fire({
                  title: "Profile Updated Successfully",
                  icon: "success",
                  timer: 1500,
                  showConfirmButton: false,
                });
              })
              .catch(() => {
                setIsLoading(false);
                setUpdateUserError("User Update Failed for Server");
              });
          }
        })
        .catch(() => {
          setIsLoading(false);
          setUpdateUserError("Photo Upload Failed");
        });
    } else {
      const updateUser = { name, email, phone };
      axiosPrivate
        .patch("/user/update", updateUser)
        .then((res) => {
          setUser(res.data);
          setIsLoading(false);
          Swal.fire({
            title: "Profile Updated Successfully",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch(() => {
          setIsLoading(false);
          setUpdateUserError("User Update Failed for Server");
        });
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setChangePassError("");
    const form = e.target;
    const oldPass = form.oldPass.value;
    const password = form.password.value;
    const confirmPass = form.confirmPass.value;
    // console.log(oldPass, password, confirmPass);
    if (password !== confirmPass) {
      setChangePassError("Password and confirm password must be the same");
      setIsLoading(false);
      return;
    }

    const payload = {
      email: user?.email,
      oldPassword: oldPass,
      newPassword: password,
    };

    try {
      const res = await axiosPrivate.patch('/user/change/password', payload);

      if (res.data.success) {
        toast.success(res.data.message || "Changed Successfully!");
        setIsLoading(false);
        setChangePassError("");
        e.target.reset();
        window.scrollTo(0, 0);
      }
      else {
        setIsLoading(false);
        setChangePassError(res.data.message || "Something Went Wrong!");
      }
    }
    catch (err) {
      setIsLoading(false);
      setChangePassError("Something Went Wrong!");
    }

  };

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  console.log(user);
  

  return (
    <div>
      <Loader isLoading={isLoading} />
      <div className="w-fit mx-auto space-y-2 flex flex-col items-center justify-center">
        <div className="relative">
          <img
            src={user?.photo || avater}
            alt=""
            className="w-28 h-28 gradient-border rounded-full bg-slate-400"
          />
          <img src={verifiedIcon} className={`${user?.isVerified ? '' : 'hidden'} w-8 absolute top-2 -right-1`} alt="" />
        </div>
        <div className="flex justify-center items-center gap-1">
          <p className={`px-3 py-1 text-xs text-white rounded-full ${user?.isVerified ? 'bg-green-600 ' : 'bg-slate-500 '} `}>{user?.isVerified ? 'Verified' : 'Unverified'}</p>
          <VerifyUser user={user} />
        </div>
        <p className="text-center text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3 capitalize">
          {user?.name}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5 my-8">
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Balance
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            <TbCurrencyTaka className="text-[#FA6023]" />
            {parseFloat(user?.balance).toFixed(2) || 0}
          </p>
        </div>
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Last Month Spent
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            <TbCurrencyTaka className="text-[#FA6023]" />
            {user?.spent || 0}
          </p>
        </div>
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Total Orders
          </p>
          <p className="text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            {user?.orders || 0}
          </p>
        </div>
      </div>
      {/* User Information */}
      <div className="border rounded-md">
        <h2 className="flex items-center gap-1 text-2xl font-semibold border rounded-md py-2 px-3">
          <HiOutlineInformationCircle className="mt-0.5" /> User Information
        </h2>
        <div className="px-8 py-5 space-y-2">
          <p>
            <span className="font-semibold">Name: </span>
            {user?.name}
          </p>
          <p>
            <span className="font-semibold">Email: </span>
            {user?.email}
          </p>
          <p>
            <span className="font-semibold">Phone: </span>
            {user?.phone || "017XXXXXXXX"}
          </p>
        </div>
      </div>
      {/* Edit User and Change Pass */}
      <div className="grid md:grid-cols-2 gap-5 lg:gap-10 py-3">
        <div className="flex-1 border-2 rounded-md py-5">
          <h2 className="text-center text-3xl lg:text-4xl mx-3 font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
            Edit User Information
          </h2>
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-2 w-4/5 lg:w-2/3 mx-auto">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-lg font-semibold">
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name}
                  className="block border border-gray-500 px-3 py-2 rounded-md w-full font-medium"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="block text-lg font-semibold">
                  Email:
                </label>
                <input
                  type="text"
                  name="email"
                  defaultValue={user?.email}
                  disabled
                  className="block border border-gray-500 px-3 py-2 rounded-md w-full font-medium"
                  placeholder="Your Email"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-lg font-semibold">
                  Phone:
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={user?.phone}
                  className="block border border-gray-500 px-3 py-2 rounded-md w-full font-medium"
                  placeholder="Your Phone"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="photo" className="block text-lg font-semibold">
                  Profile Picture:
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  className="block border border-gray-500 px-3 py-2 rounded-md w-full"
                  placeholder="Your Profile Picture"
                />
              </div>
              {updateUserError && (
                <p className="text-red-600 font-semibold text-center">
                  {updateUserError}
                </p>
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 lg:text-lg text-white font-semibold rounded block mx-auto"
              >
                Update
              </button>
            </div>
          </form>
        </div>
        <div className="flex-1 border-2 rounded-md py-5">
          <h2 className="text-center text-3xl lg:text-4xl mx-3 font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
            Change Password
          </h2>
          <form onSubmit={handleChangePass}>
            <div className="space-y-2 w-4/5 lg:w-2/3 mx-auto">
              <div className="space-y-1">
                <label
                  htmlFor="oldPass"
                  className="block text-lg font-semibold"
                >
                  Old Password
                </label>
                <div className="flex items-center h-10">
                  <input
                    type={eye ? "password" : "text"}
                    name="oldPass"
                    className="block border border-gray-500 px-3 py-2 rounded-l-md w-full h-full font-medium"
                    placeholder="Your Old Password"
                    required
                  />
                  <div
                    onClick={() => setEye(!eye)}
                    className="h-full flex items-center justify-center border border-gray-500 rounded-r-md cursor-pointer"
                  >
                    {eye ? (
                      <IoMdEye className="mx-2 text-xl" />
                    ) : (
                      <IoMdEyeOff className="mx-2 text-xl" />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-lg font-semibold"
                >
                  New Password
                </label>
                <div className="flex items-center h-10">
                  <input
                    type={eye2 ? "password" : "text"}
                    name="password"
                    className="block border border-gray-500 px-3 py-2 rounded-l-md w-full h-full font-medium"
                    placeholder="Your New Password"
                    required
                  />
                  <div
                    onClick={() => setEye2(!eye2)}
                    className="h-full flex items-center justify-center border border-gray-500 rounded-r-md cursor-pointer"
                  >
                    {eye2 ? (
                      <IoMdEye className="mx-2 text-xl" />
                    ) : (
                      <IoMdEyeOff className="mx-2 text-xl" />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="confirmPass"
                  className="block text-lg font-semibold"
                >
                  Confirm New Password
                </label>
                <div className="flex items-center h-10">
                  <input
                    type={eye3 ? "password" : "text"}
                    name="confirmPass"
                    className="block border border-gray-500 px-3 py-2 rounded-l-md w-full h-full font-medium"
                    placeholder="Confirm New Password"
                    required
                  />
                  <div
                    onClick={() => setEye3(!eye3)}
                    className="h-full flex items-center justify-center border border-gray-500 rounded-r-md cursor-pointer"
                  >
                    {eye3 ? (
                      <IoMdEye className="mx-2 text-xl" />
                    ) : (
                      <IoMdEyeOff className="mx-2 text-xl" />
                    )}
                  </div>
                </div>
              </div>
              {changePassError && (
                <p className="text-red-600 font-medium text-center">
                  {changePassError}
                </p>
              )}
              <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 lg:text-lg text-white font-semibold rounded block mx-auto">
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
