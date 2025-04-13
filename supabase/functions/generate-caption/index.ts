
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

    const { topic, imageUrl, contentType, persona } = await req.json();
    
    let prompt = "";
    
    if (contentType === 'post') {
      // Specific prompts based on the persona
      if (persona === 'Maya Chen') {
        prompt = `Generate a social media caption in the style of Maya Chen, a 28-year-old environmental scientist turned sustainability influencer. She lives in Portland, shares practical eco-friendly tips, and documents her journey toward a zero-waste lifestyle. The caption should balance educational content with personal experience about ${topic || 'sustainability'}. Make it conversational and authentic, 2-3 sentences maximum.`;
      } else if (persona === 'Aiden Rodriguez') {
        prompt = `Generate a social media caption in the style of Aiden Rodriguez, a 32-year-old former college athlete who now runs his own fitness app and training program. His content balances showcasing fitness with vulnerable mental health content and behind-the-scenes looks at entrepreneurship. Write about ${topic || 'fitness'} in an energetic, motivational tone with some personal candor. 2-3 sentences maximum.`;
      } else if (persona === 'Eleanor Wright') {
        prompt = `Generate a social media caption in the style of Eleanor Wright, a 58-year-old food writer and culinary anthropologist who travels the world documenting traditional cooking techniques. Her content combines history, culture, and food photography with personal reflections. Write about ${topic || 'food culture'} in a sophisticated, appreciative tone that conveys deep knowledge. 2-3 sentences maximum.`;
      } else if (persona === 'Jayden Park') {
        prompt = `Generate a social media caption in the style of Jayden Park, a 24-year-old software engineer and digital artist who explores the intersection of technology and creativity. They showcase AI-generated art, coding projects, and philosophical musings about technology. Write about ${topic || 'creative tech'} in a forward-thinking, slightly rebellious tone with technical insight. 2-3 sentences maximum.`;
      } else if (persona === 'Olivia Santos') {
        prompt = `Generate a social media caption in the style of Olivia Santos, a 36-year-old former corporate lawyer who now runs a successful online stationery business while raising young children. Her content focuses on balancing entrepreneurship with mindful parenting and organization systems. Write about ${topic || 'work-life balance'} in a warm, reflective tone that acknowledges life's messiness while finding moments of joy. 2-3 sentences maximum.`;
      } else {
        prompt = `Generate an engaging, authentic-sounding Instagram caption for ${persona || 'a social media user'} about ${topic || 'daily life'}. 
        The caption should sound natural and conversational, like something a real person would write.
        If the topic is travel or nature, make it reflective and awe-inspired.
        If the topic is food, focus on flavors and experiences.
        If the topic is fitness, be motivational but realistic.
        If the topic is technology, be informative but accessible.
        If the topic is art or creativity, be expressive and thoughtful.
        The caption should be 2-3 sentences maximum and include no hashtags.`;
      }
    } else if (contentType === 'comment') {
      // Persona-specific comment styles
      if (persona === 'Maya Chen') {
        prompt = `Write a supportive Instagram comment that Maya Chen, an environmentally conscious sustainability influencer, might leave on a post. Keep it positive, encouraging, and possibly reference sustainability if relevant. Under 100 characters.`;
      } else if (persona === 'Aiden Rodriguez') {
        prompt = `Write a motivational Instagram comment that Aiden Rodriguez, a fitness entrepreneur and mental health advocate, might leave on a post. Make it energetic but genuine. Under 100 characters.`;
      } else if (persona === 'Eleanor Wright') {
        prompt = `Write an appreciative Instagram comment that Eleanor Wright, a cultured food writer and culinary anthropologist, might leave on a post. Make it thoughtful and observant. Under 100 characters.`;
      } else if (persona === 'Jayden Park') {
        prompt = `Write a creative Instagram comment that Jayden Park, a tech-savvy digital artist, might leave on a post. Include a hint of their interest in the intersection of technology and creativity. Under 100 characters.`;
      } else if (persona === 'Olivia Santos') {
        prompt = `Write a supportive Instagram comment that Olivia Santos, a mindful entrepreneur and mother, might leave on a post. Make it warm and empathetic. Under 100 characters.`;
      } else {
        prompt = `Generate a brief, supportive comment that ${persona || 'someone'} might leave on an Instagram post about ${topic || 'a general topic'}. 
        Keep it genuine, friendly, and authentic-sounding. Under 100 characters. No hashtags.`;
      }
    } else {
      prompt = `Write a short, engaging social media post by ${persona || 'a social media user'} about ${topic || 'something interesting'} that sounds authentic and relatable. Keep it under 200 characters.`;
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
