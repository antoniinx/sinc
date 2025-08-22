const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const axios = require('axios');
const { query } = require('../config/database');

const router = express.Router();

// Hugging Face API configuration
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

// Check if token is configured
if (!HUGGING_FACE_TOKEN) {
  console.warn('HUGGING_FACE_TOKEN not configured, using intelligent fallback');
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
    const userId = req.user.id;
    
    console.log('Processing AI request:', text);
    console.log('Conversation history:', conversationHistory);

    // Try Hugging Face AI first, fallback to intelligent parsing
    let response;
    try {
      if (HUGGING_FACE_TOKEN) {
        console.log('Using Hugging Face AI...');
        response = await processWithHuggingFace(text, conversationHistory, userId);
      } else {
        console.log('Using intelligent parsing...');
        response = await processIntelligentRequest(text, conversationHistory, userId);
      }
    } catch (error) {
      console.log('AI failed, using intelligent parsing:', error.message);
      response = await processIntelligentRequest(text, conversationHistory, userId);
    }
    
    console.log('AI response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Intelligent request processing
async function processIntelligentRequest(text, conversationHistory = [], userId) {
  const lowerText = text.toLowerCase();
  
  // Greeting detection
  if (isGreeting(lowerText)) {
    return {
      message: "Ahoj! 👋 Jsem tvůj AI asistent pro kalendář. S čím ti mohu pomoci? Můžu ti pomoci s:\n• Vytvořením události\n• Hledáním volného času\n• Návrhem termínů pro setkání\n• Analýzou tvého kalendáře\n\nCo potřebuješ?",
      eventData: null,
      type: 'greeting'
    };
  }

  // Calendar analysis requests
  if (isCalendarAnalysisRequest(lowerText)) {
    return await analyzeCalendar(userId, lowerText);
  }

  // Meeting suggestion requests
  if (isMeetingSuggestionRequest(lowerText)) {
    return await suggestMeetingTime(userId, lowerText);
  }

  // Event creation requests
  if (isEventCreationRequest(lowerText)) {
    return await processEventCreation(text, conversationHistory);
  }

  // General help
  return {
    message: "Rozumím! Můžu ti pomoci s:\n• Vytvořením události (např. 'schůzka zítra 14:00')\n• Hledáním volného času (např. 'kdy mám volno tento týden')\n• Návrhem termínů (např. 'kdy můžu pozvat kamaráda na kafe')\n\nCo konkrétně potřebuješ?",
    eventData: null,
    type: 'help'
  };
}

// Greeting detection
function isGreeting(text) {
  const greetings = [
    'ahoj', 'čau', 'dobrý den', 'dobrý večer', 'dobré ráno',
    'hello', 'hi', 'hey', 'good morning', 'good evening',
    'zdravím', 'nazdar', 'servus'
  ];
  return greetings.some(greeting => text.includes(greeting));
}

// Calendar analysis request detection
function isCalendarAnalysisRequest(text) {
  const patterns = [
    'volno', 'volný čas', 'kdy mám volno', 'kdy nemám nic',
    'prázdný kalendář', 'volný termín', 'kdy můžu', 'kdy se můžu',
    'týden volno', 'měsíc volno', 'volný den'
  ];
  return patterns.some(pattern => text.includes(pattern));
}

// Meeting suggestion request detection
function isMeetingSuggestionRequest(text) {
  const patterns = [
    'pozvat', 'kamarád', 'kafe', 'kávu', 'setkání', 'schůzka',
    'kdy můžu pozvat', 'kdy se můžeme sejít', 'návrh termínu',
    'volný termín pro', 'kdy máš čas'
  ];
  return patterns.some(pattern => text.includes(pattern));
}

// Event creation request detection
function isEventCreationRequest(text) {
  const patterns = [
    'vytvoř', 'událost', 'schůzka', 'meeting', 'doktor', 'lékař',
    'večeře', 'oběd', 'kafe', 'sport', 'cvičení', 'návštěva',
    'zítra', 'dnes', 'příští', 'v pátek', 'v sobotu'
  ];
  return patterns.some(pattern => text.includes(pattern));
}

// Analyze user's calendar
async function analyzeCalendar(userId, text) {
  try {
    // Get user's events for the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const eventsResult = await query(`
      SELECT e.date, e.time, e.end_time, e.title, g.name as group_name
      FROM events e
      JOIN groups g ON e.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ? AND e.date >= DATE('now') AND e.date <= ?
      ORDER BY e.date ASC, e.time ASC
    `, [userId, thirtyDaysFromNow.toISOString().split('T')[0]]);

    const events = eventsResult.rows || [];
    
    if (events.length === 0) {
      return {
        message: "🎉 Skvělé! Tvůj kalendář je úplně prázdný na příštích 30 dní. Máš spoustu volného času!",
        eventData: null,
        type: 'calendar_analysis'
      };
    }

    // Analyze free time
    const freeDays = findFreeDays(events);
    const busyDays = findBusyDays(events);
    
    let response = "📅 Analýza tvého kalendáře:\n\n";
    
    if (freeDays.length > 0) {
      response += `✅ **Volné dny:** ${freeDays.slice(0, 5).join(', ')}${freeDays.length > 5 ? ' a další...' : ''}\n\n`;
    }
    
    if (busyDays.length > 0) {
      response += `📝 **Zaneprázdněné dny:** ${busyDays.slice(0, 3).join(', ')}${busyDays.length > 3 ? ' a další...' : ''}\n\n`;
    }
    
    response += `Celkem máš ${events.length} událostí na příštích 30 dní.`;
    
    return {
      message: response,
      eventData: null,
      type: 'calendar_analysis'
    };
    
  } catch (error) {
    console.error('Calendar analysis error:', error);
    return {
      message: "Omlouvám se, ale nemohu momentálně analyzovat tvůj kalendář. Zkus to prosím později.",
      eventData: null,
      type: 'error'
    };
  }
}

// Suggest meeting time
async function suggestMeetingTime(userId, text) {
  try {
    // Get user's events for the next 14 days
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    
    const eventsResult = await query(`
      SELECT e.date, e.time, e.end_time, e.title
      FROM events e
      JOIN groups g ON e.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ? AND e.date >= DATE('now') AND e.date <= ?
      ORDER BY e.date ASC, e.time ASC
    `, [userId, fourteenDaysFromNow.toISOString().split('T')[0]]);

    const events = eventsResult.rows || [];
    const freeSlots = findFreeTimeSlots(events);
    
    if (freeSlots.length === 0) {
      return {
        message: "😅 Bohužel, tvůj kalendář je na příštích 14 dní úplně plný! Možná bys měl zkusit pozdější termín nebo se domluvit na jiném čase.",
        eventData: null,
        type: 'meeting_suggestion'
      };
    }
    
    // Suggest best times
    const suggestions = freeSlots.slice(0, 5);
    let response = "🤝 **Návrhy termínů pro setkání:**\n\n";
    
    suggestions.forEach((slot, index) => {
      const dayName = getDayName(slot.date);
      response += `${index + 1}. ${dayName} ${slot.date} v ${slot.time}\n`;
    });
    
    response += "\nKterý termín ti vyhovuje? Můžu ti pomoci vytvořit událost.";
    
    return {
      message: response,
      eventData: null,
      type: 'meeting_suggestion',
      suggestions: suggestions
    };
    
  } catch (error) {
    console.error('Meeting suggestion error:', error);
    return {
      message: "Omlouvám se, ale nemohu momentálně navrhnout termíny. Zkus to prosím později.",
      eventData: null,
      type: 'error'
    };
  }
}

// Find free days (days with no events)
function findFreeDays(events) {
  const busyDates = new Set(events.map(e => e.date));
  const freeDays = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!busyDates.has(dateStr)) {
      freeDays.push(getDayName(dateStr) + ' ' + dateStr);
    }
  }
  
  return freeDays;
}

// Find busy days (days with events)
function findBusyDays(events) {
  const busyDates = new Set(events.map(e => e.date));
  return Array.from(busyDates).map(date => getDayName(date) + ' ' + date);
}

// Find free time slots
function findFreeTimeSlots(events) {
  const freeSlots = [];
  const workingHours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get events for this date
    const dayEvents = events.filter(e => e.date === dateStr);
    
    // Check each working hour
    workingHours.forEach(time => {
      const isFree = !dayEvents.some(event => {
        const eventStart = event.time;
        const eventEnd = event.end_time || addHour(event.time);
        return time >= eventStart && time < eventEnd;
      });
      
      if (isFree) {
        freeSlots.push({
          date: dateStr,
          time: time,
          dayName: getDayName(dateStr)
        });
      }
    });
  }
  
  return freeSlots;
}

// Helper functions
function getDayName(dateStr) {
  const date = new Date(dateStr);
  const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  return days[date.getDay()];
}

function addHour(time) {
  const [hours, minutes] = time.split(':');
  const newHours = (parseInt(hours) + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes}`;
}

// Process event creation (existing logic)
async function processEventCreation(text, conversationHistory = []) {
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

  // Extract event type
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
      eventTitle = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    } else {
      eventTitle = 'Událost';
    }
  }

  // Generate response
  if (extractedDate && extractedTime) {
    return {
      message: `✅ Vytvořím událost "${eventTitle}" na ${extractedDate} v ${extractedTime}${extractedEndTime ? ` až ${extractedEndTime}` : ''}. Chceš ji přidat do nějaké konkrétní skupiny?`,
      eventData: {
        title: eventTitle,
        date: extractedDate,
        time: extractedTime,
        endTime: extractedEndTime,
        description: text
      },
      type: 'event_creation'
    };
  } else if (extractedDate) {
    return {
      message: `📅 Vidím, že chceš vytvořit událost "${eventTitle}" na ${extractedDate}. Můžeš mi prosím upřesnit čas? Například: "14:00" nebo "odpoledne"`,
      eventData: null,
      type: 'event_creation'
    };
  } else if (extractedTime) {
    return {
      message: `⏰ Vidím, že chceš vytvořit událost "${eventTitle}" v ${extractedTime}. Můžeš mi prosím upřesnit datum? Například: "zítra" nebo "v pátek"`,
      eventData: null,
      type: 'event_creation'
    };
  } else {
    return {
      message: `🤔 Rozumím, že chceš vytvořit událost. Můžeš mi prosím poskytnout datum a čas? Například: "zítra 14:00" nebo "v pátek večer"`,
      eventData: null,
      type: 'event_creation'
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
async function processWithHuggingFace(text, conversationHistory = [], userId) {
  if (!HUGGING_FACE_TOKEN) {
    throw new Error('Hugging Face API token not configured');
  }

  try {
    // Create a more intelligent prompt
    const prompt = `User: ${text}
Assistant: I'll help you with your calendar and events. Let me understand what you need.

User: ${text}
Assistant: Based on your request, I can help you with calendar management, event creation, or finding free time.`;

    console.log('Sending to Hugging Face:', prompt);

    const response = await axios.post(HUGGING_FACE_API_URL, {
      inputs: prompt,
      parameters: {
        max_length: 200,
        temperature: 0.7,
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
    const aiResponse = response.data[0]?.generated_text || response.data.generated_text || 'I understand you need help with your calendar.';
    
    // Use intelligent parsing for structured data
    const parsedData = await processIntelligentRequest(text, conversationHistory, userId);
    
    return {
      message: aiResponse,
      eventData: parsedData.eventData,
      type: parsedData.type
    };

  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
}

module.exports = router;
