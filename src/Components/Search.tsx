import { useState } from 'react';

const preDefinedSuggestions = [
    "test",
    "" // add stuff
];

const Search = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setQuery(value);
        if (value) {
            const filtered = preDefinedSuggestions.filter(item =>
                item.toLowerCase().includes(value)
            ).sort();
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (result: string) => {
        let locationName = result.slice(0, result.indexOf(","));
        if (locationName === "Abbotsford") {
            locationName = 'Abbotsford,_British_Columbia';
        } else if (locationName === "Salvador") {
            locationName = 'Salvador,_Bahia';
        }
        // In React app, perhaps navigate or set state
        console.log('Selected location:', locationName);
        // For now, just log, or you can use navigate('/place/' + locationName)
    };

    return (
        <div style={{
            margin: '0.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '0.5rem',
            alignItems: 'center',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid #5d866c',
                borderRadius: '1rem',
                backgroundColor: '#f5f3f1',
                fontSize: '1.125rem',
                maxHeight: 'min-content'
            }}>
                <div style={{ display: 'flex', flexDirection: 'row', padding: '0 0.5rem' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={handleInput}
                        placeholder="Enter your address..."
                        required
                        style={{
                            flex: 1,
                            color: '#0D0A0B',
                            backgroundColor: '#F3EFF5',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            padding: '0 0.5rem',
                            maxWidth: '130%',
                            outline: 'none',
                            border: 'none',
                            borderRadius: '1rem'
                        }}
                    />
                    <button style={{ border: 'none', background: 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                            fill="none" stroke="#0D0A0B" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                            <path d="M21 21l-6 -6" />
                        </svg>
                    </button>
                </div>
                <div>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                padding: '0.625rem',
                                cursor: 'pointer',
                                borderTop: '1px solid #9ca3af',
                                transition: 'background-color 0.1s',
                                borderRadius: index === suggestions.length - 1 ? '0 0 1rem 1rem' : '0'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3d1ed'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Search;