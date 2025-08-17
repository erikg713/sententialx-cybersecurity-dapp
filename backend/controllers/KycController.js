exports.submitKYC = (req, res) => {
  const { userId } = req.body;
  console.log(`KYC submitted for ${userId}`);

  // TODO: Integrate Pi KYC service
  res.json({
    success: true,
    message: "KYC submission placeholder",
    userId
  });
};
