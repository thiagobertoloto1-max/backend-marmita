// CEP Lookup Proxy - Fetches address data from ViaCEP API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cep = url.searchParams.get('cep');
    
    if (!cep) {
      return new Response(
        JSON.stringify({ error: 'CEP parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean CEP (remove non-digits)
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return new Response(
        JSON.stringify({ error: 'CEP must have 8 digits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch from ViaCEP API
    const viaCepUrl = `https://viacep.com.br/ws/${cleanCep}/json/`;
    console.log(`Fetching CEP data from: ${viaCepUrl}`);
    
    const response = await fetch(viaCepUrl);
    
    if (!response.ok) {
      throw new Error(`ViaCEP API returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Check if CEP was not found
    if (data.erro) {
      return new Response(
        JSON.stringify({ error: 'CEP não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the address data
    return new Response(
      JSON.stringify({
        cep: data.cep,
        street: data.logradouro,
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching CEP data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch CEP data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
