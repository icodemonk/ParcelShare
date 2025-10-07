import React, {useContext, useState} from 'react';
import axios from 'axios';
import '../../Css/ParcelForm.css'
import {AuthContext} from "../../AuthContext/AuthContext.jsx";

const ParcelForm = () => {
    const { getToken, isAuthenticated ,getUserId } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        pickupLat: '',
        pickupLng: '',
        destinationLat: '',
        destinationLng: '',
        weight: '',
        pickupDate: '',
        destinationDate: '',
        deadline: '',
        description: '' ,
        parcelcreaterid : ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Get token from localStorage (assuming you stored it during login)

    const token = getToken();
    const userId = getUserId();
    if (!isAuthenticated()) {
        return (
            <div className="parcel-form-container">
                <div className="auth-required-message">
                    <h2>Authentication Required</h2>
                    <p>Please log in to create a parcel delivery request.</p>
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
                'http://localhost:8080/api/service/addparcel',
                {
                    ...formData,
                    pickupLat: parseFloat(formData.pickupLat),
                    pickupLng: parseFloat(formData.pickupLng),
                    destinationLat: parseFloat(formData.destinationLat),
                    destinationLng: parseFloat(formData.destinationLng),
                    weight: parseInt(formData.weight) ,
                    parcelcreaterid:parseInt(userId),
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setMessage('Parcel added successfully!');
            // Reset form
            setFormData({
                pickupLat: '',
                pickupLng: '',
                destinationLat: '',
                destinationLng: '',
                weight: '',
                pickupDate: '',
                destinationDate: '',
                deadline: '',
                description: ''
            });

        } catch (error) {
            console.error('Error adding parcel:', error);
            setMessage('Failed to add parcel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="parcel-form-container">
            <div className="form-header">
                <h2>Create New Parcel Delivery</h2>
                <p>Fill in the details below to create a new parcel delivery request</p>
            </div>

            <form onSubmit={handleSubmit} className="parcel-form">
                {/* Pickup Location */}
                <div className="form-section">
                    <h3>Pickup Location</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pickupLat">Pickup Latitude *</label>
                            <input
                                type="number"
                                step="any"
                                id="pickupLat"
                                name="pickupLat"
                                value={formData.pickupLat}
                                onChange={handleChange}
                                required
                                placeholder="Enter latitude"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pickupLng">Pickup Longitude *</label>
                            <input
                                type="number"
                                step="any"
                                id="pickupLng"
                                name="pickupLng"
                                value={formData.pickupLng}
                                onChange={handleChange}
                                required
                                placeholder="Enter longitude"
                            />
                        </div>
                    </div>
                </div>

                {/* Destination Location */}
                <div className="form-section">
                    <h3>Destination Location</h3>
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
                                placeholder="Enter latitude"
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
                                placeholder="Enter longitude"
                            />
                        </div>
                    </div>
                </div>

                {/* Parcel Details */}
                <div className="form-section">
                    <h3>Parcel Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="weight">Weight (grams) *</label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                required
                                placeholder="Enter weight in grams"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Parcel Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your parcel contents..."
                            rows="3"
                        />
                    </div>
                </div>

                {/* Dates Section */}
                <div className="form-section">
                    <h3>Delivery Timeline</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pickupDate">Pickup Date *</label>
                            <input
                                type="date"
                                id="pickupDate"
                                name="pickupDate"
                                value={formData.pickupDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="destinationDate">Destination Date</label>
                            <input
                                type="date"
                                id="destinationDate"
                                name="destinationDate"
                                value={formData.destinationDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deadline">Delivery Deadline *</label>
                            <input
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Parcel...' : 'Create Parcel Delivery'}
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

export default ParcelForm;