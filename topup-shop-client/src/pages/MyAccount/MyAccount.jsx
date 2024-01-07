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

const imgApi = import.meta.env.VITE_IMGAPI;
const MyAccount = () => {
  const [eye, setEye] = useState(true);
  const [eye2, setEye2] = useState(true);
  const [eye3, setEye3] = useState(true);
  const [updateUserError, setUpdateUserError] = useState("");
  const [changePassError, setChangePassError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, loginUser, updatePass } = useAuth();
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
          console.log(res.data);
          if (res.data?.data?.display_url) {
            const updateUser = {
              name,
              email,
              photo: res.data?.data?.display_url,
            };
            axiosPrivate
              .patch("/updateUser", updateUser)
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
        .patch("/updateUser", updateUser)
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
  const handleChangePass = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setChangePassError("");
    const form = e.target;
    const oldPass = form.oldPass.value;
    const password = form.password.value;
    const confirmPass = form.confirmPass.value;
    console.log(oldPass, password, confirmPass);
    if (password !== confirmPass) {
      setChangePassError("Password and confirm password must be the same");
      setIsLoading(false);
    } else {
      loginUser(user?.email, oldPass)
        .then((result) => {
          if (result.user) {
            updatePass(password)
              .then(() => {
                Swal.fire({
                  title: "Password change successful",
                  timer: 1500,
                  icon: "success",
                  showConfirmButton: false,
                });
                setIsLoading(false);
                form.reset();
              })
              .catch(() => {
                setIsLoading(false);
                setChangePassError("Something Wrong try again later");
              });
          }
        })
        .catch(() => {
          setIsLoading(false);
          setChangePassError("Wrong Password");
        });
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  },[])
  return (
    <div>
      <Loader isLoading={isLoading} />
      <div className="w-fit mx-auto space-y-2 flex flex-col items-center justify-center">
        <img
          src={user?.photo || avater}
          alt=""
          className="w-28 h-28 gradient-border rounded-full bg-slate-400"
        />
        <p className="text-center text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
          {user?.name}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5 my-8">
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Balance
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            {user?.balance || 0}
            <TbCurrencyTaka className="text-[#FA6023]" />
          </p>
        </div>
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Total Spent
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            {user?.spent || 0}
            <TbCurrencyTaka className="text-[#FA6023]" />
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
