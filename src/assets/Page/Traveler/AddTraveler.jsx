import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext/AuthContext.jsx';
import '../../Css/TravelerForm.css';

const AddTraveler = () => {
    const [formData, setFormData] = useState({
        originLat: '',
        originLng: '',
        destinationLat: '',
        destinationLng: '',
        originDate: '',
        destinationDate: '',
        weight: '' ,
        travelercreatorid : ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Get token from AuthContext
    const { getToken, isAuthenticated ,getUserId } = useContext(AuthContext);
    const token = getToken();
    const userId = getUserId();

    // Redirect or show message if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="traveler-form-container">
                <div className="auth-required-message">
                    <h2>Authentication Required</h2>
                    <p>Please log in to add your travel plan.</p>
                    <a href="/login" className="login-redirect-btn">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(
                'http://localhost:8080/api/service/addtraveler',
                {
                    ...formData,
                    originLat: parseFloat(formData.originLat),
                    originLng: parseFloat(formData.originLng),
                    destinationLat: parseFloat(formData.destinationLat),
                    destinationLng: parseFloat(formData.destinationLng),
                    weight: parseInt(formData.weight) ,
                    travelercreatorid : parseInt(userId)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setMessage('Travel plan added successfully!');
            // Reset form
            setFormData({
                originLat: '',
                originLng: '',
                destinationLat: '',
                destinationLng: '',
                originDate: '',
                destinationDate: '',
                weight: ''
            });

        } catch (error) {
            console.error('Error adding travel plan:', error);
            if (error.response?.status === 401) {
                setMessage('Session expired. Please log in again.');
            } else if (error.response?.status === 403) {
                setMessage('Access denied. You need TRAVELER role to add travel plans.');
            } else {
                setMessage(error.response?.data?.message || 'Failed to add travel plan. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="traveler-form-container">
            <div className="form-header">
                <h2>Add Your Travel Plan</h2>
                <p>Share your travel route and help deliver parcels while you travel</p>
            </div>

            <form onSubmit={handleSubmit} className="traveler-form">
                {/* Origin Location */}
                <div className="form-section">
                    <h3>Starting Point</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="originLat">Origin Latitude *</label>
                            <input
                                type="number"
                                step="any"
                                id="originLat"
                                name="originLat"
                                value={formData.originLat}
                                onChange={handleChange}
                                required
                                placeholder="Enter starting latitude"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="originLng">Origin Longitude *</label>
                            <input
                                type="number"
                                step="any"
                                id="originLng"
                                name="originLng"
                                value={formData.originLng}
                                onChange={handleChange}
                                required
                                placeholder="Enter starting longitude"
                            />
                        </div>
                    </div>
                </div>

                {/* Destination Location */}
                <div className="form-section">
                    <h3>Destination Point</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="destinationLat">Destination Latitude *</label>
                            <input
                                type="number"
                                step="any"
                                id="destinationLat"
                                name="destinationLat"
                                value={formData.destinationLat}
                                onChange={handleChange}
                                required
                                placeholder="Enter destination latitude"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="destinationLng">Destination Longitude *</label>
                            <input
                                type="number"
                                step="any"
                                id="destinationLng"
                                name="destinationLng"
                                value={formData.destinationLng}
                                onChange={handleChange}
                                required
                                placeholder="Enter destination longitude"
                            />
                        </div>
                    </div>
                </div>

                {/* Travel Details */}
                <div className="form-section">
                    <h3>Travel Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="weight">Available Capacity (grams) *</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                                placeholder="Enter available carrying capacity"
                                min="1"
                            />
                            <small className="form-help">How much weight can you carry for parcels?</small>
                        </div>
                    </div>
                </div>

                {/* Travel Dates Section */}
                <div className="form-section">
                    <h3>Travel Timeline</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="originDate">Departure Date *</label>
                            <input
                                type="date"
                                id="originDate"
                                name="originDate"
                                value={formData.originDate}
                                onChange={handleChange}
                                required
                            />
                            <small className="form-help">When are you starting your journey?</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="destinationDate">Arrival Date *</label>
                            <input
                                type="date"
                                id="destinationDate"
                                name="destinationDate"
                                value={formData.destinationDate}
                                onChange={handleChange}
                                required
                            />
                            <small className="form-help">When do you expect to reach your destination?</small>
                        </div>
                    </div>
                </div>

                {/* Benefits Info */}
                <div className="info-section">
                    <h4>🚀 Benefits of Adding Your Travel Plan</h4>
                    <ul>
                        <li>Earn extra income by delivering parcels</li>
                        <li>Reduce your travel costs</li>
                        <li>Help others in your community</li>
                        <li>Build trust and reputation as a traveler</li>
                    </ul>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Adding Travel Plan...' : 'Add Travel Plan'}
                    </button>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddTraveler;