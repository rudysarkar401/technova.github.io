import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from '@/components/ProductCard';
import { Sparkles } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  rating: { rate: number; count: number };
  category: string;
}

interface Recommendation {
  product_id: number;
  score: number;
  reason: string;
}

export const RecommendedProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get recommendations from database
        const { data: recommendations, error } = await supabase.rpc(
          'get_product_recommendations',
          {
            p_user_id: user.id,
            p_limit: 8,
          }
        );

        if (error) {
          console.error('Error fetching recommendations:', error);
          setLoading(false);
          return;
        }

        if (!recommendations || recommendations.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch product details from API
        const productIds = recommendations.map((r: Recommendation) => r.product_id);
        const productsData = await Promise.all(
          productIds.map((id) =>
            fetch(`https://fakestoreapi.com/products/${id}`).then((res) => res.json())
          )
        );

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (!user || loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Recommended for You</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};
