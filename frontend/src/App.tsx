import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Star, Search, Clock, Users, X, Info, Loader2 } from 'lucide-react';

// Base URL for the FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api'; 

// --- Star Rating Component ---
const RatingStars = ({ rating }) => {
    const validRating = parseFloat(rating);
    if (isNaN(validRating) || validRating < 0) return <span className="text-gray-500 text-xs">N/A</span>;
    
    const maxStars = 5;
    const roundedRating = Math.round(validRating * 2) / 2;
    const fullStars = Math.floor(roundedRating);
    const hasHalfStar = roundedRating % 1 !== 0;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center space-x-0.5" title={`${validRating.toFixed(1)} / 5.0`}>
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            {hasHalfStar && (
                <div className="relative w-4 h-4">
                    <Star className="absolute w-4 h-4 text-gray-300" />
                    <svg className="absolute w-4 h-4 top-0 left-0" viewBox="0 0 24 24" fill="currentColor">
                        <defs>
                            <linearGradient id={`half-star-${validRating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="50%" stopColor="#facc15"/>
                                <stop offset="50%" stopColor="#d1d5db"/>
                            </linearGradient>
                        </defs>
                        <path d="M12 2l3.09 6.31 6.91.75-5 4.87 1.18 6.88L12 18.28l-6.18 3.2 1.18-6.88-5-4.87 6.91-.75L12 2z" fill={`url(#half-star-${validRating})`} />
                    </svg>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
            ))}
            <span className="ml-1 text-xs font-semibold text-gray-600">({validRating.toFixed(1)})</span>
        </div>
    );
};


