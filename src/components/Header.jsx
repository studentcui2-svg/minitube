import { useState, useRef, useEffect } from "react";

// ==========================================
// 1. REAL YOUTUBE AUTOCOMPLETE MATCHER (JSONP)
// ==========================================
const fetchRealSuggestions = (query) => {
  return new Promise((resolve) => {
    if (!query.trim()) {
      resolve([]);
      return;
    }

    // Create a unique callback name for this specific keystroke
    const callbackName = `yt_suggest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Define the global function that Google's servers will call back to
    window[callbackName] = (data) => {
      // Google returns the suggestions in the second item of the array (data[1])
      // It looks like: [["suggestion1", 0], ["suggestion2", 0]]
      const suggestions = data[1] ? data[1].map((item) => item[0]) : [];
      resolve(suggestions);

      // Cleanup: remove the global function and the script tag
      delete window[callbackName];
      document.body.removeChild(script);
    };

    // Inject the script tag to bypass CORS
    const script = document.createElement("script");
    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(
      query,
    )}&jsonp=${callbackName}`;
    document.body.appendChild(script);
  });
};

function Header({ onMenuClick, searchQuery, onSearchQueryChange, onSearch }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // ==========================================
  // 2. DEBOUNCER: Wait 300ms after typing stops to fetch
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetchRealSuggestions(searchQuery).then((results) => {
          setFilteredSuggestions(results);
          setShowSuggestions(true);
        });
      } else {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Wait 300ms before asking Google for suggestions

    return () => clearTimeout(timer); // Cancel the timer if the user keeps typing
  }, [searchQuery]);

  // Handle typing in the input
  const handleInputChange = (e) => {
    onSearchQueryChange(e.target.value);
  };

  // Handle pressing "Enter" or clicking the Search button
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  // Handle clicking a specific suggestion from the dropdown
  const handleSuggestionClick = (suggestion) => {
    onSearchQueryChange(suggestion); // Update the input box visually
    setShowSuggestions(false); // Hide the dropdown
    onSearch(suggestion); // Trigger the actual App search!
  };

  // Close dropdown if the user clicks anywhere else on the screen
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-[#0f0f0f] px-4">
      {/* Left side: Hamburger & Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-[#f1f1f1] hover:bg-[#272727] rounded-full transition"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <div className="flex items-center gap-1 cursor-pointer">
          <div className="flex h-7 w-8 items-center justify-center rounded-lg bg-[#ff0000] text-white font-bold text-xs tracking-tighter">
            ▶
          </div>
          <span className="text-xl font-semibold tracking-tighter text-[#f1f1f1]">
            VideoFlow
          </span>
        </div>
      </div>

      {/* Middle: Search Bar & Autocomplete Dropdown */}
      <div
        className="flex flex-1 items-center justify-center px-8"
        ref={wrapperRef}
      >
        <div className="relative flex w-full max-w-150 flex-col">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center overflow-hidden rounded-full border border-[#303030] bg-[#121212] focus-within:border-[#1c62b9]"
          >
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => {
                if (filteredSuggestions.length > 0) setShowSuggestions(true);
              }}
              className="w-full bg-transparent px-4 py-2 text-[15px] text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
            />

            {/* Clear Button (X) */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchQueryChange("");
                  setShowSuggestions(false);
                  onSearch(""); // Reset search
                }}
                className="px-3 text-[#aaaaaa] hover:text-[#f1f1f1]"
              >
                ✕
              </button>
            )}

            {/* Search Button */}
            <button
              type="submit"
              className="flex items-center justify-center bg-[#222222] px-5 py-2 hover:bg-[#303030] border-l border-[#303030]"
            >
              <svg
                className="h-5 w-5 text-[#f1f1f1]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </form>

          {/* Autocomplete Dropdown List */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-12 z-50 w-full rounded-xl bg-[#222222] py-3 shadow-xl border border-[#303030]">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex w-full items-center gap-4 px-4 py-1.5 text-left text-[15px] font-bold text-[#f1f1f1] hover:bg-[#3f3f3f]"
                >
                  <svg
                    className="h-4 w-4 text-[#aaaaaa]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#272727] text-[#f1f1f1]">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14v-6.39l4 1.83V8.56l-4 1.83V6m2-4v22l-6-2.75V21H1V4h14v1.75L19 2z" />
          </svg>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3ea6ff] text-sm font-semibold text-black">
          A
        </div>
      </div>
    </header>
  );
}

export default Header;
