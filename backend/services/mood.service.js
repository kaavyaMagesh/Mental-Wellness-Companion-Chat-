// services/mood.service.js
import { supabase } from '../config/supabase.js';
import { cacheService } from './cache.service.js';

export const createMoodEntry = async (userId, data) => {
  const { mood, mood_score, stress_level, sleep_quality, energy_level, note, tags } = data;
  
  const { data: entry, error } = await supabase
    .from('mood_entries')
    .insert([
      {
        user_id: userId,
        mood,
        mood_score,
        stress_level,
        sleep_quality,
        energy_level,
        note,
        tags: tags || []
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Database Insert Failure: ${error.message}`);
  }
  
  // Invalidate trend cache for this user since data changed
  cacheService.delete(`mood_trend_${userId}`);
  
  return entry;
};

export const getMoodEntries = async (userId, filters = {}) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const { startDate, endDate } = filters;
  
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('mood_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) {
    query = query.gte('recorded_at', startDate);
  }
  
  if (endDate) {
    query = query.lte('recorded_at', endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database Fetch Failure: ${error.message}`);
  }

  return {
    entries: data,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit)
    }
  };
};

export const getMoodById = async (userId, entryId) => {
  const { data: entry, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Database Fetch Failure: ${error.message}`);
  }
  
  return entry;
};

export const updateMoodEntry = async (userId, entryId, updateData) => {
  const { mood, mood_score, stress_level, sleep_quality, energy_level, note, tags } = updateData;
  
  const { data: entry, error } = await supabase
    .from('mood_entries')
    .update({
      mood,
      mood_score,
      stress_level,
      sleep_quality,
      energy_level,
      note,
      tags
    })
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Database Update Failure: ${error.message}`);
  }
  
  // Invalidate trend cache for this user since data changed
  cacheService.delete(`mood_trend_${userId}`);
  
  return entry;
};

export const deleteMoodEntry = async (userId, entryId) => {
  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Database Delete Failure: ${error.message}`);
  }
  
  // Invalidate trend cache for this user since data changed
  cacheService.delete(`mood_trend_${userId}`);
  
  return true;
};

export const calculateMoodAnalytics = async (userId) => {
  const now = new Date();
  
  // 1. Fetch data for the last 30 days to calculate trend and streak
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const { data: thirtyDayEntries, error: thirtyDayError } = await supabase
    .from('mood_entries')
    .select('mood, mood_score, stress_level, sleep_quality, energy_level, recorded_at')
    .eq('user_id', userId)
    .gte('recorded_at', thirtyDaysAgo.toISOString())
    .order('recorded_at', { ascending: false });

  if (thirtyDayError) {
    throw new Error(`Analytics Query Failure: ${thirtyDayError.message}`);
  }

  // 2. Fetch data for the last 7 days for averages
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDayEntries = thirtyDayEntries.filter(
    entry => new Date(entry.recorded_at) >= sevenDaysAgo
  );

  // -- CALCULATE 7-DAY AVERAGES --
  let avgMood = 0, avgStress = 0, avgSleep = 0, avgEnergy = 0;
  if (sevenDayEntries.length > 0) {
    const sum = sevenDayEntries.reduce(
      (acc, curr) => {
        acc.mood += curr.mood_score;
        acc.stress += curr.stress_level;
        acc.sleep += curr.sleep_quality;
        acc.energy += curr.energy_level;
        return acc;
      },
      { mood: 0, stress: 0, sleep: 0, energy: 0 }
    );
    const count = sevenDayEntries.length;
    avgMood = parseFloat((sum.mood / count).toFixed(2));
    avgStress = parseFloat((sum.stress / count).toFixed(2));
    avgSleep = parseFloat((sum.sleep / count).toFixed(2));
    avgEnergy = parseFloat((sum.energy / count).toFixed(2));
  }

  // -- CALCULATE 30-DAY DAILY TREND ARRAY --
  const sortedTrendEntries = [...thirtyDayEntries]
    .reverse()
    .map(entry => ({
      date: entry.recorded_at.split('T')[0],
      mood_score: entry.mood_score,
      mood: entry.mood
    }));

  // -- CALCULATE STREAK COUNT --
  let streak = 0;
  if (thirtyDayEntries.length > 0) {
    const loggedDates = [
      ...new Set(thirtyDayEntries.map(entry => entry.recorded_at.split('T')[0]))
    ];
    
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (loggedDates[0] === todayStr || loggedDates[0] === yesterdayStr) {
      streak = 1;
      let currentCheckDate = new Date(loggedDates[0]);
      
      for (let i = 1; i < loggedDates.length; i++) {
        const nextDate = new Date(loggedDates[i]);
        const diffTime = Math.abs(currentCheckDate - nextDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
          currentCheckDate = nextDate;
        } else if (diffDays > 1) {
          break;
        }
      }
    }
  }

  // -- CALCULATE DISTRIBUTION HISTOGRAM --
  const distribution = thirtyDayEntries.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {});

  return {
    averages_7_day: {
      mood_score: avgMood,
      stress_level: avgStress,
      sleep_quality: avgSleep,
      energy_level: avgEnergy,
      log_count: sevenDayEntries.length
    },
    trend_30_day: sortedTrendEntries,
    streak_count: streak,
    distribution_histogram: distribution
  };
};

/**
 * Fetch 30-day mood trend averages utilizing PostgreSQL window functions.
 * Caches outputs for 15 minutes (900 seconds) in memory.
 * @param {string} userId 
 */
export const getMoodTrendAggregation = async (userId) => {
  const cacheKey = `mood_trend_${userId}`;
  
  // 1. Try fetching from Cache first (TTL checked inside cacheService)
  const cachedData = cacheService.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // 2. Cache Miss: Execute the database RPC containing OVER(...) window function
  const { data, error } = await supabase.rpc('get_user_mood_trend', {
    p_user_id: userId
  });

  if (error) {
    throw new Error(`Database Trend RPC Failure: ${error.message}`);
  }

  // 3. Store in cache for 15 minutes (900 seconds) before returning
  cacheService.set(cacheKey, data, 900);

  return data;
};

/**
 * Fetch unique tags from user's historical mood logs for autocomplete tags input
 * @param {string} userId 
 */
export const getUniqueUserMoodTags = async (userId) => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('tags')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Database Tags Fetch Failure: ${error.message}`);
  }

  // Unnest the arrays and filter down to a unique sorted list
  const tagsList = data.flatMap(row => row.tags || []);
  const uniqueTags = [...new Set(tagsList)].sort();
  
  return uniqueTags;
};
