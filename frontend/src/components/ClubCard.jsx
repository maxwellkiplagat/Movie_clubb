import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ClubCard = ({ club, onJoin = () => {}, onLeave = () => {}, isJoined }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isJoined) {
      navigate(`/clubs/${club.id}`);
    }
  };

  return (
    <div
      className={`
        club-card
        bg-gray-700
        rounded-lg
        p-6
        shadow-lg
        flex flex-col
        justify-between
        items-center
        text-center
        transition-all duration-300
        ${isJoined ? 'border-2 border-green-500 cursor-pointer hover:shadow-xl' : 'border-2 border-transparent hover:border-blue-500 hover:shadow-xl'}
      `}
      onClick={handleClick}
    >
      <h3 className="club-title text-xl font-bold text-orange-400 mb-2">{club.name}</h3>
      <p className="club-desc text-gray-300 text-sm mb-4 flex-grow">{club.description}</p>

      {isJoined ? (
        <div className="flex flex-col items-center gap-2">
          <span className="joined-label bg-green-600 text-white text-sm px-4 py-1 rounded-full font-semibold">
            ✓ Joined
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLeave();
            }}
            className="
              leave-btn
              bg-red-600 hover:bg-red-700
              text-white text-sm font-bold
              py-1 px-3 rounded-full
              shadow-md transition duration-300 ease-in-out
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75
            "
          >
            Leave Club
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin(); // This handles login redirection if not authenticated
          }}
          className="
            join-btn
            bg-blue-600 hover:bg-blue-700
            text-white font-bold
            py-2 px-4 rounded-full
            shadow-md transition duration-300 ease-in-out
            transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
          "
        >
          Join Club
        </button>
      )}
    </div>
  );
};

ClubCard.propTypes = {
  club: PropTypes.object.isRequired,
  onJoin: PropTypes.func,
  onLeave: PropTypes.func,
  isJoined: PropTypes.bool.isRequired,
};

export default ClubCard;
