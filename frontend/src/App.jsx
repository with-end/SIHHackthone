import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ✅ FIXED import
import UserSelection from './pages/UserSelection'
import History from './pages/History'
import PublicLayout from './layouts/PublicLayout'
import ReportIssue from './pages/ReportIssue'
import PublicHome from './pages/PublicHome'
import Notices from './pages/Notices'
import Track from './pages/Track'
import OfficeLayout from './layouts/OfficeLayout'
import NagarPalikaMap from './pages/NagarPalikaMap'
import Translator from './pages/Translator'
import OfficeNotice from './pages/OfficeNotice'
import OfficerInfo from './pages/Officer'
import Login from './pages/Login'
import Combo from './pages/combo' // for adding nagarpalika it is used
import Verifyer from './pages/Verifyer' 
import "./i18n"; 
import TempOffice from './pages/tempOffice'
import Test from './pages/test' 


function App() {
  const [count, setCount] = useState(0)

  return (
      
      <Routes>  
        <Route path="/trans" element={<Translator/>} />
        <Route path="/" element={<UserSelection/>} /> 
        <Route path="login" element={<Login /> } />
        <Route path="test" element={<Test/>} /> 
          
         {/* for public pages */}
         <Route path="/public" element={<PublicLayout/>}>
          <Route index element={<PublicHome/>} /> {/* Default page */}
          <Route path="report" element={<ReportIssue />} />
          <Route path='track' element={<Track/>} /> 
          <Route path="history" element={<History/>} />
          <Route path="notices" element={<Notices/>} />
        </Route>

          
          {/* Protected Routes with Navbar */}
          <Route path="/office" element={<OfficeLayout mode="office" />}>
            <Route path="" element={<TempOffice mode="office" />} />
            <Route path="notices" element={<OfficeNotice />} />
            <Route path="issues" element={<ReportIssue/>} />
            <Route path="map" element={<NagarPalikaMap/>} />
            <Route path="officers" element={<OfficerInfo/>} />
          </Route>


          {/* for a specific sub officer */}
          <Route path="verify" element={<Verifyer/>}/>  
       
        <Route path="/department/:deptId" element={<OfficeLayout mode="department" />}>
           <Route path="" element={<TempOffice mode="department" />} />
           <Route path="issues" element={<ReportIssue mode="department" />} />
           <Route path="notices" element={<OfficeNotice mode="department" />} />
           <Route path="officers" element={<OfficerInfo mode="department" />} />
           <Route path="map" element={<NagarPalikaMap mode="department" />} />
        </Route>
        
         <Route path="/state" element={<Combo mode="department" />}>
           

        </Route>
        



        
        
      </Routes>
    
      
  )
}

export default App
