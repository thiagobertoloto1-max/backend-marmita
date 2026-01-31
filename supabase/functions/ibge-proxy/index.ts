// IBGE Proxy Edge Function - Proxies requests to IBGE API to avoid CORS issues

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the IBGE API URL
    const ibgeUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/${endpoint}`;
    
    console.log(`Proxying request to: ${ibgeUrl}`);

    const response = await fetch(ibgeUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`IBGE API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `IBGE API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 1} items`);

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        } 
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error proxying IBGE request:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
