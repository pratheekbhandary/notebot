import { IIsSocketReady, ISetTextFromSpeach } from "./contexts";

export interface IInitSocketsParams {
  setTextFromSpeach: ISetTextFromSpeach;
  setIsSocketReady: IIsSocketReady;
}

export interface ITextFromSpeachParams {
  message: string;
}
