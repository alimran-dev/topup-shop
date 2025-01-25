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
  const { user, setUser, googleLogin, setLoading } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const axiosPublic = useAxiosPublic();
  const location = useLocation();

  // user login fn
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const userCredentials = {
      email: e.target.email.value,
      password: e.target.password.value
    };

    try {
      axiosPrivate.post("/user/login", userCredentials).then((res) => {
        if (res?.data?._id) {

          const LoggedUserData = {
            _id: res?.data?.insertedId,
            email: res?.data?.email,
            name: res?.data?.name,
            photo: res?.data?.photo,
            phone: res.data?.phone || "",
            role: res?.data?.role,
            balance: res?.data?.balance,
            isBanned: res?.data?.isBanned,
            spent: res?.data?.spent,
            orders: res?.data?.orders,
            coins: res?.data?.coins,
          };

          setUser(LoggedUserData);
          setError("");
          setLoading(false);
          setIsLoading(false);
          navigate("/");
        }
        else {
          setError("Invalid Credentials!")
          setLoading(false);
          setIsLoading(false);
        }
      })
    }
    catch (err) {
      setError(err?.message || "Something Went Wrong!");
      setLoading(false);
      setIsLoading(false);
    }
  };

  // for google login
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

        axiosPublic.post("/user/new", user).then((res) => {
          console.log(res.data);
          axiosPrivate
            .post("/auth/jwt", { email })
            .then((res) => {
              console.log(res.data);
              axiosPrivate
                .get("/user/profile")
                .then((res) => {
                  const currentUser = res.data;
                  currentUser.balance = parseFloat(
                    currentUser.balance.toFixed(2)
                  );
                  setUser(currentUser);
                  setIsLoading(false);
                })
                .catch((err) => {
                  setIsLoading(false);
                  console.error(err);
                  setError(
                    err.response?.data?.error || "Authentication Failed"
                  );
                });
              // console.log(res.data);
            })
            .catch((err) => {
              console.error(err);
              setIsLoading(false);
              setError("Authentication failed");
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
          <label htmlFor="email" className="input-label">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="input"
            placeholder="Email"
          />
        </div>
        <div className="space-y-1 pt-3">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            className="input"
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
        <div className="flex justify-center py-2">
          <Link to="/forgotPassword" className="text-blue-700 hover:underline">Forgot Password</Link>
        </div>
        <p className="text-center">
          Don&apos;t have an account?
          <Link
            state={location.state}
            to={"/signup"}
            className="text-blue-600 hover:underline font-semibold px-2"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
