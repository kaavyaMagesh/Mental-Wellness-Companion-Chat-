// controllers/mood.controller.js
import * as moodService from '../services/mood.service.js';

export const createMood = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const entry = await moodService.createMoodEntry(userId, req.body);
    
    return res.status(201).json({
      success: true,
      message: "Mood entry logged successfully",
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

export const getMoods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, startDate, endDate } = req.query;
    
    const result = await moodService.getMoodEntries(userId, {
      page,
      limit,
      startDate,
      endDate
    });
    
    return res.status(200).json({
      success: true,
      message: "Mood entries retrieved successfully",
      data: result.entries,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getMood = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const entry = await moodService.getMoodById(userId, id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        details: `Mood log entry with ID ${id} was not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Mood entry retrieved successfully",
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

export const updateMood = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const updated = await moodService.updateMoodEntry(userId, id, req.body);
    
    return res.status(200).json({
      success: true,
      message: "Mood entry updated successfully",
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMood = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await moodService.deleteMoodEntry(userId, id);
    
    return res.status(200).json({
      success: true,
      message: "Mood entry deleted successfully",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

export const getMoodAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const analytics = await moodService.calculateMoodAnalytics(userId);
    
    return res.status(200).json({
      success: true,
      message: "Mood analytics generated successfully",
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

export const getMoodTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trend = await moodService.getMoodTrendAggregation(userId);
    
    return res.status(200).json({
      success: true,
      message: "30-day mood trend aggregation resolved successfully",
      data: trend
    });
  } catch (error) {
    next(error);
  }
};

export const getMoodTags = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tags = await moodService.getUniqueUserMoodTags(userId);
    
    return res.status(200).json({
      success: true,
      message: "Mood tags resolved successfully",
      data: tags
    });
  } catch (error) {
    next(error);
  }
};
