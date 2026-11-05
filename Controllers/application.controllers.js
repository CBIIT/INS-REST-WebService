const config = require("../Config");

const version = (req, res) => {
  return res.json({
    status: "success",
    data: {
      softwareVersion: config.softwareVersion,
      siteDataUpdate: null,
    },
  });
};

const getWidgetUpdate = (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "This endpoint is not implemented",
  });
};

const getSiteUpdate = (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "This endpoint is not implemented",
  });
};

const getGlossaryTerms = (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "This endpoint is not implemented",
  });
};

const getGlossaryTermsByFirstLetter = (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "This endpoint is not implemented",
  });
};

const getFirstLettersInGlossary = (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "This endpoint is not implemented",
  });
};

module.exports = {
  version,
  getFirstLettersInGlossary,
  getGlossaryTerms,
  getGlossaryTermsByFirstLetter,
  getSiteUpdate,
  getWidgetUpdate,
};
