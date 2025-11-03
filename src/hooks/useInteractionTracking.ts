import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInteractionTracking = () => {
  const { user } = useAuth();

  const trackInteraction = async (
    productId: number,
    interactionType: 'view' | 'cart_add' | 'purchase',
    category?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_interactions').insert({
        user_id: user.id,
        product_id: productId,
        interaction_type: interactionType,
        category: category,
      });

      if (error) {
        console.error('Error tracking interaction:', error);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  return { trackInteraction };
};
