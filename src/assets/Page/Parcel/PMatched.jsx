import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext/AuthContext';
import '../../Css/PMatched.css';

const PMatched = () => {
    const [matchedParcels, setMatchedParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedParcel, setExpandedParcel] = useState(null);

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

        // Only fetch matched parcels if authenticated
        fetchMatchedParcels();
    }, [isAuthenticated]);

    const fetchMatchedParcels = async () => {
        // Double check authentication
        if (!isAuthenticated() || !token) {
            console.error('Not authenticated or token missing');
            setError('Please log in to view matched parcels');
            setLoading(false);
            return;
        }


        try {
            setLoading(true);
            console.log('Fetching matched parcels for user:', userId);

            const response = await axios.get(`http://localhost:8080/api/pmc/pmatched/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Matched Parcels API Response:', response.data);
            setMatchedParcels(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching matched parcels:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else if (error.response?.status === 403) {
                setError('Access denied. You need PARCEL role to view this page.');
            } else {
                setError('Failed to load matched parcels. Please try again.');
            }
            setMatchedParcels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = (parcelId) => {
        if (expandedParcel === parcelId) {
            setExpandedParcel(null);
        } else {
            setExpandedParcel(parcelId);
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

    const getParcelStatus = (parcel) => {
        if (parcel.status === 'MATCHED') return 'matched';
        if (parcel.status === 'DELIVERED') return 'delivered';
        if (parcel.status === 'PENDING') return 'pending';
        return 'default';
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="pmatched-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="pmatched-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading matched parcels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pmatched-container">
            <div className="pmatched-header">
                <h1>Matched Parcels</h1>
                <p>Your parcels that have been successfully matched with travelers</p>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button className="error-close" onClick={() => setError('')}>×</button>
                </div>
            )}

            <div className="matched-stats">
                <div className="stat-card">
                    <div className="stat-icon">🤝</div>
                    <div className="stat-info">
                        <div className="stat-number">{matchedParcels.length}</div>
                        <div className="stat-label">Total Matches</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {matchedParcels.filter(parcel => parcel.parcel?.status === 'MATCHED').length}
                        </div>
                        <div className="stat-label">Active Deliveries</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {matchedParcels.filter(parcel => parcel.parcel?.status === 'DELIVERED').length}
                        </div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            <div className="parcels-grid">
                {matchedParcels && matchedParcels.length > 0 ? (
                    matchedParcels.map(match => (
                        <div key={match.id} className="parcel-card">
                            <div className="parcel-card-header" onClick={() => handleExpand(match.id)}>
                                <div className="parcel-info">
                                    <div className="parcel-title">
                                        <h3>Match #{match.id}</h3>
                                        <span className={`status-badge status-${getParcelStatus(match.parcel)}`}>
                                            {match.parcel?.status || 'MATCHED'}
                                        </span>
                                    </div>

                                    <div className="parcel-details">
                                        <div className="detail-row">
                                            <div className="detail-item">
                                                <span className="detail-icon">📦</span>
                                                <span className="detail-label">Parcel ID:</span>
                                                <span className="detail-value">{match.parcel?.id || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-icon">⚖️</span>
                                                <span className="detail-label">Weight:</span>
                                                <span className="detail-value">{match.parcel?.weight || 0}g</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-icon">⏰</span>
                                                <span className="detail-label">Deadline:</span>
                                                <span className="detail-value">{formatDate(match.parcel?.deadline)}</span>
                                            </div>
                                        </div>

                                        {match.parcel?.description && (
                                            <div className="parcel-description-preview">
                                                <span className="description-label">Description:</span>
                                                <span className="description-text">
                                                    {match.parcel.description.length > 80
                                                        ? `${match.parcel.description.substring(0, 80)}...`
                                                        : match.parcel.description
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="timeline-preview">
                                        <div className="timeline-item">
                                            <span className="timeline-icon">📤</span>
                                            <span className="timeline-text">
                                                {formatDate(match.parcel?.pickupDate)}
                                            </span>
                                        </div>
                                        <div className="timeline-arrow">→</div>
                                        <div className="timeline-item">
                                            <span className="timeline-icon">📥</span>
                                            <span className="timeline-text">
                                                {formatDate(match.parcel?.destinationDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="header-actions">
                                    <div className="expand-section">
                                        <button
                                            className={`expand-btn ${expandedParcel === match.id ? 'expanded' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExpand(match.id);
                                            }}
                                        >
                                            {expandedParcel === match.id ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {expandedParcel === match.id && (
                                <div className="parcel-details-section">
                                    <div className="details-grid">
                                        <div className="detail-group">
                                            <h4>📦 Parcel Information</h4>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Match ID:</span>
                                                <span className="detail-value">{match.id}</span>
                                            </div>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Parcel ID:</span>
                                                <span className="detail-value">{match.parcel?.id || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Status:</span>
                                                <span className={`detail-value status-${getParcelStatus(match.parcel)}`}>
                                                    {match.parcel?.status || 'MATCHED'}
                                                </span>
                                            </div>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Weight:</span>
                                                <span className="detail-value">{match.parcel?.weight || 0} grams</span>
                                            </div>
                                        </div>

                                        <div className="detail-group">
                                            <h4>📍 Parcel Route</h4>
                                            <div className="route-coordinates">
                                                <div className="coordinate-pair">
                                                    <span className="coordinate-label">Pickup Location:</span>
                                                    <div className="coordinates">
                                                        <code>Lat: {match.parcel?.pickupLat?.toFixed(6)}</code>
                                                        <code>Lng: {match.parcel?.pickupLng?.toFixed(6)}</code>
                                                    </div>
                                                </div>
                                                <div className="coordinate-pair">
                                                    <span className="coordinate-label">Delivery Location:</span>
                                                    <div className="coordinates">
                                                        <code>Lat: {match.parcel?.destinationLat?.toFixed(6)}</code>
                                                        <code>Lng: {match.parcel?.destinationLng?.toFixed(6)}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {match.Parcels && (
                                        <div className="traveler-section">
                                            <h4>👤 Assigned Traveler</h4>
                                            <div className="traveler-details">
                                                <div className="traveler-info-grid">
                                                    <div className="traveler-info-item">
                                                        <span className="traveler-label">Traveler ID:</span>
                                                        <span className="traveler-value">{match.Parcels.id || 'N/A'}</span>
                                                    </div>
                                                    <div className="traveler-info-item">
                                                        <span className="traveler-label">Status:</span>
                                                        <span className={`traveler-value status-${match.Parcels.status?.toLowerCase() || 'active'}`}>
                                                            {match.Parcels.status || 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                    <div className="traveler-info-item">
                                                        <span className="traveler-label">Capacity:</span>
                                                        <span className="traveler-value">{match.Parcels.weight || 0}g</span>
                                                    </div>
                                                    <div className="traveler-info-item">
                                                        <span className="traveler-label">Creator ID:</span>
                                                        <span className="traveler-value">{match.Parcels.travelercreatorid || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                <div className="traveler-route">
                                                    <h5>Traveler Route</h5>
                                                    <div className="traveler-route-details">
                                                        <div className="route-point">
                                                            <span className="route-icon">📍</span>
                                                            <div className="route-info">
                                                                <span className="route-label">Origin</span>
                                                                <span className="route-coords">
                                                                    {match.Parcels.originLat?.toFixed(6)}, {match.Parcels.originLng?.toFixed(6)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="route-arrow">→</div>
                                                        <div className="route-point">
                                                            <span className="route-icon">🎯</span>
                                                            <div className="route-info">
                                                                <span className="route-label">Destination</span>
                                                                <span className="route-coords">
                                                                    {match.Parcels.destinationLat?.toFixed(6)}, {match.Parcels.destinationLng?.toFixed(6)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="traveler-timeline">
                                                    <h5>Travel Schedule</h5>
                                                    <div className="timeline-details">
                                                        <div className="timeline-item-full">
                                                            <span className="timeline-label">Departure:</span>
                                                            <span className="timeline-date">{formatDate(match.Parcels.originDate)}</span>
                                                        </div>
                                                        <div className="timeline-item-full">
                                                            <span className="timeline-label">Arrival:</span>
                                                            <span className="timeline-date">{formatDate(match.Parcels.destinationDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {match.parcel?.description && (
                                        <div className="description-section">
                                            <h4>📝 Parcel Description</h4>
                                            <div className="description-full">
                                                <p>{match.parcel.description}</p>
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
                                                    <div className="stage-date">{formatDate(match.parcel?.pickupDate)}</div>
                                                </div>
                                            </div>
                                            <div className="timeline-connector"></div>
                                            <div className="timeline-stage">
                                                <div className="stage-icon">📅</div>
                                                <div className="stage-info">
                                                    <div className="stage-label">Destination Date</div>
                                                    <div className="stage-date">{formatDate(match.parcel?.destinationDate)}</div>
                                                </div>
                                            </div>
                                            <div className="timeline-connector"></div>
                                            <div className="timeline-stage">
                                                <div className="stage-icon">⏰</div>
                                                <div className="stage-info">
                                                    <div className="stage-label">Deadline</div>
                                                    <div className="stage-date deadline-date">{formatDate(match.parcel?.deadline)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="match-status">
                                        <div className="status-info">
                                            <span className="status-icon">✅</span>
                                            <div className="status-content">
                                                <h5>Successfully Matched</h5>
                                                <p>Your parcel has been successfully matched with a traveler and is currently in delivery.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">🤝</div>
                        <h3>No Matched Parcels Found</h3>
                        <p>You don't have any matched parcels at the moment. Matches will appear here once your parcels are accepted by travelers.</p>
                        <button
                            onClick={fetchMatchedParcels}
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

export default PMatched;