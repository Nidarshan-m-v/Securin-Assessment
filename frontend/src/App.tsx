import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { ChevronDown, ChevronUp, Star, Search, Clock, Users, X, Info, Loader2 } from 'lucide-react';

// Base URL for the FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api';

// --- Types ---
interface Nutrients {
    [key: string]: string | number | null | undefined;
}

export interface Recipe {
    id: number;
    cuisine: string;
    title: string;
    rating: number | null;
    prep_time: number | null;
    cook_time: number | null;
    total_time: number | null;
    description: string | null;
    nutrients: Nutrients | string | null;
    calories_int: number | null;
    serves: string | number | null;
}

interface PaginatedRecipes {
    page: number;
    limit: number;
    total: number;
    data: Recipe[];
}

interface RatingStarsProps {
    rating: number | null | undefined;
}

interface DetailDrawerProps {
    recipe: Recipe;
    onClose: () => void;
}

interface FallbackScreenProps {
    title: string;
    message: string;
    icon: React.ElementType;
    button?: { label: string; action: () => void };
}

// --- Star Rating Component ---
const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => {
    if (rating === null || rating === undefined || isNaN(Number(rating))) {
        return <span className="text-gray-400 text-xs">0</span>;
    }
    return (
        <span className="text-sm font-semibold text-yellow-600 flex items-center">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
            {Number(rating).toFixed(1)}
        </span>
    );
};

