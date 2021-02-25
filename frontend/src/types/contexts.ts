export interface IContext {
  socket: IState<ISocketState, ISocketAction>;
  theme: IState<IThemeState, IThemeAction>;
}

export interface IState<S, A = {}> {
  states: S;
  actions?: A;
}
export interface IThemeState {
  theme: string;
}

export interface IThemeAction {
  setTheme: (theme: string) => void;
}

export interface ISocketState {
  textFromSpeach: string;
  isSocketReady: boolean;
  socketSessionId: string | null;
}

export interface ISocketAction {
  setTextFromSpeach: ISetTextFromSpeach;
  setSocketSessionId: ISetSesstionId;
  setIsSocketReady: IIsSocketReady;
}

// Actions
export type ISetTextFromSpeach = (text: string) => void;
export type IIsSocketReady = (flag: boolean) => void;
export type ISetSesstionId = (id: string) => void;
