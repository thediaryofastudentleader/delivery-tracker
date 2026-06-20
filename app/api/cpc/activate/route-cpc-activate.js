import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, customer_name, email, phone, category, order_id, total_orders } = body;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if CPC already exists
    const { data: existing } = await supabase
      .from('cash_pass_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (existing) {
      // Update if category changed
      if (existing.category !== category) {
        await supabase
          .from('cash_pass_codes')
          .update({
            category,
            total_orders: (existing.total_orders || 0) + (total_orders || 1),
            updated_at: new Date().toISOString()
          })
          .eq('code', code);
      }
      return Response.json({ success: true, code, updated: true });
    }

    // Insert new CPC
    const { error: cpcError } = await supabase.from('cash_pass_codes').insert({
      code,
      customer_name,
      email,
      phone,
      category,
      total_orders: total_orders || 1,
      purchase_days: 1,
      is_active: true
    });

    if (cpcError) {
      console.error('CPC insert error:', cpcError);
      return Response.json({ error: cpcError.message }, { status: 500 });
    }

    // Create points record
    await supabase.from('customer_points').insert({
      cpc_code: code,
      points_balance: 0,
      total_earned: 0,
      total_redeemed: 0
    });

    return Response.json({ success: true, code });
  } catch (err) {
    console.error('API error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}