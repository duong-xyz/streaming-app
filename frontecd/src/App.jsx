import AppRoutes from './routes/AppRoutes'
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#0b0c10] min-h-screen">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App
