import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";

const SignUp = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, signUp, updateUser, googleLogin,setLoading } = useAuth();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const confirmPass = form.confirmPass.value;
    const user = { name, email, phone };
    console.log(user);
    const passRegex = /^.{6,}$/;
    if (password !== confirmPass) {
      setError("Password and Confirm Password must be same.");
      setIsLoading(false);
    } else if (passRegex.test(password)) {
      signUp(email, password)
        .then(() => {
          updateUser(name)
            .then(() => {
              axiosPublic.post("/users", user).then((res) => {
                console.log(res.data);
                axiosPrivate
                  .post("/jwt", { email })
                  .then((res) => {
                    axiosPrivate.get("/user").then((res) => {
                      setUser(res.data);
                      setIsLoading(false);
                      setLoading(false);
                      console.log(res.data);
                    });
                    console.log(res.data);
                  })
                  .catch((err) => {
                    console.log(err)
                    setIsLoading(false);
                  });
              });
            })
            .catch((err) => {
              console.error(err);
              setError("Failed to update name.");
              setIsLoading(false);
            });
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          setError("Failed to create account.Please try again later.");
        });
    } else {
      setError("Password must be minimum 6 digit.");
      setIsLoading(false);
    }
  };
  const handleGoogle = () => {
    setIsLoading(true);
    setError("");
    googleLogin()
      .then((result) => {
        const { email, displayName, phoneNumber, photoURL } = result.user;
        const user = {
          email: email,
          name: displayName,
          phone: phoneNumber,
          photo: photoURL,
        };

        axiosPublic.post("/users", user).then((res) => {
          console.log(res.data);
          axiosPrivate
            .post("/jwt", { email })
            .then((res) => {
              console.log(res.data);
              axiosPrivate.get("/user").then((res) => {
                setUser(res.data);
                console.log(res.data);
                setIsLoading(false);
                setLoading(false);
              })
                .catch(err => {
                  setIsLoading(false);
                  console.error(err);
                  setError("Authentication Failed");
              })
            })
            .catch((err) => {
              setIsLoading(false);
              console.log(err)
            });
        });
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
      });
  };
  console.log(user);
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);
  return (
    <div>
      <Loader isLoading={isLoading} />
      <form
        onSubmit={handleSignUp}
        className="w-full md:w-96 border block mx-auto px-5 pb-5 shadow-md"
      >
        <div>
          <h2 className="text-3xl text-center font-bold py-5 bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent w-fit mx-auto">
            Sign Up
          </h2>
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center w-full py-1.5 px-3 border border-[#FA6023] rounded font-medium gap-1"
          >
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
        {error && (
          <p className="text-lg font-medium text-red-500 text-center mt-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-1 px-3 font-semibold text-white bg-gradient-to-r from-[#FA6023] to-[#E61C55] my-3 rounded-md"
        >
          Sign Up
        </button>
        <p className="text-center">
          Already have an account?
          <Link to={"/login"} className="text-blue-500 font-semibold px-2">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