// --- Detail Drawer Component ---
const DetailDrawer = ({ recipe, onClose }) => {
    const [isTimeExpanded, setIsTimeExpanded] = useState(false);
    
    const nutrientList = useMemo(() => {
        if (!recipe?.nutrients || typeof recipe.nutrients !== 'object') return [];
        
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
            value: recipe.nutrients[item.key] || 'N/A'
        }));
    }, [recipe]);

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 overflow-hidden">
            <div className="fixed right-0 top-0 h-full w-full md:w-1/3 bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="sticky top-0 p-6 bg-white border-b shadow-md z-10">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{recipe.title}</h1>
                    <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">{recipe.cuisine}</span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-sm font-semibold text-gray-600 mb-1">Description</h2>
                        <p className="text-gray-700 text-sm italic">{recipe.description || 'No description provided.'}</p>
                    </div>

                    {/* Time Details (with expand icon) */}
                    <div className="p-4 border rounded-xl shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsTimeExpanded(!isTimeExpanded)}>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-sm font-semibold text-gray-700">Total Time</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-md font-bold text-indigo-600">{recipe.total_time ? `${recipe.total_time} mins` : 'N/A'}</span>
                                {isTimeExpanded ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />}
                            </div>
                        </div>
                        {isTimeExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                                <p><strong>Cook Time:</strong> {recipe.cook_time ? `${recipe.cook_time} mins` : 'N/A'}</p>
                                <p><strong>Prep Time:</strong> {recipe.prep_time ? `${recipe.prep_time} mins` : 'N/A'}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Serving Info */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>Serves: <strong>{recipe.serves || 'N/A'}</strong></span>
                    </div>

                    {/* Nutrition Section */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Nutritional Information</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {nutrientList.map((item, index) => (
                                <div key={index} className="flex justify-between p-2 bg-white border rounded-lg shadow-sm">
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


// --- Main App Component ---
export default function App() {
    const [recipes, setRecipes] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [searchFilters, setSearchFilters] = useState({});
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const totalPages = Math.ceil(total / limit);

    // Initial Fetch (Pagination/Sorting/Search)
    const fetchRecipes = useCallback(async (currentPage, currentLimit, filters) => {
        setIsLoading(true);
        setIsError(false);
        
        const hasActiveFilters = Object.values(filters).some(val => val && val.trim() !== '');
        
        let url;
        if (hasActiveFilters) {
            url = `${API_BASE_URL}/recipes/search?${new URLSearchParams(filters).toString()}`;
        } else {
            url = `${API_BASE_URL}/recipes?page=${currentPage}&limit=${currentLimit}`;
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch data.");
            const data = await response.json();
            
            if (hasActiveFilters) {
                setRecipes(data.data || []);
                setTotal(data.total || 0);
            } else {
                setRecipes(data.data || []);
                setTotal(data.total || 0);
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            setIsError(true);
            setRecipes([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [setRecipes, setTotal, setIsLoading, setIsError]);

    // Effect to trigger fetching when page/limit/filters change
    useEffect(() => {
        fetchRecipes(page, limit, searchFilters);
    }, [page, limit, searchFilters, fetchRecipes]);


    // --- Handlers ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        setPage(1);
    };

    const handleFilterChange = (field, value) => {
        const newFilters = {...searchFilters};
        if (value.trim() === '') {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        
        if (Object.keys(newFilters).length !== Object.keys(searchFilters).length) {
            setPage(1);
        }
        setSearchFilters(newFilters);
    };

    const clearFilters = () => {
        setSearchFilters({});
        setPage(1);
    }
    
    // --- Render Logic ---
    const columns = [
        { key: 'title', label: 'Title', filter: true, searchParam: 'title' },
        { key: 'cuisine', label: 'Cuisine', filter: true, searchParam: 'cuisine' },
        { key: 'rating', label: 'Rating', render: (recipe) => <RatingStars rating={recipe.rating} />, filter: true, searchParam: 'rating' },
        { key: 'total_time', label: 'Total Time (mins)', filter: true, searchParam: 'total_time' },
        { key: 'serves', label: 'Serves', render: (recipe) => recipe.serves || 'N/A' },
    ];

    const hasActiveFilters = Object.keys(searchFilters).some(val => searchFilters[val] && searchFilters[val].trim() !== '');

    // --- Fallback Screens (Nice to Have) ---
    const FallbackScreen = ({ title, message, icon, button }) => (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
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
    
    if (isError) {
        return <FallbackScreen 
            title="Connection Error" 
            message={`Could not connect to the API. Ensure FastAPI is running on ${API_BASE_URL.replace('/api', '')}`}
            icon={Info}
        />
    }
    
    if (!isLoading && recipes.length === 0 && hasActiveFilters) {
        return <FallbackScreen
            title="No Results Found"
            message="Your current search filters returned no recipes. Try simplifying your query."
            icon={Search}
            button={{ label: "Clear Filters", action: clearFilters }}
        />
    }

    if (!isLoading && recipes.length === 0 && total === 0) {
        return <FallbackScreen
            title="No Data Found"
            message="The database is empty. Please run the parse_recipes.py script to populate the recipes table."
            icon={Info}
        />
    }
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-10 font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-2">Recipe Browser</h1>
                <p className="text-gray-500 mt-2">Paginated & Filtered data via a simple FastAPI backend.</p>
            </header>

            {/* Filter Status/Clear Button */}
            {hasActiveFilters && (
                <div className="flex justify-between items-center mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm">
                    <span className="font-semibold text-sm text-red-700">Filters Active ({Object.keys(searchFilters).length})</span>
                    <button onClick={clearFilters} className="px-3 py-1 text-xs text-white bg-red-500 rounded-full hover:bg-red-600 transition flex items-center space-x-1">
                        <X className="w-3 h-3" /> <span>Clear Filters</span>
                    </button>
                </div>
            )}

            {/* Recipe Table */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50 sticky top-0">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                                        <div className="flex flex-col space-y-1">
                                            <span>{col.label}</span>
                                            {/* Field-level Filter Input */}
                                            {col.filter && (
                                                <input
                                                    type="text"
                                                    placeholder={col.key === 'rating' ? "e.g., >4.5 or <3" : "Search..."}
                                                    value={searchFilters[col.searchParam] || ''}
                                                    onChange={(e) => handleFilterChange(col.searchParam, e.target.value)}
                                                    className="w-full p-1 border border-gray-300 rounded-md text-gray-700 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4"></th> {/* Detail button column */}
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
                                        className="hover:bg-indigo-50 cursor-pointer transition duration-150"
                                        onClick={() => setSelectedRecipe(recipe)}
                                    >
                                        {columns.map(col => (
                                            <td key={col.key} className="p-4 text-sm text-gray-700">
                                                {col.render ? (
                                                    col.render(recipe)
                                                ) : (
                                                    <div className="max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis" title={recipe[col.key]}>
                                                        {recipe[col.key]}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        <td className="p-4">
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
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-md border">
                {/* Results per page */}
                <div className="flex items-center space-x-2 text-sm text-gray-700 mb-4 md:mb-0">
                    <span>Results per page:</span>
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        disabled={hasActiveFilters}
                        className="p-2 border border-gray-300 rounded-lg bg-white"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    {hasActiveFilters && (
                        <span className="text-xs text-red-500">(Pagination disabled in Search Mode)</span>
                    )}
                </div>

                {/* Page Navigation */}
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                        Page {page} of {totalPages} (Total: {total})
                    </span>
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || hasActiveFilters}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || hasActiveFilters || totalPages === 0}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Detail Drawer */}
            {selectedRecipe && <DetailDrawer recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
        </div>
    );
}
