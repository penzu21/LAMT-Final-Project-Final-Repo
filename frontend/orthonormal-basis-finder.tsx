import React, { useState } from 'react';
import { Calculator, Loader2, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';

export default function OrthonormalBasisFinder() {
  const [vectors, setVectors] = useState([
    { id: 1, values: '' },
    { id: 2, values: '' }
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addVector = () => {
    setVectors([...vectors, { id: Date.now(), values: '' }]);
  };

  const removeVector = (id) => {
    if (vectors.length > 1) {
      setVectors(vectors.filter(v => v.id !== id));
    }
  };

  const updateVector = (id, value) => {
    setVectors(vectors.map(v => v.id === id ? { ...v, values: value } : v));
  };

  const parseVectors = () => {
    try {
      const parsed = vectors.map(v => {
        const values = v.values.trim().split(/[,\s]+/).filter(x => x);
        return values.map(num => {
          const parsed = parseFloat(num);
          if (isNaN(parsed)) throw new Error(`Invalid number: ${num}`);
          return parsed;
        });
      });

      if (parsed.some(v => v.length === 0)) {
        throw new Error('All vectors must have at least one component');
      }

      const dimension = parsed[0].length;
      if (parsed.some(v => v.length !== dimension)) {
        throw new Error('All vectors must have the same dimension');
      }

      return parsed;
    } catch (err) {
      throw err;
    }
  };

  const computeBasis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedVectors = parseVectors();
      
      const response = await fetch('https://lamt-final-project-final-repo-1.onrender.com/orthonormal-basis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vectors: parsedVectors })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compute orthonormal basis');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatVector = (vector) => {
    return `[${vector.map(v => v.toFixed(4)).join(', ')}]`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Orthonormal Basis Finder
          </h1>
          <p className="text-gray-600">
            Transform your vectors into an orthonormal basis using the Gram-Schmidt process
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Input Vectors</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter vector components separated by commas or spaces (e.g., "1, 2, 3" or "1 2 3")
          </p>

          <div className="space-y-4">
            {vectors.map((vector, index) => (
              <div key={vector.id} className="flex items-center gap-3">
                <span className="text-lg font-medium text-gray-700 w-8">
                  v{index + 1}
                </span>
                <input
                  type="text"
                  value={vector.values}
                  onChange={(e) => updateVector(vector.id, e.target.value)}
                  placeholder="e.g., 1, 0, 1"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                />
                <button
                  onClick={() => removeVector(vector.id)}
                  disabled={vectors.length <= 1}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={addVector}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Vector
            </button>
          </div>

          <button
            onClick={computeBasis}
            disabled={loading || vectors.every(v => !v.values.trim())}
            className="w-full mt-6 px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Computing...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Compute Orthonormal Basis
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Orthonormal Basis
              </h2>
            </div>

            <div className="space-y-4">
              {result.orthonormal_basis.map((vector, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-indigo-700">
                      e{index + 1}
                    </span>
                    <code className="flex-1 text-gray-800 font-mono text-sm">
                      {formatVector(vector)}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            {/* Process Explanation */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                About the Process
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The Gram-Schmidt process transforms a set of linearly independent vectors
                into an orthonormal basis. Each resulting vector is orthogonal (perpendicular)
                to all others and has unit length (normalized). This is fundamental in many
                areas of mathematics and physics, including QR decomposition and signal processing.
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!result && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              How to Use
            </h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600">1.</span>
                <span>Enter your vectors using commas or spaces to separate components</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600">2.</span>
                <span>Add more vectors using the "Add Vector" button if needed</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600">3.</span>
                <span>All vectors must have the same dimension</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600">4.</span>
                <span>Click "Compute Orthonormal Basis" to see the result</span>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> Try vectors like "1, 0, 1", "0, 1, 1", and "1, 1, 0"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}