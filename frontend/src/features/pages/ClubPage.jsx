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

  // Selectors to get auth and clubs state
  const { isAuthenticated, user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { allClubs, myClubs, isAllClubsLoading, isMyClubsLoading, error } = useSelector((state) => state.clubs); 
  
  const [message, setMessage] = useState(null); 
  const [hasFetchedMyClubs, setHasFetchedMyClubs] = useState(false); 
  // RE-ADDED STATE: hasAttemptedSessionCheck
  const [hasAttemptedSessionCheck, setHasAttemptedSessionCheck] = useState(false); 

  // Effect to log state changes for debugging - KEEP ACTIVE
  useEffect(() => {
    console.log("ClubPage Render - isAuthenticated:", isAuthenticated);
    console.log("ClubPage Render - user:", user);
    console.log("ClubPage Render - user?.id:", user?.id); 
    console.log("ClubPage Render - authLoading:", authLoading);
    console.log("ClubPage Render - allClubs count:", allClubs.length);
    console.log("ClubPage Render - myClubs count:", myClubs.length);
    console.log("ClubPage Render - isAllClubsLoading:", isAllClubsLoading); 
    console.log("ClubPage Render - isMyClubsLoading:", isMyClubsLoading);   
    console.log("ClubPage Render - error:", error);
    console.log("ClubPage Render - hasFetchedMyClubs:", hasFetchedMyClubs); 
    console.log("ClubPage Render - hasAttemptedSessionCheck:", hasAttemptedSessionCheck); // RE-ADDED LOG
    console.log("ClubPage: Final styling and logic fix applied."); // New log
  }, [isAuthenticated, user, authLoading, allClubs.length, myClubs.length, isAllClubsLoading, isMyClubsLoading, error, hasFetchedMyClubs, hasAttemptedSessionCheck]);


  // NEW/RE-ADDED USEEFFECT: To manage hasAttemptedSessionCheck based on global auth state
  useEffect(() => {
    // If not authenticated, auth loading is false, and user is null (meaning checkSession completed and confirmed logout)
    // AND we haven't already marked that we've attempted a session check in this component's lifecycle
    if (!isAuthenticated && !authLoading && user === null && !hasAttemptedSessionCheck) {
      console.log("ClubPage: Global session check completed and user is logged out. Setting hasAttemptedSessionCheck to true.");
      setHasAttemptedSessionCheck(true); 
    } else if (isAuthenticated && hasAttemptedSessionCheck) {
        // If user becomes authenticated (e.g., logs in from another page), reset the flag
        console.log("ClubPage: User became authenticated, resetting hasAttemptedSessionCheck flag.");
        setHasAttemptedSessionCheck(false);
    }
    // No dispatch(checkSession()) here; App.jsx handles it globally.
  }, [isAuthenticated, authLoading, user, hasAttemptedSessionCheck]); 


  // Effect to fetch all clubs and my clubs when component mounts or auth state changes
  useEffect(() => {
    dispatch(clearClubError()); 

    // Condition for fetching ALL clubs
    if (allClubs.length === 0 && !isAllClubsLoading) { 
      console.log("ClubPage useEffect: Dispatching fetchAllClubs (conditional).");
      dispatch(fetchAllClubs());
    } else {
      console.log(`ClubPage useEffect: Not dispatching fetchAllClubs. allClubs.length: ${allClubs.length}, isAllClubsLoading: ${isAllClubsLoading}`);
    }

    // Condition for fetching MY clubs - RE-ENABLED
    // This will now rely on App.jsx's checkSession to populate isAuthenticated and user?.id
    if (isAuthenticated && user?.id && myClubs.length === 0 && !isMyClubsLoading && !hasFetchedMyClubs) { 
      console.log("ClubPage useEffect: Dispatching fetchMyClubs (conditional) for user ID:", user.id);
      dispatch(fetchMyClubs());
      setHasFetchedMyClubs(true); 
    } else if (!isAuthenticated && !authLoading) {
      if (myClubs.length > 0) {
        console.log("ClubPage useEffect: Not authenticated or auth loading, clearing myClubs state (conditional).");
        dispatch({ type: 'clubs/fetchMyClubs/fulfilled', payload: [] }); 
      }
      if (hasFetchedMyClubs) { 
          console.log("ClubPage useEffect: Not authenticated, resetting hasFetchedMyClubs flag.");
          setHasFetchedMyClubs(false);
      }
    } else {
        console.log(`ClubPage useEffect: Not dispatching fetchMyClubs. isAuthenticated: ${isAuthenticated}, user?.id: ${user?.id}, myClubs.length: ${myClubs.length}, isMyClubsLoading: ${isMyClubsLoading}, hasFetchedMyClubs: ${hasFetchedMyClubs}`);
    }
  
  }, [dispatch, isAuthenticated, user?.id, isAllClubsLoading, isMyClubsLoading, allClubs.length, myClubs.length, hasFetchedMyClubs, authLoading]); 


  // Effect to handle pending club join after login - RE-ENABLED
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const pendingClubId = sessionStorage.getItem('pendingJoinClubId');
      if (pendingClubId) {
        console.log("ClubPage: Processing pending join for club ID:", pendingClubId, "with user ID:", user.id);
        sessionStorage.removeItem('pendingJoinClubId'); 
        setMessage(null); 

        dispatch(joinClub(Number(pendingClubId)))
          .unwrap() 
          .then(() => {
            setMessage('Club joined successfully!');
            console.log("ClubPage: Pending join successful, re-dispatching fetchMyClubs."); 
            dispatch(fetchMyClubs()); 
          })
          .catch((err) => {
            setMessage(`Failed to join club: ${err}`);
            console.error("ClubPage: Error during pending join:", err); 
          });
      }
    }
  }, [isAuthenticated, user?.id, dispatch, authLoading]);

  // Effect to display Redux errors - RE-ENABLED
  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  const handleJoin = async (clubId) => {
    console.log("handleJoin called for club ID:", clubId);
    console.log("handleJoin - isAuthenticated:", isAuthenticated);
    console.log("handleJoin - user:", user);
    console.log("handleJoin - user?.id:", user?.id); 

    if (!isAuthenticated) {
      console.log("handleJoin: User not authenticated. Storing pending club ID and redirecting to login."); 
      sessionStorage.setItem('pendingJoinClubId', clubId);
      sessionStorage.setItem('redirectAfterLogin', '/clubs'); 
      setMessage('Please login to join this club.'); 
      navigate('/login');
    } else if (!user?.id) { 
        console.log("handleJoin: User data not fully loaded (user.id is missing). Redirecting to login."); 
        setMessage('User data not fully loaded. Please try again.');
        navigate('/login'); 
    } else {
      setMessage(null); 
      try {
        console.log("handleJoin: Attempting to join club with user ID:", user.id, "and club ID:", clubId); 
        await dispatch(joinClub(clubId)).unwrap(); 
        setMessage('You have joined the club!');
        console.log("handleJoin: Club joined successfully, re-dispatching fetchMyClubs."); 
        dispatch(fetchMyClubs()); 
      } catch (err) {
        setMessage(`Failed to join club: ${err}`);
        console.error("handleJoin: Error joining club:", err); 
      }
    }
  };

  const availableClubs = allClubs.filter(
    (club) => !myClubs.some((myClub) => myClub.id === club.id)
  );

  // Conditional rendering for "Please log in" message - NOW WITH CORRECT LOGIC AND STYLING
  if (!isAuthenticated && !authLoading && hasAttemptedSessionCheck) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md"> 
          <p className="text-red-500 text-2xl font-bold mb-4">Please log in to access this page</p> 
          <button 
            onClick={() => navigate('/login')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state if any
  if (authLoading || isAllClubsLoading || isMyClubsLoading) { 
    return (
      <div className="club-page p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-xl">Loading clubs...</p>
      </div>
    );
  }
  
  // Show error state if any
  if (error) { 
    return (
      <div className="club-page p-6 bg-gray-900 min-h-screen text-red-500 text-center">
        <p>Error loading clubs: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
          Retry
        </button>
      </div>
    );
  }


  return (
    <div className="club-page p-6 bg-gray-900 min-h-screen text-white"> 
      <div className="feed-welcome-box bg-gray-800 rounded-lg p-6 shadow-lg mb-8"> 
        <h1 className="text-3xl font-bold mb-3 text-orange-400">Join a Club</h1> 
        <p className="text-gray-300">Find a community that shares your taste in TV shows and movies!</p>
      </div>

      {message && <p className="error text-red-500 text-center">{message}</p>} 

      {/* My Clubs Section - RE-ENABLED */}
      {isAuthenticated && myClubs.length > 0 ? (
        <div className="my-clubs-section mt-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">My Clubs</h2> 
          <div className="club-grid mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
            {myClubs.map((club) => (
              <ClubCard key={club.id} club={club} isJoined={true} />
            ))}
          </div>
        </div>
      ) : (
        // Display a message if no clubs are joined and not loading AND if authenticated
        !isMyClubsLoading && !authLoading && isAuthenticated && myClubs.length === 0 && ( 
          <p className="text-gray-400 text-center mt-4">You haven't joined any clubs yet. Explore below!</p>
        )
      )}

      {/* Explore All Clubs Section - RE-ENABLED */}
      <div className="all-clubs-section mt-8">
        <h2 className="text-xl font-semibold mb-4 text-orange-400">Explore All Clubs</h2> 
        <div className="club-grid mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
          {isAllClubsLoading && <p className="text-blue-400 text-center">Loading clubs to explore...</p>} 
          {allClubs.length > 0 ? (
            availableClubs.map((club) => (
              <ClubCard key={club.id} club={club} onJoin={() => handleJoin(club.id)} /> 
            ))
          ) : (
            !isAllClubsLoading && <p className="text-gray-400 text-center">No clubs available to explore.</p> 
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubPage;
