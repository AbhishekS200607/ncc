const appService = require('../services/applicationService');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const result = await appService.createApplication(req.body);
    logger.info(`New application: ${result.application_id}`);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.code === '23505' && err.message?.includes('whatsapp')) {
      return res.status(409).json({ success: false, message: 'This WhatsApp number is already registered.' });
    }
    next(err);
  }
};

const checkStatus = async (req, res, next) => {
  try {
    const data = await appService.getApplicationByAppId(req.params.appId);
    if (!data) return res.status(404).json({ success: false, message: 'Application not found. Please check your Application ID.' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await appService.getApplications(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await appService.getApplicationById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await appService.updateApplication(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Shortlisted', 'Selected', 'Rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status value.' });
    const data = await appService.updateStatus(req.params.id, status);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await appService.deleteApplication(req.params.id);
    res.json({ success: true, message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
};

const statistics = async (req, res, next) => {
  try {
    const data = await appService.getStatistics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const exportData = async (req, res, next) => {
  try {
    const ExcelJS = require('exceljs');
    const data = await appService.getAllForExport();
    const format = req.query.format || 'csv';

    const columns = [
      { header: 'Application ID', key: 'application_id' },
      { header: 'Name', key: 'name' },
      { header: 'WhatsApp', key: 'whatsapp' },
      { header: 'Gender', key: 'gender' },
      { header: 'Course', key: 'course' },
      { header: 'Extracurricular', key: 'extracurricular' },
      { header: 'Achievements', key: 'achievements' },
      { header: 'NCC Certificate', key: 'ncc_certificate' },
      { header: 'Guardian Name', key: 'guardian_name' },
      { header: 'Guardian Phone', key: 'guardian_phone' },
      { header: 'Height (cm)', key: 'height' },
      { header: 'Weight (kg)', key: 'weight' },
      { header: '10th %', key: 'percentage_10' },
      { header: '12th %', key: 'percentage_12' },
      { header: 'School Activity', key: 'school_activity' },
      { header: 'Parent Service', key: 'parent_service' },
      { header: 'Date Submitted', key: 'created_at' }
    ];

    if (format === 'xlsx') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Applications');
      ws.columns = columns.map(c => ({ ...c, width: 20 }));
      ws.getRow(1).font = { bold: true };
      data.forEach(r => ws.addRow({ ...r, created_at: new Date(r.created_at).toLocaleDateString('en-IN') }));
      res.setHeader('Content-Disposition', 'attachment; filename=applications.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return wb.xlsx.write(res).then(() => res.end());
    }

    // CSV
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(r => columns.map(c => {
      const val = c.key === 'created_at' ? new Date(r.created_at).toLocaleDateString('en-IN') : (r[c.key] ?? '');
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(','));
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send([headers, ...rows].join('\n'));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, checkStatus, getAll, getOne, update, updateStatus, remove, statistics, exportData };
