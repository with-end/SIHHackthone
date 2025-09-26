// Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅ import translation hook
import { googleAuth } from "../utils/firebase.js";
import axios from "axios";
import  toast  from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { setEmail, clearEmail } from "../store/authSlice";


export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation(); // ✅ get translator
  const email = useSelector((state) => state.auth.email);
  const dispatch = useDispatch();

  const navigate = useNavigate() ;

  const links = [
    { name: "comeOut", path: "/" },
    { name: "home", path: "/public" },
    { name: "reportIssue", path: "/public/report" },
    { name: "track", path: "/public/track" },
    { name: "history1", path: "/public/history" },
    { name: "notices", path: "/public/notices" },
  ];

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  async function handleGoogleAuth(){
       try{
          navigate("/public/signUp") ;
       }catch(err){
           console.log(err) ;
           toast.error(err.response.data.message) ;
       }
   }

   function handleLogOut(){
        dispatch(clearEmail());
        toast.success("user logged out in successfully") ;
       // localStorage.removeItem("myLocation") ;
      //  localStorage.removeItem("center") ;
      //  localStorage.removeItem("nagarId") ;
        

   }


  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
        <div className="flex justify-between h-16 items-center">
          <div className="text-white font-bold text-2xl">{t("civicConnect")}</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    relative font-medium px-3 py-2 rounded-lg transition-all duration-300 transform
                    ${isActive
                      ? "bg-white text-indigo-600 shadow-lg scale-110"
                      : "text-white hover:-translate-y-1 hover:bg-white hover:bg-opacity-20"}
                  `}
                >
                  {t(link.name)} {/* ✅ translated link */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-lg shadow-[0_0_20px_2px_white] pointer-events-none animate-pulse"></span>
                  )}
                </Link>
              );
            })}

            {/* ✅ Language Dropdown */}
             
            <div className="flex flex-row-reverse  items-center"> 
            <select
              onChange={changeLanguage}
              defaultValue="en"
              className="mt-2 mx-1 w-full border px-2 py-1 rounded bg-white text-indigo-600 font-medium"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="bn">বাংলা</option>
              <option value="ta">ગુજરાતી</option>
              <option value="bn">मराठी</option>
            </select>
            <button
  onClick={email ? handleLogOut : handleGoogleAuth}
  className="
    px-5 py-1 mt-2
    rounded
    font-semibold 
    shadow-lg 
    bg-gradient-to-r hover:from-indigo-500 hover:via-pink-500 hover:to-yellow-500 
  text-white
    transition-all duration-300 ease-in-out
  "
>
  {email ? t("logout") : t("register")}
</button>
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none text-2xl"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-400 bg-opacity-80">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-all duration-300
                    ${isActive
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "text-white hover:bg-indigo-600"}
                  `}
                >
                  {t(link.name)} {/* ✅ translated link */}
                </Link>
              );
            })}

            {/* ✅ Language Dropdown in Mobile Menu */}
            <div className="flex flex-col-reverse items-center">
            <select
              onChange={changeLanguage}
              defaultValue="en"
              className="mt-2 w-full border px-2 py-1 rounded bg-white text-indigo-600 font-medium"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="bn">বাংলা</option>
              <option value="ta">ગુજરાતી</option>
              <option value="bn">मराठी</option>
            </select>
             <button
  onClick={email ? handleLogOut : handleGoogleAuth}
  className="
    px-5 py-1 
    rounded
    bg-white/90
    text-indigo-600 
    font-semibold 
    shadow-lg 
    hover:bg-gradient-to-r hover:from-indigo-500 hover:via-pink-500 hover:to-yellow-500 
    hover:text-white
    transition-all duration-300 ease-in-out
  "
>
  {email ? "Log Out" : "Resister"}
</button>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
