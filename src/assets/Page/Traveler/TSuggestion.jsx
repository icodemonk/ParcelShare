import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext/AuthContext.jsx';
import '../../Css/TSuggestion.css';

const TSuggestion = () => {
    const [travelers, setTravelers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTraveler, setExpandedTraveler] = useState(null);
    const [matchedParcels, setMatchedParcels] = useState({});
    const [loadingParcels, setLoadingParcels] = useState({});
    const [acceptingParcel, setAcceptingParcel] = useState(null);
    const [error, setError] = useState('');

    const { getToken, isAuthenticated ,getUserId } = useContext(AuthContext);
    const token = getToken();
    const userId = getUserId();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }
    }, [isAuthenticated]);

    // Fetch all travelers
    useEffect(() => {
        fetchTravelers();
    }, []);

    const fetchTravelers = async () => {
        try {
            setLoading(true);
            console.log('Fetching travelers from:', 'http://localhost:8080/api/pmc/alltraveler/userId');

            const response = await axios.post(`http://localhost:8080/api/pmc/alltraveler/${userId}`, {},{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Travelers API Response:', response.data);
            setTravelers(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching travelers:', error);
            setError('Failed to load travel plans. Please try again.');
            setTravelers([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch matched parcels for a traveler
    const fetchMatchedParcels = async (travelerId) => {
        setLoadingParcels(prev => ({ ...prev, [travelerId]: true }));
        try {
            console.log(`Fetching matched parcels for traveler ${travelerId}...`);
            const response = await axios.post(`http://localhost:8080/api/service/algo/traveler/${travelerId}/${userId}`, {},{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`Matched parcels for traveler ${travelerId}:`, response.data);
            setMatchedParcels(prev => ({
                ...prev,
                [travelerId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching matched parcels for traveler ${travelerId}:`, error);
            setMatchedParcels(prev => ({
                ...prev,
                [travelerId]: []
            }));
        } finally {
            setLoadingParcels(prev => ({ ...prev, [travelerId]: false }));
        }
    };

    const handleExpand = (travelerId) => {
        if (expandedTraveler === travelerId) {
            setExpandedTraveler(null);
        } else {
            setExpandedTraveler(travelerId);
            if (!matchedParcels[travelerId]) {
                fetchMatchedParcels(travelerId);
            }
        }
    };

    const handleAcceptParcel = async (parcelId, travelerId) => {
        setAcceptingParcel(parcelId);
        try {
            console.log(`Accepting parcel ${parcelId} for traveler ${userId}...`);
            const response = await axios.post(
                `http://localhost:8080/api/pmc/updatetaccept/${parcelId}/${userId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Accept parcel response:', response.data);

            if (response.data.includes('SUCCESSFULLY')) {
                // Remove accepted parcel from the list
                setMatchedParcels(prev => ({
                    ...prev,
                    [travelerId]: prev[travelerId].filter(parcel => parcel.id !== parcelId)
                }));

                // Show success message
                setError('');
                setTimeout(() => {
                    alert('Parcel accepted successfully!');
                }, 100);
            } else {
                setError('Failed to accept parcel: ' + response.data);
            }
        } catch (error) {
            console.error('Error accepting parcel:', error);
            setError('Error accepting parcel. Please try again.');
        } finally {
            setAcceptingParcel(null);
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

    if (loading) {
        return (
            <div className="tsuggestion-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading travel suggestions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tsuggestion-container">
            <div className="tsuggestion-header">
                <h1>Travel Suggestions</h1>
                <p>Find parcels that match your travel routes and earn extra income</p>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                    <button className="error-close" onClick={() => setError('')}>×</button>
                </div>
            )}

            <div className="travelers-grid">
                {travelers && travelers.length > 0 ? (
                    travelers.map(traveler => (
                        <div key={traveler.id} className="traveler-card">
                            <div className="traveler-card-header" onClick={() => handleExpand(traveler.id)}>
                                <div className="traveler-info">
                                    <div className="traveler-title">
                                        <h3>Travel Plan #{traveler.id}</h3>
                                        <span className={`status-badge ${traveler.status?.toLowerCase() || 'active'}`}>
                                            {traveler.status || 'ACTIVE'}
                                        </span>
                                    </div>

                                    <div className="route-info">
                                        <div className="route-point">
                                            <span className="point-icon">📍</span>
                                            <div className="point-details">
                                                <span className="point-label">From</span>
                                                <span className="coordinates">
                                                    {traveler.originLat?.toFixed(6)}, {traveler.originLng?.toFixed(6)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="route-arrow">→</div>
                                        <div className="route-point">
                                            <span className="point-icon">🎯</span>
                                            <div className="point-details">
                                                <span className="point-label">To</span>
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
                                                {formatDate(traveler.originDate)} → {formatDate(traveler.destinationDate)}
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-icon">💼</span>
                                            <span className="meta-text">Capacity: {traveler.weight || 0}g</span>
                                        </div>
                                    </div>
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
                                <div className="matched-parcels-section">
                                    <div className="section-header">
                                        <h4>📦 Matching Parcels</h4>
                                        <span className="parcel-count">
                                            {matchedParcels[traveler.id]?.length || 0} found
                                        </span>
                                    </div>

                                    {loadingParcels[traveler.id] ? (
                                        <div className="parcels-loading">
                                            <div className="small-spinner"></div>
                                            <span>Searching for matching parcels...</span>
                                        </div>
                                    ) : matchedParcels[traveler.id]?.length > 0 ? (
                                        <div className="parcels-grid">
                                            {matchedParcels[traveler.id].map(parcel => (
                                                <div key={parcel.id} className="parcel-card">
                                                    <div className="parcel-header">
                                                        <h5>Parcel #{parcel.id}</h5>
                                                        <span className="parcel-status">{parcel.status || 'PENDING'}</span>
                                                    </div>

                                                    <div className="parcel-route">
                                                        <div className="route-point">
                                                            <span className="point-icon">📤</span>
                                                            <div className="point-details">
                                                                <span className="point-label">Pickup</span>
                                                                <span className="coordinates">
                                                                    {parcel.pickupLat?.toFixed(6)}, {parcel.pickupLng?.toFixed(6)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="route-arrow">→</div>
                                                        <div className="route-point">
                                                            <span className="point-icon">📥</span>
                                                            <div className="point-details">
                                                                <span className="point-label">Delivery</span>
                                                                <span className="coordinates">
                                                                    {parcel.destinationLat?.toFixed(6)}, {parcel.destinationLng?.toFixed(6)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="parcel-details">
                                                        <div className="detail-item">
                                                            <span className="detail-icon">⚖️</span>
                                                            <span className="detail-text">Weight: {parcel.weight}g</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="detail-icon">⏰</span>
                                                            <span className="detail-text">Deadline: {formatDate(parcel.deadline)}</span>
                                                        </div>
                                                        {parcel.pickupDate && (
                                                            <div className="detail-item">
                                                                <span className="detail-icon">📅</span>
                                                                <span className="detail-text">Pickup: {formatDate(parcel.pickupDate)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {parcel.description && (
                                                        <div className="parcel-description">
                                                            <p>{parcel.description}</p>
                                                        </div>
                                                    )}

                                                    <button
                                                        className="accept-btn"
                                                        onClick={() => handleAcceptParcel(parcel.id, traveler.id)}
                                                        disabled={acceptingParcel === parcel.id}
                                                    >
                                                        {acceptingParcel === parcel.id ? (
                                                            <>
                                                                <div className="btn-spinner"></div>
                                                                Accepting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="btn-icon">✓</span>
                                                                Accept Parcel
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-parcels">
                                            <div className="no-parcels-icon">🔍</div>
                                            <h4>No Matching Parcels Found</h4>
                                            <p>We couldn't find any parcels matching this travel route. Try adjusting your route or check back later.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">🚚</div>
                        <h3>No Travel Plans Available</h3>
                        <p>There are no active travel plans at the moment. Create a travel plan to start matching with parcels.</p>
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

export default TSuggestion;