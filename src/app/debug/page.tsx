"use client";

import React, { useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testDocs, setTestDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Test writing to Firestore
  const testFirestoreWrite = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      console.log("Starting Firestore write test...");
      console.log("Firestore db instance:", db);

      const docRef = await addDoc(collection(db, "test"), {
        message: "Test document",
        timestamp: new Date().toISOString(),
      });

      console.log("Document written with ID:", docRef.id);
      setTestResult(`Success! Document written with ID: ${docRef.id}`);
    } catch (error: any) {
      console.error("Error during Firestore test:", error);
      setError(`Error: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test reading from Firestore
  const testFirestoreRead = async () => {
    setIsLoading(true);
    setError(null);
    setTestDocs([]);

    try {
      console.log("Starting Firestore read test...");
      const querySnapshot = await getDocs(collection(db, "test"));

      const docs: any[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`Read ${docs.length} documents:`, docs);
      setTestDocs(docs);
      setTestResult(`Success! Read ${docs.length} documents`);
    } catch (error: any) {
      console.error("Error during Firestore read test:", error);
      setError(`Error: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Firebase Firestore Test</h1>

      <div className="space-y-4">
        <button
          onClick={testFirestoreWrite}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Write to Firestore"}
        </button>

        <button
          onClick={testFirestoreRead}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {isLoading ? "Testing..." : "Test Read from Firestore"}
        </button>

        {testResult && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
            {testResult}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {testDocs.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Test Documents:</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Tips:</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            Check your Firebase configuration in{" "}
            <code className="bg-gray-200 px-1 rounded">.env.local</code> file
          </li>
          <li>
            Verify that your Firebase project is set up correctly in the
            Firebase console
          </li>
          <li>Make sure Firestore is enabled in your Firebase project</li>
          <li>
            Check that your Firebase security rules allow read/write operations
          </li>
          <li>Ensure your API keys and credentials are correct</li>
          <li>Check for any network issues or CORS problems</li>
          <li>
            Look at the browser console logs for more detailed error messages
          </li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Detailed logs are available in the browser console (F12)</p>
      </div>
    </div>
  );
};

export default FirebaseTest;
