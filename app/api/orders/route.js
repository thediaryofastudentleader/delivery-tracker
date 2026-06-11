import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const body = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Debug logging (visible in Vercel logs)
    console.log('API /orders called');
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Service key exists:', !!supabaseServiceKey);
    console.log('Order ID:', body?.order_id);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase env vars');
      return new Response(
        JSON.stringify({ error: 'Server config error: Missing Supabase credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic validation
    if (!body || !body.order_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid order payload: missing order_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.from('orders').insert([body]).select();

    if (error) {
      console.error('Supabase insert error:', error);
      return new Response(
        JSON.stringify({ error: error.message, code: error.code, details: error.details }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order inserted successfully:', data?.[0]?.order_id);
    return new Response(
      JSON.stringify({ data, success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error', stack: err.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from('orders').select('*');
    if (orderId) {
      query = query.eq('order_id', orderId).single();
    } else {
      query = query.order('created_at', { ascending: false }).limit(50);
    }

    const { data, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('API GET error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