// --- Detail Drawer Component ---
const DetailDrawer: React.FC<DetailDrawerProps> = ({ recipe, onClose }) => {
    const [isTimeExpanded, setIsTimeExpanded] = useState(false);

    // Parse nutrients if it's a string
    const nutrients: Nutrients = useMemo(() => {
        if (!recipe?.nutrients) return {};
        if (typeof recipe.nutrients === 'string') {
            try {
                return JSON.parse(recipe.nutrients);
            } catch {
                return {};
            }
        }
        return recipe.nutrients;
    }, [recipe]);

    const nutrientList = useMemo(() => {
        const requiredKeys = [
            { key: 'calories', label: 'Calories' },
            { key: 'carbohydrateContent', label: 'Carbs' },
            { key: 'cholesterolContent', label: 'Cholesterol' },
            { key: 'proteinContent', label: 'Protein' },
            { key: 'saturatedFatContent', label: 'Saturated Fat' },
            { key: 'sodiumContent', label: 'Sodium' },
            { key: 'sugarContent', label: 'Sugar' },
            { key: 'fatContent', label: 'Total Fat' },
        ];
        return requiredKeys.map(item => ({
            label: item.label,
            value: nutrients[item.key] ?? 'N/A'
        }));
    }, [nutrients]);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition">
                    <X className="w-5 h-5 text-gray-600" />
                </button>
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-1">{recipe.title}</h1>
                    <span className="inline-block mb-2 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">{recipe.cuisine}</span>
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-gray-600 mb-1">Description</h2>
                        <p className="text-gray-700 text-sm italic">{recipe.description || 'No description provided.'}</p>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsTimeExpanded(!isTimeExpanded)}>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <span className="text-sm font-semibold text-gray-700">Total Time</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-md font-bold text-indigo-600">{recipe.total_time ? `${recipe.total_time} mins` : 'N/A'}</span>
                                {isTimeExpanded ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />}
                            </div>
                        </div>
                        {isTimeExpanded && (
                            <div className="mt-2 text-sm text-gray-600">
                                <div>Cook Time: <b>{recipe.cook_time ? `${recipe.cook_time} mins` : 'N/A'}</b></div>
                                <div>Prep Time: <b>{recipe.prep_time ? `${recipe.prep_time} mins` : 'N/A'}</b></div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>Serves: <strong>{recipe.serves || 'N/A'}</strong></span>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 border-b pb-1 mb-2">Nutritional Information</h2>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {nutrientList.map((item, index) => (
                                <div key={index} className="flex justify-between p-1 bg-gray-50 border rounded">
                                    <span className="font-medium text-gray-600">{item.label}:</span>
                                    <span className="text-gray-800 font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Fallback Screen ---
const FallbackScreen: React.FC<FallbackScreenProps> = ({ title, message, icon, button }) => (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center w-full max-w-sm">
            {React.createElement(icon, { className: "w-10 h-10 mx-auto text-yellow-500 mb-4" })}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            {button && (
                <button onClick={button.action} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    {button.label}
                </button>
            )}
        </div>
    </div>
);

// --- Main App Component ---
const App: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Fetch recipes
    const fetchRecipes = useCallback(async (currentPage: number, currentLimit: number, filters: Record<string, string>) => {
        setIsLoading(true);
        setIsError(false);

        const hasActiveFilters = Object.values(filters).some(val => val && val.trim() !== '');

        let url: string;
        if (hasActiveFilters) {
            url = `${API_BASE_URL}/recipes/search?${new URLSearchParams(filters).toString()}`;
        } else {
            url = `${API_BASE_URL}/recipes?page=${currentPage}&limit=${currentLimit}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch data.");
            const data: PaginatedRecipes = await response.json();

            setRecipes(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            setIsError(true);
            setRecipes([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecipes(page, limit, searchFilters);
    }, [page, limit, searchFilters, fetchRecipes]);

    // Handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        setPage(1);
    };

    const handleFilterChange = (field: string, value: string) => {
        const newFilters = { ...searchFilters };
        if (value.trim() === '') {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        setPage(1);
        setSearchFilters(newFilters);
    };

    const clearFilters = () => {
        setSearchFilters({});
        setPage(1);
    };

    // Table columns
    const columns = [
        { key: 'title', label: 'Title', filter: true, searchParam: 'title' },
        { key: 'cuisine', label: 'Cuisine', filter: true, searchParam: 'cuisine' },
        { key: 'rating', label: 'Rating', render: (recipe: Recipe) => <RatingStars rating={recipe.rating} />, filter: true, searchParam: 'rating' },
        { key: 'total_time', label: 'Total Time (mins)', filter: true, searchParam: 'total_time' },
        { key: 'serves', label: 'Serves', render: (recipe: Recipe) => recipe.serves || 'N/A' },
    ];

    const hasActiveFilters = Object.keys(searchFilters).some(val => searchFilters[val] && searchFilters[val].trim() !== '');

    // Fallbacks
    if (isError) {
        return <FallbackScreen
            title="Connection Error"
            message={`Could not connect to the API. Ensure FastAPI is running on ${API_BASE_URL.replace('/api', '')}`}
            icon={Info}
        />;
    }

    if (!isLoading && recipes.length === 0 && hasActiveFilters) {
        return <FallbackScreen
            title="No Results Found"
            message="Your current search filters returned no recipes. Try simplifying your query."
            icon={Search}
            button={{ label: "Clear Filters", action: clearFilters }}
        />;
    }

    if (!isLoading && recipes.length === 0 && total === 0) {
        return <FallbackScreen
            title="No Data Found"
            message="The database is empty. Please run the parse_recipes.py script to populate the recipes table."
            icon={Info}
        />;
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8 font-sans">
            <header className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Recipes Library</h1>
                <p className="text-gray-500 text-sm">A simple interface to search and browse recipes</p>
            </header>

            {hasActiveFilters && (
                <div className="flex justify-between items-center mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded shadow-sm">
                    <span className="font-semibold text-sm text-red-700">Filters Active ({Object.keys(searchFilters).length})</span>
                    <button onClick={clearFilters} className="px-3 py-1 text-xs text-white bg-red-500 rounded-full hover:bg-red-600 transition flex items-center space-x-1">
                        <X className="w-3 h-3" /> <span>Clear Filters</span>
                    </button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                                    <div className="flex flex-col space-y-1">
                                        <span>{col.label}</span>
                                        {col.filter && (
                                            <input
                                                type="text"
                                                placeholder={col.key === 'rating' ? "e.g., >4.5 or <3" : "Search..."}
                                                value={searchFilters[col.searchParam] || ''}
                                                onChange={(e) => handleFilterChange(col.searchParam, e.target.value)}
                                                className="w-full p-1 border border-gray-300 rounded text-gray-700 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center p-6 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                                    Loading recipes...
                                </td>
                            </tr>
                        ) : (
                            recipes.map(recipe => (
                                <tr
                                    key={recipe.id}
                                    className="hover:bg-indigo-50 cursor-pointer transition"
                                    onClick={() => setSelectedRecipe(recipe)}
                                >
                                    {columns.map(col => (
                                        <td key={col.key} className="p-3 text-sm text-gray-700">
                                            {col.render ? (
                                                col.render(recipe)
                                            ) : (
                                                <div className="max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis" title={String(recipe[col.key as keyof Recipe])}>
                                                    {recipe[col.key as keyof Recipe]}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedRecipe(recipe); }}
                                            className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition"
                                            title="View Details"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-5 p-3 bg-white rounded shadow border">
                <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3 md:mb-0">
                    <span>Results per page:</span>
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        disabled={hasActiveFilters}
                        className="p-2 border border-gray-300 rounded bg-white"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    {hasActiveFilters && (
                        <span className="text-xs text-red-500">(Pagination disabled in Search Mode)</span>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                        Page {page} of {totalPages} (Total: {total})
                    </span>
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || hasActiveFilters}
                        className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || hasActiveFilters || totalPages === 0}
                        className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
            {selectedRecipe && <DetailDrawer recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
        </div>
    );
};

export default App;