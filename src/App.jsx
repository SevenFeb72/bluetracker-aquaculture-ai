import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import "./styles.css";


const Home = lazy(() => import("./pages/Home.jsx"));
const Help = lazy(() => import("./pages/Help.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const NewFarm = lazy(() => import("./pages/NewFarm.jsx"));   
const CurrentFarms = lazy(() => import("./pages/CurrentFarms.jsx"));


export default function App() {
  return (
    <BrowserRouter>
      <div className="page">
        <Navbar />
        <Suspense fallback={<div className="fallback">Loading…</div>}>
          <Routes>
            
            <Route path="/" element={<Home />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/current-farms" element={<CurrentFarms />} />
            <Route path="/new-farms" element={<NewFarm />} />   
            <Route path="*" element={<NotFound />} />
            <Route path="/current-farms" element={<CurrentFarms />} />
            
            
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
