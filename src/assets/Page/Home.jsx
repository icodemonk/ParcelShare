import ParcelNav from "../Componenet/ParcelNav.jsx";
import '../Css/Home_P.css'
import a from '../img/pngwing.png'
import a1 from '../img/pngwing.com (4).png'
import a2 from '../img/pngwing.com (5).png'
import a3 from '../img/pngwing.com (6).png'
import a4 from '../img/pngwing.com (1).png'
import a5 from '../img/pngwing.com (2).png'
import a6 from '../img/pngwing.com (3).png'
import {useContext} from "react";
import {AuthContext} from "../AuthContext/AuthContext.jsx";
import GuestNav from "../Componenet/GuestNav.jsx";
import TravelerNav from "../Componenet/TravelerNav.jsx";


function HomePage() {
    const { isAuthenticated, getUserRole } = useContext(AuthContext);

    const renderNavbar = () => {
        if (!isAuthenticated()) {
            return <GuestNav />;
        }

        const role = getUserRole();
        switch (role) {
            case 'ROLE_PARCEL':
            case 'sender':
                return <ParcelNav />;
            case 'ROLE_TRAVELER':
            case 'carrier':
                return <TravelerNav />;
            default:
                return <GuestNav />;
        }
    };
    return (
        <>
            {renderNavbar()}

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Redefining Parcel Delivery with a <span className="highlight">Human Touch</span></h1>
                    <p>Connect with trusted travelers going your way. Save money, get faster deliveries, and build a stronger community—all while reducing your carbon footprint.</p>
                    <div className="cta-buttons">
                        <button className="btn btn-primary">Send a Parcel</button>
                        <button className="btn btn-secondary">Become a Traveler</button>
                    </div>
                </div>
                <div className="hero-image">
                    {/* Custom Image: Illustration of people connecting for parcel delivery */}
                    <img src={a} alt="ParcelShare Connects People" />
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <h2>How ParcelShare Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-icon">
                            {/* Custom Image: Post a request icon */}
                            <img src={a3} alt="Post a Request" />
                        </div>
                        <h3>1. Post a Request</h3>
                        <p>Share your parcel details—what, where, and when. Set your budget and let the community help.</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">
                            {/* Custom Image: Find a traveler icon */}
                            <img src={a2} alt="Find a Traveler" />
                        </div>
                        <h3>2. Find a Traveler</h3>
                        <p>Our platform matches you with verified travelers heading in the right direction.</p>
                    </div>
                    <div className="step">
                        <div className="step-icon">
                            {/* Custom Image: Connect & deliver icon */}
                            <img src={a1} alt="Connect & Deliver" />
                        </div>
                        <h3>3. Connect & Deliver</h3>
                        <p>Chat securely, arrange the handover, and track your parcel's journey in real-time.</p>
                    </div>
                </div>
            </section>

            {/* Key Benefits Section */}
            <section className="benefits">
                <div className="benefits-content">
                    <h2>Why Choose ParcelShare?</h2>
                    <div className="benefit-item">
                        {/* Custom Image: Cost-saving illustration */}
                        <img src={a4} alt="Cost Effective" />
                        <div>
                            <h3>Cost-Effective</h3>
                            <p>Save up to 80% compared to traditional courier services. Travelers earn extra income by utilizing their spare luggage space.</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        {/* Custom Image: Speed illustration */}
                        <img src={a5} alt="Faster Delivery" />
                        <div>
                            <h3>Faster & Flexible</h3>
                            <p>Get same-day or next-day deliveries based on traveler schedules. Perfect for urgent, time-sensitive packages.</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        {/* Custom Image: Community illustration */}
                        <img src={a6} alt="Build Community" />
                        <div>
                            <h3>Build Trust & Community</h3>
                            <p>Our rating and review system ensures a safe and reliable network. Connect with people you can trust.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="final-cta">
                <h2>Ready to Experience Smarter Delivery?</h2>
                <p>Join the ParcelShare community today and be a part of the future of parcel logistics.</p>
                <button className="btn btn-large">Sign Up Now - It's Free!</button>
            </section>
        </>
    );
}

export default HomePage;