const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Hugging Face API configuration
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

// Check if token is configured
if (!HUGGING_FACE_TOKEN) {
  console.warn('HUGGING_FACE_TOKEN not configured, using fallback parsing');
}

// Process AI request
router.post('/process', [
  auth,
  body('text').notEmpty().withMessage('Text is required'),
  body('conversationHistory').optional().isArray().withMessage('Conversation history must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, conversationHistory = [] } = req.body;
    
    console.log('Processing AI request:', text);
    console.log('Conversation history:', conversationHistory);

    // Try Hugging Face AI first, fallback to parsing if it fails
    let response;
    try {
      if (HUGGING_FACE_TOKEN) {
        console.log('Using Hugging Face AI...');
        response = await processWithHuggingFace(text, conversationHistory);
      } else {
        console.log('Using fallback parsing...');
        response = await processEventRequest(text, conversationHistory);
      }
    } catch (error) {
      console.log('AI failed, using fallback parsing:', error.message);
      response = await processEventRequest(text, conversationHistory);
    }
    
    console.log('AI response:', response);
    console.log('Extracted data:', {
      title: response.eventData?.title,
      date: response.eventData?.date,
      time: response.eventData?.time,
      endTime: response.eventData?.endTime
    });
    
    res.json(response);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Simple event parsing function
async function processEventRequest(text, conversationHistory = []) {
  const lowerText = text.toLowerCase();
  
  // Extract date patterns
  const datePatterns = {
    'zítra': getTomorrowDate(),
    'pozítří': getDayAfterTomorrow(),
    'dnes': getTodayDate(),
    'příští týden': getNextWeekDate(),
    'příští měsíc': getNextMonthDate()
  };

  // Extract time patterns
  const timePatterns = {
    'ráno': '09:00',
    'dopoledne': '10:00',
    'poledne': '12:00',
    'odpoledne': '14:00',
    'večer': '19:00',
    'noc': '22:00'
  };

  let extractedDate = null;
  let extractedTime = null;
  let extractedEndTime = null;
  let eventTitle = '';

  // Extract date
  for (const [pattern, date] of Object.entries(datePatterns)) {
    if (lowerText.includes(pattern)) {
      extractedDate = date;
      break;
    }
  }

  // Extract time
  for (const [pattern, time] of Object.entries(timePatterns)) {
    if (lowerText.includes(pattern)) {
      extractedTime = time;
      break;
    }
  }

  // Extract specific time (HH:MM format)
  const timeRegex = /(\d{1,2}):(\d{2})/g;
  const timeMatches = [...lowerText.matchAll(timeRegex)];
  if (timeMatches.length > 0) {
    extractedTime = timeMatches[0][0];
    if (timeMatches.length > 1) {
      extractedEndTime = timeMatches[1][0];
    }
  }
  
  // If we found specific time, override any text-based time
  if (extractedTime) {
    // Remove any text-based time we found earlier
    for (const [pattern, time] of Object.entries(timePatterns)) {
      if (lowerText.includes(pattern)) {
        // Don't override if we found specific time
        break;
      }
    }
  }

  // Extract event type - check for specific keywords first
  if (lowerText.includes('schůzka') || lowerText.includes('meeting')) {
    eventTitle = 'Schůzka';
  } else if (lowerText.includes('večeře') || lowerText.includes('dinner')) {
    eventTitle = 'Večeře';
  } else if (lowerText.includes('oběd') || lowerText.includes('lunch')) {
    eventTitle = 'Oběd';
  } else if (lowerText.includes('kafe') || lowerText.includes('coffee')) {
    eventTitle = 'Kafe';
  } else if (lowerText.includes('sport') || lowerText.includes('cvičení')) {
    eventTitle = 'Sport';
  } else if (lowerText.includes('doktor') || lowerText.includes('lékař')) {
    eventTitle = 'Doktor';
  } else if (lowerText.includes('návštěva') || lowerText.includes('visit')) {
    eventTitle = 'Návštěva';
  } else {
    // Extract custom title from the beginning of the text
    const words = text.split(' ');
    if (words.length > 0) {
      // Take the first word and capitalize it
      eventTitle = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    } else {
      eventTitle = 'Událost';
    }
  }

  // Check conversation context
  const hasEventData = conversationHistory.some(msg => msg.eventData);
  const lastMessage = conversationHistory[conversationHistory.length - 1];
  
  // If user is confirming group selection
  if (lowerText.includes('ano') || lowerText.includes('yes') || lowerText.includes('ok') || lowerText.includes('dobře')) {
    if (lastMessage && lastMessage.eventData) {
      return {
        message: `Skvělé! Vytvořím událost "${lastMessage.eventData.title}" na ${lastMessage.eventData.date} v ${lastMessage.eventData.time}. Událost bude přidána do vaší skupiny.`,
        eventData: lastMessage.eventData
      };
    }
  }
  
  // If user is providing group name
  if (lowerText.includes('skupin') || lowerText.includes('group')) {
    if (lastMessage && lastMessage.eventData) {
      return {
        message: `Rozumím, chcete událost přidat do skupiny. Vytvořím událost "${lastMessage.eventData.title}" na ${lastMessage.eventData.date} v ${lastMessage.eventData.time}.`,
        eventData: lastMessage.eventData
      };
    }
  }

  // Generate response
  if (extractedDate && extractedTime) {
    return {
      message: `Vytvořím událost "${eventTitle}" na ${extractedDate} v ${extractedTime}${extractedEndTime ? ` až ${extractedEndTime}` : ''}. Chceš ji přidat do nějaké konkrétní skupiny?`,
      eventData: {
        title: eventTitle,
        date: extractedDate,
        time: extractedTime,
        endTime: extractedEndTime,
        description: text
      }
    };
  } else if (extractedDate) {
    return {
      message: `Vidím, že chceš vytvořit událost "${eventTitle}" na ${extractedDate}. Můžeš mi prosím upřesnit čas?`,
      eventData: null
    };
  } else if (extractedTime) {
    return {
      message: `Vidím, že chceš vytvořit událost "${eventTitle}" v ${extractedTime}. Můžeš mi prosím upřesnit datum?`,
      eventData: null
    };
  } else {
    return {
      message: `Rozumím, že chceš vytvořit událost. Můžeš mi prosím poskytnout datum a čas? Například: "zítra 14:00" nebo "v pátek večer"`,
      eventData: null
    };
  }
}

// Helper functions for date extraction
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getDayAfterTomorrow() {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return dayAfter.toISOString().split('T')[0];
}

function getNextWeekDate() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
}

function getNextMonthDate() {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toISOString().split('T')[0];
}

// Process with Hugging Face AI
async function processWithHuggingFace(text, conversationHistory = []) {
  if (!HUGGING_FACE_TOKEN) {
    throw new Error('Hugging Face API token not configured');
  }

  try {
    // Create a structured prompt for event creation
    const prompt = `User: ${text}
Assistant: I'll help you create an event. Let me understand what you need.

User: ${text}
Assistant: Based on your request, I can help create an event. Please provide more details about the date and time if needed.`;

    console.log('Sending to Hugging Face:', prompt);

    const response = await axios.post(HUGGING_FACE_API_URL, {
      inputs: prompt,
      parameters: {
        max_length: 150,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9,
        return_full_text: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Hugging Face response:', response.data);

    // Extract AI response
    const aiResponse = response.data[0]?.generated_text || response.data.generated_text || 'I understand you want to create an event.';
    
    // Still use parsing for structured data, but enhance with AI response
    const parsedData = await processEventRequest(text);
    
    return {
      message: aiResponse,
      eventData: parsedData.eventData
    };

  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
}

module.exports = router;
