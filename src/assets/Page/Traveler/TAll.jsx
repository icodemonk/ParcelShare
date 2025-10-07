import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext/AuthContext.jsx';
import '../../Css/TAll.css';

const TAll = () => {
    const [travelers, setTravelers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedTraveler, setExpandedTraveler] = useState(null);

    const { getToken, isAuthenticated, getUserId} = useContext(AuthContext);
    const token = getToken();
    const userId= getUserId();

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login...');
            window.location.href = '/login';
            return;
        }

        // Only fetch travelers if authenticated
        fetchTravelers();
    }, [isAuthenticated]);

    const fetchTravelers = async () => {
        // Double check authentication
        if (!isAuthenticated() || !token) {
            console.error('Not authenticated or token missing');
            setError('Please log in to view travelers');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching all travelers...');

            const response = await axios.post(`http://localhost:8080/api/pmc/alltraveler/${userId}`, {},{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('All Travelers API Response:', response.data);
            setTravelers(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching travelers:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Failed to load travelers. Please try again.');
            }
            setTravelers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = (travelerId) => {
        if (expandedTraveler === travelerId) {
            setExpandedTraveler(null);
        } else {
            setExpandedTraveler(travelerId);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance.toFixed(2);
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="tall-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="tall-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading all travelers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tall-container">
            <div className="tall-header">
                <h1>All Travelers</h1>
                <p>View all active travel plans in the system</p>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button className="error-close" onClick={() => setError('')}>×</button>
                </div>
            )}

            <div className="travelers-stats">
                <div className="stat-card">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-info">
                        <div className="stat-number">{travelers.length}</div>
                        <div className="stat-label">Total Travelers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {travelers.filter(t => new Date(t.originDate) > new Date()).length}
                        </div>
                        <div className="stat-label">Upcoming Trips</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💼</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {travelers.reduce((total, t) => total + (t.weight || 0), 0)}g
                        </div>
                        <div className="stat-label">Total Capacity</div>
                    </div>
                </div>
            </div>

            <div className="travelers-grid">
                {travelers && travelers.length > 0 ? (
                    travelers.map(traveler => {
                        const distance = calculateDistance(
                            traveler.originLat, traveler.originLng,
                            traveler.destinationLat, traveler.destinationLng
                        );

                        return (
                            <div key={traveler.id} className="traveler-card">
                                <div className="traveler-card-header" onClick={() => handleExpand(traveler.id)}>
                                    <div className="traveler-info">
                                        <div className="traveler-title">
                                            <h3>Traveler #{traveler.id}</h3>
                                            <span className={`status-badge ${traveler.status?.toLowerCase() || 'active'}`}>
                                                {traveler.status || 'ACTIVE'}
                                            </span>
                                        </div>

                                        <div className="route-info">
                                            <div className="route-point">
                                                <span className="point-icon">📍</span>
                                                <div className="point-details">
                                                    <span className="point-label">Origin</span>
                                                    <span className="coordinates">
                                                        {traveler.originLat?.toFixed(6)}, {traveler.originLng?.toFixed(6)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="route-distance">
                                                <span className="distance-icon">📏</span>
                                                <span className="distance-text">{distance} km</span>
                                            </div>
                                            <div className="route-point">
                                                <span className="point-icon">🎯</span>
                                                <div className="point-details">
                                                    <span className="point-label">Destination</span>
                                                    <span className="coordinates">
                                                        {traveler.destinationLat?.toFixed(6)}, {traveler.destinationLng?.toFixed(6)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="traveler-meta">
                                            <div className="meta-item">
                                                <span className="meta-icon">📅</span>
                                                <span className="meta-text">
                                                    Depart: {formatDate(traveler.originDate)}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-icon">📅</span>
                                                <span className="meta-text">
                                                    Arrive: {formatDate(traveler.destinationDate)}
                                                </span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-icon">💼</span>
                                                <span className="meta-text">Capacity: {traveler.weight || 0}g</span>
                                            </div>
                                        </div>

                                        {traveler.travelercreatorid && (
                                            <div className="creator-info">
                                                <span className="creator-label">Created by User ID: </span>
                                                <span className="creator-id">{traveler.travelercreatorid}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="expand-section">
                                        <button
                                            className={`expand-btn ${expandedTraveler === traveler.id ? 'expanded' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExpand(traveler.id);
                                            }}
                                        >
                                            {expandedTraveler === traveler.id ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {expandedTraveler === traveler.id && (
                                    <div className="traveler-details-section">
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Traveler ID:</span>
                                                <span className="detail-value">{traveler.id}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Status:</span>
                                                <span className={`detail-value status-${traveler.status?.toLowerCase() || 'active'}`}>
                                                    {traveler.status || 'ACTIVE'}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Creator ID:</span>
                                                <span className="detail-value">{traveler.travelercreatorid || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Route Distance:</span>
                                                <span className="detail-value">{distance} km</span>
                                            </div>
                                        </div>

                                        <div className="coordinates-details">
                                            <div className="coordinate-group">
                                                <h4>Origin Coordinates</h4>
                                                <div className="coordinate-item">
                                                    <span>Latitude: </span>
                                                    <code>{traveler.originLat}</code>
                                                </div>
                                                <div className="coordinate-item">
                                                    <span>Longitude: </span>
                                                    <code>{traveler.originLng}</code>
                                                </div>
                                            </div>
                                            <div className="coordinate-group">
                                                <h4>Destination Coordinates</h4>
                                                <div className="coordinate-item">
                                                    <span>Latitude: </span>
                                                    <code>{traveler.destinationLat}</code>
                                                </div>
                                                <div className="coordinate-item">
                                                    <span>Longitude: </span>
                                                    <code>{traveler.destinationLng}</code>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="timeline-info">
                                            <h4>Travel Timeline</h4>
                                            <div className="timeline">
                                                <div className="timeline-item">
                                                    <span className="timeline-date">{formatDate(traveler.originDate)}</span>
                                                    <span className="timeline-event">Departure</span>
                                                </div>
                                                <div className="timeline-arrow">→</div>
                                                <div className="timeline-item">
                                                    <span className="timeline-date">{formatDate(traveler.destinationDate)}</span>
                                                    <span className="timeline-event">Arrival</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">🚚</div>
                        <h3>No Travelers Found</h3>
                        <p>There are no travelers registered in the system yet.</p>
                        <button
                            onClick={fetchTravelers}
                            className="retry-btn"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TAll;