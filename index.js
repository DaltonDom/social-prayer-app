import { LogBox } from "react-native";

// Ignore the specific warning
LogBox.ignoreLogs([
  'Unsupported top level event type "topInsetsChange" dispatched',
]);
