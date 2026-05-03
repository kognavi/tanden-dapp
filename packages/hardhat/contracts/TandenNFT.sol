//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// ① AWSの「APIスキーマ」のようなもの。TandenTokenの関数を外から叩くための定義だよ！
interface ITandenToken {
    function tandenPowerLevel(address account) external view returns (uint256);
}

contract TandenNFT is ERC721 {
    uint256 public currentTokenId;
    ITandenToken public tandenToken;
    
    // 1人1個しか持てないようにするための記録
    mapping(address => bool) public hasMinted;

    // ② デプロイする時に、TandenTokenの「コントラクトアドレス」を教えてあげる
    constructor(address _tandenTokenAddress) ERC721("Tanden Master", "TDM") {
        tandenToken = ITandenToken(_tandenTokenAddress);
    }

    // ③ NFTを受け取る関数
    function claimMasterNFT() public {
        require(!hasMinted[msg.sender], "You already claimed your NFT!");
        
        // 🔥 ここが連携のキモ！TandenTokenのデータをReadしに行ってるよ！
        uint256 power = tandenToken.tandenPowerLevel(msg.sender);
        require(power >= 10, "Your Tanden power must be at least 10!");

        // 条件クリアでNFT発行！
        hasMinted[msg.sender] = true;
        currentTokenId++;
        _safeMint(msg.sender, currentTokenId);
    }

    // ④ 🔥ここを追加！NFTのデータ（画像や説明）の場所を教える関数
    function tokenURI(uint256 /*tokenId*/) public view override returns (string memory) {
        // どのトークンIDでも、ケンの作った「丹田マスター」のメタデータを返すよ！
        return "ipfs://bafkreih7mv7vjhbg632rem4b4i2d4pmdg57w2qv45d3drheowcysubsjpa";
    }
}
