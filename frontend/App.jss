<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orthonormal Basis Finder</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-4xl mx-auto p-4">
        <!-- Header -->
        <div class="text-center mb-8 pt-8">
            <div class="flex items-center justify-center gap-3 mb-4">
                <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
                <h1 class="text-4xl font-bold text-gray-800">Orthonormal Basis Finder</h1>
            </div>
            <p class="text-gray-600">Transform your vectors into an orthonormal basis using the Gram-Schmidt process</p>
        </div>

        <!-- Main Card -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <!-- Vector Input Section -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-gray-700">Input Vectors</h2>
                    <button onclick="addVector()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Vector
                    </button>
                </div>

                <div id="vectorsContainer" class="space-y-3"></div>

                <p class="text-sm text-gray-500 mt-3">
                    💡 Enter vectors as comma-separated numbers. Example: 1, 0, 0 or [1, 0, 0]
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <button onclick="handleSubmit()" id="submitBtn" class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Compute Orthonormal Basis
                </button>
                <button onclick="clearAll()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    Clear All
                </button>
            </div>
        </div>

        <!-- Error Message -->
        <div id="errorContainer" class="hidden bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                    <h3 class="font-semibold text-red-800 mb-1">Error</h3>
                    <p id="errorMessage" class="text-red-700"></p>
                </div>
            </div>
        </div>

        <!-- Results Section -->
        <div id="resultsContainer" class="hidden bg-white rounded-2xl shadow-xl p-6">
            <div class="flex items-center gap-2 mb-4">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h2 class="text-xl font-semibold text-gray-700">Orthonormal Basis</h2>
            </div>

            <div id="basisVectors" class="space-y-4"></div>

            <div id="statsContainer" class="hidden mt-6 pt-4 border-t border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <span class="text-gray-600 font-medium">Rank:</span>
                        <span id="rankValue" class="ml-2 text-gray-800 font-semibold"></span>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <span class="text-gray-600 font-medium">Dimension:</span>
                        <span id="dimValue" class="ml-2 text-gray-800 font-semibold"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 pb-8 text-gray-600 text-sm">
            <p>Powered by Gram-Schmidt Orthogonalization</p>
        </div>
    </div>

    <script>
        let vectors = [{ id: 1, value: '' }];
        let nextId = 2;

        function renderVectors() {
            const container = document.getElementById('vectorsContainer');
            container.innerHTML = '';

            vectors.forEach((vector, index) => {
                const vectorDiv = document.createElement('div');
                vectorDiv.className = 'flex items-center gap-3';
                vectorDiv.innerHTML = `
                    <span class="text-gray-600 font-medium min-w-[60px]">v${index + 1}:</span>
                    <input
                        type="text"
                        id="vector-${vector.id}"
                        value="${vector.value}"
                        placeholder="e.g., 1, 2, 3 or [1, 2, 3]"
                        class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                        oninput="updateVector(${vector.id}, this.value)"
                    />
                    ${vectors.length > 1 ? `
                        <button onclick="removeVector(${vector.id})" class="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    ` : ''}
                `;
                container.appendChild(vectorDiv);
            });
        }

        function addVector() {
            vectors.push({ id: nextId++, value: '' });
            renderVectors();
        }

        function removeVector(id) {
            if (vectors.length > 1) {
                vectors = vectors.filter(v => v.id !== id);
                renderVectors();
            }
        }

        function updateVector(id, value) {
            const vector = vectors.find(v => v.id === id);
            if (vector) {
                vector.value = value;
            }
        }

        function parseVector(str) {
            const cleaned = str.trim().replace(/[\[\]()]/g, '');
            return cleaned.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
        }

        function showError(message) {
            document.getElementById('errorMessage').textContent = message;
            document.getElementById('errorContainer').classList.remove('hidden');
            document.getElementById('resultsContainer').classList.add('hidden');
        }

        function hideError() {
            document.getElementById('errorContainer').classList.add('hidden');
        }

        function setLoading(loading) {
            const btn = document.getElementById('submitBtn');
            btn.disabled = loading;
            if (loading) {
                btn.innerHTML = `
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                `;
            } else {
                btn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Compute Orthonormal Basis
                `;
            }
        }

        function formatVector(vec) {
            return `[${vec.map(n => n.toFixed(4)).join(', ')}]`;
        }

        function displayResults(data) {
            hideError();
            
            const basisContainer = document.getElementById('basisVectors');
            basisContainer.innerHTML = '';

            if (data.orthonormal_basis) {
                data.orthonormal_basis.forEach((vec, index) => {
                    const vecDiv = document.createElement('div');
                    vecDiv.className = 'bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4';
                    vecDiv.innerHTML = `
                        <div class="flex items-center gap-3">
                            <span class="font-semibold text-indigo-600 min-w-[60px]">u${index + 1}:</span>
                            <code class="flex-1 text-gray-800 font-mono text-sm bg-white px-3 py-2 rounded border border-indigo-200">
                                ${formatVector(vec)}
                            </code>
                        </div>
                    `;
                    basisContainer.appendChild(vecDiv);
                });

                if (data.rank !== undefined) {
                    document.getElementById('rankValue').textContent = data.rank;
                    document.getElementById('dimValue').textContent = data.orthonormal_basis[0]?.length || 0;
                    document.getElementById('statsContainer').classList.remove('hidden');
                }

                document.getElementById('resultsContainer').classList.remove('hidden');
            }
        }

        async function handleSubmit() {
            hideError();

            const parsedVectors = vectors
                .map(v => parseVector(v.value))
                .filter(v => v.length > 0);

            if (parsedVectors.length === 0) {
                showError('Please enter at least one vector');
                return;
            }

            const dimensions = parsedVectors.map(v => v.length);
            if (new Set(dimensions).size > 1) {
                showError('All vectors must have the same dimension');
                return;
            }

            setLoading(true);

            try {
                const response = await fetch('https://lamt-final-project-final-repo-1.onrender.com/orthonormalize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ vectors: parsedVectors }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to compute orthonormal basis');
                }

                displayResults(data);
            } catch (err) {
                showError(err.message || 'An error occurred while processing your request');
            } finally {
                setLoading(false);
            }
        }

        function clearAll() {
            vectors = [{ id: 1, value: '' }];
            nextId = 2;
            renderVectors();
            hideError();
            document.getElementById('resultsContainer').classList.add('hidden');
        }

        // Initialize
        renderVectors();
    </script>
</body>
</html>
