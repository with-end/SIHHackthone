import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Admin from './pages/Admin'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ✅ FIXED import
import UserSelection from './pages/UserSelection'
import History from './pages/History'
import PublicLayout from './layouts/PublicLayout'
import ReportIssue from './pages/ReportIssue'
import PublicHome from './pages/PublicHome'
import Notices from './pages/Notices'
import Track from './pages/Track'
import Office from './pages/Office'
import OfficeNavbar from './navbars/OfficeNavbar'
import OfficeLayout from './layouts/OfficeLayout'
import OfficeHome from './pages/OfficeHome'
import NagarPalikaMap from './pages/NagarPalikaMap'
import Duplicate from './pages/Duplicate'
import Imagedup from './pages/Imagedup'
import Image1 from './pages/Image1'
import DepPredict from './pages/DepPredict'
import Translator from './pages/Translator'
import Exam from './pages/Exam'
import HeadOfficerLogin from './pages/OfficeLog'
import OfficeNotice from './pages/OfficeNotice'
import Mapp from './pages/Map'
import OfficerInfo from './pages/Officer'
import DepartmentLogin from './pages/DepartLog'
import Login from './pages/Login'
import Combo from './pages/combo' // for adding nagarpalika it is used 


function App() {
  const [count, setCount] = useState(0)

  return (
      
      <Routes>  
        <Route path="/" element={<UserSelection/>} /> 
        <Route path="login" element={<Login /> } />

         <Route path="/public" element={<PublicLayout/>}>
          <Route index element={<PublicHome/>} /> {/* Default page */}
          <Route path="report" element={<ReportIssue />} />
          <Route path='track' element={<Track/>} /> 
          <Route path="history" element={<History/>} />
          <Route path="notices" element={<Notices/>} />
        </Route>

        
        {/* Protected Routes with Navbar */}
        <Route path="/office" element={<OfficeLayout mode="office" />}>
          {/* <Route path="login" element={<NagarPalikaMap />} /> */}
           {/* <Route path="login" element={<Image1/>} />  */}
          
          {/* <Route path="signup" element={<Translator />} /> */}
          <Route index element={<OfficeHome />} />
          <Route path="notices" element={<OfficeNotice />} />
          <Route path="issues" element={<ReportIssue/>} />
          <Route path="map" element={<NagarPalikaMap/>} />
          <Route path="officers" element={<OfficerInfo/>} />
        </Route>


       
        <Route path="/department/:deptId" element={<OfficeLayout mode="department" />}>
          {/* <Route index element={<DepartmentDashboard />} />
          <Route path="issues" element={<Issues mode="department" />} />
          <Route path="notices" element={<Notices mode="department" />} />
          <Route path="officers" element={<Officers mode="department" />} />
          <Route path="performance" element={<Performance mode="department" />} /> */}
        </Route>
        
         <Route path="/state" element={<Combo mode="department" />}>
           
          {/* <Route index element={<DepartmentDashboard />} />
          <Route path="issues" element={<Issues mode="department" />} />
          <Route path="notices" element={<Notices mode="department" />} />
          <Route path="officers" element={<Officers mode="department" />} />
          <Route path="performance" element={<Performance mode="department" />} /> */}
        </Route>
        



        
        
      </Routes>
    
      
  )
}

export default App
