
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!REPLICATE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_KEY is not set" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const { prompt, type } = await req.json();
    
    let model = "google/imagen-3";
    let input: any = {
      prompt: prompt || "A beautiful landscape photo of nature",
      aspect_ratio: "4:3",
      safety_filter_level: "block_medium_and_above"
    };
    
    // If type is 'profile', use Flux model instead
    if (type === 'scenic') {
      // Use imagen for scenic photos
      model = "google/imagen-3";
    } else {
      // Use flux for other types of images
      model = "black-forest-labs/flux-schnell";
      input = {
        prompt: prompt || "A beautiful photo",
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: "4:3",
        output_format: "webp",
        output_quality: 80,
        num_inference_steps: 4
      };
    }
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: model === "google/imagen-3" 
          ? "af961a46f0fcb7254a90771ef675e9101c551771ddb78d3448167f3040b536ce" 
          : "9eeefd04f121a8c8073abb6c336a970f25548c3df0622dd8c9b491b3ca6a4c68",
        input: input,
      }),
    });

    const prediction = await response.json();
    
    // Check if it's still processing
    if (prediction.status === "starting" || prediction.status === "processing") {
      return new Response(
        JSON.stringify({ 
          status: prediction.status,
          id: prediction.id,
          message: "Image generation in progress" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if completed
    if (prediction.status === "succeeded") {
      return new Response(
        JSON.stringify({ 
          status: "success",
          imageUrl: model === "google/imagen-3" ? prediction.output : prediction.output[0]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle error
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image", 
        details: prediction 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
