import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext/AuthContext.jsx';
import '../../Css/TMatched.css';

const TMatched = () => {
    const [matchedTravelers, setMatchedTravelers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedMatch, setExpandedMatch] = useState(null);

    const { getToken, isAuthenticated ,getUserId } = useContext(AuthContext);
    const token = getToken();
    const userId = getUserId();

    // Check authentication and redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('User not authenticated, redirecting to login...');
            window.location.href = '/login';
            return;
        }

        // Only fetch matched travelers if authenticated
        fetchMatchedTravelers();
    }, [isAuthenticated]);

    const fetchMatchedTravelers = async () => {
        // Double check authentication
        if (!isAuthenticated() || !token) {
            console.error('Not authenticated or token missing');
            setError('Please log in to view matched travelers');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching matched travelers...');

            const response = await axios.get(`http://localhost:8080/api/pmc/tmatched/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Matched Travelers API Response:', response.data);
            setMatchedTravelers(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching matched travelers:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError('Failed to load matched travelers. Please try again.');
            }
            setMatchedTravelers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = (matchId) => {
        if (expandedMatch === matchId) {
            setExpandedMatch(null);
        } else {
            setExpandedMatch(matchId);
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

    const getMatchStatus = (parcel) => {
        if (parcel.status === 'MATCHED') return 'success';
        if (parcel.status === 'PENDING') return 'pending';
        return 'default';
    };

    // Show loading or redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="tmatched-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="tmatched-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading matched travelers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tmatched-container">
            <div className="tmatched-header">
                <h1>Matched Travelers</h1>
                <p>Successfully matched parcels with travelers</p>
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
                        <div className="stat-number">{matchedTravelers.length}</div>
                        <div className="stat-label">Total Matches</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {matchedTravelers.filter(match => match.parcel?.status === 'MATCHED').length}
                        </div>
                        <div className="stat-label">Active Deliveries</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <div className="stat-number">
                            {matchedTravelers.filter(match => match.parcel?.status === 'DELIVERED').length}
                        </div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            </div>

            <div className="matches-grid">
                {matchedTravelers && matchedTravelers.length > 0 ? (
                    matchedTravelers.map(match => (
                        <div key={match.id} className="match-card">
                            <div className="match-card-header" onClick={() => handleExpand(match.id)}>
                                <div className="match-info">
                                    <div className="match-title">
                                        <h3>Match #{match.id}</h3>
                                        <span className={`status-badge status-${getMatchStatus(match.parcel)}`}>
                                            {match.parcel?.status || 'MATCHED'}
                                        </span>
                                    </div>

                                    <div className="match-details">
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
                                        </div>

                                        {match.parcel?.description && (
                                            <div className="parcel-description-preview">
                                                <span className="description-label">Description:</span>
                                                <span className="description-text">
                                                    {match.parcel.description.length > 100
                                                        ? `${match.parcel.description.substring(0, 100)}...`
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
                                                Pickup: {formatDate(match.parcel?.pickupDate)}
                                            </span>
                                        </div>
                                        <div className="timeline-arrow">→</div>
                                        <div className="timeline-item">
                                            <span className="timeline-icon">🎯</span>
                                            <span className="timeline-text">
                                                Delivery: {formatDate(match.parcel?.destinationDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="expand-section">
                                    <button
                                        className={`expand-btn ${expandedMatch === match.id ? 'expanded' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExpand(match.id);
                                        }}
                                    >
                                        {expandedMatch === match.id ? '▲' : '▼'}
                                    </button>
                                </div>
                            </div>

                            {expandedMatch === match.id && (
                                <div className="match-details-section">
                                    <div className="details-grid">
                                        <div className="detail-group">
                                            <h4>📦 Parcel Information</h4>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Parcel ID:</span>
                                                <span className="detail-value">{match.parcel?.id || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Status:</span>
                                                <span className={`detail-value status-${getMatchStatus(match.parcel)}`}>
                                                    {match.parcel?.status || 'MATCHED'}
                                                </span>
                                            </div>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Weight:</span>
                                                <span className="detail-value">{match.parcel?.weight || 0} grams</span>
                                            </div>
                                            <div className="detail-item-full">
                                                <span className="detail-label">Deadline:</span>
                                                <span className="detail-value">{formatDate(match.parcel?.deadline)}</span>
                                            </div>
                                        </div>

                                        <div className="detail-group">
                                            <h4>📍 Route Details</h4>
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
                                                    <div className="stage-date">{formatDate(match.parcel?.deadline)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="match-actions">
                                        <div className="action-info">
                                            <span className="action-icon">✅</span>
                                            <span className="action-text">Successfully matched and active for delivery</span>
                                        </div>
                                        <button className="contact-btn">
                                            📞 Contact Traveler
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">🤝</div>
                        <h3>No Matches Found</h3>
                        <p>There are no matched travelers at the moment. Matches will appear here once parcels are accepted by travelers.</p>
                        <button
                            onClick={fetchMatchedTravelers}
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

export default TMatched;