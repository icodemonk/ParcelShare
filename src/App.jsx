import './App.css';
import { AuthProvider } from "../src/assets/AuthContext/AuthContext.jsx";
import Login from "./assets/Page/Login.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home_P from "./assets/Page/Home.jsx"
import Suggestions from "./assets/Page/Parcel/ParcelRequestReceived.jsx"
import ParcelForm from "./assets/Page/Parcel/ParcelForm.jsx";
import AddTraveler from "./assets/Page/Traveler/AddTraveler.jsx";
import TSuggestion from "./assets/Page/Traveler/TSuggestion.jsx";
import TAll from "./assets/Page/Traveler/TAll.jsx";
import TMatched from "./assets/Page/Traveler/TMatched.jsx";
import TRequest from "./assets/Page/Traveler/TRequest.jsx";
import Signup from "./assets/Page/Signup.jsx";
import ParcelAcceptedRequest from "./assets/Page/Parcel/ParcelAcceptedRequest.jsx";
import PMatched from "./assets/Page/Parcel/PMatched.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/traveler-requests" element={<TRequest />} />
                    <Route path="/parcel-matched" element={<PMatched />} />
                    <Route path="/traveler-matched" element={<TMatched />} />
                    <Route path="/prequest" element={<ParcelAcceptedRequest />} />
                    <Route path="/traveler-suggestions" element={<TSuggestion/>}/>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home_P />} />
                    <Route path="/traveler-all" element={<TAll />} />
                    <Route path="/addparcel" element={<ParcelForm />} />
                    <Route path="/suggestion" element={<Suggestions />} />
                    <Route path="/add-traveler" element={<AddTraveler />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App;