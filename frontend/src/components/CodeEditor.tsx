import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleTestCode = async (): Promise<boolean> => {
    console.log("Testing code:", code);
    try {
      const response = await fetch("http://localhost:8000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      setOutput(result.stdout || result.stderr);
      setSuccessMessage("");
      return !result.stderr; // Return true if no errors, false otherwise
    } catch (error) {
      console.error("Error testing code:", error);
      setOutput("Error testing code");
      setSuccessMessage("");
      return false; // Return false if there was an error
    }
  };

  const handleSubmitCode = async (): Promise<void> => {
    console.log("Submitting code:", code);
    const isTestSuccessful = await handleTestCode(); // Test the code first
    if (!isTestSuccessful) {
      setSuccessMessage("Please fix the errors before submitting.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      setOutput(result.stdout || result.stderr);
      setSuccessMessage("Code submitted successfully!");
    } catch (error) {
      console.error("Error submitting code:", error);
      setOutput("Error submitting code");
      setSuccessMessage("");
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8 m-4 flex flex-col lg:flex-row">
      <div className="lg:w-2/3 pr-4 flex flex-col">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Python Code Editor</h2>
        <Editor
          height="60vh"
          defaultLanguage="python"
          defaultValue="# Write your Python code here"
          onChange={(value: string) => setCode(value || "")}
          className="border rounded"
          options={{ minimap: { enabled: false } }}
        />
        <div className="mt-6 flex justify-center space-x-4">
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            onClick={handleTestCode}
          >
            Test Code
          </button>
          <button
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            onClick={handleSubmitCode}
          >
            Submit
          </button>
        </div>
        {successMessage && <div className="mt-4 text-center text-green-600 font-semibold">{successMessage}</div>}
      </div>
      <div className="lg:w-1/3 pl-4 mt-6 lg:mt-0">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Output</h2>
        <div
          className="output-container border rounded p-4 bg-gray-100 h-60vh overflow-auto"
          style={{ fontSize: "12px" }}
        >
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
