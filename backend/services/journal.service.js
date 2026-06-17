// services/journal.service.js
import { supabase } from '../config/supabase.js';

export const createJournalEntry = async (userId, data) => {
  const { title, content, mood_link, tags, is_private } = data;
  
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert([
      {
        user_id: userId,
        title,
        content,
        mood_link: mood_link || null,
        tags: tags || [],
        is_private: is_private !== undefined ? is_private : true
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Database Insert Failure: ${error.message}`);
  }
  
  return entry;
};

export const getJournalEntries = async (userId, filters = {}) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const { tag, search } = filters;
  
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('journal_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tag) {
    query = query.contains('tags', [tag]);
  }
  
  if (search) {
    query = query.or(`content.ilike.%${search}%,title.ilike.%${search}%`);
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

export const getJournalById = async (userId, journalId) => {
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', journalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Database Fetch Failure: ${error.message}`);
  }
  
  return entry;
};

export const updateJournalEntry = async (userId, journalId, updateData) => {
  const { title, content, mood_link, tags, is_private } = updateData;
  
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .update({
      title,
      content,
      mood_link,
      tags,
      is_private
    })
    .eq('id', journalId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Database Update Failure: ${error.message}`);
  }
  
  return entry;
};

export const deleteJournalEntry = async (userId, journalId) => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', journalId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Database Delete Failure: ${error.message}`);
  }
  
  return true;
};

export const searchUserJournalsFullText = async (userId, searchQuery) => {
  const { data, error } = await supabase.rpc('search_user_journals', {
    p_user_id: userId,
    p_query: searchQuery
  });

  if (error) {
    throw new Error(`Database RPC Search Failure: ${error.message}`);
  }
  
  return data;
};

/**
 * Fetch journal entries for export, with filtering option respecting privacy flags.
 * @param {string} userId 
 * @param {object} options 
 */
export const getJournalsForExport = async (userId, options = {}) => {
  const excludePrivate = options.excludePrivate === 'true' || options.excludePrivate === true;

  let query = supabase
    .from('journal_entries')
    .select('id, title, content, tags, is_private, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (excludePrivate) {
    // If we exclude private entries, filter down to is_private = false
    query = query.eq('is_private', false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Export Query Failure: ${error.message}`);
  }

  return data;
};
