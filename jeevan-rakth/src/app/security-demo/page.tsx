/**
 * Security Demo Page
 *
 * Interactive demonstration of OWASP security measures:
 * - XSS (Cross-Site Scripting) prevention
 * - SQL Injection prevention
 * - Input sanitization and validation
 */

"use client";

import { useState } from "react";
import { SafeHtml } from "@/lib/sanitizeClient";

interface SecurityTestResult {
  originalInput: string;
  validation: {
    isValid: boolean;
    hasXss: boolean;
    hasSqlInjection: boolean;
  };
  sanitized: {
    strict: string;
    basicHtml: string;
    escaped: string;
  };
  attacks: {
    xssDetected: boolean;
    sqlInjectionDetected: boolean;
  };
  sqlTest?: {
    message: string;
    inputWasSanitized: boolean;
    resultCount?: number;
    explanation?: string;
  };
}

interface AttackExamples {
  xss: string[];
  sqlInjection: string[];
  pathTraversal: string[];
  safe: string[];
}

export default function SecurityDemoPage() {
  const [input, setInput] = useState("");
  const [testType, setTestType] = useState("general");
  const [result, setResult] = useState<SecurityTestResult | null>(null);
  const [examples, setExamples] = useState<AttackExamples | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBefore, setShowBefore] = useState(true);

  // Load attack examples
  const loadExamples = async () => {
    try {
      const response = await fetch("/api/security-demo");
      const data = await response.json();
      if (data.success) {
        setExamples(data.data.examples);
      }
    } catch (error) {
      console.error("Failed to load examples:", error);
    }
  };

  // Test input security
  const testSecurity = async () => {
    if (!input.trim()) {
      alert("Please enter some input to test");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/security-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, testType }),
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Security test failed:", error);
      alert("Failed to test security");
    } finally {
      setLoading(false);
    }
  };

  // Load examples on mount
  useState(() => {
    loadExamples();
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          🛡️ OWASP Security Demo
        </h1>

        {/* Info Card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">
            What This Demonstrates
          </h2>
          <ul className="list-disc list-inside space-y-1 text-blue-900">
            <li>
              <strong>XSS Prevention</strong> - Blocks malicious scripts from
              executing
            </li>
            <li>
              <strong>SQL Injection Prevention</strong> - Uses parameterized
              queries
            </li>
            <li>
              <strong>Input Sanitization</strong> - Cleans user input before
              storage
            </li>
            <li>
              <strong>Output Encoding</strong> - Safely displays user content
            </li>
          </ul>
        </div>

        {/* Test Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Test Security Measures
          </h2>

          <div className="space-y-4">
            {/* Test Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="general">General Input</option>
                <option value="email">Email Validation</option>
                <option value="url">URL Validation</option>
                <option value="sql">SQL Injection Test</option>
              </select>
            </div>

            {/* Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Input to Test
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Try entering: <script>alert('XSS')</script> or ' OR 1=1 --"
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
              />
            </div>

            {/* Test Button */}
            <button
              onClick={testSecurity}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test Security"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Security Analysis Results
            </h2>

            {/* Threat Detection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Threat Detection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded ${result.attacks.xssDetected ? "bg-red-100" : "bg-green-100"}`}
                >
                  <div className="font-semibold">
                    {result.attacks.xssDetected
                      ? "❌ XSS Attack Detected"
                      : "✅ No XSS Detected"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.attacks.xssDetected
                      ? "Malicious script tags or JavaScript detected"
                      : "Input appears safe from XSS"}
                  </div>
                </div>
                <div
                  className={`p-4 rounded ${result.attacks.sqlInjectionDetected ? "bg-red-100" : "bg-green-100"}`}
                >
                  <div className="font-semibold">
                    {result.attacks.sqlInjectionDetected
                      ? "❌ SQL Injection Detected"
                      : "✅ No SQL Injection Detected"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.attacks.sqlInjectionDetected
                      ? "SQL keywords or patterns detected"
                      : "Input appears safe from SQL injection"}
                  </div>
                </div>
              </div>
            </div>

            {/* Before/After Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowBefore(!showBefore)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {showBefore
                  ? "Show After Sanitization ➡️"
                  : "⬅️ Show Before Sanitization"}
              </button>
            </div>

            {/* Before Sanitization */}
            {showBefore ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  ⚠️ BEFORE Sanitization (Dangerous!)
                </h3>
                <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
                  <div className="font-mono text-sm break-all">
                    {result.originalInput}
                  </div>
                  <div className="mt-2 text-sm text-red-700">
                    ⚠️ This input contains potentially malicious content and
                    should NOT be rendered directly
                  </div>
                </div>

                {/* Dangerous Render Example (disabled) */}
                <div className="bg-gray-100 p-4 rounded border border-gray-300">
                  <div className="text-sm font-semibold mb-2">
                    ❌ If rendered without sanitization (BLOCKED for security):
                  </div>
                  <code className="text-xs bg-white p-2 block rounded">
                    &lt;div dangerouslySetInnerHTML=&#123;&#123; __html: &quot;
                    {result.originalInput}&quot; &#125;&#125; /&gt;
                  </code>
                  <div className="mt-2 text-xs text-red-600">
                    This would execute malicious scripts! 🚨
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-green-600">
                  ✅ AFTER Sanitization (Safe!)
                </h3>

                {/* Strict Sanitization */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">
                    Strict Mode (All HTML Removed):
                  </h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <div className="font-mono text-sm break-all">
                      {result.sanitized.strict || "(empty)"}
                    </div>
                  </div>
                </div>

                {/* Basic HTML Sanitization */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">
                    Basic HTML Mode (Safe Tags Allowed):
                  </h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <SafeHtml html={result.sanitized.basicHtml || "(empty)"} />
                  </div>
                </div>

                {/* HTML Escaped */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">
                    HTML Escaped (For Display):
                  </h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded font-mono text-sm break-all">
                    {result.sanitized.escaped || "(empty)"}
                  </div>
                </div>
              </div>
            )}

            {/* SQL Test Result */}
            {result.sqlTest && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  SQL Injection Protection
                </h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <div className="mb-2">
                    <span className="font-semibold">Result: </span>
                    {result.sqlTest.message}
                  </div>
                  {result.sqlTest.explanation && (
                    <div className="text-sm text-blue-700 mt-2">
                      ℹ️ {result.sqlTest.explanation}
                    </div>
                  )}
                  <div className="mt-3 text-sm">
                    <strong>How it works:</strong> Prisma ORM uses parameterized
                    queries, which means user input is never directly
                    concatenated into SQL statements. This makes SQL injection
                    impossible.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attack Examples */}
        {examples && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Common Attack Examples
            </h2>
            <p className="text-gray-600 mb-4">
              Click any example to test it automatically:
            </p>

            <div className="space-y-6">
              {/* XSS Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  XSS (Cross-Site Scripting)
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {examples.xss.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(example);
                        setTestType("general");
                      }}
                      className="text-left p-3 bg-red-50 hover:bg-red-100 rounded border border-red-200 font-mono text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL Injection Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-orange-600">
                  SQL Injection
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {examples.sqlInjection.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(example);
                        setTestType("sql");
                      }}
                      className="text-left p-3 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 font-mono text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safe Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-600">
                  Safe Input
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {examples.safe.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(example);
                        setTestType("general");
                      }}
                      className="text-left p-3 bg-green-50 hover:bg-green-100 rounded border border-green-200 text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Link */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            See the{" "}
            <a href="/SECURITY.md" className="text-blue-500 hover:underline">
              SECURITY.md documentation
            </a>{" "}
            for implementation details and best practices.
          </p>
        </div>
      </div>
    </div>
  );
}
