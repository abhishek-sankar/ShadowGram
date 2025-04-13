
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not set" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const { topic, imageUrl, contentType } = await req.json();
    
    let prompt = "";
    
    if (contentType === 'post') {
      prompt = `Generate an engaging, authentic-sounding Instagram caption about ${topic || 'daily life'}. The caption should be under 150 characters, sound like a real person wrote it, and be relatable. Don't include hashtags.`;
    } else if (contentType === 'comment') {
      prompt = `Generate a brief, supportive comment that someone might leave on an Instagram post about ${topic || 'a general topic'}. Keep it under 80 characters and make it sound like a real person wrote it.`;
    } else {
      prompt = `Write a short, engaging social media post about ${topic || 'something interesting'} that sounds authentic and relatable. Keep it under 200 characters.`;
    }
    
    // If we have an image URL, we can use it for context
    const requestBody: any = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
        topP: 0.9,
        topK: 40
      }
    };
    
    // If we have an image URL, add it to the request
    if (imageUrl) {
      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageUrl // assuming imageUrl is a base64 encoded image
        }
      });
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate caption", 
          details: data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    
    return new Response(
      JSON.stringify({ caption: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-caption function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
