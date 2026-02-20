import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Candle } from "../types/candle";
import { getCandleBySlug } from "../services/candles";
import "../styles/Product.css";

type ApiImage = { image?: string; url?: string };

const FALLBACK: Record<
  string,
  { name: string; price: string; folder: string; prefix: string; count: number; hasMain: boolean }
> = {
  "mango-island": {
    name: "Mango Island",
    price: "34.00",
    folder: "mango_island",
    prefix: "mango_island",
    count: 5,
    hasMain: true,
  },
  "matcha-chill": {
    name: "Matcha Chill",
    price: "36.00",
    folder: "matcha_chill",
    prefix: "matcha_chill",
    count: 4,
    hasMain: true,
  },
  "sweet-lemon": {
    name: "Sweet Lemon",
    price: "32.00",
    folder: "sweet_lemon",
    prefix: "sweet_lemon",
    count: 4,
    hasMain: true,
  },
  "tidal-bore": {
    name: "Tidal Bore",
    price: "38.00",
    folder: "tidal_bore",
    prefix: "tidal_bore",
    count: 4,
    hasMain: true,
  },
};

const FALLBACK_DESCRIPTION: Record<string, string> = {
  "mango-island":
    "You are on an island paradise, putting your concerns behind, sipping a refreshing Pina-Colada flavored with luscious mango and ripe fresh coconut while lounging in a hammock on the ocean",
};

const MATERIALS_TEXT =
  "Materials: coconut wax, soy wax, cotton wick, natural scents, eco glass, eco packaging";

const buildTestImages = (slug: string): string[] => {
  const cfg = FALLBACK[slug];
  if (!cfg) return [];

  const base = `/images/test/${cfg.folder}`;
  const items: string[] = [];

  if (cfg.hasMain) items.push(`${base}/${cfg.prefix}1_main.jpg`);
  for (let i = 2; i <= cfg.count; i += 1) items.push(`${base}/${cfg.prefix}${i}.jpg`);

  return items;
};

const normalizeApiImages = (item: Candle | null): string[] => {
  if (!item) return [];

  const anyItem = item as unknown as {
    images?: ApiImage[];
    image?: string;
    image_url?: string;
  };

  const list = (anyItem.images ?? [])
    .map((x) => x?.image || x?.url || "")
    .filter((x): x is string => Boolean(x && x.trim()));

  const cover = (anyItem.image || anyItem.image_url || "").trim();
  if (cover && !list.includes(cover)) return [cover, ...list];

  return list;
};

const clampInt = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const Product: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const s = String(slug || "").trim();

  const [item, setItem] = useState<Candle | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState<number>(1);
  const [sizeOz, setSizeOz] = useState<"8" | "16">("8");

  const fallback = FALLBACK[s];

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setApiError("");
        setItem(null);

        if (!s) {
          setApiError("Product not found.");
          return;
        }

        const data = await getCandleBySlug(s);
        if (!active) return;
        setItem(data);
      } catch {
        if (!active) return;
        setItem(null);
        setApiError("Failed to load product.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [s]);

  const images = useMemo(() => {
    const apiImages = normalizeApiImages(item);
    if (apiImages.length > 0) return apiImages;
    return buildTestImages(s);
  }, [item, s]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  const activeImage = images[activeIndex] || images[0] || "";

  const title = item?.name || fallback?.name || "Product";
  const price = item?.price || fallback?.price || "";
  const description =
    (item as unknown as { description?: string } | null)?.description?.trim() ||
    FALLBACK_DESCRIPTION[s] ||
    "";

  const showFallbackContent = Boolean(!item && fallback && images.length > 0);
  const showHardError = Boolean(!loading && !item && !showFallbackContent);

  const onQtyChange = (v: string) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return;
    setQty(clampInt(Math.floor(n), 1, 999));
  };

  const onAddToCart = () => {
    const id = item?.id ?? null;
    // eslint-disable-next-line no-console
    console.log("Add to cart:", { id, slug: s, qty, size_oz: sizeOz });
  };

  return (
    <main className="product" aria-label="Product page">
      <header className="product__header" aria-label="Product navigation">
        <Link className="product__back" to="/catalog" aria-label="Back to catalog">
          BACK TO CATALOG
        </Link>

        <Link className="product__cart" to="/cart" aria-label="Go to cart">
          SHOPPING CART
        </Link>
      </header>

      {loading && <p className="product__state">Loading...</p>}

      {showHardError && (
        <p className="product__state product__state--error">{apiError || "Product not found."}</p>
      )}

      {!loading && (item || showFallbackContent) && (
        <section className="product__layout" aria-label="Product details">
          <div className="product__gallery" aria-label="Product gallery">
            <div className="product__thumbs" aria-label="Gallery thumbnails">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  className={`product__thumb ${idx === activeIndex ? "product__thumb--active" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Show image ${idx + 1}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                >
                  <img className="product__thumbImg" src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>

            <div className="product__main" aria-label="Main image">
              <div className="product__mainFrame">
                {activeImage ? (
                  <img className="product__mainImg" src={activeImage} alt={title} />
                ) : (
                  <div className="product__mainPlaceholder" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>

          <aside className="product__panel" aria-label="Purchase panel">
            <h1 className="product__title">{title}</h1>

            {price ? <div className="product__price">${price}</div> : null}

            <div className="product__controls" aria-label="Purchase controls">
              <div className="product__row">
                <div className="product__label">Quantity</div>
                <input
                  className="product__qty"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(qty)}
                  onChange={(e) => onQtyChange(e.target.value)}
                  aria-label="Quantity"
                />
              </div>

              <div className="product__row">
                <div className="product__label">Size</div>
                <div className="product__segmented" role="group" aria-label="Size in ounces">
                  <button
                    type="button"
                    className={`product__segBtn ${sizeOz === "8" ? "product__segBtn--active" : ""}`}
                    onClick={() => setSizeOz("8")}
                    aria-pressed={sizeOz === "8"}
                  >
                    8 OZ
                  </button>
                  <button
                    type="button"
                    className={`product__segBtn ${sizeOz === "16" ? "product__segBtn--active" : ""}`}
                    onClick={() => setSizeOz("16")}
                    aria-pressed={sizeOz === "16"}
                  >
                    16 OZ
                  </button>
                </div>
              </div>

              <button type="button" className="product__btn" onClick={onAddToCart} aria-label="Add to cart">
                ADD TO CART
              </button>
            </div>

            {description ? (
              <div className="product__block" aria-label="Description">
                <div className="product__blockTitle">Description</div>
                <p className="product__text">{description}</p>
              </div>
            ) : null}

            <div className="product__block" aria-label="Materials">
              <div className="product__blockTitle">Materials</div>
              <p className="product__text">{MATERIALS_TEXT}</p>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
};

export default Product;