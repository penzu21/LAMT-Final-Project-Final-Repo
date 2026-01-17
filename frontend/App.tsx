import { useState } from 'react';
import { AnimatedButton } from './components/AnimatedButton';
import { Grid3x3, Ruler } from 'lucide-react';

const API_BASE_URL = 'https://lamt-final-project-final-repo-1.onrender.com';

export default function App() {
  const [numVectors, setNumVectors] = useState(3);
  const [vectorSize, setVectorSize] = useState(3);
  const [matrix, setMatrix] = useState<number[][]>(
    Array(3).fill(null).map(() => Array(3).fill(0))
  );
  const [result, setResult] = useState<string>('');

  // Update matrix when dimensions change
  const updateMatrixDimensions = (rows: number, cols: number) => {
    const newMatrix = Array(rows).fill(null).map((_, i) => 
      Array(cols).fill(null).map((_, j) => 
        i < matrix.length && j < matrix[0]?.length ? matrix[i][j] : 0
      )
    );
    setMatrix(newMatrix);
  };

  const handleNumVectorsChange = (num: number) => {
    setNumVectors(num);
    updateMatrixDimensions(num, vectorSize);
  };

  const handleVectorSizeChange = (size: number) => {
    setVectorSize(size);
    updateMatrixDimensions(numVectors, size);
  };

  const handleMatrixChange = (row: number, col: number, value: string) => {
    const newMatrix = [...matrix];
    newMatrix[row] = [...newMatrix[row]];
    newMatrix[row][col] = parseFloat(value) || 0;
    setMatrix(newMatrix);
  };

  const handleInputFocus = (row: number, col: number) => {
    // Clear the input if it's 0
    if (matrix[row][col] === 0) {
      const newMatrix = [...matrix];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = '' as any; // Temporarily set to empty string
      setMatrix(newMatrix);
    }
  };

  const handleInputBlur = (row: number, col: number) => {
    // If the input is empty on blur, set it back to 0
    if (matrix[row][col] === '' || isNaN(matrix[row][col])) {
      const newMatrix = [...matrix];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = 0;
      setMatrix(newMatrix);
    }
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear the input if backspace is pressed and value is 0
    if (e.key === 'Backspace' && matrix[row][col] === 0) {
      const newMatrix = [...matrix];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = '' as any;
      setMatrix(newMatrix);
    }
  };

  const calculateOrthonormalBasis = () => {
    // Gram-Schmidt process
    const vectors = matrix.map(row => [...row]);
    const orthonormal: number[][] = [];

    for (let i = 0; i < vectors.length; i++) {
      let v = [...vectors[i]];

      // Subtract projections onto previous orthonormal vectors
      for (let j = 0; j < orthonormal.length; j++) {
        const proj = dotProduct(v, orthonormal[j]);
        v = v.map((val, idx) => val - proj * orthonormal[j][idx]);
      }

      // Normalize
      const norm = Math.sqrt(dotProduct(v, v));
      
      if (norm < 1e-10) {
        setResult('Error: Vectors are linearly dependent. Cannot form an orthonormal basis.');
        return;
      }

      const normalized = v.map(val => val / norm);
      orthonormal.push(normalized);
    }

    // Format result
    let resultText = 'Orthonormal Basis:\n\n';
    orthonormal.forEach((vec, i) => {
      resultText += `v${i + 1} = [${vec.map(v => v.toFixed(4)).join(', ')}]\n`;
    });

    setResult(resultText);
  };

  const dotProduct = (a: number[], b: number[]): number => {
    return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
  };

  const handleClear = () => {
    setMatrix(Array(numVectors).fill(null).map(() => Array(vectorSize).fill(0)));
    setResult('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg mb-6 p-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-10 h-10 text-white" />
              <Ruler className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Orthonormal Basis Finder</h1>
          </div>
          <p className="text-blue-100 text-lg ml-24">
            Transform any set of vectors into an orthonormal basis using the Gram-Schmidt process. 
            Simply enter your vectors and calculate!
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-8 mb-8">
          {/* Number of Vectors */}
          <div className="flex-1">
            <label className="block mb-3 font-medium text-gray-700">
              Number of Vectors:
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <AnimatedButton
                  key={num}
                  onClick={() => handleNumVectorsChange(num)}
                  variant="secondary"
                  active={numVectors === num}
                >
                  {num}
                </AnimatedButton>
              ))}
            </div>
          </div>

          {/* Size of Vectors */}
          <div className="flex-1">
            <label className="block mb-3 font-medium text-gray-700">
              Size of Vectors:
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(size => (
                <AnimatedButton
                  key={size}
                  onClick={() => handleVectorSizeChange(size)}
                  variant="secondary"
                  active={vectorSize === size}
                >
                  {size}
                </AnimatedButton>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
          <table className="mx-auto border-collapse">
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  {row.map((val, j) => (
                    <td key={j} className="p-1">
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                        onFocus={() => handleInputFocus(i, j)}
                        onBlur={() => handleInputBlur(i, j)}
                        onKeyDown={(e) => handleKeyDown(i, j, e)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="any"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <AnimatedButton onClick={calculateOrthonormalBasis} variant="primary">
            Calculate
          </AnimatedButton>
          <AnimatedButton onClick={handleClear} variant="secondary">
            Clear
          </AnimatedButton>
        </div>

        {/* Your Input Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Input!</h2>
          <div className="bg-white rounded-lg shadow-md p-8 min-h-[200px]">
            <div className="grid grid-cols-1 gap-4">
              {matrix.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-medium text-gray-600 w-16">v{i + 1} =</span>
                  <span className="text-gray-800">
                    [{row.map(v => Number(v).toFixed(2)).join(', ')}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Answer */}
        <div className="flex justify-center">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Final Answer</h3>
            <pre className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
              {result || 'Enter vectors and click Calculate to see the orthonormal basis.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}