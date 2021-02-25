import { IIsSocketReady, ISetSesstionId, ISetTextFromSpeach } from "./contexts";

export interface IInitSocketsParams {
  setTextFromSpeach: ISetTextFromSpeach;
  setIsSocketReady: IIsSocketReady;
  setSessionId: ISetSesstionId;
}

export interface IServerMessage {
  Data: string;
  SessionID: string;
  Command: string;
}
