import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Turnstile from "react-turnstile";
import toast from "react-hot-toast";


const SignUp = () => {

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReferInput, setShowReferInput] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const { user, setUser, setLoading } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (referralCode) {
      setShowReferInput(true);
    }
    if (user) {
      navigate("/");
    }
  }, [navigate, user, referralCode]);


  // sign up fn
  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if(turnstileToken.length <= 0) {
      setIsLoading(false);
      return toast.error("Please complete the captcha!");
    }
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const confirmPass = form.confirmPass.value;
    const referID = form.referID?.value;
    const userData = { name, email, phone, password, referID, turnstileToken };

    const passRegex = /^.{6,}$/;

    if (password !== confirmPass) {
      setError("Password and Confirm Password must be same.");
      setIsLoading(false);
    }
    else if (passRegex.test(password)) {
      try {
        axiosPrivate.post("/user/new", userData).then((res) => {
          // console.log(res.data);
          if (res?.data?.insertedId) {
            setUser(res?.data || {});
            setError("");
            setLoading(false);
            setIsLoading(false);
            navigate("/");
          }
          else if (res.data.userExist) {
            setError("User Exist!")
            setLoading(false);
            setIsLoading(false);
          }
          else {
            setError("Sign Up Failed!")
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
    }
    else {
      setError("Password must be minimum 6 digit.");
      setLoading(false);
      setIsLoading(false);
    }
  };

  // google login
  const handleGoogle = () => {
    setError("");
    window.open(`${import.meta.env.VITE_SERVER_DOMAIN}/user/google/login?referID=${referralCode}`, '_self');
  };

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div>
      <Loader isLoading={isLoading} />
      <form
        onSubmit={handleSignUp}
        className="w-full md:w-96 border block mx-auto px-5 pb-5 shadow-md"
      >
        <div>
          <h2 className="text-3xl text-center font-bold py-5 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent w-fit mx-auto">
            Sign Up
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
        <div className="space-y-1">
          <label htmlFor="name" className="input-label">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="input"
            placeholder="Name"
          />
        </div>
        <div className="space-y-1 py-3">
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
        <div className="space-y-1">
          <label htmlFor="phone" className="input-label">
            Phone
          </label>
          <input
            type="number"
            name="phone"
            className="input"
            placeholder="Phone"
          />
        </div>
        <div className="space-y-1 py-3">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              className="input"
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
        <div className="space-y-1">
          <label htmlFor="confirmPass" className="input-label">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPass"
              required
              className="input"
              placeholder="Confirm Password"
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[14px] cursor-pointer text-xl text-gray-500"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          </div>
        </div>
        <div>
          <div>
            <button type="button" onClick={() => setShowReferInput(!showReferInput)} className="mt-3 text-blue-700">
              {showReferInput ? "Hide Refer Code" : "Refer Code"}
            </button>
          </div>
          {
            showReferInput &&
            <div className="space-y-1 mt-1">
              <label htmlFor="phone" className="input-label">
                Refer Code
              </label>
              <input
                type="text"
                name="referID"
                className="input"
                placeholder="Refer code"
                defaultValue={referralCode ? referralCode : ""}
                disabled={referralCode}
              />
            </div>
          }
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
          Sign Up
        </button>
        <p className="text-center">
          Already have an account?
          <Link to={"/login"} className="text-blue-600 hover:underline font-semibold px-2">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
