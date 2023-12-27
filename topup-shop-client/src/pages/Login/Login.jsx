import { FcGoogle } from "react-icons/fc";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, setUser, googleLogin, loginUser } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const axiosPublic = useAxiosPublic();
  const location = useLocation();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    loginUser(email, password)
      .then(() => {
        axiosPrivate
          .post("/jwt", { email })
          .then((res) => {
            axiosPrivate.get("/user")
                .then(res => {
                  setUser(res.data);
                  setIsLoading(false);
                  console.log(res.data);
              })
            console.log(res.data)
          })
          .catch((err) => {
            setError("Server Error. Try later.");
            setIsLoading(false);
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
        setError("Wrong email or password.");
        setIsLoading(false);
      });
  };
  const handleGoogle = () => {
    setError("");
    setIsLoading(true);
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
              axiosPrivate.get("/user")
                .then(res => {
                  setUser(res.data);
                  console.log(res.data);
                  setIsLoading(false);
              })
              console.log(res.data);
            })
            .catch((err) => {
              console.error(err);
              setIsLoading(false);
              setError("Authentication failed")
            });
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Authentication failed.");
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (user) {
      navigate(`${location.state || "/"}`);
    }
  }, [location.state, navigate, user]);
  console.log(user);
  return (
    <div>
      <Loader isLoading={isLoading} />
      <form
        onSubmit={handleLogin}
        className="w-full md:w-96 border block mx-auto px-5 pb-5 shadow-md"
      >
        <div>
          <h2 className="text-3xl text-center font-bold py-5 bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent w-fit mx-auto">
            Login
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
        {error && (
          <p className="text-lg font-medium text-red-500 text-center mt-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-1 px-3 font-semibold text-white bg-gradient-to-r from-[#FA6023] to-[#E61C55] my-3 rounded-md"
        >
          Login
        </button>
        <p className="text-center">
          Don&apos;t have an account?
          <Link state={location.state} to={"/signup"} className="text-blue-500 font-semibold px-2">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
