import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import ClubCard from '../../components/ClubCard';
import {
  fetchAllClubs,
  fetchMyClubs,
  joinClub,
  clearClubError, 
} from '../clubs/clubSlice'; 

const ClubPage = () => {
  const dispatch = useDispatch(); 
  const navigate = useNavigate();

  // Selectors to get auth and club state
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const { allClubs, myClubs, isLoading, error } = useSelector((state) => state.clubs);
  const [message, setMessage] = useState(null);

  // Effect to fetch all clubs and my clubs when component mounts or auth state changes
  useEffect(() => {
    dispatch(clearClubError()); 
    dispatch(fetchAllClubs()); // Always fetch all clubs

    // --- IMPORTANT CHANGE HERE: Ensure user?.id is available before fetching my clubs ---
    if (isAuthenticated && user?.id) { 
      dispatch(fetchMyClubs()); 
    } else {
      // If not authenticated or user ID is missing, clear myClubs state to avoid stale data
      dispatch({ type: 'clubs/fetchMyClubs/fulfilled', payload: [] });
    }
  }, [dispatch, isAuthenticated, user?.id]); 

  // Effect to handle pending club join after login
  useEffect(() => {
    if (isAuthenticated) {
      const pendingClubId = sessionStorage.getItem('pendingJoinClubId');
      if (pendingClubId) {
        sessionStorage.removeItem('pendingJoinClubId'); 
        setMessage(null); 

        // Dispatch joinClub for the pending club
        dispatch(joinClub(Number(pendingClubId)))
          .unwrap() 
          .then(() => {
            setMessage('Club joined successfully!');
            dispatch(fetchMyClubs()); // Refetch my clubs to update UI
          })
          .catch((err) => {
            setMessage(`Failed to join club: ${err}`);
          });
      }
    }
  }, [isAuthenticated, dispatch]);

  // Effect to display Redux errors
  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  const handleJoin = async (clubId) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingJoinClubId', clubId);
      sessionStorage.setItem('redirectAfterLogin', '/clubs'); 
      setMessage('Please login to join this club.'); 
      navigate('/login');
    } else {
      setMessage(null); 
      try {
        await dispatch(joinClub(clubId)).unwrap(); 
        setMessage('You have joined the club!');
        dispatch(fetchMyClubs()); // Re-fetch my clubs to update the UI immediately
      } catch (err) {
        setMessage(`Failed to join club: ${err}`);
      }
    }
  };

  // Filter out clubs the user already joined (based on backend data)
  const availableClubs = allClubs.filter(
    (club) => !myClubs.some((myClub) => myClub.id === club.id)
  );

  return (
    <div className="club-page">
      <div className="feed-welcome-box">
        <h1 className="text-xl font-bold mb-2">🎬 Join a Club</h1>
        <p className="text-gray-300">Find a community that shares your taste in TV shows and movies!</p>
      </div>

      {isLoading && <p className="text-blue-400 text-center">Loading clubs...</p>}
      {message && <p className="error text-red-500 text-center">{message}</p>} 

      {isAuthenticated && myClubs.length > 0 && (
        <div className="my-clubs-section mt-8">
          <h2 className="text-lg font-semibold mb-3">📂 My Clubs</h2>
          <div className="club-grid">
            {myClubs.map((club) => (
              // --- IMPORTANT: isJoined prop is passed to ClubCard ---
              <ClubCard key={club.id} club={club} isJoined={true} />
            ))}
          </div>
        </div>
      )}

      <div className="all-clubs-section mt-8">
        <h2 className="text-lg font-semibold mb-3">🌐 Explore All Clubs</h2>
        <div className="club-grid">
          {availableClubs.length > 0 ? (
            availableClubs.map((club) => (
              // --- IMPORTANT: onJoin prop is passed to ClubCard ---
              <ClubCard key={club.id} club={club} onJoin={() => handleJoin(club.id)} />
            ))
          ) : (
            !isLoading && <p className="text-gray-400 text-center">No new clubs to explore.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubPage;
