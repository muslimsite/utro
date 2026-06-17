import { EventEmitter } from "node:events";

export interface CheckInEvent {
  userId: string;
  date: string;
  time: string;
  onTime: boolean;
  streak: number;
}

class AppEvents extends EventEmitter {
  emitCheckIn(payload: CheckInEvent): void {
    this.emit("checkin", payload);
  }

  onCheckIn(handler: (payload: CheckInEvent) => void): void {
    this.on("checkin", handler);
  }
}

export const appEvents = new AppEvents();
