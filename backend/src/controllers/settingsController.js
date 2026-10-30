import { SupabaseService } from '../services/supabaseService.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import { config } from '../config/env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SupabaseService.getSettings();
    res.json({
      success: true,
      data: {
        ...settings,
        supabaseConfigured: isSupabaseConfigured(),
        supabaseUrl: config.supabase.url ? `${config.supabase.url.slice(0, 20)}...` : null,
        geminiApiKeyConfigured: !!(config.gemini.apiKey && config.gemini.apiKey.length > 5),
        currentEnvModel: config.gemini.model,
        serverPort: config.port,
        nodeEnv: config.nodeEnv
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updated = await SupabaseService.updateSettings(req.body);
    
    if (req.body.geminiApiKey) {
      config.gemini.apiKey = req.body.geminiApiKey;
    }
    if (req.body.activeModel) {
      config.gemini.model = req.body.activeModel;
    }
    if (req.body.webhookUrl) {
      config.alerts.webhookUrl = req.body.webhookUrl;
    }

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const testGeminiConnection = async (req, res) => {
  const { apiKey, model } = req.body;
  const keyToTest = apiKey || config.gemini.apiKey;
  const modelToTest = model || config.gemini.model || 'gemini-2.5-flash';

  if (!keyToTest) {
    return res.status(400).json({
      success: false,
      error: 'No Gemini API key provided to test. Please supply an API key.'
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(keyToTest);
    const m = genAI.getGenerativeModel({ model: modelToTest });
    const response = await m.generateContent('OpticGuard AI test connection. Respond with OK.');
    const text = response.response.text();

    res.json({
      success: true,
      message: `Gemini API connection verified successfully using ${modelToTest}.`,
      sampleResponse: text.trim()
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: `Gemini verification failed: ${err.message}`
    });
  }
};

export const testSupabase = async (req, res) => {
  const result = await SupabaseService.testConnection();
  if (result.connected) {
    res.json({ success: true, message: result.message });
  } else {
    res.status(400).json({ success: false, error: result.message });
  }
};
