import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
        // Track product view
        trackInteraction(data.id, 'view', data.category);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });
  }, [id]);

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
      </div>
    </div>
  );
};

export default ProductDetail;
