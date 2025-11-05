-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_admin_analytics();

-- Recreate with new return type including time-series data
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE(
  total_users bigint,
  total_interactions bigint,
  total_views bigint,
  total_cart_adds bigint,
  total_purchases bigint,
  popular_categories jsonb,
  recent_interactions jsonb,
  daily_interactions jsonb,
  interaction_types_trend jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT user_id) FROM user_interactions) as total_users,
    (SELECT COUNT(*) FROM user_interactions) as total_interactions,
    (SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'view') as total_views,
    (SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'cart_add') as total_cart_adds,
    (SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'purchase') as total_purchases,
    (SELECT jsonb_agg(jsonb_build_object('category', category, 'count', count))
     FROM (
       SELECT category, COUNT(*) as count
       FROM user_interactions
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC
       LIMIT 10
     ) as categories) as popular_categories,
    (SELECT jsonb_agg(jsonb_build_object(
       'user_id', user_id,
       'product_id', product_id,
       'interaction_type', interaction_type,
       'category', category,
       'created_at', created_at
     ))
     FROM (
       SELECT user_id, product_id, interaction_type, category, created_at
       FROM user_interactions
       ORDER BY created_at DESC
       LIMIT 50
     ) as recent) as recent_interactions,
    -- Daily interactions for the last 30 days
    (SELECT jsonb_agg(jsonb_build_object(
       'date', date,
       'views', views,
       'cart_adds', cart_adds,
       'purchases', purchases,
       'total', total
     ))
     FROM (
       SELECT
         DATE(created_at) as date,
         COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
         COUNT(*) FILTER (WHERE interaction_type = 'cart_add') as cart_adds,
         COUNT(*) FILTER (WHERE interaction_type = 'purchase') as purchases,
         COUNT(*) as total
       FROM user_interactions
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC
     ) as daily) as daily_interactions,
    -- Interaction types trend over last 7 days
    (SELECT jsonb_agg(jsonb_build_object(
       'date', date,
       'view', view_count,
       'cart_add', cart_add_count,
       'purchase', purchase_count
     ))
     FROM (
       SELECT
         DATE(created_at) as date,
         COUNT(*) FILTER (WHERE interaction_type = 'view') as view_count,
         COUNT(*) FILTER (WHERE interaction_type = 'cart_add') as cart_add_count,
         COUNT(*) FILTER (WHERE interaction_type = 'purchase') as purchase_count
       FROM user_interactions
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC
     ) as types) as interaction_types_trend;
END;
$function$;