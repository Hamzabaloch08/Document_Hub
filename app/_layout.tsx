import { Stack } from "expo-router";
import { Provider } from "react-redux";
import "../global.css";
import { store } from "../src/store/store";
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}
