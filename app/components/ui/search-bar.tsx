"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  formattedPrice: string;
  category: {
    id: string;
    name: string;
    accent_color: string;
    background_color: string;
  };
};

function SearchItemList({
  results,
  hasSearched,
  onSelect,
}: {
  results: SearchResult[];
  hasSearched: boolean;
  onSelect: () => void;
}) {
  if (!hasSearched && results.length === 0) return null;

  return (
    <div
      id="search-results"
      role="listbox"
      className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      }}
    >
      {results.length === 0 ? (
        <div className="p-4 text-center">
          <span
            className="text-sm"
            style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans)" }}
          >
            No se encontraron resultados
          </span>
        </div>
      ) : (
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={onSelect}
              role="option"
              className="flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: product.category.background_color }}
              >
                <span
                  className="text-xs font-bold uppercase"
                  style={{
                    color: product.category.accent_color,
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  {product.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {product.name}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {product.category.name}
                </p>
              </div>
              <span
                className="text-sm font-bold shrink-0"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-playfair)",
                }}
              >
                {product.formattedPrice}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isOpen = query.trim().length > 0;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleQueryChange("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setHasSearched(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }

  function handleKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      handleQueryChange("");
      inputRef.current?.blur();
    }
  }

  return (
    <div className="flex-1 max-w-xl mx-auto relative" ref={containerRef}>
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          placeholder="Search instruments, interfaces, monitors..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDownInput}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-(--muted)"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-dm-sans)",
          }}
        />
        {isLoading ? (
          <svg
            className="w-4 h-4 shrink-0 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="var(--muted)"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="var(--amber)"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <kbd
            className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
            style={{ background: "var(--border)", color: "var(--muted)" }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {isOpen && (
        <SearchItemList
          results={results}
          hasSearched={hasSearched}
          onSelect={() => handleQueryChange("")}
        />
      )}
    </div>
  );
}
