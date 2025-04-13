
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, userInfo, topic } = await req.json();
    
    if (!contentType || !userInfo) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let promptContent;
    if (contentType === 'post') {
      promptContent = `Generate an Instagram-style post that a real person might write. The content should be engaging, positive, and sound authentic. The post should be related to ${topic || 'daily life, hobbies, or current trends'}. Keep it under 280 characters. Don't include hashtags or emojis.`;
    } else if (contentType === 'comment') {
      promptContent = `Generate a supportive, positive comment that someone might leave on an Instagram post about ${topic || 'any topic'}. Keep it brief, friendly, and authentic-sounding. Under 100 characters. Don't use hashtags or excessive emojis.`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid content type" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Call OpenAI API to generate content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI that generates realistic social media content. The content should be positive, relatable, and never controversial or harmful.' },
          { role: 'user', content: promptContent }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: "Failed to generate content", details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const generatedContent = data.choices[0].message.content.trim();
    
    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        userId: userInfo.id,
        username: userInfo.username,
        profileImage: userInfo.profileImage,
        isAIGenerated: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-ai-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
