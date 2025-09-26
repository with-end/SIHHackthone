import React, { useState } from 'react'

function input({value , type , placeholder , setUserData , field , icon}) {
       const [showPassword , setShowPassword ] = useState(false) ;
  return (
       
       <div className=" relative w-full ">
           <i className={"fi " + icon +" absolute top-1/2 -translate-y-1/2 left-3 text-white"}></i>
           <input type={type !="password" ? type : ( showPassword ? "text" : type)} 
                  value={value}
                  className=" w-full h-8 px-10 text-white bg-gray-500 rounded-md" 
                  placeholder={placeholder}
                  onChange={(e)=>{
                    setUserData(prev => ({...prev , [field] : e.target.value }))
                  }}
            />
           {
            type == "password" &&    <i onClick={() => setShowPassword((prev) => !prev) } 
                                        className={`fi ${ showPassword ? "fi-sr-eye" : "fi-sr-eye-crossed"}  absolute top-1/2 -translate-y-1/2 right-3 text-white`}></i>
           }
      </div>

  )
}

export default input
