import { useMemo } from 'react';
import { getSocket } from '../lib/socket';

export const useSocket = () => {
  return useMemo(() => getSocket(), []);
};
