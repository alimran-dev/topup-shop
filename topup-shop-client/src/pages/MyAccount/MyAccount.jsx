import avater from "../../assets/images/avater.png";
import "./MyAccount.css";
import { TbCurrencyTaka } from "react-icons/tb";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useState } from "react";

const MyAccount = () => {
  const [eye, setEye] = useState(true);
  const [eye2, setEye2] = useState(true);
  const [eye3, setEye3] = useState(true);
  return (
    <div>
      <div className="w-fit mx-auto space-y-2 flex flex-col items-center justify-center">
        <img
          src={avater}
          alt=""
          className="w-28 h-28 gradient-border rounded-full bg-slate-400"
        />
        <p className="text-center text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
          Al Imran
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5 my-8">
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Balance
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            100
            <TbCurrencyTaka className="text-[#FA6023]" />
          </p>
        </div>
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Total Spent
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            100
            <TbCurrencyTaka className="text-[#FA6023]" />
          </p>
        </div>
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Total Orders
          </p>
          <p className="text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            100
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
            <span className="font-semibold">Name: </span>Al Imran
          </p>
          <p>
            <span className="font-semibold">Email: </span>alimran@gmail.com
          </p>
          <p>
            <span className="font-semibold">Phone: </span>01234567891
          </p>
        </div>
      </div>
      {/* Edit User and Change Pass */}
      <div className="grid md:grid-cols-2 gap-5 lg:gap-10 py-3">
        <div className="flex-1 border-2 rounded-md py-5">
          <h2 className="text-center text-3xl lg:text-4xl mx-3 font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
            Edit User Information
          </h2>
          <div className="space-y-2 w-4/5 lg:w-2/3 mx-auto">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-lg font-semibold">
                Name:
              </label>
              <input
                type="text"
                name="name"
                className="block border border-gray-500 px-3 py-2 rounded-md w-full font-medium"
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="name" className="block text-lg font-semibold">
                Email:
              </label>
              <input
                type="text"
                name="name"
                className="block border border-gray-500 px-3 py-2 rounded-md w-full font-medium"
                placeholder="Your Email"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="name" className="block text-lg font-semibold">
                Phone:
              </label>
              <input
                type="text"
                name="name"
                className="block border border-gray-500 px-3 py-2 rounded-md w-full font-medium"
                placeholder="Your Phone"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="name" className="block text-lg font-semibold">
                Profile Picture:
              </label>
              <input
                type="file"
                name="name"
                className="block border border-gray-500 px-3 py-2 rounded-md w-full"
                placeholder="Your Profile Picture"
              />
            </div>
            <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 lg:text-lg text-white font-semibold rounded block mx-auto">
              Update
            </button>
          </div>
        </div>
        <div className="flex-1 border-2 rounded-md py-5">
          <h2 className="text-center text-3xl lg:text-4xl mx-3 font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
            Change Password
          </h2>
          <div className="space-y-2 w-4/5 lg:w-2/3 mx-auto">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-lg font-semibold">
                Old Password
              </label>
              <div className="flex items-center h-10">
                <input
                  type={eye ? "password" : "text"}
                  name="name"
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
              <label htmlFor="name" className="block text-lg font-semibold">
                New Password
              </label>
              <div className="flex items-center h-10">
                <input
                  type={eye2 ? "password" : "text"}
                  name="name"
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
              <label htmlFor="name" className="block text-lg font-semibold">
                Confirm New Password
              </label>
              <div className="flex items-center h-10">
                <input
                  type={eye3 ? "password" : "text"}
                  name="name"
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
            <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 lg:text-lg text-white font-semibold rounded block mx-auto">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
