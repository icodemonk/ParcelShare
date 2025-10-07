import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from "../../AuthContext/AuthContext.jsx";
import '../../Css/ParcelRequestReceived.css';

const ParcelRequestReceived = () => {
    const [parcelRequests, setParcelRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [acceptingRequest, setAcceptingRequest] = useState(null);

    const { getToken, isAuthenticated, getUserId } = useContext(AuthContext);
    const token = getToken();
    const userId = getUserId();

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login...');
            window.location.href = '/login';
            return;
        }

        // Only fetch parcel requests if authenticated
        if (userId) {
            fetchParcelRequests();
        }
    }, [isAuthenticated, userId]);

    const fetchParcelRequests = async () => {
        // Double check authentication
        if (!isAuthenticated() || !token || !userId) {
            console.error('Not authenticated or user ID missing');
            setError('Please log in to view parcel requests');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching parcel requests for user:', userId);

            const response = await axios.get(`http://localhost:8080/api/pmc/prequest/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Parcel Requests API Response:', response.data);
            setParcelRequests(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching parcel requests:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Failed to load parcel requests. Please try again.');
            }
            setParcelRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = (requestId) => {
        if (expandedRequest === requestId) {
            setExpandedRequest(null);
        } else {
            setExpandedRequest(requestId);
        }
    };

    const handleAcceptRequest = async (parcelmatchid) => {
        // Check authentication before making API call
        if (!isAuthenticated() || !token) {
            setError('Authentication required');
            return;
        }

        setAcceptingRequest(parcelmatchid);
        try {
            console.log(`Accepting parcel request ${parcelmatchid}...`);
            const response = await axios.post(
                `http://localhost:8080/api/pmc/updatepaccept/${parcelmatchid}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Accept request response:', response.data);

            if (response.data.includes('SUCCESSFULLY')) {
                // Remove accepted request from the list
                setParcelRequests(prev =>
                    prev.filter(request => request.parcelmatchid !== parcelmatchid)
                );

                setError('');
                setTimeout(() => {
                    alert('Parcel request accepted successfully!');
                }, 100);
            } else {
                setError('Failed to accept request: ' + response.data);
            }
        } catch (error) {
            console.error('Error accepting parcel request:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else {
                setError('Error accepting request. Please try again.');
            }
        } finally {
            setAcceptingRequest(null);
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
            <div className="parcel-request-received-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="parcel-request-received-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading parcel requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="parcel-request-received-container">
            <div className="parcel-request-received-header">
                <h1>Parcel Requests Received</h1>
                <p>Traveler requests for your parcel deliveries</p>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button className="error-close" onClick={() => setError('')}>×</button>
                </div>
            )}

            <div className="requests-stats">
                <div className="stat-card">
                    <div className="stat-icon">📨</div>
                    <div className="stat-info">
                        <div className="stat-number">{parcelRequests.length}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {new Set(parcelRequests.map(req => req.traveler?.id)).size}
                        </div>
                        <div className="stat-label">Unique Travelers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {parcelRequests.reduce((total, req) => total + (req.parcel?.weight || 0), 0)}g
                        </div>
                        <div className="stat-label">Total Weight</div>
                    </div>
                </div>
            </div>

            <div className="requests-grid">
                {parcelRequests && parcelRequests.length > 0 ? (
                    parcelRequests.map(request => {
                        const distance = calculateDistance(
                            request.parcel?.pickupLat, request.parcel?.pickupLng,
                            request.parcel?.destinationLat, request.parcel?.destinationLng
                        );

                        return (
                            <div key={request.parcelmatchid} className="request-card">
                                <div className="request-card-header" onClick={() => handleExpand(request.parcelmatchid)}>
                                    <div className="request-info">
                                        <div className="request-title">
                                            <h3>Parcel #{request.parcel?.id}</h3>
                                            <span className="status-badge status-pending">
                                                PENDING
                                            </span>
                                        </div>

                                        <div className="request-details">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="detail-icon">⚖️</span>
                                                    <span className="detail-label">Weight:</span>
                                                    <span className="detail-value">{request.parcel?.weight || 0}g</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-label">Deadline:</span>
                                                    <span className="detail-value">{formatDate(request.parcel?.deadline)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">📏</span>
                                                    <span className="detail-label">Distance:</span>
                                                    <span className="detail-value">{distance} km</span>
                                                </div>
                                            </div>

                                            {request.parcel?.description && (
                                                <div className="parcel-description-preview">
                                                    <span className="description-label">Description:</span>
                                                    <span className="description-text">
                                                        {request.parcel.description.length > 80
                                                            ? `${request.parcel.description.substring(0, 80)}...`
                                                            : request.parcel.description
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="traveler-preview">
                                            <div className="traveler-info-mini">
                                                <span className="traveler-icon">👤</span>
                                                <span className="traveler-text">
                                                    Traveler #{request.traveler?.id} wants to deliver your parcel
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="header-actions">
                                        <button
                                            className="accept-btn-header"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAcceptRequest(request.parcelmatchid);
                                            }}
                                            disabled={acceptingRequest === request.parcelmatchid}
                                        >
                                            {acceptingRequest === request.parcelmatchid ? (
                                                <>
                                                    <div className="btn-spinner"></div>
                                                    Accepting...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="btn-icon">✓</span>
                                                    Accept
                                                </>
                                            )}
                                        </button>
                                        <div className="expand-section">
                                            <button
                                                className={`expand-btn ${expandedRequest === request.parcelmatchid ? 'expanded' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExpand(request.parcelmatchid);
                                                }}
                                            >
                                                {expandedRequest === request.parcelmatchid ? '▲' : '▼'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expandedRequest === request.parcelmatchid && (
                                    <div className="request-details-section">
                                        <div className="details-grid">
                                            <div className="detail-group">
                                                <h4>📦 Your Parcel Information</h4>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Parcel ID:</span>
                                                    <span className="detail-value">{request.parcel?.id}</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Weight:</span>
                                                    <span className="detail-value">{request.parcel?.weight || 0} grams</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Deadline:</span>
                                                    <span className="detail-value">{formatDate(request.parcel?.deadline)}</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Route Distance:</span>
                                                    <span className="detail-value">{distance} km</span>
                                                </div>
                                            </div>

                                            <div className="detail-group">
                                                <h4>👤 Traveler Information</h4>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Traveler ID:</span>
                                                    <span className="detail-value">{request.traveler?.id}</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Available Capacity:</span>
                                                    <span className="detail-value">{request.traveler?.weight || 0}g</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Travel Dates:</span>
                                                    <span className="detail-value">
                                                        {formatDate(request.traveler?.originDate)} → {formatDate(request.traveler?.destinationDate)}
                                                    </span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Status:</span>
                                                    <span className="detail-value status-active">{request.traveler?.status || 'ACTIVE'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="coordinates-grid">
                                            <div className="coordinate-group">
                                                <h4>📍 Parcel Route</h4>
                                                <div className="route-coordinates">
                                                    <div className="coordinate-pair">
                                                        <span className="coordinate-label">Pickup Location:</span>
                                                        <div className="coordinates">
                                                            <code>Lat: {request.parcel?.pickupLat?.toFixed(6)}</code>
                                                            <code>Lng: {request.parcel?.pickupLng?.toFixed(6)}</code>
                                                        </div>
                                                    </div>
                                                    <div className="coordinate-pair">
                                                        <span className="coordinate-label">Delivery Location:</span>
                                                        <div className="coordinates">
                                                            <code>Lat: {request.parcel?.destinationLat?.toFixed(6)}</code>
                                                            <code>Lng: {request.parcel?.destinationLng?.toFixed(6)}</code>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="coordinate-group">
                                                <h4>🗺️ Traveler Route</h4>
                                                <div className="route-coordinates">
                                                    <div className="coordinate-pair">
                                                        <span className="coordinate-label">Origin:</span>
                                                        <div className="coordinates">
                                                            <code>Lat: {request.traveler?.originLat?.toFixed(6)}</code>
                                                            <code>Lng: {request.traveler?.originLng?.toFixed(6)}</code>
                                                        </div>
                                                    </div>
                                                    <div className="coordinate-pair">
                                                        <span className="coordinate-label">Destination:</span>
                                                        <div className="coordinates">
                                                            <code>Lat: {request.traveler?.destinationLat?.toFixed(6)}</code>
                                                            <code>Lng: {request.traveler?.destinationLng?.toFixed(6)}</code>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {request.parcel?.description && (
                                            <div className="description-section">
                                                <h4>📝 Parcel Description</h4>
                                                <div className="description-full">
                                                    <p>{request.parcel.description}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="action-section">
                                            <div className="action-info">
                                                <span className="action-icon">📨</span>
                                                <span className="action-text">
                                                    Traveler #{request.traveler?.id} is interested in delivering your parcel.
                                                    Accept to proceed with the delivery.
                                                </span>
                                            </div>
                                            <button
                                                className="accept-btn-full"
                                                onClick={() => handleAcceptRequest(request.parcelmatchid)}
                                                disabled={acceptingRequest === request.parcelmatchid}
                                            >
                                                {acceptingRequest === request.parcelmatchid ? (
                                                    <>
                                                        <div className="btn-spinner"></div>
                                                        Accepting Request...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="btn-icon">✓</span>
                                                        Accept Traveler Request
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📨</div>
                        <h3>No Requests Received</h3>
                        <p>You haven't received any parcel delivery requests from travelers yet. Requests will appear here when travelers show interest in your parcels.</p>
                        <button
                            onClick={fetchParcelRequests}
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

export default ParcelRequestReceived;