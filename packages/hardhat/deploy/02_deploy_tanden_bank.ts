import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTandenBank: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("TandenBank", {
    from: deployer,
    args: [], // 今回はコンストラクタ引数なし
    log: true,
    autoMine: true, // ローカル環境で即座にマイニングする設定
  });

  console.log("🏦 TandenBank deployed successfully!");
};

export default deployTandenBank;

// デプロイの実行順序を制御するタグ
deployTandenBank.tags = ["TandenBank"];
