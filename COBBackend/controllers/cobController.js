const Cob = require('../models/Cob');

// Get all COB entries
const getCobs = async (req, res) => {
  try {
    const cobs = await Cob.find().sort({ createdAt: -1 });
    res.json(cobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new COB entry
const addCob = async (req, res) => {
  const { date, startTime, endTime, durationText } = req.body;
  try {
    const newCob = new Cob({ date, startTime, endTime, durationText });
    await newCob.save();
    res.status(201).json(newCob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getCobs, addCob };
// Update COB entry
const updateCob = async (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime, durationText } = req.body;
  try {
    const updated = await Cob.findByIdAndUpdate(
      id,
      { date, startTime, endTime, durationText },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete COB entry
const deleteCob = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Cob.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getCobs, addCob, updateCob, deleteCob };