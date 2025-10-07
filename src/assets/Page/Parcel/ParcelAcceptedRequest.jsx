import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from "../../AuthContext/AuthContext.jsx";
import '../../Css/ParcelAcceptedRequest.css';

const ParcelAcceptedRequest = () => {
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [rejectingRequest, setRejectingRequest] = useState(null);

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

        // Only fetch accepted requests if authenticated
        if (userId) {
            fetchAcceptedRequests();
        }
    }, [isAuthenticated, userId]);

    const fetchAcceptedRequests = async () => {
        // Double check authentication
        if (!isAuthenticated() || !token || !userId) {
            console.error('Not authenticated or user ID missing');
            setError('Please log in to view accepted requests');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching accepted parcel requests for user:', userId);

            const response = await axios.get(`http://localhost:8080/api/pmc/parequest/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Accepted Parcel Requests API Response:', response.data);
            setAcceptedRequests(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching accepted parcel requests:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Failed to load accepted requests. Please try again.');
            }
            setAcceptedRequests([]);
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

    const handleRejectRequest = async (parcelmatchid) => {
        // Check authentication before making API call
        if (!isAuthenticated() || !token) {
            setError('Authentication required');
            return;
        }

        setRejectingRequest(parcelmatchid);
        try {
            console.log(`Rejecting accepted request ${parcelmatchid}...`);
            const response = await axios.post(
                `http://localhost:8080/api/pmc/updatepreject/${parcelmatchid}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Reject request response:', response.data);

            if (response.data.includes('SUCCESSFULLY')) {
                // Remove rejected request from the list
                setAcceptedRequests(prev =>
                    prev.filter(request => request.parcelmatchid !== parcelmatchid)
                );

                setError('');
                setTimeout(() => {
                    alert('Request rejected successfully!');
                }, 100);
            } else {
                setError('Failed to reject request: ' + response.data);
            }
        } catch (error) {
            console.error('Error rejecting accepted request:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else {
                setError('Error rejecting request. Please try again.');
            }
        } finally {
            setRejectingRequest(null);
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

    const getDaysUntilDeadline = (deadline) => {
        if (!deadline) return null;
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="parcel-accepted-request-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="parcel-accepted-request-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading accepted requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="parcel-accepted-request-container">
            <div className="parcel-accepted-request-header">
                <h1>Accepted Parcel Requests</h1>
                <p>Your parcels that have been accepted by travelers</p>
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
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-number">{acceptedRequests.length}</div>
                        <div className="stat-label">Accepted Requests</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {new Set(acceptedRequests.map(req => req.traveler?.id)).size}
                        </div>
                        <div className="stat-label">Active Travelers</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {acceptedRequests.filter(req => {
                                const daysLeft = getDaysUntilDeadline(req.parcel?.deadline);
                                return daysLeft !== null && daysLeft <= 3;
                            }).length}
                        </div>
                        <div className="stat-label">Urgent Deliveries</div>
                    </div>
                </div>
            </div>

            <div className="requests-grid">
                {acceptedRequests && acceptedRequests.length > 0 ? (
                    acceptedRequests.map(request => {
                        const distance = calculateDistance(
                            request.parcel?.pickupLat, request.parcel?.pickupLng,
                            request.parcel?.destinationLat, request.parcel?.destinationLng
                        );
                        const daysUntilDeadline = getDaysUntilDeadline(request.parcel?.deadline);

                        return (
                            <div key={request.parcelmatchid} className="request-card">
                                <div className="request-card-header" onClick={() => handleExpand(request.parcelmatchid)}>
                                    <div className="request-info">
                                        <div className="request-title">
                                            <h3>Parcel #{request.parcel?.id}</h3>
                                            <div className="status-section">
                                                <span className="status-badge status-accepted">
                                                    ACCEPTED
                                                </span>
                                                {daysUntilDeadline !== null && daysUntilDeadline <= 3 && (
                                                    <span className="urgency-badge">
                                                        ⚠️ {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} left
                                                    </span>
                                                )}
                                            </div>
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
                                                    <span className="detail-value deadline-date">{formatDate(request.parcel?.deadline)}</span>
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
                                                    Traveler #{request.traveler?.id} is delivering your parcel
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="header-actions">
                                        <button
                                            className="reject-btn-header"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRejectRequest(request.parcelmatchid);
                                            }}
                                            disabled={rejectingRequest === request.parcelmatchid}
                                        >
                                            {rejectingRequest === request.parcelmatchid ? (
                                                <>
                                                    <div className="btn-spinner"></div>
                                                    Rejecting...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="btn-icon">✕</span>
                                                    Reject
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
                                                    <span className={`detail-value ${daysUntilDeadline <= 3 ? 'deadline-urgent' : ''}`}>
                                                        {formatDate(request.parcel?.deadline)}
                                                        {daysUntilDeadline !== null && (
                                                            <span className="days-left"> ({daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} left)</span>
                                                        )}
                                                    </span>
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

                                        <div className="delivery-timeline">
                                            <h4>🚚 Delivery Progress</h4>
                                            <div className="timeline-steps">
                                                <div className="timeline-step completed">
                                                    <div className="step-icon">📨</div>
                                                    <div className="step-info">
                                                        <div className="step-label">Request Sent</div>
                                                        <div className="step-status">Completed</div>
                                                    </div>
                                                </div>
                                                <div className="timeline-connector completed"></div>
                                                <div className="timeline-step completed">
                                                    <div className="step-icon">✅</div>
                                                    <div className="step-info">
                                                        <div className="step-label">Request Accepted</div>
                                                        <div className="step-status">Completed</div>
                                                    </div>
                                                </div>
                                                <div className="timeline-connector active"></div>
                                                <div className="timeline-step active">
                                                    <div className="step-icon">🚚</div>
                                                    <div className="step-info">
                                                        <div className="step-label">In Transit</div>
                                                        <div className="step-status">Active</div>
                                                    </div>
                                                </div>
                                                <div className="timeline-connector"></div>
                                                <div className="timeline-step">
                                                    <div className="step-icon">📦</div>
                                                    <div className="step-info">
                                                        <div className="step-label">Delivered</div>
                                                        <div className="step-status">Pending</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="action-section">
                                            <div className="action-info">
                                                <span className="action-icon">✅</span>
                                                <span className="action-text">
                                                    Traveler #{request.traveler?.id} has accepted your parcel delivery request.
                                                    The delivery is currently in progress.
                                                </span>
                                            </div>
                                            <button
                                                className="reject-btn-full"
                                                onClick={() => handleRejectRequest(request.parcelmatchid)}
                                                disabled={rejectingRequest === request.parcelmatchid}
                                            >
                                                {rejectingRequest === request.parcelmatchid ? (
                                                    <>
                                                        <div className="btn-spinner"></div>
                                                        Rejecting Request...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="btn-icon">✕</span>
                                                        Reject Delivery
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
                        <div className="no-data-icon">✅</div>
                        <h3>No Accepted Requests</h3>
                        <p>You don't have any accepted parcel requests at the moment. Accepted requests will appear here when travelers accept your parcel delivery requests.</p>
                        <button
                            onClick={fetchAcceptedRequests}
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

export default ParcelAcceptedRequest;