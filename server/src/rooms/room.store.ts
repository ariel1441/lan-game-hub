import type { Room, RoomMembership } from './room.types.js';

class RoomStore {
  private readonly rooms = new Map<string, Room>();
  private readonly membershipBySocketId = new Map<string, RoomMembership>();

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  setRoom(room: Room): void {
    this.rooms.set(room.code, room);
  }

  deleteRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      for (const player of room.players) {
        this.membershipBySocketId.delete(player.socketId);
      }
    }

    this.rooms.delete(code);
  }

  setMembership(socketId: string, membership: RoomMembership): void {
    this.membershipBySocketId.set(socketId, membership);
  }

  getMembership(socketId: string): RoomMembership | undefined {
    return this.membershipBySocketId.get(socketId);
  }

  deleteMembership(socketId: string): void {
    this.membershipBySocketId.delete(socketId);
  }
}

export const roomStore = new RoomStore();
