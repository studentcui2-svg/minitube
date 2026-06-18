function CategoryPills({
  categories,
  activeCategory,
  onCategoryChange,
  loading,
}) {
  return (
    // Clean container with native scrolling hidden
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          disabled={loading}
          onClick={() => onCategoryChange(category)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            category === activeCategory
              ? "bg-[#f1f1f1] text-[#0f0f0f]"
              : "bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]"
          } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryPills;
