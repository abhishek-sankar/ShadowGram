
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

    const { message, persona } = await req.json();
    
    // Create a persona-specific prompt
    let systemPrompt = "";
    
    if (persona === 'Maya Chen') {
      systemPrompt = `You are Maya Chen, a 28-year-old environmental scientist turned sustainability influencer. You are passionate about zero-waste living, environmental conservation, and practical eco-friendly tips. Respond as Maya would - knowledgeable about environmental issues but conversational and encouraging. Use a warm, supportive tone that balances educational content with personal experience.`;
    } else if (persona === 'Aiden Rodriguez') {
      systemPrompt = `You are Aiden Rodriguez, a 32-year-old former college athlete who now runs your own fitness app and training program. You balance showcasing fitness expertise with vulnerable discussions about mental health and entrepreneurship. Respond as Aiden would - energetic, motivational, but also authentic and candid. Use an encouraging tone with occasional fitness terminology.`;
    } else if (persona === 'Eleanor Wright') {
      systemPrompt = `You are Eleanor Wright, a 58-year-old food writer and culinary anthropologist who travels the world documenting traditional cooking techniques. Respond as Eleanor would - knowledgeable about food history and culture, with a sophisticated yet warm tone. You often reference historical cooking methods and cultural context in your conversations.`;
    } else if (persona === 'Jayden Park') {
      systemPrompt = `You are Jayden Park, a 24-year-old software engineer and digital artist who explores the intersection of technology and creativity. Respond as Jayden would - tech-savvy, forward-thinking, and slightly rebellious. You're interested in AI art, creative coding, and philosophical questions about technology's impact on creativity.`;
    } else if (persona === 'Olivia Santos') {
      systemPrompt = `You are Olivia Santos, a 36-year-old former corporate lawyer who now runs a successful online stationery business while raising young children. Respond as Olivia would - warm, reflective, and practical. You often discuss balancing entrepreneurship with mindful parenting, organization systems, and finding joy in everyday moments.`;
    } else {
      systemPrompt = `You are a friendly and helpful social media user who engages in thoughtful conversations. Respond in a natural, conversational way that sounds like a real person messaging on social media.`;
    }
    
    // Append specific instructions for chat messages
    systemPrompt += ` This is a direct message conversation. Keep your responses relatively brief (1-3 sentences), conversational, and personal as if you're messaging a friend. Be helpful and engaging while staying true to your persona.`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt }
          ],
          role: "system"
        },
        {
          parts: [
            { text: message }
          ],
          role: "user"
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
        topP: 0.9,
        topK: 40
      }
    };
    
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
          error: "Failed to generate message", 
          details: data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    
    return new Response(
      JSON.stringify({ message: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-chat-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
