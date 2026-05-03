// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// 🛡️ OpenZeppelinのReentrancyGuardをインポート（Scaffold-ETH 2には最初から入ってるよ！）
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


/**
 * @title TandenBank
 * @dev リエントランシー攻撃対策済みの安全な銀行コントラクト
 */
contract TandenBank is ReentrancyGuard {
    // ユーザーごとの預金残高を記録するマッピング
    mapping(address => uint256) public balances;

    // 預金・引き出し時にフロントエンドに通知を送るイベント
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    /**
     * @notice ETHを預ける関数
     */
    function deposit() public payable {
        require(msg.value > 0, "Must deposit more than 0 ETH");
        
        balances[msg.sender] += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @notice 預けたETHを全額引き出す関数
     * 🛡️ nonReentrant修飾子をつけて再入攻撃をブロック！
     */
    function withdraw() public nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance to withdraw");

        // 🛡️ Checks-Effects-Interactionsパターン：送金前に残高を0にする！
        balances[msg.sender] = 0;

        // 外部への送金（ここでハッカーが再入しようとしても、nonReentrantが弾く！）
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send ETH");

        emit Withdraw(msg.sender, bal);
    }

    /**
     * @notice コントラクトが持っている総ETH量を確認する関数
     */
    function getBankBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
