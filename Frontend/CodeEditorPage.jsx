import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

const CodeEditorPage = () => {
  const [question, setQuestion] = useState("Loading question...");
  const [code, setCode] = useState("// Write your solution here...");
  const [output, setOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [language, setLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const outputRef = useRef(null);

  const role = localStorage.getItem("dsa-role");
  const difficulty = localStorage.getItem("dsa-difficulty");

  useEffect(() => {
    if (!role || !difficulty) {
      alert("Please select a role and difficulty first.");
      navigate("/dsadashboard");
    }
  }, [navigate, role, difficulty]);

  useEffect(() => {
    setTimeout(() => {
      setQuestion(
        `Write a function for the ${role} role. Difficulty: ${difficulty}. Example: Reverse a string.`
      );
    }, 500);
  }, [role, difficulty]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const scrollToOutput = () => {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleCompile = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("Please log in to compile code.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setOutput("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch("/api/compile-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, code, language }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (result.success) {
        setOutput(result.output || "✅ Code compiled successfully.");
        setSuccessMessage("✅ Compilation successful!");
      } else {
        setOutput(result.error || "⚠️ Compilation failed.");
        setSuccessMessage("⚠️ Something went wrong.");
      }
    } catch (error) {
      setOutput("❌ Compilation failed due to timeout or network issue.");
      setSuccessMessage("❌ Compilation error.");
    } finally {
      setLoading(false);
      scrollToOutput();
    }
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("Please log in to submit code.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setOutput("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch("/api/submit-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          code,
          language,
          role,
          difficulty,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (result.success) {
        setOutput(result.output || "✔️ Code submitted and executed successfully.");
        setSuccessMessage("🎉 Code submitted successfully!");
      } else {
        setOutput(result.output || "⚠️ Code submitted but failed to run.");
        setSuccessMessage("⚠️ Code submitted, but check the output.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setOutput("❌ Submission failed due to timeout or network error.");
      setSuccessMessage("❌ Error submitting code.");
    } finally {
      setLoading(false);
      scrollToOutput();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-purple-700">Code Challenge</h2>
          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <label className="text-sm font-semibold text-gray-600">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border px-3 py-2 rounded-md bg-white text-gray-800 shadow-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <label className="text-sm font-semibold text-gray-600">Theme:</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="border px-3 py-2 rounded-md bg-white text-gray-800 shadow-sm"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
              </select>
            </div>
            <span className="text-sm font-semibold text-red-600 ml-4">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="mb-6 p-4 border border-purple-300 bg-purple-50 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-purple-800">Problem Statement:</h3>
          <p className="text-gray-700">{question}</p>
        </div>

        <div className="mb-4 border border-gray-300 rounded-md overflow-hidden">
          <Editor
            height="400px"
            language={language}
            value={code}
            theme={editorTheme}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: "on",
              formatOnType: true,
              formatOnPaste: true,
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-4 gap-4 flex-wrap">
          <button
            onClick={() => navigate("/past-submissions")}
            className="text-purple-700 font-semibold underline"
          >
            View Past Submissions
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleCompile}
              disabled={loading}
              className={`${
                loading ? "bg-yellow-300" : "bg-yellow-500 hover:bg-yellow-600"
              } text-white px-6 py-2 rounded-md font-semibold transition`}
            >
              {loading ? "Compiling..." : "Compile Code"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              } text-white px-6 py-2 rounded-md font-semibold transition`}
            >
              {loading ? "Submitting..." : "Submit Code"}
            </button>
            <button
              onClick={() => navigate("/dsadashboard")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold transition"
            >
              End Test
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md">
            {successMessage}
          </div>
        )}

        <div
          ref={outputRef}
          className="mt-6 bg-gray-100 p-4 rounded-md border text-sm text-gray-800"
        >
          <strong>Output:</strong>
          <pre className="mt-2 whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
