import { GlucoseReading } from "../types/reading";

export type RootStackParamList = {
  MainTabs: undefined;
  AddReading: undefined;
  EditReading: { reading: GlucoseReading };
  ChangePIN: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  History: undefined;
  Insights: undefined;
  Settings: undefined;
};
