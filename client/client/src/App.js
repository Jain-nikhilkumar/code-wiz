// Purpose: Main component of the application. It is the parent component of the CollaborativeEditor component.
import './App.css';
import CollaborativeEditor from './CollaborativeEditor';


  
function App() {
  return (
    <div className="App">
      <h1>Real-Time Collaborative Coding Platform</h1>
      <CollaborativeEditor />
    </div>
  );
}

export default App;
