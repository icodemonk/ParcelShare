import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext/AuthContext.jsx';
import '../../Css/TRequest.css';

const TRequest = () => {
    const [requestedParcels, setRequestedParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [rejectingRequest, setRejectingRequest] = useState(null);

    const { getToken, isAuthenticated, user ,getUserId } = useContext(AuthContext);
    const token = getToken();
    const userId = getUserId();

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login...');
            window.location.href = '/login';
            return;
        }

        // Only fetch requested parcels if authenticated
        fetchRequestedParcels();
    }, [isAuthenticated]);

    const fetchRequestedParcels = async () => {
        // Double check authentication
        if (!isAuthenticated() || !token) {
            console.error('Not authenticated or token missing');
            setError('Please log in to view parcel requests');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching requested parcels...');

            const response = await axios.get(`http://localhost:8080/api/pmc/trequest/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Requested Parcels API Response:', response.data);
            setRequestedParcels(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching requested parcels:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Failed to load parcel requests. Please try again.');
            }
            setRequestedParcels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = (parcelId) => {
        if (expandedRequest === parcelId) {
            setExpandedRequest(null);
        } else {
            setExpandedRequest(parcelId);
        }
    };

    const handleRejectRequest = async (parcelId) => {
        // Check authentication before making API call
        if (!isAuthenticated() || !token) {
            setError('Authentication required');
            return;
        }

        setRejectingRequest(parcelId);
        try {
            console.log(`Rejecting parcel ${parcelId}...`);



            if (!userId) {
                setError('User ID not found. Please log in again.');
                return;
            }

            const response = await axios.post(
                `http://localhost:8080/api/pmc/updatetreject/${parcelId}/${userId}`,
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
                // Remove rejected parcel from the list
                setRequestedParcels(prev =>
                    prev.filter(parcel => parcel.id !== parcelId)
                );

                setError('');
                setTimeout(() => {
                    alert('Request rejected successfully!');
                }, 100);
            } else {
                setError('Failed to reject request: ' + response.data);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
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

    const getRequestStatus = (parcel) => {
        if (!parcel) return 'default';
        if (parcel.status === 'PENDING') return 'pending';
        if (parcel.status === 'ACCEPTED') return 'accepted';
        if (parcel.status === 'MATCHED') return 'matched';
        return 'default';
    };

    const isUrgent = (deadline) => {
        if (!deadline) return false;
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3; // Urgent if deadline is within 3 days
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="trequest-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="trequest-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading parcel requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="trequest-container">
            <div className="trequest-header">
                <h1>Parcel Requests</h1>
                <p>Parcel delivery requests waiting for your acceptance</p>
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
                        <div className="stat-number">{requestedParcels.length}</div>
                        <div className="stat-label">Pending Requests</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚨</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {requestedParcels.filter(parcel => isUrgent(parcel.deadline)).length}
                        </div>
                        <div className="stat-label">Urgent Requests</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {requestedParcels.reduce((total, parcel) => total + (parcel.weight || 0), 0)}g
                        </div>
                        <div className="stat-label">Total Weight</div>
                    </div>
                </div>
            </div>

            <div className="requests-grid">
                {requestedParcels && requestedParcels.length > 0 ? (
                    requestedParcels.map(parcel => {
                        const isUrgentRequest = isUrgent(parcel.deadline);

                        return (
                            <div key={parcel.id} className={`request-card ${isUrgentRequest ? 'urgent' : ''}`}>
                                <div className="request-card-header" onClick={() => handleExpand(parcel.id)}>
                                    <div className="request-info">
                                        <div className="request-title">
                                            <div className="title-left">
                                                <h3>Parcel #{parcel.id}</h3>
                                                {isUrgentRequest && (
                                                    <span className="urgent-badge">URGENT</span>
                                                )}
                                            </div>
                                            <span className={`status-badge status-${getRequestStatus(parcel)}`}>
                                                {parcel.status || 'PENDING'}
                                            </span>
                                        </div>

                                        <div className="request-details">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="detail-icon">⚖️</span>
                                                    <span className="detail-label">Weight:</span>
                                                    <span className="detail-value">{parcel.weight || 0}g</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-icon">⏰</span>
                                                    <span className="detail-label">Deadline:</span>
                                                    <span className={`detail-value ${isUrgentRequest ? 'urgent-text' : ''}`}>
                                                        {formatDate(parcel.deadline)}
                                                    </span>
                                                </div>
                                            </div>

                                            {parcel.description && (
                                                <div className="parcel-description-preview">
                                                    <span className="description-label">Description:</span>
                                                    <span className="description-text">
                                                        {parcel.description.length > 80
                                                            ? `${parcel.description.substring(0, 80)}...`
                                                            : parcel.description
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="timeline-preview">
                                            <div className="timeline-item">
                                                <span className="timeline-icon">📤</span>
                                                <span className="timeline-text">
                                                    {formatDate(parcel.pickupDate)}
                                                </span>
                                            </div>
                                            <div className="timeline-arrow">→</div>
                                            <div className="timeline-item">
                                                <span className="timeline-icon">📥</span>
                                                <span className="timeline-text">
                                                    {formatDate(parcel.destinationDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="header-actions">
                                        <div className="expand-section">
                                            <button
                                                className={`expand-btn ${expandedRequest === parcel.id ? 'expanded' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExpand(parcel.id);
                                                }}
                                            >
                                                {expandedRequest === parcel.id ? '▲' : '▼'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expandedRequest === parcel.id && (
                                    <div className="request-details-section">
                                        <div className="details-grid">
                                            <div className="detail-group">
                                                <h4>📦 Parcel Information</h4>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Parcel ID:</span>
                                                    <span className="detail-value">{parcel.id}</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Status:</span>
                                                    <span className={`detail-value status-${getRequestStatus(parcel)}`}>
                                                        {parcel.status || 'PENDING'}
                                                    </span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Weight:</span>
                                                    <span className="detail-value">{parcel.weight || 0} grams</span>
                                                </div>
                                                <div className="detail-item-full">
                                                    <span className="detail-label">Creator ID:</span>
                                                    <span className="detail-value">{parcel.parcelcreaterid || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="detail-group">
                                                <h4>📍 Route Details</h4>
                                                <div className="route-coordinates">
                                                    <div className="coordinate-pair">
                                                        <span className="coordinate-label">Pickup Location:</span>
                                                        <div className="coordinates">
                                                            <code>Lat: {parcel.pickupLat?.toFixed(6)}</code>
                                                            <code>Lng: {parcel.pickupLng?.toFixed(6)}</code>
                                                        </div>
                                                    </div>
                                                    <div className="coordinate-pair">
                                                        <span className="coordinate-label">Delivery Location:</span>
                                                        <div className="coordinates">
                                                            <code>Lat: {parcel.destinationLat?.toFixed(6)}</code>
                                                            <code>Lng: {parcel.destinationLng?.toFixed(6)}</code>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {parcel.description && (
                                            <div className="description-section">
                                                <h4>📝 Parcel Description</h4>
                                                <div className="description-full">
                                                    <p>{parcel.description}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="timeline-section">
                                            <h4>⏰ Delivery Timeline</h4>
                                            <div className="timeline-full">
                                                <div className="timeline-stage">
                                                    <div className="stage-icon">📅</div>
                                                    <div className="stage-info">
                                                        <div className="stage-label">Pickup Date</div>
                                                        <div className="stage-date">{formatDate(parcel.pickupDate)}</div>
                                                    </div>
                                                </div>
                                                <div className="timeline-connector"></div>
                                                <div className="timeline-stage">
                                                    <div className="stage-icon">📅</div>
                                                    <div className="stage-info">
                                                        <div className="stage-label">Destination Date</div>
                                                        <div className="stage-date">{formatDate(parcel.destinationDate)}</div>
                                                    </div>
                                                </div>
                                                <div className="timeline-connector"></div>
                                                <div className="timeline-stage">
                                                    <div className={`stage-icon ${isUrgentRequest ? 'urgent-icon' : ''}`}>⏰</div>
                                                    <div className="stage-info">
                                                        <div className="stage-label">Deadline</div>
                                                        <div className={`stage-date ${isUrgentRequest ? 'deadline-urgent' : 'deadline-date'}`}>
                                                            {formatDate(parcel.deadline)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="request-actions">
                                            <div className="action-info">
                                                <span className="action-icon">📨</span>
                                                <span className="action-text">
                                                    {isUrgentRequest
                                                        ? '🚨 Urgent: This parcel needs to be delivered soon!'
                                                        : 'This parcel delivery request is waiting for your response'
                                                    }
                                                </span>
                                            </div>
                                            <div className="action-buttons">
                                                <button
                                                    className="reject-btn"
                                                    onClick={() => handleRejectRequest(parcel.id)}
                                                    disabled={rejectingRequest === parcel.id}
                                                >
                                                    {rejectingRequest === parcel.id ? (
                                                        <>
                                                            <div className="btn-spinner"></div>
                                                            Rejecting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="btn-icon">✕</span>
                                                            Reject Request
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📨</div>
                        <h3>No Requests Found</h3>
                        <p>There are no pending parcel requests at the moment. Requests will appear here when parcels match your travel routes.</p>
                        <button
                            onClick={fetchRequestedParcels}
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

export default TRequest;