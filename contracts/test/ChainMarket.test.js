const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('ChainMarket', function () {
  let ChainMarket, market, owner, addr1, addr2, nft

  beforeEach(async () => {
    ;[owner, addr1, addr2] = await ethers.getSigners()

    const NFT = await ethers.getContractFactory('MockNFT')
    nft = await NFT.deploy()
    await nft.deployed()

    ChainMarket = await ethers.getContractFactory('ChainMarket')
    market = await ChainMarket.deploy()
    await market.deployed()
  })

  it('Should create and execute listing', async function () {
    // Mint NFT to addr1
    await nft.connect(addr1).mint(addr1.address, 1)
    
    // Approve market to transfer NFT
    await nft.connect(addr1).approve(market.address, 1)
    
    // Create listing
    await market.connect(addr1).listItem(
      nft.address,
      1,
      ethers.utils.parseEther('1.0'),
      'ipfs://test'
    )
    
    // Execute purchase
    await market.connect(addr2).purchaseItem(1, {
      value: ethers.utils.parseEther('1.0')
    })
    
    // Verify ownership transfer
    expect(await nft.ownerOf(1)).to.equal(addr2.address)
  })
})
