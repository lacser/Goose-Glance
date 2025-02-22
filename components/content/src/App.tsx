import { useContextService } from "./utils/useContextService";
import { DevContent } from "./components/DevContent";

function App() {
  useContextService();

  return <DevContent />;
}

export default App;
