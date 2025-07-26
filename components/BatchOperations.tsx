/**
 * @file BatchOperations.tsx
 * This component provides a UI for performing bulk actions on the exercise library.
 * It includes forms for:
 * 1. Batch Deletion: Deleting exercises based on a set of filters.
 * 2. Purging: Deleting exercises that fall below certain quality thresholds.
 * It includes a crucial "preview" step before deletion to prevent mistakes.
 */
import React, { useState } from 'react';
import { previewDeletion, batchDeleteExercises, purgeLowQualityExercises } from '../services/api';
import type { Exercise, BatchDeleteParams, PurgeParams, DeletionResult } from '../types';
import Loader from './Loader';

const BatchOperations: React.FC = () => {
    const [batchParams, setBatchParams] = useState<BatchDeleteParams>({});
    const [purgeParams, setPurgeParams] = useState<PurgeParams>({ fitness_level_threshold: 3, intensity_threshold: 3 });
    
    const [preview, setPreview] = useState<Exercise[]>([]);
    const [result, setResult] = useState<DeletionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBatchParams({ ...batchParams, [e.target.name]: e.target.value });
    };

    const handlePurgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPurgeParams({ ...purgeParams, [e.target.name]: e.target.valueAsNumber || 0 });
    };

    const handlePreview = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setPreview([]);
        try {
            const previewResults = await previewDeletion(batchParams);
            setPreview(previewResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch preview.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBatchDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${preview.length} exercise(s)? This action cannot be undone.`)) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const deleteResult = await batchDeleteExercises(batchParams);
            setResult(deleteResult);
            setPreview([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Batch deletion failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurge = async () => {
        if (!confirm('Are you sure you want to purge low-quality exercises? This action cannot be undone.')) {
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const purgeResult = await purgeLowQualityExercises(purgeParams);
            setResult(purgeResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Purge failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Batch Delete Section */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-brand-secondary">Batch Delete by Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="exercise_name_pattern" placeholder="Name pattern (e.g., %pull-up%)" onChange={handleBatchChange} className="bg-gray-800 border border-dark-border rounded-md py-2 px-3" />
                    <input type="number" name="fitness_level_max" placeholder="Max fitness level (e.g., 3)" onChange={handleBatchChange} className="bg-gray-800 border border-dark-border rounded-md py-2 px-3" />
                    <input type="number" name="intensity_max" placeholder="Max intensity (e.g., 3)" onChange={handleBatchChange} className="bg-gray-800 border border-dark-border rounded-md py-2 px-3" />
                    <input type="date" name="created_before" onChange={handleBatchChange} className="bg-gray-800 border border-dark-border rounded-md py-2 px-3 text-medium-text" />
                </div>
                <div className="flex space-x-4">
                    <button onClick={handlePreview} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark-bg bg-brand-secondary hover:bg-opacity-90 disabled:bg-gray-500">
                        {isLoading ? 'Loading...' : 'Preview Deletion'}
                    </button>
                    {preview.length > 0 && (
                         <button onClick={handleBatchDelete} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-900">
                             {isLoading ? 'Deleting...' : `Delete ${preview.length} Items`}
                         </button>
                    )}
                </div>
            </div>

            {/* Purge Low Quality Section */}
            <div className="space-y-4 pt-4 border-t border-dark-border">
                 <h3 className="font-semibold text-lg text-brand-secondary">Purge Low-Quality Exercises</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-medium-text">Max Fitness Level</label>
                        <input type="number" name="fitness_level_threshold" value={purgeParams.fitness_level_threshold} onChange={handlePurgeChange} className="w-full mt-1 bg-gray-800 border border-dark-border rounded-md py-2 px-3" />
                    </div>
                    <div>
                        <label className="text-sm text-medium-text">Max Intensity</label>
                        <input type="number" name="intensity_threshold" value={purgeParams.intensity_threshold} onChange={handlePurgeChange} className="w-full mt-1 bg-gray-800 border border-dark-border rounded-md py-2 px-3" />
                    </div>
                 </div>
                 <button onClick={handlePurge} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-900">
                    {isLoading ? 'Purging...' : 'Purge Low-Quality'}
                 </button>
            </div>
            
            {isLoading && <Loader />}
            {error && <p className="text-red-400 text-sm mt-4">Error: {error}</p>}
            {result && <p className="text-green-400 font-semibold mt-4">{result.detail} ({result.deleted_count} items deleted)</p>}

            {preview.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-yellow-400">{preview.length} exercise(s) will be deleted:</h4>
                    <ul className="max-h-48 overflow-y-auto bg-gray-800 p-3 rounded-md space-y-1 text-sm">
                        {preview.map(ex => <li key={ex.id}>{ex.exercise_name}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BatchOperations;
