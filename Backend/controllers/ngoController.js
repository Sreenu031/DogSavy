const DogReport = require('../models/DogReport');
const Ngo = require('../models/Ngo');

// Get nearby rescue requests (Pending)
exports.getNearbyReports = async (req, res) => {
  try {
    // Get NGO location
    const ngo = await Ngo.findById(req.user.id);
    if (!ngo) return res.status(404).json({ error: 'NGO not found' });

    // Find pending reports within ~10km (simple filter, can use geospatial for real apps)
    const reports = await DogReport.find({
      status: 'Pending',
      $expr: {
        $lt: [
          {
            $sqrt: {
              $add: [
                { $pow: [{ $subtract: ["$location.latitude", ngo.latitude] }, 2] },
                { $pow: [{ $subtract: ["$location.longitude", ngo.longitude] }, 2] }
              ]
            }
          },
          0.1 // ~10km, adjust as needed
        ]
      }
    }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept a rescue request
exports.acceptReport = async (req, res) => {
  try {
    const report = await DogReport.findById(req.params.reportId);
    if (!report || report.status !== 'Pending') return res.status(400).json({ error: 'Invalid report' });
    report.status = 'Accepted';
    report.assignedNgo = req.user.id;
    await report.save();
    res.json({ message: 'Rescue accepted', report });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark a rescue as completed
exports.markRescued = async (req, res) => {
  try {
    const report = await DogReport.findById(req.params.reportId);
    if (!report || report.status !== 'Accepted' || String(report.assignedNgo) !== req.user.id)
      return res.status(400).json({ error: 'Invalid report or not assigned to you' });
    report.status = 'Rescued';
    await report.save();
    res.json({ message: 'Rescue marked as completed', report });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get ongoing rescues (Accepted)
exports.getOngoingRescues = async (req, res) => {
  try {
    const reports = await DogReport.find({
      status: 'Accepted',
      assignedNgo: req.user.id
    }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get rescue summary/history
exports.getRescueSummary = async (req, res) => {
  try {
    const totalRescued = await DogReport.countDocuments({
      status: 'Rescued',
      assignedNgo: req.user.id
    });
    // Optionally, add more stats (by month, etc.)
    res.json({ totalRescued });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};