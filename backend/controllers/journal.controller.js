// controllers/journal.controller.js
import * as journalService from '../services/journal.service.js';

export const createJournal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const entry = await journalService.createJournalEntry(userId, req.body);
    
    return res.status(201).json({
      success: true,
      message: "Journal entry logged successfully",
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

export const getJournals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, tag, search } = req.query;
    
    const result = await journalService.getJournalEntries(userId, {
      page,
      limit,
      tag,
      search
    });
    
    return res.status(200).json({
      success: true,
      message: "Journal entries retrieved successfully",
      data: result.entries,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const getJournal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const entry = await journalService.getJournalById(userId, id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        details: `Journal entry with ID ${id} was not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Journal entry retrieved successfully",
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

export const updateJournal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const updated = await journalService.updateJournalEntry(userId, id, req.body);
    
    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully",
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    await journalService.deleteJournalEntry(userId, id);
    
    return res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

export const searchJournals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    
    const results = await journalService.searchUserJournalsFullText(userId, q);
    
    return res.status(200).json({
      success: true,
      message: "Full-text search queries resolved successfully",
      data: results
    });
  } catch (error) {
    next(error);
  }
};

export const exportJournals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format, exclude_private } = req.query;

    const data = await journalService.getJournalsForExport(userId, {
      excludePrivate: exclude_private
    });

    if (format === 'pdf' || format === 'html') {
      // Stream back a beautifully styled HTML attachment suitable for printing to PDF
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', 'attachment; filename="journals-export.html"');
      
      let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>InnerWhispers Journal Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 40px; color: #2d3748; background-color: #f7fafc; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { color: #4a3aff; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-top: 0; font-size: 2em; }
    .entry { margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px dashed #e2e8f0; }
    .entry:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .meta { font-size: 0.85em; color: #718096; margin-bottom: 15px; display: flex; gap: 15px; }
    .title { font-size: 1.4em; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
    .content { line-height: 1.7; font-size: 1.05em; color: #2d3748; white-space: pre-wrap; }
    .tags { margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap; }
    .tag { font-size: 0.75em; background: #edf2f7; color: #4a5568; padding: 4px 8px; border-radius: 4px; }
    .badge { font-weight: bold; text-transform: uppercase; font-size: 0.7em; padding: 2px 6px; border-radius: 4px; }
    .badge-private { background: #fee2e2; color: #991b1b; }
    .badge-shared { background: #dcfce7; color: #166534; }
    @media print {
      body { background: white; margin: 0; }
      .container { box-shadow: none; padding: 0; max-width: 100%; }
      .entry { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>InnerWhispers Journal History</h1>
    <p style="color: #718096; margin-bottom: 30px;">Exported on: ${new Date().toLocaleDateString()}</p>
      `;

      data.forEach(entry => {
        html += `
    <div class="entry">
      <div class="title">${entry.title || 'Untitled Journal Entry'}</div>
      <div class="meta">
        <span>Date: ${new Date(entry.created_at).toLocaleString()}</span>
        <span class="badge ${entry.is_private ? 'badge-private' : 'badge-shared'}">${entry.is_private ? 'Private' : 'Shared'}</span>
      </div>
      <div class="content">${entry.content}</div>
      ${entry.tags && entry.tags.length ? `
      <div class="tags">
        ${entry.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
      </div>` : ''}
    </div>
        `;
      });

      html += `
  </div>
</body>
</html>
      `;
      return res.send(html);
    }

    // Default: Return JSON
    return res.status(200).json({
      success: true,
      message: "Journal export compiled successfully",
      data: data
    });
  } catch (error) {
    next(error);
  }
};
