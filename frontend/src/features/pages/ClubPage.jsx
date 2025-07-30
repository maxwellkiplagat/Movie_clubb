import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ClubCard from '../../components/ClubCard';
import {
  fetchAllClubs,
  fetchMyClubs,
  joinClub,
  clearClubError,
  leaveClub,
} from '../clubs/clubSlice';

const ClubPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { allClubs, myClubs, isAllClubsLoading, isMyClubsLoading, error } = useSelector((state) => state.clubs);

 const [hasFetchedMyClubs, setHasFetchedMyClubs] = useState(false);
 const [message, setMessage] = useState("");
 const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(clearClubError());

    if (allClubs.length === 0 && !isAllClubsLoading) {
      dispatch(fetchAllClubs());
    }

    if (isAuthenticated && user?.id && myClubs.length === 0 && !isMyClubsLoading && !hasFetchedMyClubs) {
      dispatch(fetchMyClubs());
      setHasFetchedMyClubs(true);
    } else if (!isAuthenticated && !authLoading) {
      if (myClubs.length > 0) {
        dispatch({ type: 'clubs/fetchMyClubs/fulfilled', payload: [] });
      }
      if (hasFetchedMyClubs) {
        setHasFetchedMyClubs(false);
      }
    }
  }, [
    dispatch,
    isAuthenticated,
    user?.id,
    isAllClubsLoading,
    isMyClubsLoading,
    allClubs.length,
    myClubs.length,
    hasFetchedMyClubs,
    authLoading,
  ]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const pendingClubId = sessionStorage.getItem('pendingJoinClubId');
      if (pendingClubId) {
        sessionStorage.removeItem('pendingJoinClubId');
        setMessage(null);

        dispatch(joinClub(Number(pendingClubId)))
          .unwrap()
          .then(() => {
            setMessage('Club joined successfully!');
            dispatch(fetchMyClubs());
          })
          .catch((err) => {
            setMessage(`Failed to join club: ${err}`);
          });
      }
    }
  }, [isAuthenticated, user?.id, dispatch, authLoading]);

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
    } else if (!user?.id) {
      setMessage('User data not fully loaded. Please try again.');
      navigate('/login');
    } else {
      setMessage(null);
      try {
        await dispatch(joinClub(clubId)).unwrap();
        setMessage('You have joined the club!');
        dispatch(fetchMyClubs());
      } catch (err) {
        setMessage(`Failed to join club: ${err}`);
      }
    }
  };

  const handleLeave = async (clubId) => {
    setMessage(null);
    try {
      await dispatch(leaveClub(clubId)).unwrap();
      setMessage('You have left the club.');
      dispatch(fetchMyClubs());
    } catch (err) {
      setMessage(`Failed to leave club: ${err}`);
    }
  };

  const filteredMyClubs = myClubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableClubs = allClubs.filter(
    (club) => !myClubs.some((myClub) => myClub.id === club.id)
  );

  const filteredAvailableClubs = availableClubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isAllClubsLoading || isMyClubsLoading) {
    return (
      <div className="club-page p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-xl">Loading clubs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-page p-6 bg-gray-900 min-h-screen text-red-500 text-center">
        <p>Error loading clubs: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="club-page p-6 bg-gray-900 min-h-screen text-white">
      <div className="feed-welcome-box bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
        <div className="flex flex-col gap-4">

          <div>
            <h1 className="text-3xl font-bold mb-2 text-orange-400">Join a Club</h1>
            <p className="text-gray-300">Find a community that shares your taste in TV shows and movies!</p>
          </div>
          {}
          <div>
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>
        </div>
      </div>

      {message && <p className="error text-red-500 text-center">{message}</p>}

      {isAuthenticated && myClubs.length > 0 ? (
        <div className="my-clubs-section mt-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">My Clubs</h2>
          <div className="club-grid mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyClubs.length > 0 ? (
              filteredMyClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  isJoined={true}
                  onLeave={() => handleLeave(club.id)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full">No clubs match your search.</p>
            )}
          </div>
        </div>
      ) : (
        !isMyClubsLoading &&
        !authLoading &&
        isAuthenticated &&
        myClubs.length === 0 && (
          <p className="text-gray-400 text-center mt-4">
            You haven't joined any clubs yet. Explore below!
          </p>
        )
      )}

      <div className="all-clubs-section mt-8">
        <h2 className="text-xl font-semibold mb-4 text-orange-400">🌍Explore All Clubs</h2>
        <div className="club-grid mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAllClubsLoading && <p className="text-blue-400 text-center">Loading clubs to explore...</p>}
          {filteredAvailableClubs.length > 0 ? (
            filteredAvailableClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isJoined={false}
                onJoin={() => handleJoin(club.id)}
              />
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
