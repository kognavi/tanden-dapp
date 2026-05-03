// packages/hardhat/deploy/01_deploy_tanden_token.js

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // ① まずは TANDENトークンをデプロイして、結果を変数に保存！
  const tandenTokenDeployment = await deploy("TandenToken", {
    from: deployer,
    // コンストラクタ引数(今回は不要)
    args: [],
    log: true,
    autoMine: true, // ローカル開発を爆速にする魔法だよ✨
  });

  console.log("🚀 TANDENトークンがデプロイされました！");

  // ② 次に TandenNFT をデプロイ！（ここで①のアドレスを注入！）
  await deploy("TandenNFT", {
    from: deployer,
    args: [tandenTokenDeployment.address], // 🔥 ここが超重要！
    log: true,
    autoMine: true,
  });

  console.log("🏆 TandenNFTもデプロイ完了だよっ！");
};

// デプロイタグも両方指定しておくね！
module.exports.tags = ["TandenToken", "TandenNFT"];
