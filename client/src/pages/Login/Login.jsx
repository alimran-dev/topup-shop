import { FcGoogle } from "react-icons/fc";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Turnstile from "react-turnstile";
import toast from "react-hot-toast";


const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const { user, setUser, setLoading } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const [searchParams] = useSearchParams();


  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setRedirecting(true);
      setTimeout(() => navigate(`${location.state || "/"}`), 200);
    } else if (success === "false") {
      setError("Authentication failed. Please try again.");
    }
  }, [navigate, searchParams, location.state]);

  // user login fn
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if(turnstileToken.length<=0){
      setIsLoading(false);
      return toast.error("Please complete the captcha!");
    }

    const userCredentials = {
      email: e.target.email.value,
      password: e.target.password.value,
      turnstileToken,
    };

    try {
      axiosPrivate.post("/user/login", userCredentials).then((res) => {

        if (res?.data?._id) {

          setUser(res?.data || {});
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
    window.open(`${import.meta.env.VITE_SERVER_DOMAIN}/user/google/login`, '_self');
  };

  useEffect(() => {
    if (user) {
      navigate(`${location.state || "/"}`);
    }
  }, [location.state, navigate, user]);


  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Loader isLoading={isLoading || redirecting} />
      <div className="w-full md:w-96 border block mx-auto px-5 pb-5 shadow-md">
        <div>
          <h2 className="text-3xl text-center font-bold py-5 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent w-fit mx-auto">
            Login
          </h2>
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center w-full py-1.5 px-3 border border-primary rounded font-medium gap-1"
          >
            <FcGoogle className="text-xl" /> Login with Google
          </button>
          <div className="flex items-center gap-1.5">
            <span className="block border-b-2 border-primary flex-1"></span>
            <h3 className="text-lg font-medium">OR</h3>
            <span className="block border-b-2 border-primary flex-1"></span>
          </div>
        </div>
        <form
          onSubmit={handleLogin}
        >
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="input pr-10"
                placeholder="Password"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[14px] cursor-pointer text-xl text-gray-500"
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
          </div>
          {error && (
            <p className="text-lg font-medium text-red-500 text-center mt-2">
              {error}
            </p>
          )}
          <Turnstile sitekey={import.meta.env.VITE_TURNSTILE_KEY} theme="light" className="w-fit mx-auto mt-2" onVerify={(token)=>setTurnstileToken(token)} />
          <button
            type="submit"
            className="w-full py-1 px-3 font-semibold text-white bg-gradient-to-r from-primary to-secondary my-3 rounded-md"
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
    </div>
  );
};

export default Login;
