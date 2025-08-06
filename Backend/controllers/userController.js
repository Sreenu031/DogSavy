const DogReport = require('../models/DogReport');

exports.reportDog = async (req, res) => {
  try {
    const { imageUrl, description, latitude, longitude } = req.body;
    const report = new DogReport({
      imageUrl,
      description,
      location: { latitude, longitude },
      reportedBy: req.user.id
    });
    await report.save();
    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await DogReport.find({ reportedBy: req.user.id })
      .populate('assignedNgo', 'organizationName latitude longitude')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
