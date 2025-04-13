
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

    const { prompt, style } = await req.json();
    
    let enhancedPrompt = prompt || "";
    
    // Add portrait-specific styling based on requested style
    if (style === 'professional') {
      enhancedPrompt = `Professional headshot of a ${enhancedPrompt || "person"}, business attire, clean backdrop, studio lighting, high quality, photorealistic`;
    } else if (style === 'casual') {
      enhancedPrompt = `Casual portrait of a ${enhancedPrompt || "person"}, natural lighting, outdoors, candid, relaxed, high quality, photorealistic`;
    } else if (style === 'artistic') {
      enhancedPrompt = `Artistic portrait of a ${enhancedPrompt || "person"}, stylized, creative lighting, unique perspective, high quality`;
    } else {
      // Default style
      enhancedPrompt = `Portrait photograph of a ${enhancedPrompt || "person"} with natural lighting, neutral background, head and shoulders, high resolution, photorealistic`;
    }
    
    console.log(`Generating profile image with prompt: ${enhancedPrompt}`);
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "687458266007b196a490e79a77bae4b123c1792900e1cb730a51344887ad9832",
        input: {
          model: "dev",
          prompt: enhancedPrompt,
          go_fast: false,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1", // Square for profile images
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 28
        },
      }),
    });

    const prediction = await response.json();
    
    console.log("Prediction response:", prediction);
    
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
          imageUrl: prediction.output[0] 
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
    console.error('Error in generate-profile-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
