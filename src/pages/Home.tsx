import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { RecommendedProducts } from '@/components/RecommendedProducts';
import heroBanner from '@/assets/hero-banner.jpg';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  rating: { rate: number; count: number };
  category: string;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=8')
      .then((res) => res.json())
      .then((data) => {
        setFeaturedProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Hero Banner"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Welcome to <span className="text-gradient">Technova</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover the latest in technology and electronics. Premium quality, unbeatable prices.
            </p>
            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="gradient-primary hover:opacity-90 transition-opacity glow-primary">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?category=electronics">
                <Button size="lg" variant="outline">
                  Browse Electronics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Lightning Fast Delivery</h3>
                <p className="text-muted-foreground">Get your orders delivered within 24-48 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
                <p className="text-muted-foreground">100% secure payment processing</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Best Prices</h3>
                <p className="text-muted-foreground">Competitive pricing on all products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <RecommendedProducts />

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
