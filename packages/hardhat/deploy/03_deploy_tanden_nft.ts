import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTandenNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // ① すでにデプロイされている TandenToken の情報を取得するよ！
  const tandenToken = await get("TandenToken");

  // ② TandenNFT をデプロイ！
  await deploy("TandenNFT", {
    from: deployer,
    // 🔥 ここが重要！TandenNFTのコンストラクタにTandenTokenのアドレスを渡す！
    args: [tandenToken.address],
    log: true,
    autoMine: true,
  });
};

export default deployTandenNFT;
deployTandenNFT.tags = ["TandenNFT"];
