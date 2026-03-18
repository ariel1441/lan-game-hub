import { useContext } from 'react';
import { RoomContext } from '../providers/RoomProvider';

export const useRoom = () => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider.');
  }

  return context;
};
