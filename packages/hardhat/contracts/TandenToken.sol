//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TandenToken is ERC20, Ownable {
    // トークンの詳細
    string private constant TOKEN_NAME = "TANDEN";
    string private constant TOKEN_SYMBOL = "TDN";
    uint8 private constant DECIMALS = 18;
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 100万トークン

    // 特別な機能：丹田パワーレベル
    mapping(address => uint256) public tandenPowerLevel;
    
    // Faucet（蛇口）を利用したかどうかの記録
    mapping(address => bool) public hasUsedFaucet;
    
    // イベント
    event TandenPowerIncreased(address indexed user, uint256 newLevel);
    event FaucetUsed(address indexed user, uint256 amount);

    constructor() ERC20(TOKEN_NAME, TOKEN_SYMBOL) Ownable(msg.sender) {
        // 初期供給量を発行者（デプロイした人）に割り当て
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // 🚰 誰でも1回だけ100 TANDENもらえる蛇口機能
    function faucet() public {
        require(!hasUsedFaucet[msg.sender], "You already used the faucet!");
        
        hasUsedFaucet[msg.sender] = true;
        uint256 faucetAmount = 100 * 10**18; // 100トークン
        
        // 新しくトークンを発行してあげる
        _mint(msg.sender, faucetAmount);
        
        emit FaucetUsed(msg.sender, faucetAmount);
    }

    // 🧘‍♀️ 丹田パワーを上げる関数（トークンを使用）
    function increaseTandenPower() public {
        // 10トークンを消費
        uint256 cost = 10 * 10**18;
        require(balanceOf(msg.sender) >= cost, "Not enough TANDEN tokens");
        
        // トークンを燃やす（総供給量から削除）
        _burn(msg.sender, cost);
        
        // 丹田パワーレベルを上げる
        tandenPowerLevel[msg.sender] += 1;
        
        // イベント発行
        emit TandenPowerIncreased(msg.sender, tandenPowerLevel[msg.sender]);
    }

    // トークンをミント（新規発行）する関数（オーナーのみ実行可能）
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}