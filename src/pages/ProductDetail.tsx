import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
import { productApi } from '@/services/productApi';
import { recommendationEngine } from '@/services/recommendationEngine';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { trackInteraction } = useInteractionTracking();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.fetchProductById(Number(id));
        if (data) {
          setProduct(data);
          // Track product view
          trackInteraction(data.id, 'view', data.category);
          
          // Fetch similar products
          setLoadingSimilar(true);
          const similar = await recommendationEngine.getSimilarProducts(
            data.id,
            data.category,
            data.price,
            4
          );
          setSimilarProducts(similar);
          setLoadingSimilar(false);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, trackInteraction]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square rounded-lg bg-muted p-8 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-4">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">{product.rating.rate}</span>
                  <span className="text-muted-foreground">({product.rating.count} reviews)</span>
                </div>
              </div>
              <div className="text-4xl font-bold text-primary mb-6">
                ₹{(product.price * 83).toFixed(2)}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 gradient-primary hover:opacity-90 transition-opacity glow-primary"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Similar Products</h2>
            </div>

            {loadingSimilar ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[400px] rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
