export const crudFactory = (Model, resourceName) => ({
  create: async (req, res) => {
    try {
      const data = { ...req.body, hospital: req.hospital._id };
      // enforce patient/encounter linkage safety if present
      if (data.patient && String(req.user.hospital) !== String(req.hospital._id))
        return res.status(403).json({ message: "Cross-tenant patient reference" });

      const doc = await Model.create(data);
      res.status(201).json({ message: `${resourceName} created`, data: doc });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  list: async (req, res) => {
    try {
      const { page = 1, limit = 20, sort = "-createdAt" } = req.query;
      const filter = { ...req.tenantFilter };

      // patient scoped listing if patientId is provided
      if (req.query.patient) filter.patient = req.query.patient;
      if (req.query.encounter) filter.encounter = req.query.encounter;

      const docs = await Model.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const count = await Model.countDocuments(filter);
      res.json({ data: docs, page: Number(page), pages: Math.ceil(count / limit), total: count });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  get: async (req, res) => {
    try {
      const doc = await Model.findOne({ _id: req.params.id, ...req.tenantFilter });
      if (!doc) return res.status(404).json({ message: `${resourceName} not found` });
      res.json({ data: doc });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id, ...req.tenantFilter },
        req.body,
        { new: true }
      );
      if (!doc) return res.status(404).json({ message: `${resourceName} not found` });
      res.json({ message: `${resourceName} updated`, data: doc });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  remove: async (req, res) => {
    try {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, ...req.tenantFilter });
      if (!doc) return res.status(404).json({ message: `${resourceName} not found` });
      res.json({ message: `${resourceName} deleted` });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
});
