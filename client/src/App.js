import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
