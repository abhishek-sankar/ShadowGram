
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

    const { prompt, type, category } = await req.json();
    
    // Always use Google's Imagen for image generation
    const model = "google/imagen-3";
    let enhancedPrompt = prompt || "A beautiful photo";
    
    // Enhance the prompt based on the content category
    if (category === 'travel') {
      enhancedPrompt = `${enhancedPrompt || "A beautiful travel scene"} with stunning landscapes, natural lighting, high quality travel photography`;
    } else if (category === 'food') {
      enhancedPrompt = `${enhancedPrompt || "Delicious food"} with perfect composition, professional food photography, appetizing, high quality`;
    } else if (category === 'fitness') {
      enhancedPrompt = `${enhancedPrompt || "Fitness scene"} with dynamic action, healthy lifestyle, professional sports photography, high quality`;
    } else if (category === 'art') {
      enhancedPrompt = `${enhancedPrompt || "Creative artwork"} with artistic composition, rich colors, professional art photography, high quality`;
    } else if (category === 'technology') {
      enhancedPrompt = `${enhancedPrompt || "Modern technology"} with clean lines, professional product photography, high quality`;
    }
    
    console.log(`Generating image with type: ${type}, category: ${category}, prompt: ${enhancedPrompt}`);
    
    const input = {
      prompt: enhancedPrompt,
      aspect_ratio: "4:3",
      safety_filter_level: "block_medium_and_above"
    };
    
    const modelVersion = "af961a46f0fcb7254a90771ef675e9101c551771ddb78d3448167f3040b536ce";
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: modelVersion,
        input: input,
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
          imageUrl: prediction.output
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
