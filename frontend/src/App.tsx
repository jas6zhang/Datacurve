import React from "react";
import CodeEditor from "./components/CodeEditor";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <CodeEditor />
    </div>
  );
};

export default App;
