import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/input.jsx";
import googleIcon from "../assets/googleIcon.svg";
import { googleAuth } from "../utils/firebase.js";
import { useSelector, useDispatch } from "react-redux";
import { setEmail, clearEmail } from "../store/authSlice";

function Authe(props) {
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleAuthForm(e) {
    e.preventDefault();
    try {
      // const res = await axios.post(
      //   `${import.meta.env.VITE_BACKEND_URL}/${props.type}`,
      //   userData
      // );

      if (props.type === "signup") {
        toast.success(res.data.message);
        navigate("/signin");
      } else {
        toast.success(res.data.message);
        navigate("/public");
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setUserData({ name: "", email: "", password: "" });
    }
  }

  async function handleGoogleAuth() {
    try {
      const data = await googleAuth();
      console.log(data) ;
      dispatch(setEmail(data.email));
       // const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`, {
      //   accessToken: data.accessToken,
      // });
      toast.success("Google login successful");
      navigate("/public");
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Google login failed");
    }
  }

  return (
    <div className="min-h-[calc(100vh_-70px)] flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-6 flex flex-col gap-6">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-4">
          {props.type === "signup" ? "Sign Up" : "Sign In"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleAuthForm}>
          {props.type === "signup" && (
            <Input
              type="text"
              placeholder="Enter your name"
              setUserData={setUserData}
              field="name"
              value={userData.name}
              icon="fi-bs-id-card-clip-alt"
            />
          )}

          <Input
            type="email"
            placeholder="Enter your email"
            setUserData={setUserData}
            field="email"
            value={userData.email}
            icon="fi-rr-at"
          />

          <Input
            type="password"
            placeholder="Enter your password"
            setUserData={setUserData}
            field="password"
            value={userData.password}
            icon="fi-rr-lock"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-xl shadow hover:from-indigo-600 hover:to-purple-600 font-semibold transition-all"
          >
            {props.type === "signup" ? "Register" : "Login"}
          </button>
        </form>

        <p className="text-center font-medium text-gray-700">or</p>

        <div
          onClick={handleGoogleAuth}
          className="w-full py-2 rounded-xl bg-white border flex justify-center items-center gap-3 cursor-pointer
                     hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all"
        >
          <img src={googleIcon} alt="Google" className="w-6 h-6" />
          <span className="font-semibold">Continue with Google</span>
        </div>

        <p className="text-center text-gray-700 mt-2">
          {props.type === "signup" ? (
            <>
              Already have an account?{" "}
              <Link to="/public/signin" className="text-indigo-700 font-semibold">
                Sign In
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link to="/public/signup" className="text-indigo-700 font-semibold">
                Sign Up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Authe;
