import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";

const SignUp = () => {
  const [error, setError] = useState("");
  const { user, setUser, signUp, updateUser, googleLogin, auth } = useAuth();
  const navigate = useNavigate();
  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const confirmPass = form.confirmPass.value;
    const user = { name, email, phone, password, confirmPass };
    console.log(user);
    const passRegex = /^.{6,}$/;
    if (password !== confirmPass) {
      setError("Password and Confirm Password must be same.")
    }
    else if(passRegex.test(password)) {
      signUp(email,password)
        .then(() => {
        updateUser(name)
          .then(() => {
            setUser(auth.currentUser);
          })
          .catch(err => {
            console.error(err);
            setError("Failed to update name.")
          })
        })
        .catch(err => {
          console.error(err);
          setError("Failed to create account.Please try again later.")
      })
    }
    else {
      setError("Password must be minimum 6 digit.")
    }
  };
  const handleGoogle = () => {
    googleLogin()
      .then(result => {
      setUser(result.user)
    })
      .catch(err => {
        console.error(err);
    })
  }
  console.log(user);
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  },[navigate, user])
  return (
    <div>
      <form
        onSubmit={handleSignUp}
        className="w-full md:w-96 border block mx-auto px-5 pb-5 shadow-md"
      >
        <div>
          <h2 className="text-3xl text-center font-bold py-5 bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent w-fit mx-auto">
            Sign Up
          </h2>
          <button onClick={handleGoogle} className="flex items-center justify-center w-full py-1.5 px-3 border border-[#FA6023] rounded font-medium gap-1">
            <FcGoogle className="text-xl" /> Login with Google
          </button>
          <div className="flex items-center gap-1.5">
            <span className="block border-b-2 border-[#FA6023] flex-1"></span>
            <h3 className="text-lg font-medium">OR</h3>
            <span className="block border-b-2 border-[#FA6023] flex-1"></span>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="name" className="block text-lg font-medium">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="border w-full py-1.5 px-3 rounded-md focus:outline-[#FA6023] font-medium"
            placeholder="Name"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-lg font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="border w-full py-1.5 px-3 rounded-md focus:outline-[#FA6023] font-medium"
            placeholder="Email"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="block text-lg font-medium">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            className="border w-full py-1.5 px-3 rounded-md focus:outline-[#FA6023] font-medium"
            placeholder="Phone"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="block text-lg font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            className="border w-full py-1.5 px-3 rounded-md focus:outline-[#FA6023] font-medium"
            placeholder="Password"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPass" className="block text-lg font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPass"
            required
            className="border w-full py-1.5 px-3 rounded-md focus:outline-[#FA6023] font-medium"
            placeholder="Confirm Password"
          />
        </div>
        {error && <p className="text-lg font-medium text-red-500 text-center mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full py-1 px-3 font-semibold text-white bg-gradient-to-r from-[#FA6023] to-[#E61C55] my-3 rounded-md"
        >
          Sign Up
        </button>
        <p className="text-center">
          Already have an account?
          <Link to={'/login'} className="text-blue-500 font-semibold px-2">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
