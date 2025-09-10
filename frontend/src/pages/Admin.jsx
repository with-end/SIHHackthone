//import AdminDashboard from "../components/AdminDashboard";
import { Helmet } from "react-helmet-async";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Helmet manages <head> tags in React */}
      <Helmet>
        <title>Admin Dashboard - CivicConnect</title>
        <meta
          name="description"
          content="Government admin dashboard for managing community reports and tracking departmental performance."
        />
      </Helmet>
       <div> hellow what about you </div>
  
    </div>
  );
}
