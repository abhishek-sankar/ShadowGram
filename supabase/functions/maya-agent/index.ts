
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maya Chen's persona information
const mayaPersona = {
  name: "Maya Chen",
  age: 28,
  location: "Portland, Oregon",
  occupation: "Environmental scientist and sustainability influencer",
  bio: `Maya Chen is a 28-year-old environmental scientist turned sustainability influencer. 
  She lives in Portland, Oregon, and shares practical eco-friendly tips while documenting her 
  journey toward a zero-waste lifestyle. With a PhD in Environmental Science from UC Berkeley,
  Maya combines scientific knowledge with approachable, everyday sustainability practices.
  She's passionate about composting, reducing plastic waste, sustainable fashion, local farming,
  and renewable energy. Maya balances educational content with personal experiences, making 
  sustainability feel achievable rather than overwhelming.`,
  topics: [
    "Zero-waste living",
    "Sustainable home products",
    "Composting and urban gardening",
    "Eco-friendly fashion",
    "Plant-based cooking",
    "Environmental activism",
    "Plastic-free alternatives",
    "Sustainable travel",
    "Local farmers markets and CSAs",
    "DIY natural cleaning products"
  ],
  imageTopics: {
    "Zero-waste living": "A clean, minimalist kitchen with glass jars storing bulk foods, reusable produce bags, and a small compost bin",
    "Sustainable home products": "A collection of bamboo toothbrushes, beeswax wraps, wool dryer balls, and reusable silicone food storage bags",
    "Composting": "A small apartment compost bin system with layers of organic material",
    "Urban gardening": "A balcony garden with herbs and vegetables in upcycled containers",
    "Eco-friendly fashion": "A capsule wardrobe featuring timeless, ethically made clothing items in natural fibers",
    "Plant-based cooking": "A colorful plant-based meal with local, seasonal vegetables",
    "Environmental activism": "A peaceful climate protest with people holding creative signs",
    "Plastic-free alternatives": "A zero-waste kit with stainless steel straws, bamboo utensils, and cloth napkins",
    "Sustainable travel": "A backpacker using a refillable water bottle and reusable travel containers",
    "Local farmers markets": "A vibrant farmers market with local produce and reusable shopping bags",
    "DIY natural cleaning": "Homemade cleaning products in glass spray bottles with ingredients like vinegar and essential oils"
  },
  commonPhrases: [
    "Small changes add up to big impact!",
    "Progress over perfection in sustainability.",
    "Being eco-friendly doesn't have to be complicated!",
    "Let me share a practical tip that worked for me...",
    "Here's an easy swap you could try this week...",
    "The data on this is fascinating, but let me break it down simply...",
    "I've been experimenting with...",
    "Have you considered trying...?",
    "That's a common challenge! Here's how I approach it..."
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Parse request
    const { message, conversation } = await req.json();
    console.log("Received message:", message);
    console.log("Conversation context:", conversation);

    // Create context from the conversation history
    const conversationContext = conversation && conversation.length > 0 
      ? conversation.map(msg => `${msg.senderId === 'maya' ? 'Maya' : 'User'}: ${msg.content}`).join('\n')
      : '';

    // Analyze the message to determine if it's related to any image topics
    const imageAnalysisPrompt = `
      Based on this message: "${message}"
      
      Determine if it's asking about or related to any of these sustainability topics:
      ${Object.keys(mayaPersona.imageTopics).join(', ')}
      
      If it is, respond with only the exact topic name from the list above that best matches. 
      If it's not related to any of these topics, respond with "NONE".
      Answer with ONLY the topic name or "NONE", no other text.
    `;

    // First check if we should include an image
    const imageAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that analyzes messages.' },
          { role: 'user', content: imageAnalysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const imageAnalysisData = await imageAnalysisResponse.json();
    const topicMatch = imageAnalysisData.choices[0].message.content.trim();
    console.log("Topic match:", topicMatch);
    
    // Generate an image if there's a topic match
    let imageDescription = null;
    let shouldGenerateImage = topicMatch !== 'NONE' && mayaPersona.imageTopics[topicMatch];
    
    if (shouldGenerateImage) {
      imageDescription = mayaPersona.imageTopics[topicMatch];
      console.log("Will generate image for topic:", topicMatch);
      console.log("Image description:", imageDescription);
    }

    // Build the prompt for Maya's response
    const promptTemplate = `
      You are Maya Chen, a 28-year-old environmental scientist turned sustainability influencer from Portland.
      
      Here's information about who you are:
      ${mayaPersona.bio}
      
      Topics you're passionate and knowledgeable about:
      ${mayaPersona.topics.join(', ')}
      
      Phrases you commonly use:
      ${mayaPersona.commonPhrases.join('\n')}
      
      ${conversationContext ? `Here's the conversation so far:\n${conversationContext}\n\n` : ''}
      
      User: ${message}
      
      Your task:
      - Respond as Maya would in a direct message conversation on social media
      - Keep your response conversational, friendly and helpful
      - Use your knowledge about sustainability to provide valuable information
      - Occasionally use one of your common phrases when appropriate
      - Keep your response relatively brief (2-4 sentences) as this is a chat conversation
      - If the user asks about something unrelated to sustainability, you can still respond as Maya but briefly pivot back to sustainability topics when possible
      ${shouldGenerateImage ? `- Mention that you're sharing an image related to ${topicMatch}` : ''}
      
      Maya's response:
    `;

    // Get Maya's response from OpenAI
    const responseFromOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are Maya Chen, a sustainability influencer.' },
          { role: 'user', content: promptTemplate }
        ],
        temperature: 0.7,
      }),
    });

    const data = await responseFromOpenAI.json();
    const mayaResponse = data.choices[0].message.content.trim();
    console.log("Maya's response:", mayaResponse);

    // If we need to generate an image, do it now
    let imageUrl = null;
    if (shouldGenerateImage && imageDescription) {
      try {
        const imagePrompt = `A high-quality, realistic photograph showing ${imageDescription}. The image should look like it's from a sustainability influencer's Instagram feed, with natural lighting and a clean aesthetic.`;
        
        console.log("Generating image with prompt:", imagePrompt);
        
        const imageGenerationResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
          }),
        });

        const imageData = await imageGenerationResponse.json();
        
        if (imageData.data && imageData.data[0] && imageData.data[0].url) {
          imageUrl = imageData.data[0].url;
          console.log("Generated image URL:", imageUrl);
        } else {
          console.error("Failed to generate image:", imageData);
        }
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: mayaResponse,
        image: imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in maya-agent function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
