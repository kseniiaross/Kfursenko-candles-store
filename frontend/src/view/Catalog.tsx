// src/view/Catalog.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Candle, Category } from "../types/candle";

import { listCandles, listCategories } from "../services/candles";
import { useAppDispatch } from "../store/hooks";
import { addToCart } from "../store/cartSlice";

import "../styles/Catalog.css";

type CatalogCardItem = Pick<Candle, "id" | "slug" | "name" | "price"> & {
  coverUrl?: string;
  isPreview?: boolean;
};

const TEST_COVERS: string[] = [
  "/images/test/mango_island1_main.jpg",
  "/images/test/matcha_chill1_main.jpg",
  "/images/test/sweet_lemon1_main.jpg",
  "/images/test/tidal_bore1_main.jpg",
];

const PREVIEW_ITEMS: CatalogCardItem[] = [
  {
    id: 1,
    slug: "mango-island",
    name: "Mango Island",
    price: "34.00",
    coverUrl: TEST_COVERS[0],
    isPreview: true,
  },
  {
    id: 2,
    slug: "matcha-chill",
    name: "Matcha Chill",
    price: "36.00",
    coverUrl: TEST_COVERS[1],
    isPreview: true,
  },
  {
    id: 3,
    slug: "sweet-lemon",
    name: "Sweet Lemon",
    price: "32.00",
    coverUrl: TEST_COVERS[2],
    isPreview: true,
  },
  {
    id: 4,
    slug: "tidal-bore",
    name: "Tidal Bore",
    price: "38.00",
    coverUrl: TEST_COVERS[3],
    isPreview: true,
  },
];

const Catalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const q = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";

  const categoryId = useMemo(() => {
    const n = Number(categoryParam);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [categoryParam]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [cats, items] = await Promise.all([
          listCategories(),
          listCandles({
            search: q ? q : undefined,
            category: categoryId,
            ordering: "-created_at",
          }),
        ]);

        if (!active) return;
        setCategories(cats);
        setCandles(items);
      } catch {
        if (!active) return;
        setError("Failed to load catalog.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [q, categoryId]);

  const onSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    const v = value.trim();
    if (v) next.set("q", v);
    else next.delete("q");
    setSearchParams(next);
  };

  const onCategoryChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("category");
    setSearchParams(next);
  };

  const getCoverUrlFromApi = (p: Candle): string => {
    const anyP = p as unknown as {
      images?: Array<{ image?: string; url?: string }>;
      image?: string;
      image_url?: string;
    };

    const fromImages =
      anyP.images && anyP.images.length > 0
        ? anyP.images[0]?.image || anyP.images[0]?.url || ""
        : "";

    return fromImages || anyP.image || anyP.image_url || "";
  };

  const hasActiveFilters = Boolean(q || categoryParam);

  const displayItems: CatalogCardItem[] = useMemo(() => {
    if (candles.length === 0) return PREVIEW_ITEMS;

    return candles.map((p, idx) => {
      const apiCover = getCoverUrlFromApi(p);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        coverUrl: apiCover || TEST_COVERS[idx % TEST_COVERS.length],
        isPreview: false,
      };
    });
  }, [candles]);

  const onAddToCart = (item: CatalogCardItem) => {
    dispatch(addToCart({ candle_id: item.id, quantity: 1 }));
  };

  return (
    <main className="catalog" aria-label="Catalog page">
      <header className="catalog__header">
        <div className="catalog__topRow">
          <h1 className="catalog__title">Catalog</h1>

          <Link className="catalog__cartLink" to="/cart" aria-label="Go to cart">
            SHOPPING CART
          </Link>
        </div>

        <div className="catalog__filters" role="search" aria-label="Catalog filters">
          <div className="catalog__field catalog__field--wide">
            <label className="catalog__label" htmlFor="catalog-search">
              Search in catalog
            </label>
            <input
              id="catalog-search"
              className="catalog__input"
              value={q}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search in catalog..."
              autoComplete="off"
            />
          </div>

          <div className="catalog__field">
            <label className="catalog__label" htmlFor="catalog-category">
              Category
            </label>
            <select
              id="catalog-category"
              className="catalog__select"
              value={categoryParam}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="catalog__clearBtn"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear
          </button>
        </div>
      </header>

      {loading && <p className="catalog__state">Loading...</p>}
      {error && <p className="catalog__state catalog__state--error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="catalog__meta" aria-label="Catalog meta">
            <span className="catalog__count">{candles.length} items</span>
          </div>

          <section className="catalog__grid" aria-label="Product list">
            {displayItems.map((p) => {
              const coverUrl = p.coverUrl || "";
              const to = `/product/${p.slug}`;

              return (
                <article
                  key={p.id}
                  className={`catalogCard ${p.isPreview ? "catalogCard--preview" : ""}`}
                  aria-label={p.name}
                >
                  <Link
                    to={to}
                    className="catalogCard__link"
                    aria-disabled={p.isPreview ? true : undefined}
                  >
                    <div className="catalogCard__media">
                      <img className="catalogCard__img" src={coverUrl} alt={p.name} loading="lazy" />
                    </div>

                    <div className="catalogCard__metaRow" aria-label="Product meta">
                      <div className="catalogCard__name" title={p.name}>
                        {p.name}
                      </div>
                      <div className="catalogCard__price">${p.price}</div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    className="catalogCard__btn"
                    onClick={() => onAddToCart(p)}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    Add to cart
                  </button>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
};

export default Catalog;