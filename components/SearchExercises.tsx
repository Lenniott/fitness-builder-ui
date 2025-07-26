/**
 * @file SearchExercises.tsx
 * This component provides a user interface for searching exercises.
 * It supports two modes: 'keyword' search with filters and 'semantic'
 * search based on natural language queries. It handles form state,
 * API requests, and displays loading, error, and result states.
 */
import React, { useState } from 'react';
import { searchExercises, semanticSearchExercises } from '../services/api';
import type { Exercise, SearchPayload, SemanticSearchPayload } from '../types';
import Loader from './Loader';

const SearchExercises: React.FC = () => {
    const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        fitness_level_min: 0,
        fitness_level_max: 10,
        intensity_min: 0,
        intensity_max: 10
    });
    const [results, setResults] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.valueAsNumber || 0 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            let searchResults: Exercise[];
            if (searchType === 'keyword') {
                const payload: SearchPayload = { query, ...filters, limit: 50 };
                searchResults = await searchExercises(payload);
            } else {
                if (!query) {
                    setError('Semantic search requires a query.');
                    setIsLoading(false);
                    return;
                }
                const payload: SemanticSearchPayload = { query, limit: 50 };
                searchResults = await semanticSearchExercises(payload);
            }
            setResults(searchResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex bg-gray-800 rounded-lg p-1">
                <button onClick={() => setSearchType('keyword')} className={`w-1/2 py-2 rounded-md text-sm font-medium ${searchType === 'keyword' ? 'bg-brand-primary text-dark-bg' : 'text-medium-text'}`}>
                    Keyword Search
                </button>
                <button onClick={() => setSearchType('semantic')} className={`w-1/2 py-2 rounded-md text-sm font-medium ${searchType === 'semantic' ? 'bg-brand-secondary text-dark-bg' : 'text-medium-text'}`}>
                    Semantic Search
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="search-query" className="block text-sm font-medium text-medium-text">
                        {searchType === 'keyword' ? 'Search Term (optional)' : 'Describe the exercise you want'}
                    </label>
                    <input
                        type="text"
                        id="search-query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchType === 'keyword' ? 'e.g., push-up, squat' : 'e.g., beginner exercise for lower back'}
                        className="mt-1 block w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-light-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    />
                </div>

                {searchType === 'keyword' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-medium-text">Fitness Level</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input type="number" name="fitness_level_min" value={filters.fitness_level_min} onChange={handleFilterChange} className="w-full bg-gray-800 border border-dark-border rounded-md py-2 px-3" min="0" max="10" />
                                <span className="text-medium-text">to</span>
                                <input type="number" name="fitness_level_max" value={filters.fitness_level_max} onChange={handleFilterChange} className="w-full bg-gray-800 border border-dark-border rounded-md py-2 px-3" min="0" max="10" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-medium-text">Intensity</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input type="number" name="intensity_min" value={filters.intensity_min} onChange={handleFilterChange} className="w-full bg-gray-800 border border-dark-border rounded-md py-2 px-3" min="0" max="10" />
                                <span className="text-medium-text">to</span>
                                <input type="number" name="intensity_max" value={filters.intensity_max} onChange={handleFilterChange} className="w-full bg-gray-800 border border-dark-border rounded-md py-2 px-3" min="0" max="10" />
                            </div>
                        </div>
                    </div>
                )}
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-primary hover:bg-opacity-90 disabled:bg-gray-500">
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>
            
            {error && <p className="text-red-400 text-sm">Error: {error}</p>}

            {isLoading && <Loader text="Searching for exercises..." />}

            {results.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-green-400">{results.length} result(s) found</h4>
                    <ul className="max-h-60 overflow-y-auto bg-gray-800 p-3 rounded-md space-y-2">
                        {results.map(ex => (
                            <li key={ex.id} className="text-sm text-light-text border-b border-dark-border pb-1">
                                {ex.exercise_name} <span className="text-xs text-medium-text">(Lvl: {ex.fitness_level}, Int: {ex.intensity})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {!isLoading && results.length === 0 && !error && <p className="text-center text-medium-text pt-4">No results found.</p>}
        </div>
    );
};

export default SearchExercises;
