-- Create user_interactions table to track all user activity
CREATE TABLE public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'cart_add', 'purchase')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_product_id ON public.user_interactions(product_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see their own interactions
CREATE POLICY "Users can view their own interactions"
  ON public.user_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON public.user_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a function to get product recommendations
CREATE OR REPLACE FUNCTION public.get_product_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_id INTEGER,
  score DECIMAL,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    -- Get categories the user has interacted with
    SELECT DISTINCT category, 
           COUNT(*) * (CASE interaction_type 
             WHEN 'purchase' THEN 3 
             WHEN 'cart_add' THEN 2 
             WHEN 'view' THEN 1 
           END) as category_weight
    FROM user_interactions
    WHERE user_id = p_user_id
    GROUP BY category
  ),
  user_products AS (
    -- Get products the user has already interacted with
    SELECT DISTINCT product_id
    FROM user_interactions
    WHERE user_id = p_user_id
  ),
  similar_users AS (
    -- Find users with similar interaction patterns
    SELECT ui.user_id, COUNT(*) as similarity
    FROM user_interactions ui
    WHERE ui.product_id IN (SELECT product_id FROM user_products)
      AND ui.user_id != p_user_id
    GROUP BY ui.user_id
    ORDER BY similarity DESC
    LIMIT 20
  ),
  recommendations AS (
    -- Get products from similar users in preferred categories
    SELECT 
      ui.product_id,
      SUM(
        (CASE ui.interaction_type 
          WHEN 'purchase' THEN 5 
          WHEN 'cart_add' THEN 3 
          WHEN 'view' THEN 1 
        END) * 
        COALESCE(uc.category_weight, 1)
      ) as recommendation_score,
      CASE 
        WHEN uc.category IS NOT NULL THEN 'Based on your interest in ' || ui.category
        ELSE 'Popular with similar users'
      END as recommendation_reason
    FROM user_interactions ui
    INNER JOIN similar_users su ON ui.user_id = su.user_id
    LEFT JOIN user_categories uc ON ui.category = uc.category
    WHERE ui.product_id NOT IN (SELECT product_id FROM user_products)
    GROUP BY ui.product_id, ui.category, uc.category
    
    UNION ALL
    
    -- Add popular products from user's favorite categories
    SELECT 
      ui.product_id,
      COUNT(*) * 2 as recommendation_score,
      'Popular in ' || ui.category as recommendation_reason
    FROM user_interactions ui
    INNER JOIN user_categories uc ON ui.category = uc.category
    WHERE ui.product_id NOT IN (SELECT product_id FROM user_products)
    GROUP BY ui.product_id, ui.category
  )
  SELECT 
    r.product_id,
    SUM(r.recommendation_score)::DECIMAL as score,
    (ARRAY_AGG(r.recommendation_reason ORDER BY r.recommendation_score DESC))[1] as reason
  FROM recommendations r
  GROUP BY r.product_id
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$;